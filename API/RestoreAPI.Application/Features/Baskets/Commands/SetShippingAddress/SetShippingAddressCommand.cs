using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Baskets.Commands.SetShippingAddress;

public class SetShippingAddressCommand : IRequest<Result<BasketDto>>
{
    public string BuyerId { get; init; } = string.Empty;
    public AddressInput Address { get; init; } = null!;
}
