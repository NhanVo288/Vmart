using Hangfire;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace RestoreAPI.Infrastructure.HealthChecks;

public class HangfireHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var storage = JobStorage.Current;
            using var connection = storage.GetConnection();
            connection.GetJobData("test");

            return Task.FromResult(HealthCheckResult.Healthy("Hangfire is running"));
        }
        catch (Exception ex)
        {
            return Task.FromResult(
                HealthCheckResult.Unhealthy("Hangfire is not reachable", ex));
        }
    }
}
