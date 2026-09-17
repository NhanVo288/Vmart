using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Features.Favorites.Commands.TransferFavorite;

public class TransferFavoriteCommandHandler : IRequestHandler<TransferFavoriteCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TransferFavoriteCommandHandler> _logger;

    public TransferFavoriteCommandHandler(IUnitOfWork unitOfWork, ILogger<TransferFavoriteCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(TransferFavoriteCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.AnonymousBuyerId) || string.IsNullOrWhiteSpace(request.UserBuyerId))
            return Result.Success();
        if (request.AnonymousBuyerId == request.UserBuyerId)
            return Result.Success();

        var anonFavorite = await _unitOfWork.Favorites.GetFavoriteAsync(request.AnonymousBuyerId);
        if (anonFavorite is null || anonFavorite.Items.Count == 0)
            return Result.Success();

        var userFavorite = await _unitOfWork.Favorites.GetFavoriteAsync(request.UserBuyerId);
        if (userFavorite is null)
        {
            userFavorite = new Favorite(request.UserBuyerId);
            await _unitOfWork.Favorites.AddAsync(userFavorite);
        }

        foreach (var item in anonFavorite.Items)
        {
            userFavorite.AddItem(item.ProductId);
        }

        _unitOfWork.Favorites.Delete(anonFavorite);
        await _unitOfWork.SaveChangesAsync(ct);
        _logger.LogInformation("Favorites transferred from anonymous to user {UserId}", request.UserBuyerId);
        return Result.Success();
    }
}
