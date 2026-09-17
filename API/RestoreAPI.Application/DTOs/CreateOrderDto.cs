namespace RestoreAPI.Application.DTOs
{
    public class CreateOrderDto
    {
        public required AddressDto ShippingAddress { get; set; }
        public string? PaymentReference { get; set; }
        public PaymentSummaryDto? PaymentSummary { get; set; }
    }
}
