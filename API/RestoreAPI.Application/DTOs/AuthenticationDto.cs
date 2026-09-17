namespace RestoreAPI.Application.DTOs
{
    public class AuthenticationDto
    {
        public bool IsSuccess { get; set; }
        public string? Token { get; set; }
        public string? Email { get; set; }
        public string? UserId { get; set; }
        public List<string>? Errors { get; set; }
    }
}
