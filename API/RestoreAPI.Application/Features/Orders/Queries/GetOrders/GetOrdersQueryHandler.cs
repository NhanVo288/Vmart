using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;

namespace RestoreAPI.Application.Features.Orders.Queries.GetOrders;

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, PaginatedList<OrderDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetOrdersQueryHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<PaginatedList<OrderDto>> Handle(GetOrdersQuery request, CancellationToken ct)
    {
        return await _unitOfWork.Orders.GetOrdersByBuyerIdAsync(request.BuyerId, request.Filter);
    }
}
