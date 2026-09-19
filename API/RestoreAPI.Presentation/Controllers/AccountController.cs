using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Features.Accounts.Commands.CreateOrUpdateAddress;
using RestoreAPI.Application.Features.Accounts.Commands.ForgotPassword;
using RestoreAPI.Application.Features.Accounts.Commands.Login;
using RestoreAPI.Application.Features.Accounts.Commands.Logout;
using RestoreAPI.Application.Features.Accounts.Commands.Register;
using RestoreAPI.Application.Features.Accounts.Commands.ResetPassword;
using RestoreAPI.Application.Features.Accounts.Queries.GetSavedAddress;
using RestoreAPI.Application.Features.Accounts.Queries.GetUserInfo;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Settings;
using RestoreAPI.Presentation.Common;

namespace RestoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger<AccountController> _logger;
        private readonly ITokenService _tokenService;
        private readonly JwtSettings _jwtSettings;

        public AccountController(
            IMediator mediator,
            ILogger<AccountController> logger,
            ITokenService tokenService,
            JwtSettings jwtSettings)
        {
            _mediator = mediator;
            _logger = logger;
            _tokenService = tokenService;
            _jwtSettings = jwtSettings;
        }

        [HttpPost("register")]
        public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
        {
            var result = await _mediator.Send(new RegisterCommand
            {
                Email = registerDto.Email,
                Password = registerDto.Password
            });

            if (result.IsFailure)
                return result.ToActionResult(this);

            _logger.LogInformation("New user registered: {Email}", registerDto.Email);

            if (!string.IsNullOrEmpty(result.Value!.UserId))
            {
                await TransferAnonymousBuyerAsync(result.Value.UserId, _mediator);
            }

            SetAuthenticationCookies(result.Value);

            return CreatedAtAction(nameof(GetUserInfo), result.Value);
        }

        [Authorize]
        [HttpGet("user-info")]
        public async Task<ActionResult> GetUserInfo()
        {
            if (User.Identity?.IsAuthenticated != true) return NoContent();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                await TransferAnonymousBuyerAsync(userId, _mediator);
            }

            var userInfo = await _mediator.Send(new GetUserInfoQuery { Principal = User });

            if (userInfo == null) return NoContent();

            return Ok(new
            {
                userInfo.Email,
                userInfo.UserName,
                userInfo.Roles
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthenticationDto>> Login(LoginDto loginDto)
        {
            var result = await _mediator.Send(new LoginCommand
            {
                Email = loginDto.Email,
                Password = loginDto.Password
            });

            if (result.IsFailure)
                return result.ToActionResult(this);

            SetAuthenticationCookies(result.Value);

            return Ok(result.Value);
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<ActionResult> Refresh()
        {
            if (!Request.Cookies.TryGetValue(
                    AuthenticationConstants.RefreshTokenCookieName,
                    out var refreshToken))
            {
                return Unauthorized();
            }

            var tokens = await _tokenService.RotateRefreshTokenAsync(refreshToken);
            if (tokens is null)
            {
                return Unauthorized();
            }

            SetAuthenticationCookies(tokens.AccessToken, tokens.RefreshToken);
            return NoContent();
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            var accessToken = Request.Cookies[AuthenticationConstants.AccessTokenCookieName]
                ?? Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            var refreshToken = Request.Cookies[AuthenticationConstants.RefreshTokenCookieName]
                ?? string.Empty;

            await _mediator.Send(new LogoutCommand
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });

            foreach (var cookie in Request.Cookies.Keys)
            {
                Response.Cookies.Delete(cookie);
            }

            DeleteAuthenticationCookies();

            _logger.LogInformation("User logged out");
            return NoContent();
        }

        private void SetAuthenticationCookies(AuthenticationDto authentication)
        {
            if (string.IsNullOrWhiteSpace(authentication.AccessToken) ||
                string.IsNullOrWhiteSpace(authentication.RefreshToken))
            {
                throw new InvalidOperationException("Authentication tokens were not created.");
            }

            SetAuthenticationCookies(authentication.AccessToken, authentication.RefreshToken);
        }

        private void SetAuthenticationCookies(string accessToken, string refreshToken)
        {
            Response.Cookies.Append(
                AuthenticationConstants.AccessTokenCookieName,
                accessToken,
                BuildAccessTokenCookieOptions());
            Response.Cookies.Append(
                AuthenticationConstants.RefreshTokenCookieName,
                refreshToken,
                BuildRefreshTokenCookieOptions());

            Response.Cookies.Delete(
                AuthenticationConstants.LegacyHangfireCookieName,
                BuildLegacyHangfireCookieOptions());
        }

        private void DeleteAuthenticationCookies()
        {
            Response.Cookies.Delete(
                AuthenticationConstants.AccessTokenCookieName,
                BuildAccessTokenCookieOptions());
            Response.Cookies.Delete(
                AuthenticationConstants.RefreshTokenCookieName,
                BuildRefreshTokenCookieOptions());
            Response.Cookies.Delete(
                AuthenticationConstants.LegacyHangfireCookieName,
                BuildLegacyHangfireCookieOptions());
        }

        private CookieOptions BuildAccessTokenCookieOptions() => new()
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Strict,
            Secure = Request.IsHttps,
            Expires = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.AccessTokenMinutes),
            Path = "/"
        };

        private CookieOptions BuildRefreshTokenCookieOptions() => new()
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Strict,
            Secure = Request.IsHttps,
            Expires = DateTimeOffset.UtcNow.AddDays(_jwtSettings.RefreshTokenDays),
            Path = "/"
        };

        private CookieOptions BuildLegacyHangfireCookieOptions() => new()
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Strict,
            Secure = Request.IsHttps,
            Path = "/hangfire"
        };

        [Authorize]
        [HttpPost("address")]
        public async Task<ActionResult<AddressDto>> CreateOrUpdateAddress(AddressDto addressDto)
        {
            var result = await _mediator.Send(new CreateOrUpdateAddressCommand
            {
                Principal = User,
                Address = addressDto
            });
            return result.ToActionResult(this);
        }

        [Authorize]
        [HttpGet("address")]
        public async Task<ActionResult<AddressDto>> GetSavedAddress()
        {
            var address = await _mediator.Send(new GetSavedAddressQuery { Principal = User });

            if (address == null) return NoContent();

            return Ok(address);
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            await _mediator.Send(new ForgotPasswordCommand { Email = dto.Email });
            _logger.LogInformation("Password reset requested for {Email}", dto.Email);
            return Ok(new { message = "If an account exists with this email, you will receive a password reset link." });
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var result = await _mediator.Send(new ResetPasswordCommand
            {
                Email = dto.Email,
                Token = dto.Token,
                NewPassword = dto.NewPassword
            });

            if (result.IsFailure)
                return result.ToActionResult(this);

            _logger.LogInformation("Password reset completed for {Email}", dto.Email);
            return Ok(new { message = "Password has been reset successfully." });
        }
    }
}
