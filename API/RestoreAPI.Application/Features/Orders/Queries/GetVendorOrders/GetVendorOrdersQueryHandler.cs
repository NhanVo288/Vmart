using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;

namespace RestoreAPI.Application.Features.Orders.Queries.GetVendorOrders;

public class GetVendorOrdersQueryHandler : IRequestHandler<GetVendorOrdersQuery, PaginatedList<VendorOrderDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetVendorOrdersQueryHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<PaginatedList<VendorOrderDto>> Handle(GetVendorOrdersQuery request, CancellationToken ct)
    {
        return await _unitOfWork.Orders.GetOrdersByVendorIdAsync(request.VendorId, request.Filter);
    }
}
