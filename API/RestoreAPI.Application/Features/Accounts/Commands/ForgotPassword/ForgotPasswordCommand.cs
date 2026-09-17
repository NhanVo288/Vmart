using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.Accounts.Commands.ForgotPassword;

public class ForgotPasswordCommand : IRequest<Result>
{
    public string Email { get; init; } = string.Empty;
}
