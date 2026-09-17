using Microsoft.Extensions.Diagnostics.HealthChecks;
using RestoreAPI.Application.Settings;

namespace RestoreAPI.Infrastructure.HealthChecks;

public sealed class SepayHealthCheck : IHealthCheck
{
    private readonly SepaySettings _settings;

    public SepayHealthCheck(SepaySettings settings) => _settings = settings;

    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var configured = !string.IsNullOrWhiteSpace(_settings.BankAccountNumber)
            && !string.IsNullOrWhiteSpace(_settings.BankName)
            && !string.IsNullOrWhiteSpace(_settings.WebhookApiKey);

        return Task.FromResult(configured
            ? HealthCheckResult.Healthy("SePay VietQR and webhook are configured")
            : HealthCheckResult.Unhealthy("SePay bank account, bank name, or webhook API key is missing"));
    }
}
