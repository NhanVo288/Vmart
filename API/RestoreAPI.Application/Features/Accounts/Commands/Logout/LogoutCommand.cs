using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.Accounts.Commands.Logout;

public class LogoutCommand : IRequest<Result>
{
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
}
