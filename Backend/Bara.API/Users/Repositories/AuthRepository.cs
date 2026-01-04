using Bara.API.DataContext;
using Bara.API.Services.BackgroudServices;
using Bara.API.Users.DTOs.AuthDTOs;
using Bara.API.Users.Interfaces.UserInterfaces;
using Bara.API.Utilities.Settings;
using Bara.API.Utilities.ToolKit;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Services.ExternalAPI_Integration;
using Services.MailingService;
using System.IdentityModel.Tokens.Jwt;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
namespace Bara.API.Users.Repositories
{
    public class AuthRepository : IAuthService
    {
        private readonly ILogger<AuthRepository> logger;
        private readonly IMailService mailer;
        private readonly IMemoryCache cache;
        private readonly AppSettings settings;
        private readonly Secrets secrets;
        private readonly LogHelper<AuthRepository> logHelper;
        private readonly BaraContext dbContext;
        private readonly HangfireJobs hangfire;
        private readonly ExternalApiIntegrationService externalService;
        public AuthRepository(BaraContext baraContext, IOptions<Secrets> secrets, IOptions<AppSettings> appSettings,
            ILogger<AuthRepository> logger, IMemoryCache memoryCache, IMailService mailService, LogHelper<AuthRepository> logHelper, HangfireJobs hangfire, ExternalApiIntegrationService externalApiIntegrationService)
        {
            this.secrets = secrets.Value;
            mailer = mailService;
            cache = memoryCache;
            this.logger = logger;
            settings = appSettings.Value;
            this.logHelper = logHelper;
            dbContext = baraContext;
            this.hangfire = hangfire;
            externalService = externalApiIntegrationService;
        }
        public async Task<ResponseDetail<LoginResponseDTO>> Login(AuthRequestDTO authReqBody)
        {
            var email = authReqBody.Email.ToLowerInvariant();
            try
            {
                var validationErrors = new List<string>();
                var userProfile = await dbContext.Users
                                                .Where(u => u.Email == email)
                                                .Select(x => new { x.AuthProfile, x.VerificationStatus, x.Email, x.ProfileImageUrl })
                                                .FirstOrDefaultAsync();
                if (userProfile == null)
                {
                    return ResponseDetail<LoginResponseDTO>.Failed("Login unsuccessful...Email or password is invalid");
                }
                var user = userProfile.AuthProfile;
                var response = new LoginResponseDTO
                {
                    Email = authReqBody.Email,
                    Name = user.FullName,
                    UserId = user.UserId,
                    IsProfileSetupComplete = user.IsProfileSetupComplete,
                    Role = user.Role,
                    IsVerified = user.IsVerified,
                    VerificationStatus = userProfile.VerificationStatus.ToString(),
                    ProfileImage = userProfile.ProfileImageUrl
                };
                var confirmPassword = BCrypt.Net.BCrypt.Verify(authReqBody.Password, user.Password);
                if (!confirmPassword)
                {
                    user.LoginAttempts += 1;
                    user.ModifiedAt = DateTimeOffset.UtcNow;
                    response.WrongLoginAttempts = user.LoginAttempts;
                    dbContext.AuthProfiles.Update(user);
                    await dbContext.SaveChangesAsync();
                    return ResponseDetail<LoginResponseDTO>.Failed(response, "Login unsuccessful...Email or password is invalid");
                }
                else if (user.IsLocked || user.LoginAttempts > 5)
                {
                    response.WrongLoginAttempts = user.LoginAttempts;
                    Expression<Func<AuthRepository, Task>> job = s => s.UnlockAccount(user.UserId);
                    BackgroundJob.Schedule(job, TimeSpan.FromHours(1));

                    return ResponseDetail<LoginResponseDTO>.Failed(response, "Login unsuccessful...account has been blocked due to too many wrong email or password attempts... Try again in 1hr");
                }

                else if (!user.IsEmailVerified) validationErrors.Add("Login unsuccessful...Email address is unverified... Please verify yout email and try again");
                //else if (!user.IsVerified && user.Role != Role.Admin.ToString()) validationErrors.Add("Login unsuccessful... Account verification failed or is still in progress");

                if (validationErrors.Count > 0)
                {
                    return ResponseDetail<LoginResponseDTO>.Failed(string.Join(" |\n ", validationErrors), 403, "Forbidden");
                }

                var (Ip, Country) = await externalService.GetIpAndCountryAsync(secrets.IpInfoKey);
                if (user.LastLoginDevice != authReqBody.LoginDevice || user.LastLoginIPAddress != Ip)
                {
                    var cacheKey = $"User_Login_Token_{user.UserId}";
                    var token = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
                    cache.Set(cacheKey, token.ToString(), absoluteExpiration: DateTimeOffset.UtcNow.AddMinutes(10));
                    logger.LogInformation($"User_Login_Token_{user.UserId}: {token}");
                    Console.WriteLine($"User_Login_Token_{user.UserId}: {token}");

                    var mailBody = MailNotifications.LoginNotification(email, user.FullName, token, authReqBody.LoginDevice, Ip, Country);
                    var mailRes = await mailer.SendMail(mailBody);
                    if (!mailRes.IsSuccess)
                    {
                        return ResponseDetail<LoginResponseDTO>.Failed($"An error occured while sending a login notification mail", 500, "Unexpected Error");
                    }
                    if (user.LoginAttempts > 0)
                    {
                        response.WrongLoginAttempts = user.LoginAttempts;
                        user.LoginAttempts = 0;
                        user.ModifiedAt = DateTimeOffset.UtcNow;
                        dbContext.AuthProfiles.Update(user);
                        await dbContext.SaveChangesAsync();
                    }

                    logger.LogInformation($"User: {user.FullName} with ID: {user.UserId} was able to login successfully but requires login verification because of" +
                        $"the difference in device or ip address.");
                    return ResponseDetail<LoginResponseDTO>.Successful(response, "Please verify login attempt");
                }
                else
                {
                    var accessToken = GenerateJwtToken(user.Role, user.IsVerified ? "Verified" : "Unverified", user.UserId);

                    response.AccessToken = accessToken;
                    response.WrongLoginAttempts = user.LoginAttempts;
                    user.LoginAttempts = 0;
                    user.LastLoginAt = DateTimeOffset.UtcNow;
                    user.ModifiedAt = DateTimeOffset.UtcNow;

                    //Console.WriteLine($"Access token for this login for user {user.FullName}: {accessToken}");
                    dbContext.AuthProfiles.Update(user);
                    await dbContext.SaveChangesAsync();
                    //Console.WriteLine(user);
                    logger.LogInformation($"User: {user.FullName} with ID: {user.UserId}has logged in successfully.");
                    return ResponseDetail<LoginResponseDTO>.Successful(response, "Login Successful");
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"attempting to login with {authReqBody.Email}", ex.Message);
                return ResponseDetail<LoginResponseDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }
        public Task<ResponseDetail<bool>> ChangePassword(PasswordChangeDTO reqBody)
        {
            throw new NotImplementedException();
        }

        public Task<string> GenerateRefreshToken(string token)
        {
            throw new NotImplementedException();
        }


        public async Task Logout(Guid userId)
        {
            try
            {
                var user = await dbContext.AuthProfiles.FindAsync(userId);
                if (user == null)
                {
                    logger.LogWarning($"User with ID {userId} not found during logout attempt.");
                    return;
                }
                user.LastLogoutAt = DateTimeOffset.UtcNow;
                user.ModifiedAt = DateTimeOffset.UtcNow;
                dbContext.AuthProfiles.Update(user);
                await dbContext.SaveChangesAsync();

                logger.LogInformation($"User: {user.FullName} has been logged out successfully.");

                var cacheKey = $"User_Login_Token_{user.UserId}";
                if (cache.TryGetValue(cacheKey, out string verificationToken))
                {
                    cache.Remove(cacheKey);
                    logger.LogInformation("Removed login token for user: {name} with ID: {userId}", user.FullName, user.UserId);
                    return;
                }
                else
                {
                    logger.LogWarning($"No login token found for user: {user.FullName} with ID: {user.UserId}");
                    return;
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Logging out user with ID {userId}", ex.Message);
            }
        }

        public async Task<ResponseDetail<string>> ResendVerificationToken(string email, string type, string device)
        {
            try
            {
                var normalizedEmail = email.Trim().ToLowerInvariant();
                var user = await dbContext.AuthProfiles.Where(x => x.Email == normalizedEmail).Select(x => new { x.Email, x.UserId }).FirstOrDefaultAsync();
                var token = RandomNumberGenerator.GetInt32(100000, 999999);
                if (user == null)
                {
                    return ResponseDetail<string>.Failed("Account doens't exist", 404, "Not Found");
                }
                else
                {
                    var cacheKey = type == "login" ? $"User_Login_Token_{user.UserId}" : $"User_Verification_Token_{email}";
                    cache.Set(cacheKey, token.ToString(), absoluteExpiration: DateTimeOffset.UtcNow.AddMinutes(10));
                    logger.LogInformation($"{cacheKey}: {token}");
                    //Console.WriteLine($"User_Verification_Token_{user.Email}: {token}");
                    MailRequestDTO mailBody;
                    if (type == "login")
                    {
                        var (Ip, Country) = await externalService.GetIpAndCountryAsync(secrets.IpInfoKey);
                        mailBody = MailNotifications.LoginNotification(email, user.Email, token.ToString(), device, Ip, Country);
                    }
                    mailBody = MailNotifications.RegistrationConfirmationMailNotification(user.Email, "", token.ToString());
                    var mailRes = await mailer.SendMail(mailBody);
                    if (mailRes.IsSuccess == false)
                    {
                        return ResponseDetail<string>.Failed($"An error occured while resending verification mail", 500, "Unexpected Error");
                    }
                }
                return ResponseDetail<string>.Successful($"Verification token: {token} has been successfully sent");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Verifying Email {email}", ex.Message);
                return ResponseDetail<string>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public async Task<ResponseDetail<LoginResponseDTO>> VerifyEmail(string token, string email)
        {
            try
            {
                var normalizedEmail = email.Trim().ToLowerInvariant();

                var userProfile = await dbContext.Users
                    .AsNoTracking()
                    .Where(u => u.Email == normalizedEmail)
                    .Select(u => new
                    {
                        u.AuthProfile,
                        u.VerificationStatus,
                        u.Email,
                        u.ProfileImageUrl
                    })
                    .FirstOrDefaultAsync();

                if (userProfile is null)
                {
                    logger.LogInformation($"Email verification for user with email: {email} failed because email doesn't exist");
                    return ResponseDetail<LoginResponseDTO>.Failed($"Operation can not be completed because user does not exist", 404);
                }
                var user = userProfile.AuthProfile;
                var response = new LoginResponseDTO
                {
                    Email = email,
                    Name = user.FullName,
                    UserId = user.UserId,
                    IsProfileSetupComplete = user.IsProfileSetupComplete,
                    Role = user.Role,
                    IsVerified = user.IsVerified,
                    VerificationStatus = userProfile.VerificationStatus.ToString(),
                    ProfileImage = userProfile.ProfileImageUrl
                };
                if (user.IsEmailVerified)
                {
                    return ResponseDetail<LoginResponseDTO>.Failed("User email is already verified.", 409, "Conflict");
                }
                else
                {
                    var cacheKey = $"User_Verification_Token_{email}";
                    cache.TryGetValue(cacheKey, out string verificationToken);
                    if (verificationToken == null || token != verificationToken)
                    {
                        logger.LogInformation($"Token verification of email {email} for User: {user.FullName} with ID: {user.UserId} failed... Might be due to an invalid token");
                        return ResponseDetail<LoginResponseDTO>.Failed("Operation failed... Please try again", 400, "Invalid or Expired Token");
                    }
                    var (Ip, Country) = await externalService.GetIpAndCountryAsync(secrets.IpInfoKey);
                    var accessToken = GenerateJwtToken(user.Role, user.IsVerified ? "Verified" : "Unverified", user.UserId);

                    response.AccessToken = accessToken;
                    response.WrongLoginAttempts = user.LoginAttempts;
                    user.LoginAttempts = 0;
                    user.LastLoginAt = DateTimeOffset.UtcNow;
                    user.ModifiedAt = DateTimeOffset.UtcNow;
                    user.IsEmailVerified = true;

                    user.ModifiedAt = DateTimeOffset.UtcNow;
                    cache.Remove(cacheKey);

                    dbContext.AuthProfiles.Update(user);
                    await dbContext.SaveChangesAsync();
                    logger.LogInformation($"Email verification {email} for User: {user.FullName} with ID: {user.UserId} was successful.");
                    return ResponseDetail<LoginResponseDTO>.Successful(response, "Email Verification Successful");

                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Verifying Email for {email}", ex.Message);
                return ResponseDetail<LoginResponseDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public async Task<ResponseDetail<LoginResponseDTO>> VerifyLogin(LoginVerificationDTO loginDetails)
        {
            try
            {
                var email = loginDetails.Email.ToLowerInvariant();
                var userProfile = await dbContext.Users.Where(u => u.Email == email).Select(x => new { x.AuthProfile, x.ProfileImageUrl,x.VerificationStatus, x.Email }).FirstOrDefaultAsync();
                if (userProfile == null)
                {
                    return ResponseDetail<LoginResponseDTO>.Failed("Login unsuccessful...Email or password is invalid");
                }
                var user = userProfile.AuthProfile;

                var response = new LoginResponseDTO
                {
                    Email = loginDetails.Email,
                    Name = user.FullName,
                    UserId = user.UserId,
                    WrongLoginAttempts = user.LoginAttempts,
                    IsProfileSetupComplete = user.IsProfileSetupComplete,
                    Role = user.Role,
                    IsVerified = user.IsVerified,
                    VerificationStatus = userProfile.VerificationStatus.ToString(),
                    ProfileImage = userProfile.ProfileImageUrl
                };

                var cacheKey = $"User_Login_Token_{user.UserId}";
                cache.TryGetValue(cacheKey, out string verificationToken);
                if (verificationToken == null || loginDetails.Token != verificationToken)
                {
                    logger.LogInformation($"Login verification of email {loginDetails.Email} for User: {user.FullName} with ID: {user.UserId} failed... Might be due to an invalid token");
                    return ResponseDetail<LoginResponseDTO>.Failed("Operation can't be completed at the moment because the token is invalid or expired", 403, "Forbidden");
                }
                cache.Remove(cacheKey);
                var jwt_token = GenerateJwtToken(user.Role, user.IsVerified ? "Verified" : "Unverified", user.UserId);
                var (Ip, Country) = await externalService.GetIpAndCountryAsync(secrets.IpInfoKey);

                response.AccessToken = jwt_token;
                response.WrongLoginAttempts = 0;
                user.LoginAttempts = 0;
                user.LastLoginDevice = loginDetails.Device;
                user.LastLoginIPAddress = Ip;
                user.LastLoginAt = DateTimeOffset.UtcNow;
                user.ModifiedAt = DateTimeOffset.UtcNow;

                dbContext.AuthProfiles.Update(user);
                await dbContext.SaveChangesAsync();
                logger.LogInformation($"User: {user.FullName} with ID: {user.UserId}has logged in successfully.");
                return ResponseDetail<LoginResponseDTO>.Successful(response, "Login Successful");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Verifying Email: {loginDetails.Email} for login", ex.Message);
                return ResponseDetail<LoginResponseDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        // Here lies UnlockAccount method: private.
        // Called only by this class.
        // Let no other dare invoke or try to perform any magic, lest the compiler raises its voice... Well, except you can handle the errors you get (if any).
        //You have been warned
        [AutomaticRetry(Attempts = 3, DelaysInSeconds = [10, 30, 60])]
        private async Task<bool> UnlockAccount(Guid userId)
        {
            string name = "";
            try
            {
                var user = await dbContext.AuthProfiles.FirstOrDefaultAsync(x => x.UserId == userId);
                if (user != null)
                {
                    name = user.FullName;
                    user.IsLocked = false;
                    user.LoginAttempts = 0;
                    dbContext.AuthProfiles.Update(user);
                    await dbContext.SaveChangesAsync();
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"unlocking user {name}'s account ", ex.Message);
                return false;
            }
        }

        public string GenerateJwtToken(string role, string verificationStatus, Guid userId)
        {
            var claims = new List<Claim>
            {
                new("UserId", userId.ToString()),
                new ("Role", role),
                new("VerificationStatus", verificationStatus)
            };
            var random = new Random();
            string issuer = secrets.Issuers[random.Next(secrets.Issuers.Length)];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secrets.JwtSickRit));
            var signingCred = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);
            var token = new JwtSecurityToken(
                issuer,
                signingCredentials: signingCred,
                claims: claims,
                expires: DateTime.Now.AddMinutes(60)
                );
            //SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
            //{
            //    Issuer = settings.Issuer,
            //    Subject = new ClaimsIdentity(claims),
            //    Expires = DateTime.UtcNow.AddMinutes(60),
            //    SigningCredentials = signingCred
            //};

            var finalToken = new JwtSecurityTokenHandler().WriteToken(token);
            return finalToken;
        }

        public async Task<ResponseDetail<string>> ForgotPassword(ForgotPasswordRequestDTO request)
        {
            try
            {
                var user = await dbContext.AuthProfiles.FirstOrDefaultAsync(x => x.Email == request.Email);
                if (user is null)
                {
                    logger.LogInformation($"Password reset requested for non-existent email: {request.Email}");
                    return ResponseDetail<string>.Successful("If the email exists, a password reset link has been sent", "");
                }

                var resetToken = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
                var cacheKey = $"User_Password_Reset_Token_{request.Email}";
                cache.Set(cacheKey, resetToken, absoluteExpiration: DateTimeOffset.UtcNow.AddMinutes(30));
                logger.LogInformation($"User_Password_Reset_Token_{request.Email}: {resetToken}");
                Console.WriteLine($"User_Password_Reset_Token_{request.Email}: {resetToken}");

                var resetMail = MailNotifications.PasswordResetMailNotification(user.Email, user.FullName, resetToken);
                var mailRes = await mailer.SendMail(resetMail);
                if (!mailRes.IsSuccess)
                {
                    return ResponseDetail<string>.Failed("An error occurred while sending password reset email", 500, "Unexpected Error");
                }

                logger.LogInformation($"Password reset token sent successfully for user with email {request.Email}.");
                return ResponseDetail<string>.Successful("Password reset link has been sent to your email", resetToken);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"while processing forgot password for {request.Email}");
                return ResponseDetail<string>.Failed("An error occurred while processing your request", 500, ex.Message);
            }
        }

        public async Task<ResponseDetail<bool>> ResetPassword(ResetPasswordDTO request)
        {
            try
            {
                var user = await dbContext.AuthProfiles.FirstOrDefaultAsync(x => x.Email == request.Email);
                if (user is null)
                {
                    logger.LogInformation($"Password reset attempted for non-existent email: {request.Email}");
                    return ResponseDetail<bool>.Failed("Invalid reset request", 400);
                }

                var cacheKey = $"User_Password_Reset_Token_{request.Email}";
                cache.TryGetValue(cacheKey, out string cachedToken);
                if (cachedToken == null || cachedToken != request.Token)
                {
                    logger.LogInformation($"Invalid reset token provided for user with email {request.Email}.");
                    return ResponseDetail<bool>.Failed("Invalid or expired reset token", 400);
                }

                if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
                {
                    return ResponseDetail<bool>.Failed("Password must be at least 6 characters long", 400);
                }

                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

                user.Password = hashedPassword;
                user.ModifiedAt = DateTimeOffset.UtcNow;
                cache.Remove(cacheKey);

                dbContext.AuthProfiles.Update(user);
                await dbContext.SaveChangesAsync();

                logger.LogInformation($"Password reset successfully for user with email {request.Email}.");
                return ResponseDetail<bool>.Successful(true, "Password reset successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"while resetting password for {request.Email}");
                return ResponseDetail<bool>.Failed("An error occurred while resetting your password", 500, ex.Message);
            }
        }
    }
}
