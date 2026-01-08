using Bara.API.Users.Enums;
using System;

namespace Bara.API.Users.DTOs.UserDTO
{
    public class RetryKycDTO
    {
        public Guid UserId { get; set; }
        public Guid AdminId { get; set; }
        public string VerificationNumber { get; set; }
        public DocumentType VerificationType { get; set; }
    }
}
