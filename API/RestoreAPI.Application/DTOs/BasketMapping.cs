using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.DTOs
{
    public static class BasketMapping
    {
        public static BasketDto ToDto(this Basket basket)
        {
            return new BasketDto
            {
                Id = basket.Id,
                BuyerId = basket.BuyerId,
                PaymentQrUrl = basket.PaymentQrUrl,
                PaymentReference = basket.PaymentReference,
                DeliveryFee = basket.DeliveryFee,
                Discount = basket.Discount,
                ShippingAddress = basket.HasShippingAddress() ? new AddressDto
                {
                    Name = basket.ShipName!,
                    Line1 = basket.ShipLine1!,
                    Line2 = basket.ShipLine2 ?? "",
                    City = basket.ShipCity!,
                    State = basket.ShipState!,
                    PostalCode = basket.ShipPostalCode!,
                    Country = basket.ShipCountry!
                } : null,
                Items = basket.Items.Select(i => i.ToDto()).ToList()
            };
        }

        public static BasketItemDto ToDto(this BasketItem item)
        {
            return new BasketItemDto
            {
                ProductId = item.ProductId,
                ProductName = item.Product!.Name,
                Price = item.Product!.Price,
                PictureUrl = item.Product!.PictureUrl,
                Brand = item.Product!.Brand,
                Type = item.Product!.Type,
                Quantity = item.Quantity,
                QuantityInStock = item.Product!.QuantityInStock
            };
        }
    }
}
