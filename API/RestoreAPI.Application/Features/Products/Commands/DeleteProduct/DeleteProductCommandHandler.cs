using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Products.Commands.DeleteProduct;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;
    private readonly IProductNotificationService _notificationService;
    private readonly ICacheService _cacheService;
    private readonly ILogger<DeleteProductCommandHandler> _logger;

    public DeleteProductCommandHandler(
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorageService,
        IProductNotificationService notificationService,
        ICacheService cacheService,
        ILogger<DeleteProductCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
        _notificationService = notificationService;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteProductCommand request, CancellationToken ct)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(request.Id);
        if (product is null)
            return Result.Failure(Errors.ProductNotFound(request.Id));

        if (request.ActorRole == "Vendor" && product.SellerId != request.ActorId)
            return Result.Failure(new Error("Product.Forbidden", "You can only delete your own products.", ErrorType.Forbidden));

        var productName = product.Name;
        var sellerId = product.SellerId;
        var publicId = product.CloudinaryPublicId;

        _unitOfWork.Products.Delete(product);
        await _unitOfWork.SaveChangesAsync(ct);
        await _cacheService.RemoveByPrefixAsync("products:", ct);
        _logger.LogInformation("Product {ProductId} deleted from database", request.Id);

        await _notificationService.NotifyProductDeletedAsync(request.Id, productName, sellerId, request.ActorName, ct);

        if (!string.IsNullOrEmpty(publicId))
        {
            try
            {
                await _fileStorageService.DeleteAsync(publicId, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete image {PublicId} for deleted product {ProductId}", publicId, request.Id);
            }
        }

        return Result.Success();
    }
}
