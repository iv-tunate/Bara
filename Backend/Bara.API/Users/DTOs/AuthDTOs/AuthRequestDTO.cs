namespace Bara.API.Users.DTOs.AuthDTOs
{
    /// <summary>
    /// Represents the request body used for authenticating a user during login.
    /// </summary>
    public class AuthRequestDTO
    {
        /// <summary>
        /// The email address associated with the user’s account.
        /// </summary>
        public required string Email { get; set; }

        /// <summary>
        /// The user's account password (in plain text, to be hashed/validated server-side).
        /// </summary>
        public required string Password { get; set; }

        /// <summary>
        /// A string representing the device or client used to initiate the login attempt (e.g., "Chrome on Windows 10").
        /// </summary>
        public required string LoginDevice { get; set; }
    }

}
