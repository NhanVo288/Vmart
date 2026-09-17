using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RestoreAPI.Application.Settings;
using RestoreAPI.Infrastructure.Data;

namespace RestoreAPI.Infrastructure.Jobs;

public class CleanupRevokedTokensJob
{
    private readonly AppDbContext _context;
    private readonly CleanupSettings _settings;
    private readonly ILogger<CleanupRevokedTokensJob> _logger;

    public CleanupRevokedTokensJob(
        AppDbContext context,
        IOptions<CleanupSettings> settings,
        ILogger<CleanupRevokedTokensJob> logger)
    {
        _context = context;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task Execute()
    {
        var cutoff = DateTime.UtcNow.AddDays(-_settings.RevokedTokensAfterDays);

        var deleted = await _context.RevokedTokens
            .Where(t => t.ExpiresAt < cutoff)
            .ExecuteDeleteAsync();

        _logger.LogInformation(
            "Revoked token cleanup completed. Deleted {Count} tokens older than {Cutoff}.",
            deleted, cutoff);
    }
}
