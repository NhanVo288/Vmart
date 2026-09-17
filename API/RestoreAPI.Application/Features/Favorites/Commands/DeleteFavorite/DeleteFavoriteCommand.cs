using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.Favorites.Commands.DeleteFavorite;

public class DeleteFavoriteCommand : IRequest<Result>
{
    public string BuyerId { get; init; } = string.Empty;
}
