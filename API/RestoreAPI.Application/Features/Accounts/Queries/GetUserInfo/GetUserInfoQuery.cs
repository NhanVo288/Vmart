using System.Security.Claims;
using MediatR;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Accounts.Queries.GetUserInfo;

public class GetUserInfoQuery : IRequest<UserInfoDto?>
{
    public ClaimsPrincipal Principal { get; init; } = new();
}
