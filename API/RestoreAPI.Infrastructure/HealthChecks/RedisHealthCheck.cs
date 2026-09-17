using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;

namespace RestoreAPI.Infrastructure.HealthChecks;

public class RedisHealthCheck : IHealthCheck
{
    private readonly IServiceProvider _serviceProvider;

    public RedisHealthCheck(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var multiplexer = _serviceProvider.GetService<IConnectionMultiplexer>();
            if (multiplexer is null || !multiplexer.IsConnected)
            {
                return HealthCheckResult.Degraded("Redis is offline or unreachable (API will fallback to DB)");
            }

            var db = multiplexer.GetDatabase();
            var ping = await db.PingAsync();

            var data = new Dictionary<string, object>
            {
                { "pingMs", Math.Round(ping.TotalMilliseconds, 2) },
                { "status", "Connected" }
            };

            return HealthCheckResult.Healthy("Redis is connected and responsive", data);
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Degraded("Redis health check failed (API will fallback to DB)", ex);
        }
    }
}
