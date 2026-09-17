namespace RestoreAPI.Application.DTOs
{
    public class VendorOrderDto
    {
        public int Id { get; set; }
        public string? BuyerEmail { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = null!;
        public decimal VendorSubtotal { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }
}
