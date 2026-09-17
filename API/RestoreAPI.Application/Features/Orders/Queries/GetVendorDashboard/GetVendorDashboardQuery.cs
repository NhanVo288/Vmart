using MediatR;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Orders.Queries.GetVendorDashboard;

public class GetVendorDashboardQuery : IRequest<VendorDashboardDto>
{
    public string VendorId { get; init; } = string.Empty;
}
