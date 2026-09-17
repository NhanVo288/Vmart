using Microsoft.Data.SqlClient;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Factories;

namespace RestoreAPI.Application.Features.Orders.Commands.CreateOrder;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<OrderDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAccountRepository _accountRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<CreateOrderCommandHandler> _logger;

    public CreateOrderCommandHandler(
        IUnitOfWork unitOfWork,
        IAccountRepository accountRepository,
        IEmailService emailService,
        ILogger<CreateOrderCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _accountRepository = accountRepository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result<OrderDto>> Handle(CreateOrderCommand request, CancellationToken ct)
    {
        var buyerId = request.BuyerId;
        var userEmail = request.UserEmail;

        if (string.IsNullOrWhiteSpace(userEmail))
        {
            userEmail = (await _accountRepository.GetUserByIdAsync(buyerId))?.Email;
        }

        userEmail ??= buyerId;

        var paymentReference = request.PaymentReference;

        if (!string.IsNullOrEmpty(paymentReference))
        {
            var existing = await _unitOfWork.Orders.GetOrderByPaymentReferenceAsync(paymentReference);
            if (existing != null && existing.BuyerId == buyerId)
            {
                var existingDto = existing.ToDto();
                await AttachEmailDeliveryStatusAsync(userEmail, existingDto);
                return Result.Success(existingDto);
            }
        }

        var basket = await _unitOfWork.Baskets.GetBasketAsync(buyerId);

        if (basket == null || string.IsNullOrEmpty(basket.PaymentReference))
        {
            return Result.Failure<OrderDto>(Errors.BasketNotReady);
        }

        var order = OrderFactory.BuildFromBasket(basket, buyerId, null, userEmail);
        if (order is null)
        {
            return Result.Failure<OrderDto>(Errors.InvalidShippingAddress);
        }

        var stockRequirements = basket.Items
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, TotalQuantity = g.Sum(i => i.Quantity) })
            .ToList();

        foreach (var req in stockRequirements)
        {
            var decremented = await _unitOfWork.Products.TryDecrementStockAsync(req.ProductId, req.TotalQuantity);
            if (!decremented)
            {
                return Result.Failure<OrderDto>(Errors.InsufficientStock("product", req.ProductId, req.TotalQuantity));
            }
        }

        await _unitOfWork.Orders.AddAsync(order);

        _unitOfWork.Baskets.Delete(basket);

        try
        {
            await _unitOfWork.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (IsDuplicatePaymentReference(ex))
        {
            _logger.LogWarning(
                "Duplicate payment reference detected: {PaymentReference}",
                order.PaymentReference);

            var existingOrder = await _unitOfWork.Orders
                .GetOrderByPaymentReferenceAsync(order.PaymentReference!);

            if (existingOrder is null)
            {
                return Result.Failure<OrderDto>(Errors.OrderAlreadyExists);
            }

            return Result.Success(existingOrder.ToDto());
        }

        var resultDto = order.ToDto();
        _logger.LogInformation("Order created: {OrderId} for user {UserId}, total: {Total}", resultDto.Id, buyerId, resultDto.Total);

        await AttachEmailDeliveryStatusAsync(userEmail, resultDto);

        return Result.Success(resultDto);
    }

    private async Task AttachEmailDeliveryStatusAsync(string userEmail, OrderDto order)
    {
        if (string.IsNullOrWhiteSpace(userEmail) || !userEmail.Contains("@"))
        {
            order.EmailSent = false;
            order.EmailError = "A valid customer email address was not found.";
            return;
        }

        try
        {
            order.EmailError = await _emailService.SendOrderConfirmationEmailAsync(userEmail, order);
            order.EmailSent = order.EmailError == null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Email delivery failed for order {OrderId}", order.Id);
            order.EmailSent = false;
            order.EmailError = ex.GetBaseException().Message;
        }
    }

    private static bool IsDuplicatePaymentReference(DbUpdateException ex)
    {
        if (ex.InnerException is not SqlException sql) return false;
        return sql.Errors.Cast<SqlError>()
            .Any(e => e.Number is 2601 or 2627);
    }
}
