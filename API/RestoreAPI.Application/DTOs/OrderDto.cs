namespace RestoreAPI.Application.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public string BuyerId { get; set; } = null!;
        public string? BuyerEmail { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal Subtotal { get; set; }
        public long DeliveryFee { get; set; }
        public long Discount { get; set; }
        public long Total { get; set; }
        public string Status { get; set; } = null!;
        public AddressDto? ShippingAddress { get; set; }
        public PaymentSummaryDto? PaymentSummary { get; set; }
        public string? PaymentReference { get; set; }
        public bool? EmailSent { get; set; }
        public string? EmailError { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }
}
