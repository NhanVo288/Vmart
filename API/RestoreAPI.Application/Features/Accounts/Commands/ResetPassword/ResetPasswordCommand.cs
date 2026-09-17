using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.Accounts.Commands.ResetPassword;

public class ResetPasswordCommand : IRequest<Result>
{
    public string Email { get; init; } = string.Empty;
    public string Token { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
}
