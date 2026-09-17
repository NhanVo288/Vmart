using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Interfaces;

public interface IProductNotificationService
{
    Task NotifyProductCreatedAsync(ProductDto product, string? vendorName, CancellationToken ct = default);
    Task NotifyProductDeletedAsync(int productId, string productName, string? vendorId, string? vendorName, CancellationToken ct = default);
    Task NotifyProductUpdatedAsync(ProductDto product, CancellationToken ct = default);
}
