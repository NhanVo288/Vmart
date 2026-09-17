using MediatR;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Favorites.Queries.GetFavorite;

public class GetFavoriteQuery : IRequest<FavoriteDto?>
{
    public string BuyerId { get; init; } = string.Empty;
}
