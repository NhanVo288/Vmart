using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Favorites.Queries.GetFavorite;

public class GetFavoriteQueryHandler
    : IRequestHandler<GetFavoriteQuery, FavoriteDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetFavoriteQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<FavoriteDto?> Handle(
        GetFavoriteQuery request, CancellationToken ct)
    {
        var favorite = await _unitOfWork.Favorites
            .GetFavoriteAsync(request.BuyerId);

        return favorite?.ToDto();
    }
}
