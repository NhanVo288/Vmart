using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Accounts.Commands.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    private readonly IAccountRepository _accountRepository;
    private readonly ILogger<LogoutCommandHandler> _logger;

    public LogoutCommandHandler(IAccountRepository accountRepository, ILogger<LogoutCommandHandler> logger)
    {
        _accountRepository = accountRepository;
        _logger = logger;
    }

    public async Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("User logged out");
        await _accountRepository.LogoutAsync(request.BearerToken);
        return Result.Success();
    }
}
