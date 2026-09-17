using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Favorites.Commands.AddFavoriteItem;

public class AddFavoriteItemCommand : IRequest<Result<FavoriteDto>>
{
    public string BuyerId { get; init; } = string.Empty;
    public int ProductId { get; init; }
}
