using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;

namespace RestoreAPI.Application.Features.Products.Queries.GetProductsBySellerId;

public class GetProductsBySellerIdQuery : IRequest<PaginatedList<ProductDto>>
{
    public string SellerId { get; init; } = string.Empty;
    public ProductFilterRequest Filter { get; init; } = new();
}
