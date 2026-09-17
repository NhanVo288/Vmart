using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Features.Baskets.Commands.TransferBasket;

public class TransferBasketCommandHandler : IRequestHandler<TransferBasketCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TransferBasketCommandHandler> _logger;

    public TransferBasketCommandHandler(IUnitOfWork unitOfWork, ILogger<TransferBasketCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(TransferBasketCommand request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.AnonymousBuyerId) || string.IsNullOrWhiteSpace(request.UserBuyerId))
            return Result.Success();
        if (request.AnonymousBuyerId == request.UserBuyerId)
            return Result.Success();

        var anonBasket = await _unitOfWork.Baskets.GetBasketAsync(request.AnonymousBuyerId);
        if (anonBasket is null || anonBasket.Items.Count == 0)
            return Result.Success();

        var userBasket = await _unitOfWork.Baskets.GetBasketAsync(request.UserBuyerId);
        if (userBasket is null)
        {
            userBasket = new Basket(request.UserBuyerId);
            await _unitOfWork.Baskets.AddAsync(userBasket);
        }

        foreach (var item in anonBasket.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
            if (product is null) continue;
            var quantityToAdd = Math.Min(item.Quantity, product.QuantityInStock);
            if (quantityToAdd > 0)
                userBasket.AddItem(item.ProductId, quantityToAdd);
        }

        _unitOfWork.Baskets.Delete(anonBasket);
        await _unitOfWork.SaveChangesAsync(ct);
        _logger.LogInformation("Basket transferred from anonymous to user {UserId}", request.UserBuyerId);
        return Result.Success();
    }
}
