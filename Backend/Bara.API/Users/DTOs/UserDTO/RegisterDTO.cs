using Bara.API.Users.Enums;

namespace Bara.API.Users.DTOs.UserDTO
{
    /// <summary>
    /// Represents the data transfer object for user registration.
    /// </summary>
    public class RegisterDTO
    {
        /// <summary>
        /// The email address of the user registering.
        /// </summary>
        public required string Email { get; set; }
        /// <summary>
        /// The password chosen by the user for their account. Must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.
        /// </summary>
        public required string Password { get; set; }
        /// <summary>
        /// Represents the type of user registering, such as Writer, Producer, or Admin.
        /// </summary>
        public Role Type { get; set; }
    }
}
