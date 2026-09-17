namespace RestoreAPI.Application.DTOs
{
    public class UserInfoDto
    {
        public required string Email { get; set; }
        public required string UserName { get; set; }
        public List<string> Roles { get; set; } = [];
    }
}
