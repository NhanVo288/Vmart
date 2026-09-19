using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Settings;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Infrastructure.Data;
using StackExchange.Redis;

namespace RestoreAPI.Infrastructure.Services
{
    public class TokenService : ITokenService
    {
        private readonly JwtSettings _jwtSettings;
        private readonly UserManager<User> _userManager;
        private readonly AppDbContext _context;
        private readonly ILogger<TokenService> _logger;
        private readonly IConnectionMultiplexer _redis;

        public TokenService(
            JwtSettings jwtSettings,
            UserManager<User> userManager,
            AppDbContext context,
            ILogger<TokenService> logger,
            IConnectionMultiplexer redis)
        {
            _jwtSettings = jwtSettings;
            _userManager = userManager;
            _context = context;
            _logger = logger;
            _redis = redis;
        }

        public async Task<TokenPairDto> CreateTokenPairAsync(User user)
        {
            var accessToken = await CreateAccessTokenAsync(user);
            var refreshToken = await CreateRefreshSessionAsync(user.Id);
            return new TokenPairDto(accessToken, refreshToken);
        }

        public async Task<TokenPairDto?> RotateRefreshTokenAsync(string refreshToken)
        {
            if (!TryParseRefreshToken(refreshToken, out var sessionId, out var secret))
                return null;

            var database = GetRedisDatabase();
            var sessionKey = GetRefreshSessionKey(sessionId);
            var values = await database.HashGetAsync(
                sessionKey,
                new RedisValue[] { "userId", "secretHash" });

            if (values.Length != 2 || values[0].IsNullOrEmpty || values[1].IsNullOrEmpty)
                return null;

            var currentSecretHash = HashToken(secret);
            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(values[1].ToString()),
                    Encoding.UTF8.GetBytes(currentSecretHash)))
            {
                _logger.LogWarning("Rejected an invalid refresh token for session {SessionId}", sessionId);
                return null;
            }

            var userId = values[0].ToString();
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
            {
                await database.KeyDeleteAsync(sessionKey);
                return null;
            }

            var nextSecret = GenerateSecureToken();
            var nextSecretHash = HashToken(nextSecret);
            var accessToken = await CreateAccessTokenAsync(user);

            var transaction = database.CreateTransaction();
            transaction.AddCondition(Condition.HashEqual(sessionKey, "secretHash", currentSecretHash));
            _ = transaction.HashSetAsync(sessionKey, "secretHash", nextSecretHash);
            _ = transaction.KeyExpireAsync(sessionKey, TimeSpan.FromDays(_jwtSettings.RefreshTokenDays));

            if (!await transaction.ExecuteAsync())
            {
                _logger.LogWarning("Refresh token rotation race rejected for session {SessionId}", sessionId);
                return null;
            }

            return new TokenPairDto(accessToken, $"{sessionId}.{nextSecret}");
        }

        public async Task RevokeRefreshTokenAsync(string refreshToken)
        {
            if (!TryParseRefreshToken(refreshToken, out var sessionId, out _))
                return;

            await GetRedisDatabase().KeyDeleteAsync(GetRefreshSessionKey(sessionId));
        }

        private async Task<string> CreateAccessTokenAsync(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
            var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(ClaimTypes.Email, user.Email!),
                new(ClaimTypes.Name, user.UserName ?? user.Email!),
                new(ClaimTypes.NameIdentifier, user.Id),
            };

            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenMinutes),
                SigningCredentials = signingCredentials,
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            _logger.LogInformation("JWT token created for user {UserId}", user.Id);
            return tokenHandler.WriteToken(token);
        }

        private async Task<string> CreateRefreshSessionAsync(string userId)
        {
            var sessionId = GenerateSecureToken();
            var secret = GenerateSecureToken();
            var sessionKey = GetRefreshSessionKey(sessionId);
            var database = GetRedisDatabase();
            var transaction = database.CreateTransaction();

            _ = transaction.HashSetAsync(sessionKey, new HashEntry[]
            {
                new("userId", userId),
                new("secretHash", HashToken(secret))
            });
            _ = transaction.KeyExpireAsync(sessionKey, TimeSpan.FromDays(_jwtSettings.RefreshTokenDays));

            if (!await transaction.ExecuteAsync())
                throw new InvalidOperationException("Could not create the refresh token session in Redis.");

            return $"{sessionId}.{secret}";
        }

        public async Task RevokeAsync(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(token)) return;
            var jwtToken = handler.ReadJwtToken(token);
            var tokenHash = ComputeHash(token);
            var expiry = jwtToken.ValidTo;
            var userId = jwtToken.Subject ?? jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            _context.RevokedTokens.Add(new RevokedToken
            {
                TokenHash = tokenHash,
                UserId = userId,
                RevokedAt = DateTime.UtcNow,
                ExpiresAt = expiry,
            });

            await _context.SaveChangesAsync();
            _logger.LogInformation("Token revoked for user {UserId}", userId);
        }

        public async Task RevokeAllAsync(string userId)
        {
            _context.RevokedTokens.Add(new RevokedToken
            {
                TokenHash = null,
                UserId = userId,
                RevokedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
            });

            await _context.SaveChangesAsync();
            _logger.LogInformation("All tokens revoked for user {UserId}", userId);
        }

        public async Task<bool> IsTokenValidAsync(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(token))
            {
                _logger.LogWarning("Invalid token validation attempt");
                return false;
            }
            var jwtToken = handler.ReadJwtToken(token);
            var tokenHash = ComputeHash(token);
            var userId = jwtToken.Subject ?? jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            var isBlacklisted = await _context.RevokedTokens
                .AnyAsync(r => r.TokenHash == tokenHash);

            if (isBlacklisted) return false;

            if (userId != null)
            {
                var issuedAt = jwtToken.ValidFrom;
                var hasBulkRevoke = await _context.RevokedTokens
                    .AnyAsync(r => r.TokenHash == null && r.UserId == userId && r.RevokedAt > issuedAt);

                if (hasBulkRevoke) return false;
            }

            return true;
        }

        private static string ComputeHash(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(bytes);
        }

        private IDatabase GetRedisDatabase()
        {
            if (!_redis.IsConnected)
                throw new InvalidOperationException("Redis is required for refresh token sessions but is unavailable.");

            return _redis.GetDatabase();
        }

        private static RedisKey GetRefreshSessionKey(string sessionId) => $"auth:refresh:{sessionId}";

        private static string GenerateSecureToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        private static string HashToken(string token)
        {
            return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
        }

        private static bool TryParseRefreshToken(string token, out string sessionId, out string secret)
        {
            sessionId = string.Empty;
            secret = string.Empty;

            var separator = token.IndexOf('.');
            if (separator <= 0 || separator == token.Length - 1 || token.IndexOf('.', separator + 1) >= 0)
                return false;

            sessionId = token[..separator];
            secret = token[(separator + 1)..];
            return IsBase64UrlToken(sessionId) && IsBase64UrlToken(secret);
        }

        private static bool IsBase64UrlToken(string value) =>
            value.Length == 43 && value.All(character =>
                char.IsAsciiLetterOrDigit(character) || character is '-' or '_');
    }
}
