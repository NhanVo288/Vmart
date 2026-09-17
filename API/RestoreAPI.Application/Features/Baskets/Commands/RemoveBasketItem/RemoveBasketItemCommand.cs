using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.Baskets.Commands.RemoveBasketItem;

public class RemoveBasketItemCommand : IRequest<Result>
{
    public string BuyerId { get; init; } = string.Empty;
    public int ProductId { get; init; }
}
