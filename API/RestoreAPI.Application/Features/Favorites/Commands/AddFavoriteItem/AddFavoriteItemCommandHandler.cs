using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Features.Favorites.Commands.AddFavoriteItem;

public class AddFavoriteItemCommandHandler
    : IRequestHandler<AddFavoriteItemCommand, Result<FavoriteDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AddFavoriteItemCommandHandler> _logger;

    public AddFavoriteItemCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<AddFavoriteItemCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<FavoriteDto>> Handle(
        AddFavoriteItemCommand request, CancellationToken ct)
    {
        var favorite = await _unitOfWork.Favorites.GetFavoriteAsync(request.BuyerId);

        if (favorite is null)
        {
            favorite = new Favorite(request.BuyerId);
            await _unitOfWork.Favorites.AddAsync(favorite);
        }

        favorite.AddItem(request.ProductId);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Favorite added for product {ProductId} by user {UserId}",
            request.ProductId, request.BuyerId);

        favorite = await _unitOfWork.Favorites.GetFavoriteAsync(request.BuyerId);
        return Result.Success(favorite!.ToDto());
    }
}
