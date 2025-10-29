namespace Bara.API.Users.DTOs.AuthDTOs
{
    /// <summary>
    /// Represents the data required to verify a user's login attempt.
    /// Typically used in a two-step verification process.
    /// </summary>
    public class LoginVerificationDTO
    {
        /// <summary>
        /// The email address associated with the user account.
        /// </summary>
        public required string Email { get; set; }

        /// <summary>
        /// The one-time token sent to the user's email for verifying the login attempt.
        /// </summary>
        public required string Token { get; set; }

        /// <summary>
        /// The device or client initiating the login attempt (e.g., "Firefox on Android").
        /// </summary>
        public required string Device { get; set; }
    }

}
