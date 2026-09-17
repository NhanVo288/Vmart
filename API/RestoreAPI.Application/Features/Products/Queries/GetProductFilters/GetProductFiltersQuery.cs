using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Requests;

namespace RestoreAPI.Application.Features.Products.Queries.GetProductFilters;

public class GetProductFiltersQuery : IRequest<ProductFiltersDto>
{
    public ProductFilterRequest? Filter { get; init; }
}
