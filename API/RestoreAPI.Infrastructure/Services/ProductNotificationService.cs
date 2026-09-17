using Microsoft.AspNetCore.SignalR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Infrastructure.Hubs;

namespace RestoreAPI.Infrastructure.Services;

public class ProductNotificationService : IProductNotificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHubContext<ProductHub> _hubContext;

    public ProductNotificationService(IUnitOfWork unitOfWork, IHubContext<ProductHub> hubContext)
    {
        _unitOfWork = unitOfWork;
        _hubContext = hubContext;
    }

    public async Task NotifyProductCreatedAsync(ProductDto product, string? vendorName, CancellationToken ct = default)
    {
        if (!string.IsNullOrEmpty(product.SellerId))
        {
            var displayName = !string.IsNullOrEmpty(vendorName) ? vendorName : "Vendor";
            var notification = new AdminNotification
            {
                Action = "ProductCreated",
                ProductId = product.Id,
                ProductName = product.Name,
                VendorId = product.SellerId,
                VendorName = displayName,
                Message = $"Vendor {displayName} added product '{product.Name}'",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _unitOfWork.AdminNotifications.AddNotificationAsync(notification, ct);
            await _unitOfWork.SaveChangesAsync(ct);

            var notificationDto = new AdminNotificationDto
            {
                Id = notification.Id,
                Action = notification.Action,
                ProductId = notification.ProductId,
                ProductName = notification.ProductName,
                VendorId = notification.VendorId,
                VendorName = notification.VendorName,
                Message = notification.Message,
                CreatedAt = notification.CreatedAt,
                IsRead = notification.IsRead
            };

            await _hubContext.Clients.Group("admins")
                .SendAsync("ReceiveAdminNotification", notificationDto, cancellationToken: ct);
        }

        await _hubContext.Clients.Group("admins")
            .SendAsync("ProductCreated", product, cancellationToken: ct);

        if (!string.IsNullOrEmpty(product.SellerId))
        {
            await _hubContext.Clients.Group($"vendor-{product.SellerId}")
                .SendAsync("ProductCreated", product, cancellationToken: ct);
        }
    }

    public async Task NotifyProductDeletedAsync(int productId, string productName, string? vendorId, string? vendorName, CancellationToken ct = default)
    {
        if (!string.IsNullOrEmpty(vendorId))
        {
            var displayName = !string.IsNullOrEmpty(vendorName) ? vendorName : "Vendor";
            var notification = new AdminNotification
            {
                Action = "ProductDeleted",
                ProductId = productId,
                ProductName = productName,
                VendorId = vendorId,
                VendorName = displayName,
                Message = $"Vendor {displayName} deleted product '{productName}'",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _unitOfWork.AdminNotifications.AddNotificationAsync(notification, ct);
            await _unitOfWork.SaveChangesAsync(ct);

            var notificationDto = new AdminNotificationDto
            {
                Id = notification.Id,
                Action = notification.Action,
                ProductId = notification.ProductId,
                ProductName = notification.ProductName,
                VendorId = notification.VendorId,
                VendorName = notification.VendorName,
                Message = notification.Message,
                CreatedAt = notification.CreatedAt,
                IsRead = notification.IsRead
            };

            await _hubContext.Clients.Group("admins")
                .SendAsync("ReceiveAdminNotification", notificationDto, cancellationToken: ct);
        }

        await _hubContext.Clients.Group("admins")
            .SendAsync("ProductDeleted", new { id = productId }, cancellationToken: ct);

        if (!string.IsNullOrEmpty(vendorId))
        {
            await _hubContext.Clients.Group($"vendor-{vendorId}")
                .SendAsync("ProductDeleted", new { id = productId }, cancellationToken: ct);
        }
    }

    public async Task NotifyProductUpdatedAsync(ProductDto product, CancellationToken ct = default)
    {
        await _hubContext.Clients.Group("admins")
            .SendAsync("ProductUpdated", product, cancellationToken: ct);

        if (!string.IsNullOrEmpty(product.SellerId))
        {
            await _hubContext.Clients.Group($"vendor-{product.SellerId}")
                .SendAsync("ProductUpdated", product, cancellationToken: ct);
        }
    }
}
