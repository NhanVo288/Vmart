namespace RestoreAPI.Application.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public decimal Price { get; set; }
        public required string PictureUrl { get; set; }
        public string? CloudinaryPublicId { get; set; }
        public required string Brand { get; set; }
        public required string Type { get; set; }
        public int QuantityInStock { get; set; }
        public string? SellerId { get; set; }
    }
}
