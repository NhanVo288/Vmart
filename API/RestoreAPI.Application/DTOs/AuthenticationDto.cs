using System.Text.Json.Serialization;

namespace RestoreAPI.Application.DTOs
{
    public class AuthenticationDto
    {
        public bool IsSuccess { get; set; }
        [JsonIgnore]
        public string? AccessToken { get; set; }
        [JsonIgnore]
        public string? RefreshToken { get; set; }
        public string? Email { get; set; }
        public string? UserId { get; set; }
        public List<string>? Errors { get; set; }
    }
}
