using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;

namespace RestoreAPI.Application.Features.AdminNotifications.Queries.GetAdminNotifications;

public class GetAdminNotificationsQueryHandler : IRequestHandler<GetAdminNotificationsQuery, PaginatedList<AdminNotificationDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAdminNotificationsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PaginatedList<AdminNotificationDto>> Handle(GetAdminNotificationsQuery request, CancellationToken ct)
    {
        return await _unitOfWork.AdminNotifications.GetPaginatedNotificationsAsync(request.PageNumber, request.PageSize, request.IsRead, ct);
    }
}
