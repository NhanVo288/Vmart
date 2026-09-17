using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Favorites.Commands.DeleteFavorite;

public class DeleteFavoriteCommandHandler
    : IRequestHandler<DeleteFavoriteCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteFavoriteCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(
        DeleteFavoriteCommand request, CancellationToken ct)
    {
        var favorite = await _unitOfWork.Favorites.GetFavoriteAsync(request.BuyerId);
        if (favorite is null)
            return Result.Failure(Errors.FavoriteNotFound);

        _unitOfWork.Favorites.Delete(favorite);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Success();
    }
}
