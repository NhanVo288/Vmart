using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Features.StockNotifications.Commands.Subscribe;

public class SubscribeCommandHandler : IRequestHandler<SubscribeCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<SubscribeCommandHandler> _logger;

    public SubscribeCommandHandler(IUnitOfWork unitOfWork, ILogger<SubscribeCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(SubscribeCommand request, CancellationToken ct)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId);
        if (product is null)
            return Result.Failure(Errors.ProductNotFound(request.ProductId));

        if (product.QuantityInStock > 0)
            return Result.Failure(Errors.ProductInStock);

        var existing = await _unitOfWork.StockNotifications.GetByEmailAndProductAsync(request.Email, request.ProductId);
        if (existing is not null)
        {
            if (existing.IsNotified)
            {
                existing.IsNotified = false;
                existing.NotifiedAt = null;
                await _unitOfWork.SaveChangesAsync(ct);
                return Result.Success();
            }
            return Result.Failure(Errors.AlreadySubscribed);
        }

        var notification = new StockNotification
        {
            ProductId = request.ProductId,
            Email = request.Email
        };

        await _unitOfWork.StockNotifications.AddAsync(notification);
        await _unitOfWork.SaveChangesAsync(ct);
        return Result.Success();
    }
}
