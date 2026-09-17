using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;

namespace RestoreAPI.Application.Features.Orders.Queries.GetOrders;

public class GetOrdersQuery : IRequest<PaginatedList<OrderDto>>
{
    public string BuyerId { get; init; } = string.Empty;
    public OrderFilterRequest Filter { get; init; } = new();
}
