using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Accounts.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthenticationDto>>
{
    private readonly IAccountRepository _accountRepository;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(IAccountRepository accountRepository, ILogger<LoginCommandHandler> logger)
    {
        _accountRepository = accountRepository;
        _logger = logger;
    }

    public async Task<Result<AuthenticationDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("User login attempt: {Email}", request.Email);
        var loginDto = new LoginDto
        {
            Email = request.Email,
            Password = request.Password
        };

        var authDto = await _accountRepository.LoginAsync(loginDto);
        if (!authDto.IsSuccess)
        {
            _logger.LogWarning("Login failed for {Email}", request.Email);
            return Result.Failure<AuthenticationDto>(Errors.InvalidCredentials);
        }
        return Result.Success(authDto);
    }
}
