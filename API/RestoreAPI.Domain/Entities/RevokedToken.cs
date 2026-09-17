namespace RestoreAPI.Domain.Entities
{
    public class RevokedToken
    {
        public int Id { get; set; }
        public string? TokenHash { get; set; }
        public string? UserId { get; set; }
        public DateTime RevokedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
