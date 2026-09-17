using RestoreAPI.Domain.Entities;
using RestoreAPI.Domain.Entities.OrderAggregate;
using RestoreAPI.Domain.Enums;

namespace RestoreAPI.Domain.Factories
{
    public static class OrderFactory
    {
        public static Order? BuildFromBasket(Basket basket, string buyerId, PaymentSummary? paymentSummary, string? buyerEmail = null)
        {
            if (!basket.HasShippingAddress()) return null;

            var items = CreateOrderItems(basket.Items);
            if (items == null) return null;

            var subtotal = items.Sum(i => (long)(i.Price * i.Quantity));
            var deliveryFee = subtotal > 10000 ? 0 : 500;

            var shippingAddress = new ShippingAddress
            {
                Address = new Entities.Common.Address
                {
                    Name = basket.ShipName!,
                    Line1 = basket.ShipLine1!,
                    Line2 = basket.ShipLine2,
                    City = basket.ShipCity!,
                    State = basket.ShipState!,
                    PostalCode = basket.ShipPostalCode!,
                    Country = basket.ShipCountry!
                }
            };

            var order = new Order(
                buyerId,
                buyerEmail,
                basket.PaymentReference!,
                shippingAddress,
                paymentSummary,
                items,
                deliveryFee,
                0,
                subtotal
            );

            return order;
        }

        private static List<OrderItems>? CreateOrderItems(IReadOnlyCollection<BasketItem> basketItems)
        {
            var orderItems = new List<OrderItems>();

            foreach (var item in basketItems)
            {
                var product = item.Product!;

                orderItems.Add(new OrderItems
                {
                    ItemOrdered = new ProductItemOrdered
                    {
                        ProductId = item.ProductId,
                        ProductName = product.Name,
                        PictureUrl = product.PictureUrl
                    },
                    Price = product.Price,
                    Quantity = item.Quantity
                });
            }

            return orderItems;
        }
    }
}
