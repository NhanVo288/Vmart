using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Baskets.Commands.RemoveBasketItem;

public class RemoveBasketItemCommandHandler : IRequestHandler<RemoveBasketItemCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;

    public RemoveBasketItemCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RemoveBasketItemCommand request, CancellationToken cancellationToken)
    {
        var basket = await _unitOfWork.Baskets.GetBasketAsync(request.BuyerId);
        if (basket is null)
            return Result.Failure(Errors.BasketNotFound);

        if (!basket.RemoveItem(request.ProductId))
            return Result.Failure(Errors.BasketEmpty);

        if (basket.Items.Count == 0)
        {
            _unitOfWork.Baskets.Delete(basket);
        }

        await _unitOfWork.SaveChangesAsync();
        return Result.Success();
    }
}
