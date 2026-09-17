using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Accounts.Commands.Register;

public class RegisterCommand : IRequest<Result<AuthenticationDto>>
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
}
