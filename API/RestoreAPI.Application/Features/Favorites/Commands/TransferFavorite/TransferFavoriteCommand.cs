using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.Favorites.Commands.TransferFavorite;

public class TransferFavoriteCommand : IRequest<Result>
{
    public string AnonymousBuyerId { get; init; } = string.Empty;
    public string UserBuyerId { get; init; } = string.Empty;
}
