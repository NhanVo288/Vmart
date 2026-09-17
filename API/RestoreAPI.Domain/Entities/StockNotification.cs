namespace RestoreAPI.Domain.Entities
{
    public class StockNotification
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        public required string Email { get; set; }
        public bool IsNotified { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? NotifiedAt { get; set; }
    }
}
