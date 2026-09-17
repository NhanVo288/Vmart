using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Favorites.Commands.RemoveFavoriteItem;

public class RemoveFavoriteItemCommandHandler
    : IRequestHandler<RemoveFavoriteItemCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RemoveFavoriteItemCommandHandler> _logger;

    public RemoveFavoriteItemCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<RemoveFavoriteItemCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(
        RemoveFavoriteItemCommand request, CancellationToken ct)
    {
        var favorite = await _unitOfWork.Favorites.GetFavoriteAsync(request.BuyerId);
        if (favorite is null)
            return Result.Failure(Errors.FavoriteNotFound);

        if (!favorite.RemoveItem(request.ProductId))
            return Result.Failure(Errors.FavoriteItemNotFound);

        if (favorite.Items.Count == 0)
        {
            _unitOfWork.Favorites.Delete(favorite);
        }

        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Favorite removed for product {ProductId} by user {UserId}",
            request.ProductId, request.BuyerId);

        return Result.Success();
    }
}
