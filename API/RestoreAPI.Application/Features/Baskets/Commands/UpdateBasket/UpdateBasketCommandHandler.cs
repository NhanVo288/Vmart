using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Baskets.Commands.UpdateBasket;

public class UpdateBasketCommandHandler : IRequestHandler<UpdateBasketCommand, Result<BasketDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateBasketCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BasketDto>> Handle(UpdateBasketCommand request, CancellationToken cancellationToken)
    {
        var basket = await _unitOfWork.Baskets.GetBasketAsync(request.BuyerId);
        if (basket is null)
            return Result.Failure<BasketDto>(Errors.BasketNotFound);

        basket.Clear();
        foreach (var item in request.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
            if (product is null)
                return Result.Failure<BasketDto>(Errors.ProductNotFound(item.ProductId));
            if (product.QuantityInStock < item.Quantity)
                return Result.Failure<BasketDto>(Errors.InsufficientStock(product.Name, product.QuantityInStock, item.Quantity));

            basket.AddItem(item.ProductId, item.Quantity);
        }

        await _unitOfWork.SaveChangesAsync();

        basket = await _unitOfWork.Baskets.GetBasketAsync(request.BuyerId);
        return Result.Success(basket!.ToDto());
    }
}
