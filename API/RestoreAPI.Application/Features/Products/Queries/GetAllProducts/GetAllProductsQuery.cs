using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;

namespace RestoreAPI.Application.Features.Products.Queries.GetAllProducts;

public class GetAllProductsQuery : IRequest<PaginatedList<ProductDto>>
{
    public ProductFilterRequest Filter { get; init; } = new();
}
