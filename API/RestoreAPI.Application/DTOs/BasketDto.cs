namespace RestoreAPI.Application.DTOs
{
    public class BasketDto
    {
        public int Id { get; set; }
        public string BuyerId { get; set; } = null!;
        public string? PaymentQrUrl { get; set; }
        public string? PaymentReference { get; set; }
        public long DeliveryFee { get; set; }
        public long Discount { get; set; }
        public AddressDto? ShippingAddress { get; set; }
        public List<BasketItemDto> Items { get; set; } = new();
    }
}
