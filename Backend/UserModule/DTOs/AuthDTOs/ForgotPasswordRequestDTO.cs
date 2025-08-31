namespace UserModule.DTOs.AuthDTOs
{
    /// <summary>
    /// Represents the request body for initiating a password reset process.
    /// </summary>
    public class ForgotPasswordRequestDTO
    {
        /// <summary>
        /// The email address associated with the user's account.
        /// </summary>
        public required string Email { get; set; }
    }
}
