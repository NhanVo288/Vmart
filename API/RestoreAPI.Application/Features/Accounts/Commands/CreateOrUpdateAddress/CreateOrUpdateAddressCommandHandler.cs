using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Accounts.Commands.CreateOrUpdateAddress;

public class CreateOrUpdateAddressCommandHandler : IRequestHandler<CreateOrUpdateAddressCommand, Result<AddressDto>>
{
    private readonly IAccountRepository _accountRepository;

    public CreateOrUpdateAddressCommandHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<Result<AddressDto>> Handle(CreateOrUpdateAddressCommand request, CancellationToken cancellationToken)
    {
        return await _accountRepository.CreateOrUpdateAddressAsync(request.Principal, request.Address);
    }
}
