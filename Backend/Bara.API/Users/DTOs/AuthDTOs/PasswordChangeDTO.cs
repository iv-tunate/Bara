namespace Bara.API.Users.DTOs.AuthDTOs
{
    /// <summary>
    /// Represents the data required to change a user's password.
    /// Typically used in authenticated password update workflows.
    /// </summary>
    public class PasswordChangeDTO
    {
        /// <summary>
        /// The email address associated with the user's account.
        /// </summary>
        public required string Email { get; set; }

        /// <summary>
        /// The user's current password for validation before making changes.
        /// </summary>
        public required string CurrentPassword { get; set; }

        /// <summary>
        /// The new password the user wants to set.
        /// Must meet password strength requirements.
        /// </summary>
        public required string NewPassword { get; set; }
    }

}
