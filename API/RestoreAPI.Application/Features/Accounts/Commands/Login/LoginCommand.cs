using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Accounts.Commands.Login;

public class LoginCommand : IRequest<Result<AuthenticationDto>>
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}
