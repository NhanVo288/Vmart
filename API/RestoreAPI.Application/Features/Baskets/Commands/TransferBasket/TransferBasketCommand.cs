using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.Baskets.Commands.TransferBasket;

public class TransferBasketCommand : IRequest<Result>
{
    public string AnonymousBuyerId { get; init; } = string.Empty;
    public string UserBuyerId { get; init; } = string.Empty;
}
