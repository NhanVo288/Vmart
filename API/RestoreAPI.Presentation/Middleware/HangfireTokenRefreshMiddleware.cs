using System.IdentityModel.Tokens.Jwt;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Settings;

namespace RestoreAPI.Middleware;

public sealed class HangfireTokenRefreshMiddleware
{
    private readonly RequestDelegate _next;

    public HangfireTokenRefreshMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ITokenService tokenService,
        JwtSettings jwtSettings)
    {
        if (context.Request.Path.StartsWithSegments("/hangfire") &&
            AccessTokenNeedsRefresh(context.Request.Cookies[AuthenticationConstants.AccessTokenCookieName]) &&
            context.Request.Cookies.TryGetValue(
                AuthenticationConstants.RefreshTokenCookieName,
                out var refreshToken))
        {
            var tokens = await tokenService.RotateRefreshTokenAsync(refreshToken);
            if (tokens is not null)
            {
                context.Request.Headers.Authorization = $"Bearer {tokens.AccessToken}";
                AppendAuthenticationCookies(context, tokens.AccessToken, tokens.RefreshToken, jwtSettings);
            }
        }

        await _next(context);
    }

    private static bool AccessTokenNeedsRefresh(string? accessToken)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
            return true;

        var handler = new JwtSecurityTokenHandler();
        return !handler.CanReadToken(accessToken) ||
               handler.ReadJwtToken(accessToken).ValidTo <= DateTime.UtcNow;
    }

    private static void AppendAuthenticationCookies(
        HttpContext context,
        string accessToken,
        string refreshToken,
        JwtSettings jwtSettings)
    {
        var commonOptions = new CookieOptions
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Strict,
            Secure = context.Request.IsHttps,
            Path = "/"
        };

        context.Response.Cookies.Append(
            AuthenticationConstants.AccessTokenCookieName,
            accessToken,
            new CookieOptions
            {
                HttpOnly = commonOptions.HttpOnly,
                IsEssential = commonOptions.IsEssential,
                SameSite = commonOptions.SameSite,
                Secure = commonOptions.Secure,
                Path = commonOptions.Path,
                Expires = DateTimeOffset.UtcNow.AddMinutes(jwtSettings.AccessTokenMinutes)
            });
        context.Response.Cookies.Append(
            AuthenticationConstants.RefreshTokenCookieName,
            refreshToken,
            new CookieOptions
            {
                HttpOnly = commonOptions.HttpOnly,
                IsEssential = commonOptions.IsEssential,
                SameSite = commonOptions.SameSite,
                Secure = commonOptions.Secure,
                Path = commonOptions.Path,
                Expires = DateTimeOffset.UtcNow.AddDays(jwtSettings.RefreshTokenDays)
            });
    }
}
