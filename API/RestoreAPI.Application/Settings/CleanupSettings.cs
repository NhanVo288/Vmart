namespace RestoreAPI.Application.Settings;

public class CleanupSettings
{
    public int RevokedTokensAfterDays { get; set; } = 7;
    public int StaleBasketsAfterDays { get; set; } = 30;
}
