using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Interfaces
{
    public interface ITokenService
    {
        Task<string> CreateTokenAsync(User user);
        Task RevokeAsync(string token);
        Task RevokeAllAsync(string userId);
        Task<bool> IsTokenValidAsync(string token);
    }
}
