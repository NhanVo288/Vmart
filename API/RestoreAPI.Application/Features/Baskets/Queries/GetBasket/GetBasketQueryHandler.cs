using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Baskets.Queries.GetBasket;

public class GetBasketQueryHandler : IRequestHandler<GetBasketQuery, BasketDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetBasketQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<BasketDto?> Handle(GetBasketQuery request, CancellationToken cancellationToken)
    {
        var basket = await _unitOfWork.Baskets.GetBasketAsync(request.BuyerId);
        return basket?.ToDto();
    }
}
