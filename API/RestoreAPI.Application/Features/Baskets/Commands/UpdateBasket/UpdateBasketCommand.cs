using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Requests;

namespace RestoreAPI.Application.Features.Baskets.Commands.UpdateBasket;

public class UpdateBasketCommand : IRequest<Result<BasketDto>>
{
    public string BuyerId { get; init; } = string.Empty;
    public List<BasketItemRequest> Items { get; init; } = new();
}
