using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Baskets.Commands.DeleteBasket;

public class DeleteBasketCommandHandler : IRequestHandler<DeleteBasketCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteBasketCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteBasketCommand request, CancellationToken cancellationToken)
    {
        var basket = await _unitOfWork.Baskets.GetBasketAsync(request.BuyerId);
        if (basket is null)
            return Result.Failure(Errors.BasketNotFound);

        _unitOfWork.Baskets.Delete(basket);
        await _unitOfWork.SaveChangesAsync();
        return Result.Success();
    }
}
