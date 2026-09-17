using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Baskets.Commands.CreateBasket;

public class CreateBasketCommandHandler : IRequestHandler<CreateBasketCommand, Result<BasketDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateBasketCommandHandler> _logger;

    public CreateBasketCommandHandler(IUnitOfWork unitOfWork, ILogger<CreateBasketCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<BasketDto>> Handle(CreateBasketCommand request, CancellationToken cancellationToken)
    {
        var basket = await _unitOfWork.Baskets.GetBasketAsync(request.BuyerId);

        if (basket is null)
        {
            basket = new Domain.Entities.Basket(request.BuyerId);
            await _unitOfWork.Baskets.AddAsync(basket);
        }

        foreach (var item in request.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
            if (product is null)
                return Result.Failure<BasketDto>(Errors.ProductNotFound(item.ProductId));
            if (product.QuantityInStock < item.Quantity)
            {
                _logger.LogWarning("Stock validation failed for product {ProductId}: requested {Requested}, available {Available}", item.ProductId, item.Quantity, product.QuantityInStock);
                return Result.Failure<BasketDto>(Errors.InsufficientStock(product.Name, product.QuantityInStock, item.Quantity));
            }

            basket.AddItem(item.ProductId, item.Quantity);
        }

        await _unitOfWork.SaveChangesAsync();

        basket = await _unitOfWork.Baskets.GetBasketAsync(request.BuyerId);
        _logger.LogInformation("Basket created: {BasketId}", basket!.Id);
        return Result.Success(basket.ToDto());
    }
}
