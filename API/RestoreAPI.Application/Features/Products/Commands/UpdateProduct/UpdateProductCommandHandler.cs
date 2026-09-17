using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Products.Commands.UpdateProduct;

public class UpdateProductCommandHandler
    : IRequestHandler<UpdateProductCommand, Result<ProductDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ICacheService _cacheService;
    private readonly ILogger<UpdateProductCommandHandler> _logger;

    public UpdateProductCommandHandler(
        IUnitOfWork unitOfWork, IFileStorageService fileStorageService,
        IBackgroundJobService backgroundJobService,
        ICacheService cacheService,
        ILogger<UpdateProductCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
        _backgroundJobService = backgroundJobService;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<Result<ProductDto>> Handle(
        UpdateProductCommand request, CancellationToken ct)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(request.Id);
        if (product is null)
            return Result.Failure<ProductDto>(Errors.ProductNotFound(request.Id));

        if (request.ActorRole == "Vendor" && product.SellerId != request.ActorId)
            return Result.Failure<ProductDto>(new Error("Product.Forbidden", "You can only modify your own products.", ErrorType.Forbidden));

        var wasOutOfStock = product.QuantityInStock == 0;

        if (request.Name is not null) product.Name = request.Name;
        if (request.Description is not null) product.Description = request.Description;
        if (request.Price.HasValue) product.Price = request.Price.Value;
        if (request.QuantityInStock.HasValue) product.QuantityInStock = request.QuantityInStock.Value;
        if (request.Type is not null) product.Type = request.Type;
        if (request.Brand is not null) product.Brand = request.Brand;

        if (request.ImageStream is not null)
        {
            var oldPublicId = product.CloudinaryPublicId;

            var upload = await _fileStorageService.UploadAsync(
                request.ImageStream, request.ImageFileName!, ct);
            product.PictureUrl = upload.Url;
            product.CloudinaryPublicId = upload.PublicId;

            await _unitOfWork.SaveChangesAsync(ct);
            await _cacheService.RemoveByPrefixAsync("products:", ct);

            if (!string.IsNullOrEmpty(oldPublicId))
            {
                try
                {
                    await _fileStorageService.DeleteAsync(oldPublicId, ct);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete old image {PublicId} after update", oldPublicId);
                }
            }

            if (wasOutOfStock && product.QuantityInStock > 0)
                _backgroundJobService.Enqueue<IStockNotificationService>(
                    x => x.NotifySubscribersAsync(product.Id));

            _logger.LogInformation("Product {ProductId} updated", request.Id);
            return Result.Success(MapToDto(product));
        }

        await _unitOfWork.SaveChangesAsync(ct);
        await _cacheService.RemoveByPrefixAsync("products:", ct);

        if (wasOutOfStock && product.QuantityInStock > 0)
            _backgroundJobService.Enqueue<IStockNotificationService>(
                x => x.NotifySubscribersAsync(product.Id));

        _logger.LogInformation("Product {ProductId} updated", request.Id);
        return Result.Success(MapToDto(product));
    }

    private static ProductDto MapToDto(Domain.Entities.Product p) => new()
    {
        Id = p.Id, Name = p.Name, Description = p.Description,
        Price = p.Price, PictureUrl = p.PictureUrl,
        QuantityInStock = p.QuantityInStock, Type = p.Type,
        Brand = p.Brand, SellerId = p.SellerId
    };
}
