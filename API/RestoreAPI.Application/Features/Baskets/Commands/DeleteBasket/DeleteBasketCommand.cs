using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.Baskets.Commands.DeleteBasket;

public class DeleteBasketCommand : IRequest<Result>
{
    public string BuyerId { get; init; } = string.Empty;
}
