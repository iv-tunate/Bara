namespace Bara.API.Users.DTOs.UserDTO
{
    public class RegisterResponseDTO
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
