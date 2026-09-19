using RestoreAPI.Application.DTOs;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Interfaces
{
    public interface ITokenService
    {
        Task<TokenPairDto> CreateTokenPairAsync(User user);
        Task<TokenPairDto?> RotateRefreshTokenAsync(string refreshToken);
        Task RevokeRefreshTokenAsync(string refreshToken);
        Task RevokeAsync(string token);
        Task RevokeAllAsync(string userId);
        Task<bool> IsTokenValidAsync(string token);
    }
}
