namespace Bara.API.Users.DTOs.AuthDTOs
{
    /// <summary>
    /// Represents the response data returned after a login attempt.
    /// </summary>
    public class LoginResponseDTO
    {
        /// <summary>
        /// The unique identifier of the authenticated user.
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// The full name of the authenticated user.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The email address used for the login.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// The number of failed login attempts recorded for this user (resets upon successful login).
        /// </summary>
        public int WrongLoginAttempts { get; set; }

        /// <summary>
        /// The JWT access token issued if the login is successful and passes verification.
        /// May be null if additional verification (e.g., token or email confirmation) is required.
        /// </summary>
        public string? AccessToken { get; set; }

        public bool IsProfileSetupComplete { get; set; }
        public bool IsVerified { get; set; }
        public string VerificationStatus { get; set; }
        public string Role { get; set; }
        public string ProfileImage { get; set; }
    }

}
