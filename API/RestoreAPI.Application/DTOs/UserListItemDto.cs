namespace RestoreAPI.Application.DTOs
{
    public class UserListItemDto
    {
        public required string Id { get; set; }
        public required string Email { get; set; }
        public required string UserName { get; set; }
        public List<string> Roles { get; set; } = [];
    }
}
