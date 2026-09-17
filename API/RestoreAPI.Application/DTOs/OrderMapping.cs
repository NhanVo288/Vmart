using RestoreAPI.Domain.Entities.OrderAggregate;

namespace RestoreAPI.Application.DTOs
{
    public static class OrderMapping
    {
        public static OrderDto ToDto(this Order order)
        {
            var address = order.ShippingAddress?.Address;

            return new OrderDto
            {
                Id = order.Id,
                BuyerId = order.BuyerId,
                BuyerEmail = order.BuyerEmail,
                OrderDate = order.OrderDate,
                Subtotal = order.Subtotal,
                DeliveryFee = order.DeliveryFee,
                Discount = order.Discount,
                Total = order.GetTotal(),
                Status = order.Status.ToString(),
                ShippingAddress = address is null ? null : new AddressDto
                {
                    Name = address.Name,
                    Line1 = address.Line1,
                    Line2 = address.Line2,
                    City = address.City,
                    State = address.State,
                    PostalCode = address.PostalCode,
                    Country = address.Country
                },
                PaymentSummary = order.PaymentSummary is not null ? new PaymentSummaryDto
                {
                    Last4 = order.PaymentSummary.Last4,
                    ExpMonth = order.PaymentSummary.ExpMonth,
                    ExpYear = order.PaymentSummary.ExpYear,
                    Brand = order.PaymentSummary.Brand
                } : null,
                PaymentReference = order.PaymentReference,
                OrderItems = order.OrderItems.Select(ToDto).ToList()
            };
        }

        public static VendorOrderDto ToVendorDto(this Order order, List<int> vendorProductIds)
        {
            var vendorItems = order.OrderItems
                .Where(oi => vendorProductIds.Contains(oi.ItemOrdered.ProductId))
                .ToList();

            return new VendorOrderDto
            {
                Id = order.Id,
                BuyerEmail = order.BuyerEmail,
                OrderDate = order.OrderDate,
                Status = order.Status.ToString(),
                VendorSubtotal = vendorItems.Sum(oi => oi.Price * oi.Quantity),
                OrderItems = vendorItems.Select(ToDto).ToList()
            };
        }

        public static OrderItemDto ToDto(this OrderItems item)
        {
            return new OrderItemDto
            {
                ProductId = item.ItemOrdered.ProductId,
                ProductName = item.ItemOrdered.ProductName,
                PictureUrl = item.ItemOrdered.PictureUrl,
                Price = item.Price,
                Quantity = item.Quantity
            };
        }
    }
}
