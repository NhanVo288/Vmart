using RestoreAPI.Domain.Entities.OrderAggregate;

namespace RestoreAPI.Application.DTOs
{
    public static class OrderProjection
    {
        public static IQueryable<OrderDto> ProjectToDto(this IQueryable<Order> query)
        {
            return query.Select(o => new OrderDto
            {
                Id = o.Id,
                BuyerId = o.BuyerId,
                BuyerEmail = o.BuyerEmail,
                OrderDate = o.OrderDate,
                Subtotal = o.Subtotal,
                DeliveryFee = o.DeliveryFee,
                Discount = o.Discount,
                Total = (long)o.Subtotal + o.DeliveryFee - o.Discount,
                Status = o.Status.ToString(),
                ShippingAddress = new AddressDto
                {
                    Name = o.ShippingAddress.Address.Name,
                    Line1 = o.ShippingAddress.Address.Line1,
                    Line2 = o.ShippingAddress.Address.Line2,
                    City = o.ShippingAddress.Address.City,
                    State = o.ShippingAddress.Address.State,
                    PostalCode = o.ShippingAddress.Address.PostalCode,
                    Country = o.ShippingAddress.Address.Country
                },
                PaymentSummary = o.PaymentSummary == null ? null : new PaymentSummaryDto
                {
                    Last4 = o.PaymentSummary.Last4,
                    ExpMonth = o.PaymentSummary.ExpMonth,
                    ExpYear = o.PaymentSummary.ExpYear,
                    Brand = o.PaymentSummary.Brand
                },
                PaymentReference = o.PaymentReference,
                OrderItems = o.OrderItems.Select(i => new OrderItemDto
                {
                    ProductId = i.ItemOrdered.ProductId,
                    ProductName = i.ItemOrdered.ProductName,
                    PictureUrl = i.ItemOrdered.PictureUrl,
                    Price = i.Price,
                    Quantity = i.Quantity
                }).ToList()
            });
        }
    }
}
