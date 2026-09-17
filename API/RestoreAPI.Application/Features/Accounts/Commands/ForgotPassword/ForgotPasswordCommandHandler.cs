using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Accounts.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result>
{
    private readonly IAccountRepository _accountRepository;
    private readonly ILogger<ForgotPasswordCommandHandler> _logger;

    public ForgotPasswordCommandHandler(IAccountRepository accountRepository, ILogger<ForgotPasswordCommandHandler> logger)
    {
        _accountRepository = accountRepository;
        _logger = logger;
    }

    public async Task<Result> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Password reset requested for {Email}", request.Email);
        await _accountRepository.ForgotPasswordAsync(request.Email);
        return Result.Success();
    }
}
