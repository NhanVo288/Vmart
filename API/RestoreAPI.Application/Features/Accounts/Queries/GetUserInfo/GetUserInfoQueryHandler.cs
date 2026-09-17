using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Accounts.Queries.GetUserInfo;

public class GetUserInfoQueryHandler : IRequestHandler<GetUserInfoQuery, UserInfoDto?>
{
    private readonly IAccountRepository _accountRepository;

    public GetUserInfoQueryHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<UserInfoDto?> Handle(GetUserInfoQuery request, CancellationToken cancellationToken)
    {
        return await _accountRepository.GetUserInfoAsync(request.Principal);
    }
}
