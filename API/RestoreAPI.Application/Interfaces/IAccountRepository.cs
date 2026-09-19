using System.Security.Claims;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Interfaces
{
    public interface IAccountRepository
    {
        Task<AuthenticationDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthenticationDto> LoginAsync(LoginDto loginDto);
        Task<UserInfoDto?> GetUserInfoAsync(ClaimsPrincipal principal);
        Task<List<UserListItemDto>> GetAllUsersAsync();
        Task<UserListItemDto?> GetUserByIdAsync(string id);
        Task<bool> UpdateUserRolesAsync(string id, List<string> roles);
        Task LogoutAsync(string accessToken, string refreshToken);
        Task<Result<AddressDto>> CreateOrUpdateAddressAsync(ClaimsPrincipal principal, AddressDto addressDto);
        Task<AddressDto?> GetSavedAddressAsync(ClaimsPrincipal principal);
        Task ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
    }
}
