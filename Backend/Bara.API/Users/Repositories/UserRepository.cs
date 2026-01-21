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
using Bara.API.Scripts.Models;
using Bara.API.Transactions.Models;
using Bara.API.Scripts.Enums;
using Bara.API.Transactions.Enums;

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
        private readonly IMailService mailer;
        public UserRepository(BaraContext baraContext,  IMailService mailer, LogHelper<UserRepository> logHelper, HangfireJobs hangfire,
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
            this.mailer = mailer;
        }

        public async Task<ResponseDetail<RegisterResponseDTO>> BeginRegistration(RegisterDTO detail)
        {
            using var transaction = await dbContext.Database.BeginTransactionAsync();
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
                    validationErrors.Add($"An account already exists...Please contact support to restore your account.");
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
                //Console.WriteLine($"{detail.Type}_Verification_Token_{detail.Email}: {token}");
                logger.LogInformation($"{detail.Type}_Verification_Token_{detail.Email}: {token}");

                var verificationMail = MailNotifications.RegistrationConfirmationMailNotification(detail.Email, token.ToString());
                logger.LogInformation($"A Verification mail, along with the token was sent to {detail.Email}");
                User user;
                var email = detail.Email.ToLowerInvariant();
                if (detail.Type == Role.Writer)
                {
                    Writer writerProfile = new Writer
                    {
                        Email = email,
                        Type = detail.Type,
                        VerificationStatus = detail.Type == Role.Admin ? VerificationStatus.Approved : VerificationStatus.Pending,
                        AuthProfile = new AuthProfile
                        {
                            Email = email,
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
                        Email = email,
                        Type = detail.Type,
                        VerificationStatus = detail.Type == Role.Admin ? VerificationStatus.Approved : VerificationStatus.Pending,
                        AuthProfile = new AuthProfile
                        {
                            Email = email,
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
                        Email = email,
                        Type = detail.Type,
                        VerificationStatus = detail.Type == Role.Admin ? VerificationStatus.Approved : VerificationStatus.Pending,
                        AuthProfile = new AuthProfile
                        {
                            Email = email,
                            Password = BCrypt.Net.BCrypt.HashPassword(detail.Password),
                            Role = detail.Type.ToString(),
                            IsVerified = detail.Type == Role.Admin
                        },
                    };

                    await dbContext.Users.AddAsync(user);
                }
                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                BackgroundJob.Enqueue(() => hangfire.SendMailAsync(verificationMail));
                var jwt_token = authService.GenerateJwtToken(user.AuthProfile.Role, user.AuthProfile.IsVerified ? "Verified" : "Unverified", user.Id, user.Email);
                var response = new RegisterResponseDTO
                {
                    UserId = user.Id,
                    Email = user.Email,
                    AccessToken = jwt_token,
                    Role = user.AuthProfile.Role
                };
                logger.LogInformation($"Registration was complete and token was sent to {detail.Email}");
                return ResponseDetail<RegisterResponseDTO>.Successful(response, $"A verification token has been sent to {detail.Email}. Please check your inbox to complete the registration process.", 201);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError($"An exception: {ex.GetType().Name} was thrown while creating a writer profile... This has caused the operation to rollback and  the account is probably not created\nBase Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}", ex.Message);
                return ResponseDetail<RegisterResponseDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }
        public async Task<ResponseDetail<bool>> BlackListUser(Guid userId, string? reason)
        {
            try
            {
                var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId);
                if (user == null)
                {
                    return ResponseDetail<bool>.Failed(false, "User not found", 404);
                }

                if (user.IsBlacklisted)
                {
                    return ResponseDetail<bool>.Failed(false, "User is already blacklisted", 409);
                }

                user.IsBlacklisted = true;
                user.ModifiedAt = DateTimeOffset.UtcNow;

                var blackListedUser = new BlackListedUser
                {
                    UserId = userId,
                    Name = $"{user.FirstName} {user.LastName}".Trim(),
                    Reason = reason ?? "No reason provided",
                    BlackListedAt = DateTimeOffset.UtcNow
                };

                dbContext.BlackListedUsers.Add(blackListedUser);
                await dbContext.SaveChangesAsync();

                var mailRequest = MailNotifications.BlacklistNotification(user.Email, user.FirstName, reason ?? "Violation of platform policies");
                await mailer.SendMail(mailRequest);

                logger.LogInformation("User {UserId} has been blacklisted. Reason: {Reason}", userId, reason);
                return ResponseDetail<bool>.Successful(true, "User blacklisted successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"blacklisting user {userId}");
                return ResponseDetail<bool>.Failed(false, "An error occurred while blacklisting the user", 500);
            }
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
                    return ResponseDetail<BankDetail>.Failed(new BankDetail(), "Invalid or non existent user id. Please check the user ID and try again.");
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
                    Name = resolveAccountRes.Data.AccountName
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

        public async Task<ResponseDetail<BlackListedUser>> GetBlackListedUser(Guid userId)
        {
            try
            {
                var user = await dbContext.BlackListedUsers
                    .Include(b => b.User)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(b => b.UserId == userId);

                if (user == null)
                {
                    return ResponseDetail<BlackListedUser>.Failed("Blacklisted user record not found", 404);
                }

                return ResponseDetail<BlackListedUser>.Successful(user, "Blacklisted user details retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"retrieving blacklisted user detail for {userId}");
                return ResponseDetail<BlackListedUser>.Failed("An error occurred while retrieving blacklisted user details", 500);
            }
        }

        public async Task<ResponseDetail<List<BlackListedUser>>> GetBlackListedUsers(int pageNumber, int pageSize)
        {
            try
            {
                var query = dbContext.BlackListedUsers
                    .Include(b => b.User)
                    .AsNoTracking();

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var users = await query
                    .OrderByDescending(b => b.BlackListedAt)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return ResponseDetail<List<BlackListedUser>>.SuccessfulPaginatedResponse(users, totalCount, totalPages, pageNumber, "Blacklisted users retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "retrieving blacklisted users");
                return ResponseDetail<List<BlackListedUser>>.Failed("An error occurred while retrieving blacklisted users", 500);
            }
        }

        public async Task<ResponseDetail<PlatformStatsDTO>> GetPlatformStats()
        {
            try
            {
                var stats = new PlatformStatsDTO
                {
                    TotalUsers = await dbContext.Users.CountAsync(),
                    PendingKyc = await dbContext.Users.CountAsync(u => u.VerificationStatus == VerificationStatus.Pending),
                    BlacklistedUsers = await dbContext.BlackListedUsers.CountAsync(),
                    TotalScripts = await dbContext.Scripts.CountAsync(),
                    TotalPlatformEarnings = await dbContext.ScriptTransactions
                        .Where(st => st.TransactionStatus == ScriptTransactionStatus.Completed)
                        .SumAsync(st => st.Amount)
                };

                return ResponseDetail<PlatformStatsDTO>.Successful(stats, "Platform statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "calculating platform statistics");
                return ResponseDetail<PlatformStatsDTO>.Failed("An error occurred while calculating platform statistics", 500);
            }
        }

        public async Task<ResponseDetail<bool>> RemoveUserFromBlackList(Guid userId)
        {
            try
            {
                var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId);
                if (user == null)
                {
                    return ResponseDetail<bool>.Failed(false, "User not found", 404);
                }

                var blackListedUserArea = await dbContext.BlackListedUsers.FirstOrDefaultAsync(x => x.UserId == userId);
                if (blackListedUserArea != null)
                {
                    dbContext.BlackListedUsers.Remove(blackListedUserArea);
                }

                user.IsBlacklisted = false;
                user.ModifiedAt = DateTimeOffset.UtcNow;

                await dbContext.SaveChangesAsync();

                logger.LogInformation("User {UserId} has been removed from the blacklist", userId);
                return ResponseDetail<bool>.Successful(true, "User removed from blacklist successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"removing user {userId} from blacklist");
                return ResponseDetail<bool>.Failed(false, "An error occurred while removing the user from the blacklist", 500);
            }
        }

        public async Task<ResponseDetail<bool>> UpdateUserVerificationStatus(string verificationIdNumber, string dateOfBirth, string firstName, string lastName, string type)
        {
            string name = "";
            try
            {
                var user = await dbContext.Users
                    .Include(x => x.Document)
                    .Include(x => x.AuthProfile)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(x => x.Document.IdentificationNumber == verificationIdNumber);

                if (user == null)
                {
                    logger.LogWarning("User not found for verification ID: {VerificationId}", verificationIdNumber);
                    return ResponseDetail<bool>.Failed(false, $"User not found with the provided verification ID number {verificationIdNumber}.", 404);
                }

                if (user.VerificationStatus == VerificationStatus.Approved)
                {
                    logger.LogInformation($"Another verification attempt for {firstName} {lastName} was made after verification has been approved");
                    return ResponseDetail<bool>.Successful(true, "Account is already verified");
                }

                name = $"{user.FirstName} {user.LastName}";
                var dateOfBirthTallies = user.DateOfBirth.ToString("yyyy-MM-dd") == dateOfBirth;
                //var nameTallies = (user.FirstName?.Equals(firstName, StringComparison.OrdinalIgnoreCase) ?? false) && 
                //                  (user.LastName?.Equals(lastName, StringComparison.OrdinalIgnoreCase) ?? false);

                var errors = new List<string>();

                if (!dateOfBirthTallies) errors.Add($"The date of birth on your {type.ToUpper()} does not match the provided date of birth at the time of registration.");
                //if (!nameTallies) errors.Add(name + $"The name on your {type.ToUpper()}does not match the provided firstname and/or lastname at the time of registration.");
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
                    cache.Remove($"{user.Type}_Profile_{user.Id}");
                    return ResponseDetail<bool>.Successful(true, $"User verification status updated successfully for {name}.");
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"updating user verification status for {name}");
                return ResponseDetail<bool>.Failed(false, $"An error occurred while updating user verification status for {name}. Please try again later.");
            }
        }

        public async Task<ResponseDetail<bool>> RetryKycVerification(RetryKycDTO payload)
        {
            try
            {
                var user = await dbContext.Users
                    .Include(x => x.Document)
                    .FirstOrDefaultAsync(x => x.Id == payload.UserId);

                if (user is null)
                {
                    logger.LogWarning($" KYC retry failed: User with ID {payload.UserId} not found (Initiated by {payload.AdminId})");
                    return ResponseDetail<bool>.Failed(false, "User not found", 404, "Not Found");
                }

                if (user.Document == null)
                {
                    logger.LogWarning($"KYC retry failed for user {user.Id}: No identity document record found.");
                    return ResponseDetail<bool>.Failed(false, "No document found for this user. KYC retry cannot be initiated without an existing document record.", 400);
                }

                user.Document.IdentificationNumber = payload.VerificationNumber;
                user.Document.DocumentType = payload.VerificationType;
                
                await dbContext.SaveChangesAsync();

                KycHelper.InitiateKycProcess(
                    payload.VerificationNumber,
                    payload.VerificationType,
                    user.Id,
                    user.LastName
                );

                logger.LogInformation($"Admin-initiated KYC verification retry for user {user.Id} by admin {payload.AdminId}");
                return ResponseDetail<bool>.Successful(true, "KYC verification retry has been initiated successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"admin retrying KYC for user {payload.UserId}");
                return ResponseDetail<bool>.Failed(false, "An error occurred while retrying KYC verification. Please try again later.", 500);
            }
        }

        public async Task<ResponseDetail<List<AdminUserListDTO>>> GetAllUsers(int pageNumber, int pageSize)
        {
            try
            {
                var query = dbContext.Users.AsNoTracking();
                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var users = await query
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new AdminUserListDTO
                    {
                        Id = u.Id,
                        Name = (string.IsNullOrEmpty(u.FirstName) && string.IsNullOrEmpty(u.LastName)) ? string.Empty : u.FirstName + " " + u.LastName,
                        Email = u.Email,
                        Role = u.AuthProfile.Role,
                        VerificationStatus = u.VerificationStatus.ToString(),
                        CreatedAt = u.CreatedAt,
                        ProfileImageUrl = u.ProfileImageUrl,
                        IsBlacklisted = u.IsBlacklisted
                    })
                    .ToListAsync();

                if (totalCount < 1)
                {
                    return ResponseDetail<List<AdminUserListDTO>>.SuccessfulPaginatedResponse(users, totalCount, totalPages, pageNumber, "No users found", 204);
                }

                return ResponseDetail<List<AdminUserListDTO>>.SuccessfulPaginatedResponse(users, totalCount, totalPages, pageNumber, "Users retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "retrieving all users for admin");
                return ResponseDetail<List<AdminUserListDTO>>.Failed("An error occurred while retrieving users", 500);
            }
        }

        public async Task<ResponseDetail<AdminUserDetailDTO>> GetAdminUserDetail(Guid userId)
        {
            try
            {
                var user = await dbContext.Users
                    .AsNoTracking()
                    .Include(u => u.AuthProfile)
                    .Include(u => u.Wallet)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return ResponseDetail<AdminUserDetailDTO>.Failed("User not found", 404);
                }

                var totalEarnings = await dbContext.ScriptTransactions
                    .Where(st => st.WriterId == userId && st.TransactionStatus == ScriptTransactionStatus.Completed)
                    .SumAsync(st => st.WriterShare);

                var detail = new AdminUserDetailDTO
                {
                    Id = user.Id,
                    Email = user.Email,
                    Role = user.AuthProfile.Role,
                    VerificationStatus = user.VerificationStatus.ToString(),
                    CreatedAt = user.CreatedAt,
                    ProfileImageUrl = user.ProfileImageUrl,
                    PhoneNumber = user.PhoneNumber,
                    WalletBalance = user.Wallet?.AvailableBalance ?? 0,
                    Bio = user.Bio,
                    TotalBalance = user.Wallet?.TotalBalance ?? 0,
                    LockedBalance = user.Wallet?.LockedBalance ?? 0,
                    TotalEarnings = totalEarnings,
                    IsBlacklisted = user.IsBlacklisted,
                    Name = (string.IsNullOrEmpty(user.FirstName) && string.IsNullOrEmpty(user.LastName)) ? string.Empty : user.FirstName + " " + user.LastName,
                    Scripts = await dbContext.Scripts
                        .AsNoTracking()
                        .Where(s => s.WriterId == userId)
                        .Select(s => new AdminUserScriptDTO
                        {
                            Id = s.Id,
                            Title = s.Title,
                            Status = s.Status.ToString(),
                            CreatedAt = s.CreatedAt,
                            Price = s.Price.ToString(),
                            CurrencySymbol = s.CurrencySymbol
                        }).ToListAsync(),
                    Transactions = await dbContext.Transactions
                        .AsNoTracking()
                        .Where(t => t.UserId == userId)
                        .Select(t => new AdminUserTransactionDTO
                        {
                            Id = t.Id,
                            Amount = t.Amount,
                            Currency = t.Currency.ToString(),
                            Type = t.TransactionType.ToString(),
                            Reference = t.ReferenceId,
                            Status = t.Status.ToString(),
                            CreatedAt = t.CreatedAt
                        }).ToListAsync(),
                    ScriptTransactions = await dbContext.ScriptTransactions
                        .AsNoTracking()
                        .Where(st => st.WriterId == userId || st.ProducerId == userId)
                        .Select(st => new AdminUserScriptTransactionDTO
                        {
                            Id = st.Id,
                            ScriptTitle = st.ScriptTitle,
                            Amount = st.Amount,
                            Status = st.TransactionStatus.ToString(),
                            CreatedAt = st.CreatedAt
                        }).ToListAsync()
                };

                return ResponseDetail<AdminUserDetailDTO>.Successful(detail, "User details retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"retrieving admin user detail for {userId}");
                return ResponseDetail<AdminUserDetailDTO>.Failed("An error occurred while retrieving user details", 500);
            }
        }

        public async Task<ResponseDetail<decimal>> GetTotalEarnings(Guid userId)
        {
            try
            {
                var totalEarnings = await dbContext.ScriptTransactions
                    .Where(st => st.WriterId == userId && st.TransactionStatus == ScriptTransactionStatus.Completed)
                    .SumAsync(st => st.WriterShare);

                return ResponseDetail<decimal>.Successful(totalEarnings, "Total earnings retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"calculating total earnings for user {userId}");
                return ResponseDetail<decimal>.Failed(0, "An error occurred while calculating earnings", 500);
            }
        }

        public async Task<ResponseDetail<List<AdminUserListDTO>>> SearchUsers(string query, int pageNumber, int pageSize)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                {
                    return ResponseDetail<List<AdminUserListDTO>>.Failed("Search query cannot be empty", 400);
                }

                var lowerQuery = query.ToLower();
                var baseQuery = dbContext.Users
                    .AsNoTracking()
                    .Where(u => u.Email.ToLower().Contains(lowerQuery) || 
                               u.FirstName.ToLower().Contains(lowerQuery) || 
                               u.LastName.ToLower().Contains(lowerQuery));

                var totalCount = await baseQuery.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var users = await baseQuery
                    .OrderByDescending(u => u.CreatedAt)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new AdminUserListDTO
                    {
                        Id = u.Id,
                        Name = (string.IsNullOrEmpty(u.FirstName) && string.IsNullOrEmpty(u.LastName)) ? string.Empty : u.FirstName + " " + u.LastName,
                        Email = u.Email,
                        Role = u.AuthProfile.Role,
                        VerificationStatus = u.VerificationStatus.ToString(),
                        CreatedAt = u.CreatedAt,
                        ProfileImageUrl = u.ProfileImageUrl,
                        IsBlacklisted = u.IsBlacklisted
                    })
                    .ToListAsync();

                if (totalCount < 1)
                {
                    return ResponseDetail<List<AdminUserListDTO>>.SuccessfulPaginatedResponse(users, totalCount, totalPages, pageNumber, $"No users found matching '{query}'", 204);
                }

                return ResponseDetail<List<AdminUserListDTO>>.SuccessfulPaginatedResponse(users, totalCount, totalPages, pageNumber, $"Found {totalCount} users matching '{query}'");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"paginated searching users for '{query}'");
                return ResponseDetail<List<AdminUserListDTO>>.Failed("An error occurred during user search", 500);
            }
        }
        public async Task<ResponseDetail<bool>> UpdateProfileImage(Guid userId, UpdateProfileImageDTO imageInfo)
        {
            try
            {
                var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId);
                if (user == null)
                {
                    return ResponseDetail<bool>.Failed(false, "User not found", 404);
                }

                user.ProfileImageUrl = imageInfo.ProfileImageUrl;
                user.ProfileImagePublicId = imageInfo.ProfileImagePublicId;
                user.ModifiedAt = DateTimeOffset.UtcNow;

                await dbContext.SaveChangesAsync();
                
                cache.Remove($"Writer_Profile_{userId}");
                cache.Remove($"Producer_Profile_{userId}");

                return ResponseDetail<bool>.Successful(true, "Profile image updated successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"updating profile image for {userId}");
                return ResponseDetail<bool>.Failed(false, "An error occurred while updating profile image", 500);
            }
        }
    }
}
