namespace RestoreAPI.Application.DTOs
{
    public class FavoriteItemDto
    {
        public int ProductId { get; set; }
        public required string ProductName { get; set; }
        public decimal Price { get; set; }
        public required string PictureUrl { get; set; }
        public required string Brand { get; set; }
        public required string Type { get; set; }
    }
}
