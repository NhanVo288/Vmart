using System.Text.Json.Serialization;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Models;

public sealed record SepayPaymentRequest(
    string PaymentReference,
    string QrUrl,
    long Amount,
    string BankName,
    string BankAccountNumber,
    string AccountHolder);

public sealed record SepayPaymentStatus(string Status, OrderDto? Order = null);

public sealed class SepayWebhookPayload
{
    [JsonPropertyName("id")] public long Id { get; init; }
    [JsonPropertyName("gateway")] public string Gateway { get; init; } = string.Empty;
    [JsonPropertyName("transactionDate")] public string TransactionDate { get; init; } = string.Empty;
    [JsonPropertyName("accountNumber")] public string AccountNumber { get; init; } = string.Empty;
    [JsonPropertyName("code")] public string? Code { get; init; }
    [JsonPropertyName("content")] public string Content { get; init; } = string.Empty;
    [JsonPropertyName("transferType")] public string TransferType { get; init; } = string.Empty;
    [JsonPropertyName("description")] public string Description { get; init; } = string.Empty;
    [JsonPropertyName("transferAmount")] public decimal TransferAmount { get; init; }
    [JsonPropertyName("referenceCode")] public string ReferenceCode { get; init; } = string.Empty;
}
