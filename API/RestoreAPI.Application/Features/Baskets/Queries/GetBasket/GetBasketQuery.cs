using MediatR;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Baskets.Queries.GetBasket;

public class GetBasketQuery : IRequest<BasketDto?>
{
    public string BuyerId { get; init; } = string.Empty;
}
