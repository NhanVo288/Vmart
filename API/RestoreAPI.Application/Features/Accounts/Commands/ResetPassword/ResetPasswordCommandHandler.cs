using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Accounts.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result>
{
    private readonly IAccountRepository _accountRepository;
    private readonly ILogger<ResetPasswordCommandHandler> _logger;

    public ResetPasswordCommandHandler(IAccountRepository accountRepository, ILogger<ResetPasswordCommandHandler> logger)
    {
        _accountRepository = accountRepository;
        _logger = logger;
    }

    public async Task<Result> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Password reset attempt for {Email}", request.Email);
        var result = await _accountRepository.ResetPasswordAsync(request.Email, request.Token, request.NewPassword);
        if (!result)
            return Result.Failure(Errors.PasswordResetFailed);
        return Result.Success();
    }
}
