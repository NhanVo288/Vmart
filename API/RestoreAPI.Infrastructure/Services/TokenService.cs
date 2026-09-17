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
using RestoreAPI.Domain.Entities;
using RestoreAPI.Infrastructure.Data;

namespace RestoreAPI.Infrastructure.Services
{
    public class TokenService : ITokenService
    {
        private readonly JwtSettings _jwtSettings;
        private readonly UserManager<User> _userManager;
        private readonly AppDbContext _context;
        private readonly ILogger<TokenService> _logger;

        public TokenService(JwtSettings jwtSettings, UserManager<User> userManager, AppDbContext context, ILogger<TokenService> logger)
        {
            _jwtSettings = jwtSettings;
            _userManager = userManager;
            _context = context;
            _logger = logger;
        }

        public async Task<string> CreateTokenAsync(User user)
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
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = signingCredentials,
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            _logger.LogInformation("JWT token created for user {UserId}", user.Id);
            return tokenHandler.WriteToken(token);
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
    }
}
