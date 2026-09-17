using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RestoreAPI.Application.Settings;
using RestoreAPI.Infrastructure.Data;

namespace RestoreAPI.Infrastructure.Jobs;

public class CleanupStaleBasketsJob
{
    private readonly AppDbContext _context;
    private readonly CleanupSettings _settings;
    private readonly ILogger<CleanupStaleBasketsJob> _logger;

    public CleanupStaleBasketsJob(
        AppDbContext context,
        IOptions<CleanupSettings> settings,
        ILogger<CleanupStaleBasketsJob> logger)
    {
        _context = context;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task Execute()
    {
        var cutoff = DateTime.UtcNow.AddDays(-_settings.StaleBasketsAfterDays);

        var deleted = await _context.Baskets
            .Where(b => b.IsAnonymous
                && b.Items.Count == 0
                && b.LastModifiedAt < cutoff)
            .ExecuteDeleteAsync();

        _logger.LogInformation(
            "Stale basket cleanup completed. Deleted {Count} baskets older than {Cutoff}.",
            deleted, cutoff);
    }
}
