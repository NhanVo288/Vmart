using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Models;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Interfaces;

public interface IAdminNotificationRepository
{
    Task<AdminNotification> AddNotificationAsync(AdminNotification notification, CancellationToken ct = default);
    Task<PaginatedList<AdminNotificationDto>> GetPaginatedNotificationsAsync(int pageNumber, int pageSize, bool? isRead = null, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(CancellationToken ct = default);
    Task<bool> MarkAsReadAsync(int id, CancellationToken ct = default);
    Task MarkAllAsReadAsync(CancellationToken ct = default);
}
