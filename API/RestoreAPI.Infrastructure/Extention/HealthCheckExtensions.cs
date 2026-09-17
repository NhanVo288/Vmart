using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using RestoreAPI.Infrastructure.HealthChecks;

namespace RestoreAPI.Infrastructure.Extention;

public static class HealthCheckExtensions
{
    public static IHealthChecksBuilder AddHangfireHealthCheck(
        this IHealthChecksBuilder builder)
    {
        builder.AddCheck<HangfireHealthCheck>(
            "hangfire",
            tags: new[] { "jobs" },
            timeout: TimeSpan.FromSeconds(5));

        return builder;
    }

    public static IHealthChecksBuilder AddSepayHealthCheck(
        this IHealthChecksBuilder builder)
    {
        builder.AddCheck<SepayHealthCheck>(
            "sepay",
            tags: new[] { "payment" },
            timeout: TimeSpan.FromSeconds(10));

        return builder;
    }

    public static IHealthChecksBuilder AddElasticsearchHealthCheck(
        this IHealthChecksBuilder builder)
    {
        builder.AddCheck<ElasticsearchHealthCheck>(
            "elasticsearch",
            tags: new[] { "logging", "search" },
            timeout: TimeSpan.FromSeconds(5));

        return builder;
    }

    public static IHealthChecksBuilder AddRedisHealthCheck(
        this IHealthChecksBuilder builder)
    {
        builder.AddCheck<RedisHealthCheck>(
            "redis",
            tags: new[] { "cache", "redis" },
            timeout: TimeSpan.FromSeconds(5));

        return builder;
    }
}
