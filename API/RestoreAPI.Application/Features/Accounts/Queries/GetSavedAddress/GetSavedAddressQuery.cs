using System.Security.Claims;
using MediatR;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Accounts.Queries.GetSavedAddress;

public class GetSavedAddressQuery : IRequest<AddressDto?>
{
    public ClaimsPrincipal Principal { get; init; } = new();
}
