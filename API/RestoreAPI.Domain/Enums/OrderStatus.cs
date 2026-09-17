namespace RestoreAPI.Domain.Enums
{
    public enum OrderStatus
    {
        Pending,
        PaymentReceived,
        PaymentFailed,
        PaymentMismatch,
        Shipped,
        Delivered,
        Cancelled
    }
}
