using Hangfire;

namespace RestoreAPI.Infrastructure.Jobs;

public static class HangfireJobRegistration
{
    public static void Register()
    {
        var vietnamTime = TimeZoneHelper.GetVietnamTimeZone();

        RecurringJob.AddOrUpdate<CleanupRevokedTokensJob>(
            "cleanup-revoked-tokens",
            job => job.Execute(),
            Cron.Daily(3, 0),
            new RecurringJobOptions { TimeZone = vietnamTime });

        RecurringJob.AddOrUpdate<CleanupStaleBasketsJob>(
            "cleanup-stale-baskets",
            job => job.Execute(),
            Cron.Daily(4, 0),
            new RecurringJobOptions { TimeZone = vietnamTime });
    }
}
