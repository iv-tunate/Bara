using SharedModule.Utils;
using UserModule.DTOs.AuthDTOs;

namespace UserModule.Interfaces.UserInterfaces
{
    /// <summary>
    /// Defines authentication-related operations such as login, logout, email verification, and password management.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Attempts to authenticate a user using the provided credentials and device information.
        /// </summary>
        /// <param name="authReqBody">An object containing the user's email, password, and login device.</param>
        /// <returns>A response containing login result details including access token, user ID, name, email, and login attempt count.</returns>
        Task<ResponseDetail<LoginResponseDTO>> Login(AuthRequestDTO authReqBody);

        /// <summary>
        /// Generates a new refresh token based on the current access token.
        /// </summary>
        /// <param name="token">The existing access token used to generate a refresh token.</param>
        /// <returns>A newly generated refresh token as a string.</returns>
        Task<string> GenerateRefreshToken(string token);

        /// <summary>
        /// Logs out a user and performs any necessary cleanup such as token revocation.
        /// </summary>
        /// <param name="userId">The unique identifier of the user to log out.</param>
        /// <returns>A response indicating whether the logout was successful.</returns>
        Task Logout(Guid userId);

        /// <summary>
        /// Verifies a login attempt using a device and token-based challenge-response mechanism.
        /// </summary>
        /// <param name="loginDetails">The login verification data including email, login device, and verification token.</param>
        /// <returns>A response indicating whether the login verification was successful, along with login data if applicable.</returns>
        Task<ResponseDetail<LoginResponseDTO>> VerifyLogin(LoginVerificationDTO loginDetails);

        /// <summary>
        /// Updates the user's password using the provided change request.
        /// </summary>
        /// <param name="reqBody">The password change details including the current and new password.</param>
        /// <returns>A response indicating whether the password change was successful.</returns>
        Task<ResponseDetail<bool>> ChangePassword(PasswordChangeDTO reqBody);

        /// <summary>
        /// Confirms a user's email address using a previously sent verification token.
        /// </summary>
        /// <param name="token">The verification token sent to the user's email.</param>
        /// <param name="email">The email address to verify.</param>
        /// <returns>A response indicating whether the email verification was successful.</returns>
        Task<ResponseDetail<bool>> VerifyEmail(string token, string email);

        /// <summary>
        /// Resends a verification token to the specified user's email address.
        /// </summary>
        /// <param name="email">The email address to resend the verification token to.</param>
        /// <returns>A response containing the new verification token or an error message.</returns>
        Task<ResponseDetail<string>> ResendVerificationToken(string email);

        /// <summary>
        /// Initiates a password reset process by sending a reset token to the user's email.
        /// </summary>
        /// <param name="request">The forgot password request containing the user's email.</param>
        /// <returns>A response indicating whether the reset token was sent successfully.</returns>
        Task<ResponseDetail<string>> ForgotPassword(ForgotPasswordRequestDTO request);

        /// <summary>
        /// Resets a user's password using the provided reset token and new password.
        /// </summary>
        /// <param name="request">The reset password request containing email, token, and new password.</param>
        /// <returns>A response indicating whether the password was reset successfully.</returns>
        Task<ResponseDetail<bool>> ResetPassword(ResetPasswordDTO request);
    }
}

