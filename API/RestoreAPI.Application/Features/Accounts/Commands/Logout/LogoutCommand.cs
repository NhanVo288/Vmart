using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.Accounts.Commands.Logout;

public class LogoutCommand : IRequest<Result>
{
    public string BearerToken { get; init; } = string.Empty;
}
