namespace RestoreAPI.Application.Settings;

public sealed class SepaySettings
{
    public string BankAccountNumber { get; init; } = string.Empty;
    public string BankName { get; init; } = string.Empty;
    public string AccountHolder { get; init; } = string.Empty;
    public string PaymentCodePrefix { get; init; } = "RESTORE";
    public string WebhookApiKey { get; init; } = string.Empty;
    public string QrBaseUrl { get; init; } = "https://vietqr.app/img";
}
