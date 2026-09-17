using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Products.Commands.UpdateProduct;

public class UpdateProductCommand : IRequest<Result<ProductDto>>
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public decimal? Price { get; init; }
    public int? QuantityInStock { get; init; }
    public string? Type { get; init; }
    public string? Brand { get; init; }
    public Stream? ImageStream { get; init; }
    public string? ImageFileName { get; init; }
    public string? ActorId { get; init; }
    public string? ActorRole { get; init; }
}
