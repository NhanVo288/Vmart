namespace RestoreAPI.Domain.Entities;

public class AdminNotification
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty; // "ProductCreated" or "ProductDeleted"
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? VendorId { get; set; }
    public string? VendorName { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;
}
