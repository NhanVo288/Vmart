using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.Products.Commands.DeleteProduct;

public class DeleteProductCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string? ActorId { get; init; }
    public string? ActorRole { get; init; }
    public string? ActorName { get; init; }
}
