using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Models;

namespace RestoreAPI.Application.Features.AdminNotifications.Queries.GetAdminNotifications;

public class GetAdminNotificationsQuery : IRequest<PaginatedList<AdminNotificationDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public bool? IsRead { get; init; }
}
