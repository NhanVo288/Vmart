using Microsoft.EntityFrameworkCore;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Infrastructure.Data;

namespace RestoreAPI.Infrastructure.Repositories;

public class AdminNotificationRepository : IAdminNotificationRepository
{
    private readonly AppDbContext _context;

    public AdminNotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AdminNotification> AddNotificationAsync(AdminNotification notification, CancellationToken ct = default)
    {
        await _context.AdminNotifications.AddAsync(notification, ct);
        return notification;
    }

    public async Task<PaginatedList<AdminNotificationDto>> GetPaginatedNotificationsAsync(int pageNumber, int pageSize, bool? isRead = null, CancellationToken ct = default)
    {
        var query = _context.AdminNotifications
            .AsNoTracking()
            .AsQueryable();

        if (isRead.HasValue)
            query = query.Where(n => n.IsRead == isRead.Value);

        query = query.OrderByDescending(n => n.CreatedAt);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new AdminNotificationDto
            {
                Id = n.Id,
                Action = n.Action,
                ProductId = n.ProductId,
                ProductName = n.ProductName,
                VendorId = n.VendorId,
                VendorName = n.VendorName,
                Message = n.Message,
                CreatedAt = n.CreatedAt,
                IsRead = n.IsRead
            })
            .ToListAsync(ct);

        return new PaginatedList<AdminNotificationDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<int> GetUnreadCountAsync(CancellationToken ct = default)
    {
        return await _context.AdminNotifications
            .Where(n => !n.IsRead)
            .CountAsync(ct);
    }

    public async Task<bool> MarkAsReadAsync(int id, CancellationToken ct = default)
    {
        var notification = await _context.AdminNotifications.FindAsync(new object[] { id }, ct);
        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task MarkAllAsReadAsync(CancellationToken ct = default)
    {
        await _context.AdminNotifications
            .Where(n => !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);
    }
}
