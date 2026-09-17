namespace RestoreAPI.Application.DTOs
{
    public class FavoriteDto
    {
        public int Id { get; set; }
        public string BuyerId { get; set; } = null!;
        public List<FavoriteItemDto> Items { get; set; } = new();
    }
}
