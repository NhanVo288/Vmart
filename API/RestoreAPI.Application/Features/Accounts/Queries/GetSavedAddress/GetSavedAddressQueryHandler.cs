using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Accounts.Queries.GetSavedAddress;

public class GetSavedAddressQueryHandler : IRequestHandler<GetSavedAddressQuery, AddressDto?>
{
    private readonly IAccountRepository _accountRepository;

    public GetSavedAddressQueryHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<AddressDto?> Handle(GetSavedAddressQuery request, CancellationToken cancellationToken)
    {
        return await _accountRepository.GetSavedAddressAsync(request.Principal);
    }
}
