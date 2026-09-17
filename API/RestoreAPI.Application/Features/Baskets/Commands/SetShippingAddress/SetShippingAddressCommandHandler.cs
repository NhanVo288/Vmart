using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Baskets.Commands.SetShippingAddress;

public class SetShippingAddressCommandHandler : IRequestHandler<SetShippingAddressCommand, Result<BasketDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public SetShippingAddressCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BasketDto>> Handle(SetShippingAddressCommand request, CancellationToken cancellationToken)
    {
        var basket = await _unitOfWork.Baskets.GetBasketAsync(request.BuyerId);
        if (basket is null)
            return Result.Failure<BasketDto>(Errors.BasketNotFound);

        basket.SetShippingAddress(
            request.Address.Name,
            request.Address.Line1,
            request.Address.Line2,
            request.Address.City,
            request.Address.State,
            request.Address.PostalCode,
            request.Address.Country
        );

        await _unitOfWork.SaveChangesAsync();

        basket = await _unitOfWork.Baskets.GetBasketAsync(request.BuyerId);
        return Result.Success(basket!.ToDto());
    }
}
