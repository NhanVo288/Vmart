using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Products.Queries.GetProductById;

public class GetProductByIdQuery : IRequest<Result<ProductDto>>
{
    public int Id { get; init; }
}
