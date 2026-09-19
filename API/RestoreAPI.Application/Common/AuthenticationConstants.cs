namespace RestoreAPI.Application.Common;

public static class AuthenticationConstants
{
    public const string AccessTokenCookieName = "access_token";
    public const string RefreshTokenCookieName = "refresh_token";
    public const string LegacyHangfireCookieName = "hangfire_access_token";
    public const string ResolvedTokenItemKey = "ResolvedJwtToken";
}
