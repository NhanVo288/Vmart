using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.DTOs
{
    public static class FavoriteMapping
    {
        public static FavoriteDto ToDto(this Favorite favorite)
        {
            return new FavoriteDto
            {
                Id = favorite.Id,
                BuyerId = favorite.BuyerId,
                Items = favorite.Items.Select(i => i.ToDto()).ToList()
            };
        }

        public static FavoriteItemDto ToDto(this FavoriteItem item)
        {
            return new FavoriteItemDto
            {
                ProductId = item.ProductId,
                ProductName = item.Product!.Name,
                Price = item.Product!.Price,
                PictureUrl = item.Product!.PictureUrl,
                Brand = item.Product!.Brand,
                Type = item.Product!.Type,
            };
        }
    }
}
