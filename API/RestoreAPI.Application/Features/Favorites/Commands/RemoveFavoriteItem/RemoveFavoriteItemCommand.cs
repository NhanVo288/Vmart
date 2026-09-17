using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.Favorites.Commands.RemoveFavoriteItem;

public class RemoveFavoriteItemCommand : IRequest<Result>
{
    public string BuyerId { get; init; } = string.Empty;
    public int ProductId { get; init; }
}
