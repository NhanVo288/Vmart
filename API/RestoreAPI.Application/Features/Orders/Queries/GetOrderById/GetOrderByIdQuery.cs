using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Orders.Queries.GetOrderById;

public class GetOrderByIdQuery : IRequest<Result<OrderDto>>
{
    public int Id { get; init; }
    public string BuyerId { get; init; } = string.Empty;
}
