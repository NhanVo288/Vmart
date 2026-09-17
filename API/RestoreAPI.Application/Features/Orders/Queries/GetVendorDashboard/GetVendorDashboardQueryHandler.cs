using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Requests;

namespace RestoreAPI.Application.Features.Orders.Queries.GetVendorDashboard;

public class GetVendorDashboardQueryHandler : IRequestHandler<GetVendorDashboardQuery, VendorDashboardDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetVendorDashboardQueryHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<VendorDashboardDto> Handle(GetVendorDashboardQuery request, CancellationToken ct)
    {
        var productFilter = new ProductFilterRequest { PageNumber = 1, PageSize = 1 };
        var products = await _unitOfWork.Products.GetAllBySellerIdAsync(request.VendorId, productFilter);

        var orderFilter = new OrderFilterRequest { PageNumber = 1, PageSize = 1 };
        var orders = await _unitOfWork.Orders.GetOrdersByVendorIdAsync(request.VendorId, orderFilter);

        var allOrdersFilter = new OrderFilterRequest { PageNumber = 1, PageSize = 50 };
        var allOrders = await _unitOfWork.Orders.GetOrdersByVendorIdAsync(request.VendorId, allOrdersFilter);

        var revenue = allOrders.Items
            .Where(o => o.Status is "PaymentReceived" or "Shipped" or "Delivered")
            .Sum(o => o.VendorSubtotal);

        return new VendorDashboardDto
        {
            TotalProducts = products.TotalCount,
            TotalOrders = orders.TotalCount,
            TotalRevenue = revenue
        };
    }
}
