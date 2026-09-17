using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Accounts.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthenticationDto>>
{
    private readonly IAccountRepository _accountRepository;
    private readonly ILogger<RegisterCommandHandler> _logger;

    public RegisterCommandHandler(IAccountRepository accountRepository, ILogger<RegisterCommandHandler> logger)
    {
        _accountRepository = accountRepository;
        _logger = logger;
    }

    public async Task<Result<AuthenticationDto>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("User registration attempt for {Email}", request.Email);
        try
        {
            var registerDto = new RegisterDto
            {
                Email = request.Email,
                Password = request.Password
            };

            var authDto = await _accountRepository.RegisterAsync(registerDto);
            if (!authDto.IsSuccess)
            {
                _logger.LogWarning("Registration failed for {Email}", request.Email);
                return Result.Failure<AuthenticationDto>(
                    Errors.RegistrationFailed(string.Join(", ", authDto.Errors ?? new())));
            }
            return Result.Success(authDto);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Registration failed for {Email}", request.Email);
            throw;
        }
    }
}
