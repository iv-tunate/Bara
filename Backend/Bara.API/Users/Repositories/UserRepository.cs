using Bara.API.DataContext;
using Bara.API.Services.BackgroudServices;
using Bara.API.Services.Paystack;
using Bara.API.Services.Paystack.DTOs;
using Bara.API.Services.SignalR;
using Bara.API.Users.DTOs;
using Bara.API.Users.DTOs.UserDTO;
using Bara.API.Users.Enums;
using Bara.API.Users.Interfaces.UserInterfaces;
using Bara.API.Users.Models;
using Bara.API.Utilities.ToolKit;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Services.MailingService;
using System.Security.Cryptography;

namespace Bara.API.Users.Repositories
{
    public class UserRepository : IUserService
    {
        private readonly BaraContext dbContext;
        private readonly LogHelper<UserRepository> logHelper;
        private readonly ILogger<UserRepository> logger;
        private readonly IHubContext<NotificationHub> notificationHub;
        private readonly HangfireJobs hangfire;
        private readonly IMemoryCache cache;
        private readonly IPaystackService paystack;
        private readonly IAuthService authService;
        public UserRepository(BaraContext baraContext, LogHelper<UserRepository> logHelper, HangfireJobs hangfire,
        ILogger<UserRepository> logger, IHubContext<NotificationHub> hubContext, IMemoryCache cache, IPaystackService paystackService, IAuthService authService)
        {
            dbContext = baraContext;
            this.logHelper = logHelper;
            this.logger = logger;
            notificationHub = hubContext;
            this.hangfire = hangfire;
            this.cache = cache;
            paystack = paystackService;
            this.authService = authService;
        }

        public async Task<ResponseDetail<RegisterResponseDTO>> BeginRegistration(RegisterDTO detail)
        {
            try
            {
                var validationErrors = new List<string>();
                var userProfile = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == detail.Email);
                if (userProfile is not null)
                {
                    validationErrors.Add($"A user with the email {detail.Email} already exists.");
                }
                else if (userProfile?.IsDeleted == false)
                {
                    validationErrors.Add($"Please contact support to restore your account.");
                    return ResponseDetail<RegisterResponseDTO>.Failed(string.Join(" ; ", validationErrors), 409, "Conflict");
                }

                var emailValidation = RegexValidations.IsValidMail(detail.Email);
                var passwordValidation = RegexValidations.IsAcceptablePasswordFormat(detail.Password);

                if (!emailValidation || !passwordValidation)
                {
                    if (!emailValidation) validationErrors.Add("Invalid email format");
                    if (!passwordValidation) validationErrors.Add("Password must be strong (at least 8 characters, one uppercase, one lowercase, one number, and one special character)");
                    return ResponseDetail<RegisterResponseDTO>.Failed(string.Join(" | ", validationErrors), 400);
                }

                // --------------------  GENERATE EMAIL VERIFICATION TOKEN --------------------
                var token = RandomNumberGenerator.GetInt32(100000, 999999);

                cache.Set($"User_Verification_Token_{detail.Email}", token.ToString(), absoluteExpiration: DateTimeOffset.UtcNow.AddMinutes(10));
                Console.WriteLine($"{detail.Type}_Verification_Token_{detail.Email}: {token}");
                logger.LogInformation($"{detail.Type}_Verification_Token_{detail.Email}: {token}");

                var verificationMail = MailNotifications.RegistrationConfirmationMailNotification(detail.Email, token.ToString());

                User user;
                if (detail.Type == Role.Writer)
                {
                    Writer writerProfile = new Writer
                    {
                        Email = detail.Email,
                        Type = detail.Type,
                        VerificationStatus = detail.Type == Role.Admin ? VerificationStatus.Approved : VerificationStatus.Pending,
                        AuthProfile = new AuthProfile
                        {
                            Email = detail.Email,
                            Password = BCrypt.Net.BCrypt.HashPassword(detail.Password),
                            Role = detail.Type.ToString(),
                        },
                    };
                    await dbContext.Writers.AddAsync(writerProfile);
                    user = writerProfile;
                }

                else if (detail.Type == Role.Producer)
                {
                    Producer producerProfile = new Producer
                    {
                        Email = detail.Email,
                        Type = detail.Type,
                        VerificationStatus = detail.Type == Role.Admin ? VerificationStatus.Approved : VerificationStatus.Pending,
                        AuthProfile = new AuthProfile
                        {
                            Email = detail.Email,
                            Password = BCrypt.Net.BCrypt.HashPassword(detail.Password),
                            Role = detail.Type.ToString(),
                        },
                    };
                    await dbContext.Producers.AddAsync(producerProfile);
                    user = producerProfile;
                }
                else
                {
                    user = new User
                    {
                        Email = detail.Email,
                        Type = detail.Type,
                        VerificationStatus = detail.Type == Role.Admin ? VerificationStatus.Approved : VerificationStatus.Pending,
                        AuthProfile = new AuthProfile
                        {
                            Email = detail.Email,
                            Password = BCrypt.Net.BCrypt.HashPassword(detail.Password),
                            Role = detail.Type.ToString(),
                            IsVerified = detail.Type == Role.Admin
                        },
                    };

                    await dbContext.Users.AddAsync(user);
                }
                await dbContext.SaveChangesAsync();

                BackgroundJob.Enqueue(() => hangfire.SendMailAsync(verificationMail));
                var jwt_token = authService.GenerateJwtToken(user.AuthProfile.Role, user.AuthProfile.IsVerified ? "Verified" : "Unverified", user.Id);
                var response = new RegisterResponseDTO
                {
                    UserId = user.Id,
                    Email = user.Email,
                    AccessToken = jwt_token,
                    Role = user.AuthProfile.Role
                };
                return ResponseDetail<RegisterResponseDTO>.Successful(response, $"A verification token has been sent to {detail.Email}. Please check your inbox to complete the registration process.", 201);
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception: {ex.GetType().Name} was thrown while creating a writer profile... \nBase Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}", ex.Message);
                return ResponseDetail<RegisterResponseDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }
        public Task<ResponseDetail<bool>> BlackListUser(Guid userId, string? reason)
        {
            throw new NotImplementedException();
        }
        public async Task<ResponseDetail<BankDetail>> AddBankDetail(PostBankDetailDTO bankDetailData, Guid userId)
        {
            try
            {
                var user = await dbContext.Users
                                        .Include(x => x.BankDetails)
                                        .FirstOrDefaultAsync(x => x.Id == userId);

                if (user is null)
                {
                    return ResponseDetail<BankDetail>.Failed(default, "Invalid or non existent user id. Please check the user ID and try again.");
                }

                var resolveAccountRes = await paystack.ResolveAccountNumber(bankDetailData.AccountNumber, bankDetailData.BankCode);
                if (resolveAccountRes.Status == false)
                {
                    return ResponseDetail<BankDetail>.Failed(default, resolveAccountRes.Message);
                }
                var receipientData = new CreateRecipientRequest
                {
                    AccountNumber = bankDetailData.AccountNumber,
                    BankCode = bankDetailData.BankCode,
                    Name = resolveAccountRes.Data.AccountName,
                };
                var paymentRecipient = await paystack.CreateRecipientAsync(receipientData);
                if (paymentRecipient.RecipientCode is null)
                {
                    return ResponseDetail<BankDetail>.Failed(default, "An error occurred while adding bank detail. Please try again later.");
                }
                var bankDetail = new BankDetail
                {
                    AccountNumber = bankDetailData.AccountNumber,
                    BankName = bankDetailData.BankName,
                    AccountName = resolveAccountRes.Data.AccountName,
                    UserId = userId,
                    BankCode = bankDetailData.BankCode,
                    BankId = bankDetailData.BankId,
                    BankType = bankDetailData.BankType,
                    RecipientCode = paymentRecipient.RecipientCode
                };
                user.BankDetails.Add(bankDetail);
                await dbContext.SaveChangesAsync();
                logger.LogInformation($"Bank detail added successfully for user {user.Email} with ID {userId}.");
                return ResponseDetail<BankDetail>.Successful(bankDetail, "Bank detail added successfully.", 201);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "adding bank detail");
                return ResponseDetail<BankDetail>.Failed(default, "An error occurred while adding bank detail. Please try again later.");
            }
        }
        public async Task<ResponseDetail<List<BankDetail>>> GetAllBankDetails(Guid userId)
        {
            try
            {
                var bankDetails = await dbContext.BankDetails.Where(x => x.UserId == userId)
                                                             .ToListAsync();
                return ResponseDetail<List<BankDetail>>.Successful(bankDetails, "Bank details retrieved successfully.", 200);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "getting all bank details");
                return ResponseDetail<List<BankDetail>>.Failed([], "An error occurred while retrieving bank details. Please try again later.");
            }
        }

        public async Task<ResponseDetail<BankDetail>> GetBankDetail(Guid bankDetailId, Guid userId)
        {
            try
            {
                var bankDetail = await dbContext.BankDetails
                    .FirstOrDefaultAsync(x => x.Id == bankDetailId && x.UserId == userId);
                return ResponseDetail<BankDetail>.Successful(bankDetail, "Bank detail retrieved successfully.", 200);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "getting bank detail");
                return ResponseDetail<BankDetail>.Failed(default, "An error occurred while retrieving bank detail. Please try again later.");
            }
        }

        public Task<ResponseDetail<BlackListedUser>> GetBlackListedUser(Guid userId)
        {
            throw new NotImplementedException();
        }

        public Task<ResponseDetail<List<BlackListedUser>>> GetBlackListedUsers(int pageNumber, int pageSize)
        {
            throw new NotImplementedException();
        }

        public Task<ResponseDetail<bool>> RemoveUserFromBlackList(Guid userId)
        {
            throw new NotImplementedException();
        }

        public async Task<ResponseDetail<bool>> UpdateUserVerificationStatus(string verificationIdNumber, string dateOfBirth, string firstName, string lastName, string type)
        {
            string name = "";
            try
            {
                var user = await dbContext.Users
                    .Include(x => x.Document)
                    .Include(x => x.AuthProfile)
                    .FirstOrDefaultAsync(x => x.Document.IdentificationNumber == verificationIdNumber);

                var errors = new List<string>();

                if (user == null) errors.Add($"User not found with the provided verification ID number {verificationIdNumber}.");

                if (user.VerificationStatus == VerificationStatus.Approved)
                {
                    logger.LogInformation($"Another verification attempt for {firstName} {lastName} was made after verification has been approved");
                    return ResponseDetail<bool>.Successful(true, "Account is already verified");
                }

                name = $"{user?.FirstName} {user?.LastName}";
                var dateOfBirthTallies = user.DateOfBirth.ToString("yyyy-MM-dd") == dateOfBirth;
                var nameTallies = user.FirstName.Equals(firstName, StringComparison.OrdinalIgnoreCase) && user.LastName.Equals(lastName, StringComparison.OrdinalIgnoreCase);

                if (!dateOfBirthTallies) errors.Add($"The date of birth on your {type.ToUpper()} does not match the provided date of birth at the time of registration.");
                if (!nameTallies) errors.Add(name + $"The name on your {type.ToUpper()}does not match the provided firstname and/or lastname at the time of registration.");
                if (errors.Count > 0)
                {
                    user.VerificationStatus = VerificationStatus.Failed;
                    user.ModifiedAt = DateTimeOffset.UtcNow;
                    await notificationHub.Clients.User(user.Id.ToString()).SendAsync("KycFailed", new
                    {
                        message = $"Your KYC was verified unsuccessful... {string.Join(" |\n ", errors)}",
                        time = DateTime.UtcNow
                    });

                    logger.LogInformation($"Verification for {user.FirstName} {user.LastName} failed because {string.Join(" |\n ", errors)}");
                    return ResponseDetail<bool>.Failed(false, string.Join(" |\n ", errors));
                }
                else
                {
                    user.Document.IsVerified = true;
                    user.AuthProfile.IsVerified = true;
                    user.ModifiedAt = DateTimeOffset.UtcNow;
                    user.VerificationStatus = VerificationStatus.Approved;
                    user.Document.IsVerified = true;
                    await dbContext.SaveChangesAsync();
                    logger.LogInformation($"User verification status updated successfully for {name} with ID {user.Id}.");
                    await notificationHub.Clients.User(user.Id.ToString()).SendAsync("KycSuccessful", new
                    {
                        message = $"Your KYC was verified successful",
                        time = DateTime.UtcNow
                    });
                    return ResponseDetail<bool>.Successful(true, $"User verification status updated successfully for {name}.");
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"updating user verification status for {name}");
                return ResponseDetail<bool>.Failed(false, $"An error occurred while updating user verification status for {name}. Please try again later.");
            }
        }
    }
}
