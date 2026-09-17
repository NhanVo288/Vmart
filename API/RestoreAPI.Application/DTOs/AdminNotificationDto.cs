namespace RestoreAPI.Application.DTOs;

public class AdminNotificationDto
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? VendorId { get; set; }
    public string? VendorName { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}
