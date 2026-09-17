using System.Security.Claims;
using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Accounts.Commands.CreateOrUpdateAddress;

public class CreateOrUpdateAddressCommand : IRequest<Result<AddressDto>>
{
    public ClaimsPrincipal Principal { get; init; } = new();
    public AddressDto Address { get; init; } = new()
    {
        Name = string.Empty,
        Line1 = string.Empty,
        City = string.Empty,
        State = string.Empty,
        PostalCode = string.Empty,
        Country = string.Empty
    };
}
