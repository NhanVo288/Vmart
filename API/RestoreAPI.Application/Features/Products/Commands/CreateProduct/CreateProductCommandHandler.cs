using MediatR;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Features.Products.Commands.CreateProduct;

public class CreateProductCommandHandler
    : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;
    private readonly IProductNotificationService _notificationService;
    private readonly ICacheService _cacheService;
    private readonly ILogger<CreateProductCommandHandler> _logger;

    public CreateProductCommandHandler(
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorageService,
        IProductNotificationService notificationService,
        ICacheService cacheService,
        ILogger<CreateProductCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
        _notificationService = notificationService;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<Result<ProductDto>> Handle(
        CreateProductCommand request, CancellationToken ct)
    {
        string? pictureUrl = null;
        string? cloudinaryPublicId = null;

        if (request.ImageStream is not null)
        {
            var upload = await _fileStorageService.UploadAsync(
                request.ImageStream, request.ImageFileName!, ct);
            pictureUrl = upload.Url;
            cloudinaryPublicId = upload.PublicId;
        }

        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            QuantityInStock = request.QuantityInStock,
            Type = request.Type,
            Brand = request.Brand,
            PictureUrl = pictureUrl,
            CloudinaryPublicId = cloudinaryPublicId,
            SellerId = request.SellerId
        };

        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.SaveChangesAsync(ct);
        await _cacheService.RemoveByPrefixAsync("products:", ct);

        _logger.LogInformation("Product created: {ProductName}", product.Name);

        var productDto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            PictureUrl = product.PictureUrl,
            QuantityInStock = product.QuantityInStock,
            Type = product.Type,
            Brand = product.Brand,
            SellerId = product.SellerId
        };

        await _notificationService.NotifyProductCreatedAsync(productDto, request.VendorName, ct);

        return Result.Success(productDto);
    }
}
