using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Domain.Entities.Common;

namespace RestoreAPI.Infrastructure.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly SignInManager<User> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;
        private readonly IBackgroundJobService _backgroundJobService;
        private readonly ILogger<AccountRepository> _logger;

        public AccountRepository(
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<User> signInManager,
            ITokenService tokenService,
            IEmailService emailService,
            IBackgroundJobService backgroundJobService,
            ILogger<AccountRepository> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _emailService = emailService;
            _backgroundJobService = backgroundJobService;
            _logger = logger;
        }

        public async Task<AuthenticationDto> RegisterAsync(RegisterDto registerDto)
        {
            var user = new User
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
            };
            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded)
            {
                _logger.LogWarning("Registration failed for email {Email}: {Errors}", registerDto.Email, string.Join(", ", result.Errors.Select(e => e.Description)));
                return new AuthenticationDto
                {
                    IsSuccess = false,
                    Errors = result.Errors.Select(e => e.Description).ToList()
                };
            }

            var roleExists = await _roleManager.RoleExistsAsync("User");
            if (!roleExists)
            {
                await _roleManager.CreateAsync(new IdentityRole("User"));
            }
            await _userManager.AddToRoleAsync(user, "User");

            var token = await _tokenService.CreateTokenAsync(user);

            _logger.LogInformation("User registered: {UserId}", user.Id);

            // Send Welcome Email asynchronously
            _backgroundJobService.Enqueue<IEmailService>(
                x => x.SendWelcomeEmailAsync(user.Email!, user.UserName ?? user.Email!));

            return new AuthenticationDto
            {
                IsSuccess = true,
                Email = user.Email,
                UserId = user.Id,
                Token = token
            };
        }

        public async Task<UserInfoDto?> GetUserInfoAsync(ClaimsPrincipal principal)
        {
            if (principal.Identity?.IsAuthenticated != true) return null;

            var user = await _userManager.GetUserAsync(principal);
            if (user == null) return null;

            var roles = await _userManager.GetRolesAsync(user);

            return new UserInfoDto
            {
                Email = user.Email!,
                UserName = user.UserName!,
                Roles = roles.ToList(),
            };
        }

        public async Task<List<UserListItemDto>> GetAllUsersAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<UserListItemDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(new UserListItemDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    UserName = user.UserName!,
                    Roles = roles.ToList(),
                });
            }

            return result;
        }

        public async Task<UserListItemDto?> GetUserByIdAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return null;

            var roles = await _userManager.GetRolesAsync(user);

            return new UserListItemDto
            {
                Id = user.Id,
                Email = user.Email!,
                UserName = user.UserName!,
                Roles = roles.ToList(),
            };
        }

        public async Task<bool> UpdateUserRolesAsync(string id, List<string> roles)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return false;

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            foreach (var role in roles)
            {
                var roleExists = await _roleManager.RoleExistsAsync(role);
                if (!roleExists)
                    await _roleManager.CreateAsync(new IdentityRole(role));
            }

            var result = await _userManager.AddToRolesAsync(user, roles);
            if (!result.Succeeded)
            {
                _logger.LogError("Failed to update roles for user {UserId}", id);
            }
            else
            {
                _logger.LogInformation("User roles updated: {UserId} -> {Roles}", id, string.Join(", ", roles));
            }
            return result.Succeeded;
        }

        public async Task<AuthenticationDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                _logger.LogWarning("Login failed for email {Email}", loginDto.Email);
                return new AuthenticationDto
                {
                    IsSuccess = false,
                    Errors = new List<string> { "Invalid email or password" }
                };
            }

            var token = await _tokenService.CreateTokenAsync(user);

            return new AuthenticationDto
            {
                IsSuccess = true,
                Email = user.Email,
                UserId = user.Id,
                Token = token
            };
        }

        public async Task LogoutAsync(string token)
        {
            if (!string.IsNullOrEmpty(token))
                await _tokenService.RevokeAsync(token);
        }

        public async Task<Result<AddressDto>> CreateOrUpdateAddressAsync(ClaimsPrincipal principal, AddressDto addressDto)
        {
            var user = await _userManager.GetUserAsync(principal);
            if (user == null)
            {
                var userId = _userManager.GetUserId(principal);
                if (userId != null)
                {
                    user = await _userManager.Users.Include(x => x.Address).FirstOrDefaultAsync(x => x.Id == userId);
                }
            }
            else
            {
                user = await _userManager.Users.Include(x => x.Address).FirstOrDefaultAsync(x => x.Id == user.Id);
            }

            if (user == null)
            {
                _logger.LogWarning("CreateOrUpdateAddress failed: user not found.");
                return Result.Failure<AddressDto>(Errors.UserNotFound);
            }

            user.Address = new Address
            {
                Name = addressDto.Name,
                Line1 = addressDto.Line1,
                Line2 = addressDto.Line2,
                City = addressDto.City,
                State = addressDto.State,
                PostalCode = addressDto.PostalCode,
                Country = addressDto.Country,
            };

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
                _logger.LogError("Failed to update address for user {UserId}: {Errors}", user.Id, errors);
                return Result.Failure<AddressDto>(new Error(
                    "Address.UpdateFailed",
                    $"Failed to save address: {errors}",
                    ErrorType.Failure));
            }

            return Result.Success(addressDto);
        }

        public async Task<AddressDto?> GetSavedAddressAsync(ClaimsPrincipal principal)
        {
            var userId = _userManager.GetUserId(principal);
            if (userId == null)
            {
                var user = await _userManager.GetUserAsync(principal);
                userId = user?.Id;
            }

            if (userId == null) return null;

            var address = await _userManager.Users
                .Where(x => x.Id == userId)
                .AsNoTracking()
                .Select(x => x.Address)
                .FirstOrDefaultAsync();

            if (address == null) return null;

            return new AddressDto
            {
                Name = address.Name,
                Line1 = address.Line1,
                Line2 = address.Line2,
                City = address.City,
                State = address.State,
                PostalCode = address.PostalCode,
                Country = address.Country,
            };
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return;

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            await _emailService.SendPasswordResetLinkAsync(email, user.UserName ?? "there", token);
        }

        public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return false;

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            return result.Succeeded;
        }
    }
}
