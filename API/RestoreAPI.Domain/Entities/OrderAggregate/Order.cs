using RestoreAPI.Domain.Enums;

namespace RestoreAPI.Domain.Entities.OrderAggregate
{
    public class Order
    {
        private readonly List<OrderItems> _orderItems = new();

        private Order() { }

        public Order(string buyerId, string? buyerEmail, string paymentReference, ShippingAddress shippingAddress, PaymentSummary? paymentSummary, List<OrderItems> items, long deliveryFee, long discount, decimal subtotal)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(buyerId);

            BuyerId = buyerId;
            BuyerEmail = buyerEmail;
            PaymentReference = paymentReference;
            ShippingAddress = shippingAddress;
            PaymentSummary = paymentSummary;
            DeliveryFee = deliveryFee;
            Discount = discount;
            Subtotal = subtotal;
            _orderItems = items;
        }

        public int Id { get; private set; }

        public string BuyerId { get; private set; } = null!;

        public string? BuyerEmail { get; private set; }

        public DateTime OrderDate { get; private set; } = DateTime.UtcNow;

        public decimal Subtotal { get; private set; }

        public long DeliveryFee { get; private set; }

        public long Discount { get; private set; }

        public OrderStatus Status { get; private set; } = OrderStatus.Pending;

        public ShippingAddress ShippingAddress { get; private set; } = null!;

        public PaymentSummary? PaymentSummary { get; private set; }

        public string? PaymentReference { get; private set; }

        public IReadOnlyCollection<OrderItems> OrderItems => _orderItems;

        public void SetPaymentReference(string paymentReference)
        {
            PaymentReference = paymentReference;
        }

        public void UpdateStatus(OrderStatus status)
        {
            if (!IsValidTransition(Status, status))
                throw new InvalidOperationException(
                    $"Cannot transition from {Status} to {status}");

            Status = status;
        }

        private static bool IsValidTransition(OrderStatus from, OrderStatus to)
        {
            return (from, to) switch
            {
                (OrderStatus.Pending, OrderStatus.PaymentReceived) => true,
                (OrderStatus.Pending, OrderStatus.PaymentFailed) => true,
                (OrderStatus.Pending, OrderStatus.Cancelled) => true,
                (OrderStatus.PaymentReceived, OrderStatus.Shipped) => true,
                (OrderStatus.PaymentReceived, OrderStatus.Cancelled) => true,
                (OrderStatus.Shipped, OrderStatus.Delivered) => true,
                _ => false
            };
        }

        public void SetPaymentSummary(PaymentSummary paymentSummary)
        {
            PaymentSummary = paymentSummary;
        }

        public void ReplaceOrderItems(List<OrderItems> items, long deliveryFee, long discount, decimal subtotal)
        {
            _orderItems.Clear();
            _orderItems.AddRange(items);
            DeliveryFee = deliveryFee;
            Discount = discount;
            Subtotal = subtotal;
        }

        public long GetTotal()
        {
            return (long)(Subtotal + DeliveryFee - Discount);
        }
    }
}
