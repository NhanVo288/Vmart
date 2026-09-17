using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;

namespace RestoreAPI.Application.Features.Orders.Queries.GetVendorOrders;

public class GetVendorOrdersQuery : IRequest<PaginatedList<VendorOrderDto>>
{
    public string VendorId { get; init; } = string.Empty;
    public OrderFilterRequest Filter { get; init; } = new();
}
