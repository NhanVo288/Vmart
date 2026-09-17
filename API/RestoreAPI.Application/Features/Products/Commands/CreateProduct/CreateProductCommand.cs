using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Products.Commands.CreateProduct;

public class CreateProductCommand : IRequest<Result<ProductDto>>
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public int QuantityInStock { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Brand { get; init; } = string.Empty;
    public Stream? ImageStream { get; init; }
    public string? ImageFileName { get; init; }
    public string? SellerId { get; init; }
    public string? VendorName { get; init; }
}
