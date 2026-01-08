using System;

namespace Bara.API.Users.DTOs
{
    public class AdminUserListDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string VerificationStatus { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsBlacklisted { get; set; }
    }
}
