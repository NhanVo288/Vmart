using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Settings;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Domain.Entities.OrderAggregate;
using RestoreAPI.Domain.Enums;
using RestoreAPI.Domain.Factories;

namespace RestoreAPI.Infrastructure.Services;

public sealed class SepayPaymentService : IPaymentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly SepaySettings _settings;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<SepayPaymentService> _logger;

    public SepayPaymentService(IUnitOfWork unitOfWork, SepaySettings settings,
        UserManager<User> userManager, ILogger<SepayPaymentService> logger)
    {
        _unitOfWork = unitOfWork;
        _settings = settings;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<SepayPaymentRequest> CreateOrUpdatePaymentAsync(string buyerId)
    {
        ValidateConfiguration();
        var basket = await _unitOfWork.Baskets.GetBasketAsync(buyerId)
            ?? throw new InvalidOperationException("Basket not found");
        if (basket.Items.Count == 0) throw new InvalidOperationException("Basket is empty");
        if (!basket.HasShippingAddress()) throw new InvalidOperationException("Shipping address is required");

        var subtotal = (long)basket.Items.Sum(i => i.Quantity * i.Product!.Price);
        var deliveryFee = subtotal > 10000 ? 0 : 500;
        const long discount = 0;
        var amount = subtotal + deliveryFee - discount;

        basket.SetDeliveryFee(deliveryFee);
        basket.SetDiscount(discount);

        var reference = basket.PaymentReference;
        if (string.IsNullOrWhiteSpace(reference))
        {
            reference = BuildPaymentReference();
        }

        var qrUrl = BuildQrUrl(reference, amount);
        basket.SetPaymentRequest(reference, qrUrl);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("SePay request {PaymentReference} prepared for basket {BasketId}, amount {Amount}",
            reference, basket.Id, amount);

        return new SepayPaymentRequest(reference, qrUrl, amount, _settings.BankName,
            _settings.BankAccountNumber, _settings.AccountHolder);
    }

    public async Task<SepayPaymentStatus> GetPaymentStatusAsync(string buyerId, string paymentReference)
    {
        var order = await _unitOfWork.Orders.GetOrderByPaymentReferenceAsync(paymentReference);
        if (order is not null)
        {
            return order.BuyerId == buyerId
                ? new SepayPaymentStatus("paid", order.ToDto())
                : new SepayPaymentStatus("not_found");
        }

        var basket = await _unitOfWork.Baskets.GetBasketByPaymentReferenceAsync(paymentReference);
        return basket?.BuyerId == buyerId
            ? new SepayPaymentStatus("pending")
            : new SepayPaymentStatus("not_found");
    }

    public bool IsWebhookAuthorized(string? authorizationHeader)
    {
        if (string.IsNullOrWhiteSpace(_settings.WebhookApiKey) || string.IsNullOrWhiteSpace(authorizationHeader))
            return false;

        var expected = Encoding.UTF8.GetBytes($"Apikey {_settings.WebhookApiKey}");
        var actual = Encoding.UTF8.GetBytes(authorizationHeader.Trim());
        return expected.Length == actual.Length && CryptographicOperations.FixedTimeEquals(expected, actual);
    }

    public async Task ProcessWebhookAsync(SepayWebhookPayload payload)
    {
        if (!string.Equals(payload.TransferType, "in", StringComparison.OrdinalIgnoreCase)) return;

        var reference = ExtractPaymentReference(payload);
        if (reference is null)
        {
            _logger.LogInformation("Ignored SePay transaction {TransactionId}: payment reference not found", payload.Id);
            return;
        }

        var existingOrder = await _unitOfWork.Orders.GetOrderByPaymentReferenceAsync(reference);
        if (existingOrder?.Status == OrderStatus.PaymentReceived)
        {
            _logger.LogInformation("Ignored duplicate SePay transaction {TransactionId} for {PaymentReference}",
                payload.Id, reference);
            return;
        }

        var basket = await _unitOfWork.Baskets.GetBasketByPaymentReferenceAsync(reference);
        if (basket is null)
        {
            _logger.LogWarning("Ignored SePay transaction {TransactionId}: no basket for {PaymentReference}",
                payload.Id, reference);
            return;
        }

        var expectedAmount = (long)basket.Items.Sum(i => i.Quantity * i.Product!.Price)
            + basket.DeliveryFee - basket.Discount;
        if (payload.TransferAmount != expectedAmount)
        {
            _logger.LogWarning("Ignored SePay transaction {TransactionId}: amount {Actual} does not match {Expected}",
                payload.Id, payload.TransferAmount, expectedAmount);
            return;
        }

        if (!string.IsNullOrWhiteSpace(_settings.BankAccountNumber)
            && !string.Equals(payload.AccountNumber, _settings.BankAccountNumber, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Ignored SePay transaction {TransactionId}: beneficiary account mismatch", payload.Id);
            return;
        }

        await CompletePaymentAsync(reference, basket, payload);
    }

    private async Task CompletePaymentAsync(string reference, Basket basket, SepayWebhookPayload payload)
    {
        var buyerEmail = (await _userManager.FindByIdAsync(basket.BuyerId))?.Email;
        var summary = new PaymentSummary
        {
            Last4 = ParseLastFour(payload.AccountNumber),
            ExpMonth = 0,
            ExpYear = 0,
            Brand = $"SePay/{payload.Gateway}"
        };
        var order = OrderFactory.BuildFromBasket(basket, basket.BuyerId, summary, buyerEmail)
            ?? throw new InvalidOperationException("Unable to create order from basket");

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            foreach (var item in basket.Items.GroupBy(i => i.ProductId))
            {
                if (!await _unitOfWork.Products.TryDecrementStockAsync(item.Key, item.Sum(i => i.Quantity)))
                    throw new InvalidOperationException($"Insufficient stock for product {item.Key}");
            }

            order.UpdateStatus(OrderStatus.PaymentReceived);
            await _unitOfWork.Orders.AddAsync(order);
            _unitOfWork.Baskets.Delete(basket);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitAsync();
            _logger.LogInformation("SePay transaction {TransactionId} completed order {OrderId} ({PaymentReference})",
                payload.Id, order.Id, reference);

        }
        catch (DbUpdateException ex) when (IsDuplicatePaymentReference(ex))
        {
            await _unitOfWork.RollbackAsync();
            _logger.LogInformation("Order already exists for SePay reference {PaymentReference}", reference);
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    private string? ExtractPaymentReference(SepayWebhookPayload payload)
    {
        var prefix = NormalizePrefix(_settings.PaymentCodePrefix);
        var pattern = $@"(?<![A-Z0-9]){Regex.Escape(prefix)}[A-F0-9]{{16}}(?![A-Z0-9])";
        foreach (var value in new[] { payload.Code, payload.Content, payload.Description })
        {
            var match = Regex.Match(value?.ToUpperInvariant() ?? string.Empty, pattern);
            if (match.Success) return match.Value;
        }
        return null;
    }

    private string BuildPaymentReference() =>
        $"{NormalizePrefix(_settings.PaymentCodePrefix)}{Guid.NewGuid():N}"[..(NormalizePrefix(_settings.PaymentCodePrefix).Length + 16)];

    private string BuildQrUrl(string reference, long amount)
    {
        var separator = _settings.QrBaseUrl.Contains('?') ? '&' : '?';
        return $"{_settings.QrBaseUrl}{separator}acc={Uri.EscapeDataString(_settings.BankAccountNumber)}" +
               $"&bank={Uri.EscapeDataString(_settings.BankName)}&amount={amount}" +
               $"&des={Uri.EscapeDataString(reference)}&template=compact";
    }

    private void ValidateConfiguration()
    {
        if (string.IsNullOrWhiteSpace(_settings.BankAccountNumber)
            || string.IsNullOrWhiteSpace(_settings.BankName)
            || string.IsNullOrWhiteSpace(_settings.WebhookApiKey))
            throw new InvalidOperationException("SePay settings are not configured");
    }

    private static string NormalizePrefix(string prefix)
    {
        var normalized = Regex.Replace(prefix.ToUpperInvariant(), "[^A-Z0-9]", string.Empty);
        return string.IsNullOrWhiteSpace(normalized) ? "RESTORE" : normalized;
    }

    private static int ParseLastFour(string accountNumber)
    {
        var digits = new string(accountNumber.Where(char.IsDigit).TakeLast(4).ToArray());
        return int.TryParse(digits, out var value) ? value : 0;
    }

    private static bool IsDuplicatePaymentReference(DbUpdateException ex) =>
        ex.InnerException is SqlException sql && sql.Errors.Cast<SqlError>().Any(e => e.Number is 2601 or 2627);
}
