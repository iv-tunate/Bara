namespace Bara.API.Users.DTOs.AuthDTOs
{
    /// <summary>
    /// Represents the request body for resetting a user's password using a reset token.
    /// </summary>
    public class ResetPasswordDTO
    {
        /// <summary>
        /// The email address associated with the user's account.
        /// </summary>
        public required string Email { get; set; }

        /// <summary>
        /// The password reset token sent to the user's email.
        /// </summary>
        public required string Token { get; set; }

        /// <summary>
        /// The new password chosen by the user.
        /// </summary>
        public required string NewPassword { get; set; }
    }
}
