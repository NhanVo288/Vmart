using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Features.Accounts.Commands.CreateOrUpdateAddress;
using RestoreAPI.Application.Features.Accounts.Commands.ForgotPassword;
using RestoreAPI.Application.Features.Accounts.Commands.Login;
using RestoreAPI.Application.Features.Accounts.Commands.Logout;
using RestoreAPI.Application.Features.Accounts.Commands.Register;
using RestoreAPI.Application.Features.Accounts.Commands.ResetPassword;
using RestoreAPI.Application.Features.Accounts.Queries.GetSavedAddress;
using RestoreAPI.Application.Features.Accounts.Queries.GetUserInfo;
using RestoreAPI.Presentation.Common;

namespace RestoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger<AccountController> _logger;

        public AccountController(IMediator mediator, ILogger<AccountController> logger)
        {
            _mediator = mediator;
            _logger = logger;
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

            return CreatedAtAction(nameof(GetUserInfo), result.Value);
        }

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
            return result.ToActionResult(this);
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            await _mediator.Send(new LogoutCommand { BearerToken = token });

            foreach (var cookie in Request.Cookies.Keys)
            {
                Response.Cookies.Delete(cookie);
            }

            _logger.LogInformation("User logged out");
            return NoContent();
        }

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
