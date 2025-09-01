using Microsoft.AspNetCore.Mvc;
using SharedModule.Utils;
using UserModule.DTOs.AuthDTOs;
using UserModule.Interfaces.UserInterfaces;

namespace Bara.API.Controllers.UserModuleControllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;
        private readonly ILogger<AuthController> logger;
        private readonly LogHelper<AuthController> logHelper;
        public AuthController(ILogger<AuthController> logger, IAuthService authService, LogHelper<AuthController> logHelper)
        {
            this.logger = logger;
            this.authService = authService;
            this.logHelper = logHelper;
        }

        /// <summary>
        /// Authenticates a user using provided credentials and returns a JWT or session token.
        /// </summary>
        /// <param name="loginPayload">The login credentials including email and password.</param>
        /// <returns>Returns a success response with token if credentials are valid; otherwise returns appropriate error message.</returns>
        /// <response code="200">Login successful</response>
        /// <response code="400">Invalid login credentials or unverified or account is deleted</response>
        /// <response code="500">Internal server error</response>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthRequestDTO loginPayload)
        {
            try
            {
                var response = await authService.Login(loginPayload);
                if (response.IsSuccess)
                {
                    logger.LogInformation("User {email} logged in successfully", loginPayload.Email);
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Login failed with status code 500: {Message}", response.Message);
                    return StatusCode(500, response);
                }

                logger.LogError("Login failed with status code {response}", response);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Logging in user with email {loginPayload.Email}");
                return StatusCode(500, ResponseDetail<string>.Failed("Your login request failed", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Logs out a user by invalidating their session or token.
        /// </summary>
        /// <param name="userId">The unique identifier of the user to log out.</param>
        /// <returns>Returns a success message if logout is successful.</returns>
        /// <response code="200">Logout successful</response>
        /// <response code="500">Internal server error</response>
        [HttpPost("logout/{userId}")]
        public async Task<IActionResult> Logout(Guid userId)
        {
            try
            {
                await authService.Logout(userId);
                logger.LogInformation("User with ID {userId} logged out successfully", userId);
                return Ok(new { message = "Logout successful" });
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Logging out user with ID {userId}");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occured", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Verifies a user's login using additional login verification details (e.g., OTP or second factor).
        /// </summary>
        /// <param name="loginDetails">The login verification payload including OTP, token, or metadata.</param>
        /// <returns>Returns a success response if verification is successful; otherwise returns an error.</returns>
        /// <response code="200">Login verification successful</response>
        /// <response code="400">Invalid verification attempt</response>
        /// <response code="500">Internal server error</response>
        [HttpPut("verify-login")]
        public async Task<IActionResult> VerifyLogin([FromBody] LoginVerificationDTO loginDetails)
        {
            try
            {
                var response = await authService.VerifyLogin(loginDetails);
                if (response.IsSuccess)
                {
                    logger.LogInformation("Login verification successful for {email}", loginDetails.Email);
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Login verification failed with status code 500: {response}", response);
                    return StatusCode(500, response);
                }
                logger.LogError("Login verification failed with status code {response}", response);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Verifying login for user with email {loginDetails.Email}");
                return StatusCode(500, ResponseDetail<string>.Failed("Your request failed", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Resends a verification token to the user's email address.
        /// </summary>
        /// <param name="email">The email address of the user to resend the verification token to.</param>
        /// <returns>Returns a success response if token is successfully resent.</returns>
        /// <response code="200">Verification token resent</response>
        /// <response code="404">Email not found or already verified</response>
        /// <response code="500">Internal server error</response>
        [HttpPost("resend-verification-token/{email}")]
        public async Task<IActionResult> ResendVerificationToken(string email)
        {
            try
            {
                var response = await authService.ResendVerificationToken(email);
                if (response.IsSuccess)
                {
                    logger.LogInformation("Resend verification token successful for {email}", email);
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Resend verification token failed with status code 500: {response}", response);
                    return StatusCode(500, response);
                }
                logger.LogError("Resend verification token failed {response}", response);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Resending verification token for user with email {email}");
                return StatusCode(500, ResponseDetail<string>.Failed("Your request failed", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Verifies a user's email using the verification token sent to them.
        /// </summary>
        /// <param name="email">The email address of the user to verify.</param>
        /// <param name="token">The verification token provided to the user.</param>
        /// <returns>Returns a success response if the email is verified successfully.</returns>
        /// <response code="200">Email verified successfully</response>
        /// <response code="400">Invalid or expired token</response>
        /// <response code="500">Internal server error</response>
        [HttpPut("verify-email/{email}/{token}")]
        public async Task<IActionResult> VerifyEmail(string email, string token)
        {
            try
            {
                var response = await authService.VerifyEmail(token, email);
                if (response.IsSuccess)
                {
                    logger.LogInformation("Email verification successful for {email}", email);
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Email verification failed with status code 500: {response}", response);
                    return StatusCode(500, response);
                }
                logger.LogError("Email verification failed {response}", response);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Verifying email {email}");
                return StatusCode(500, ResponseDetail<string>.Failed("Your request failed", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Initiates a password reset process by sending a reset token to the user's email.
        /// </summary>
        /// <param name="request">The forgot password request containing the user's email.</param>
        /// <returns>Returns a success response if the reset token was sent successfully.</returns>
        /// <response code="200">Password reset token sent successfully</response>
        /// <response code="400">Invalid email format or other validation errors</response>
        /// <response code="500">Internal server error</response>
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDTO request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    return BadRequest(ResponseDetail<string>.Failed("Email is required", 400));
                }

                var response = await authService.ForgotPassword(request);
                if (response.IsSuccess)
                {
                    logger.LogInformation("Password reset token sent for email {email}", request.Email);
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Forgot password failed with status code 500: {response}", response);
                    return StatusCode(500, response);
                }

                logger.LogError("Forgot password failed {response}", response);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Processing forgot password for {request.Email}");
                return StatusCode(500, ResponseDetail<string>.Failed("Your request failed", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Resets a user's password using the provided reset token and new password.
        /// </summary>
        /// <param name="request">The reset password request containing email, token, and new password.</param>
        /// <returns>Returns a success response if the password was reset successfully.</returns>
        /// <response code="200">Password reset successfully</response>
        /// <response code="400">Invalid token, expired token, or validation errors</response>
        /// <response code="500">Internal server error</response>
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
                {
                    return BadRequest(ResponseDetail<bool>.Failed("Email, token, and new password are required", 400));
                }

                var response = await authService.ResetPassword(request);
                if (response.IsSuccess)
                {
                    logger.LogInformation("Password reset successful for email {email}", request.Email);
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Reset password failed with status code 500: {response}", response);
                    return StatusCode(500, response);
                }

                logger.LogError("Reset password failed {response}", response);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Resetting password for {request.Email}");
                return StatusCode(500, ResponseDetail<bool>.Failed("Your request failed", 500, "Internal server error"));
            }
        }
    }
}
