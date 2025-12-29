using Bara.API.DataContext;
using Bara.API.Services.Paystack;
using Bara.API.Services.Paystack.DTOs;
using Bara.API.Services.SignalR;
using Bara.API.Transactions.DTOs.TransactionDTOs;
using Bara.API.Transactions.Enums;
using Bara.API.Transactions.Interfaces;
using Bara.API.Transactions.Models;
using Bara.API.Utilities.Models;
using Bara.API.Utilities.Settings;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Services.ExternalAPI_Integration;
using Services.MailingService;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;

namespace Bara.API.Transactions.Repositories
{
    public class TransactionRepository : ITransactionService
    {
        private readonly IPaystackService paystack;
        private readonly LogHelper<TransactionRepository> logHelper;
        private readonly ILogger<TransactionRepository> logger;
        private readonly BaraContext dbContext;
        private readonly IMailService mailer;
        private readonly IHubContext<NotificationHub> notificationHub;
        private readonly Secrets secrets;
        private readonly ExternalApiIntegrationService externalServices;
        private readonly IMemoryCache cache;
        private readonly IConfiguration config;

        public TransactionRepository(IPaystackService paystackService, LogHelper<TransactionRepository> logHelper,
            ILogger<TransactionRepository> logger, BaraContext context, IMailService mailer,
            IHubContext<NotificationHub> notificationHub, ExternalApiIntegrationService externalApiIntegrationService,
            IOptions<Secrets> appSecrets, IMemoryCache cache, IConfiguration configuration)
        {
            paystack = paystackService;
            this.logHelper = logHelper;
            this.logger = logger;
            dbContext = context;
            this.mailer = mailer;
            this.notificationHub = notificationHub;
            externalServices = externalApiIntegrationService;
            secrets = appSecrets.Value;
            this.cache = cache;
            config = configuration;
        }

        public async Task<ResponseDetail<object>> InitiateTransactionAsync(TransactionInitDTO data, Guid userId)
        {
            await using var dbTransaction = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var user = await dbContext.Users.Where(x => x.Id == userId)
                        .Select(x => new
                        {
                            x.Id,
                            x.Email,
                            x.AuthProfile.FullName,
                            x.AuthProfile.FirstName,
                            x.AuthProfile.LastName,
                            WalletId = x.Wallet.Id
                        }).FirstOrDefaultAsync();

                if (user == null)
                {
                    logger.LogInformation($"User with ID {userId} not found while initiating transaction.");
                    return ResponseDetail<object>.Failed("User not found", 404);
                }

                var referenceId = Guid.NewGuid().ToString(); // Fixed: Ensure unique reference

                var transaction = new PaymentTransaction
                {
                    UserId = user.Id,
                    UserFullName = user.FullName,
                    Amount = data.Amount,
                    Status = TransactionStatus.Initiated,
                    TransactionType = TransactionType.WalletFunding,
                    WalletID = user.WalletId,
                    ReferenceId = referenceId, 
                    PaymentMethod = "Paystack",
                    Currency = Currency.NAIRA
                };

                await dbContext.Transactions.AddAsync(transaction);
                var dbRes = await dbContext.SaveChangesAsync();

                if (dbRes < 0)
                {
                    await dbTransaction.RollbackAsync();
                    logger.LogError($"Failed to save transaction for user {user.FullName}. Database error.");
                    return ResponseDetail<object>.Failed("Failed to initiate transaction", 500);
                }
                else
                {
                    // var frontendUrl = config["FrontendBaseUrl"] ?? "http://localhost:3000";
                    var frontendUrl = "http://localhost:3000";
                    
                    var paymentInitRequest = new PaymentInitRequest
                    {
                        Amount = data.Amount,
                        Email = user.Email,
                        Currency = "NGN",
                        Reference = referenceId, 
                        CallbackUrl = $"{frontendUrl}/callback/paystack",
                        UserId = user.Id,
                        CustomerName = user.FullName,
                        Channels = new List<string> { "card", "bank", "ussd", "qr", "mobile_money", "bank_transfer" },
                        Metadata = new Dictionary<string, object>
                        {
                            { "user_id", user.Id },
                            { "customer_name", user.FullName },
                            { "email", user.Email },
                            { "transaction_id", transaction.Id },
                            { "reference", referenceId },
                            { "custom_fields", new List<object> 
                                {
                                    new { display_name = "User Name", variable_name = "user_name", value = user.FullName }
                                } 
                            }
                        },
                    };

                    var paymentResponse = await paystack.InitializePaymentAsync(paymentInitRequest);

                    if (paymentResponse.Status)
                    {
                        transaction.Status = TransactionStatus.Pending;
                        transaction.AccessCode = paymentResponse.Data.AccessCode;

                        dbContext.Transactions.Update(transaction);
                        await dbContext.SaveChangesAsync();
                        await dbTransaction.CommitAsync();

                        return ResponseDetail<object>.Successful(new
                        {
                            transaction.Id,
                            paymentUrl = paymentResponse.Data.AuthorizationUrl,
                            reference = referenceId 
                        }, "Transaction initiated successfully");
                    }
                    else
                    {
                        transaction.Status = TransactionStatus.Failed;
                        await dbTransaction.RollbackAsync();
                        logger.LogError($"Failed to initialize payment for user {user.FullName}. Error: {paymentResponse.Message}");
                        return ResponseDetail<object>.Failed(paymentResponse.Message, 500);
                    }
                }
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"While creating a transaction for {userId}");
                return ResponseDetail<object>.Failed("Failed to initiate transaction", 500, ex.Message);
            }
        }

        public async Task<ResponseDetail<bool>> InitiateWithdrawalProcess(Guid userId, InitiateWithdrawalDTO data)
        {
            try
            {
                var user = await dbContext.Users.FindAsync(userId);
                if (user == null)
                {
                    return ResponseDetail<bool>.Failed(false, "Invaid or Non-Existent user Id", 400, "Invalid Operation");
                }
                var (Ip, Country) = await externalServices.GetIpAndCountryAsync(secrets.IpInfoKey);
                var token = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
                var mailBody = new WithdrawalNotificationDTO
                {
                    Amount = data.Amount,
                    Country = Country,
                    Ip = Ip,
                    Currency = data.Currency,
                    Device = data.Device,
                    InitiatedAt = DateTimeOffset.UtcNow,
                    Name = user.FirstName + " " + user.LastName,
                    Receiver = user.Email,
                    Token = token
                };
                var notificationBody = MailNotifications.WithdrawalInitiationNotification(mailBody);
                var cacheKey = $"withdrawal_token_{userId}";
                cache.Set(cacheKey, token, TimeSpan.FromMinutes(10));
                logger.LogInformation($"withdrawal_token_{userId} for {user.FirstName}: {token}");
                var mailRes = await mailer.SendMail(notificationBody);
                if (!mailRes.IsSuccess)
                {
                    return ResponseDetail<bool>.Failed(false, "Operation can not be completed at this time, please try again later");
                }
                return ResponseDetail<bool>.Successful(true, $"Withdrawal verification token sent to {user.Email}");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"While initiating withdrawal for {userId}");
                return ResponseDetail<bool>.Failed("Failed to initiate withdrawal", 500, ex.Message);
            }
        }

        public async Task<ResponseDetail<bool>> ContinueWithdrawalInitiation(Guid userId, string token, InitiateWithdrawalDTO data)
        {
            await using var dbTransaction = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var user = await dbContext.Users
                                .Where(x => x.Id == userId)
                                .Include(x => x.BankDetails)
                                .Include(x => x.PaymentTransactions)
                                .Include(x => x.Wallet)
                                .FirstOrDefaultAsync();

                if (user == null)
                {
                    return ResponseDetail<bool>.Failed(false, "Invaid or Non-Existent user Id", 400, "Invalid Operation");
                }

                var cacheKey = $"withdrawal_token_{userId}";
                if (!cache.TryGetValue(cacheKey, out string cachedToken) || cachedToken != token)
                {
                    logger.LogInformation($"Invalid or expired withdrawal token attempt for user {user.FirstName} {user.MiddleName} {user.LastName}");
                    return ResponseDetail<bool>.Failed(false, "Invalid or expired token", 400, "Invalid Token");
                }
                cache.Remove(cacheKey);

                var recipientCode = user.BankDetails.Where(x => x.Id == data.BankAccountId)
                                                    .Select(x => x.RecipientCode).FirstOrDefault();

                if (string.IsNullOrEmpty(recipientCode))
                {
                    logger.LogInformation($"No recipient code found for user {user.FirstName} {user.MiddleName} {user.LastName} which caused the withdrawal transaction to fail");
                }
                var availableBal = user.Wallet.AvailableBalance;
                var fee = data.Amount * 0.016m;
                if (availableBal < data.Amount)
                {
                    logger.LogInformation($"Insufficient balance for user {user.FirstName} {user.MiddleName} {user.LastName} to process withdrawal of {data.Amount}");
                    return ResponseDetail<bool>.Failed(false, "Insufficient balance", 400, "Insufficient Balance");
                }
                var reqBody = new WithdrawalRequest
                {
                    Amount = data.Amount - fee,
                    Reason = data.Reason,
                    UserId = userId,
                    RecipientCode = recipientCode
                };

                var withdrawalResponse = await paystack.InitiateWithdrawalAsync(reqBody);

                if (!withdrawalResponse.Status)
                {
                    logger.LogError($"Withdrawal initiation failed for user {user.FirstName} {user.MiddleName} {user.LastName}. Error: {withdrawalResponse.Message}");
                    return ResponseDetail<bool>.Failed(false, "Withdrawal initiation failed", 500, withdrawalResponse.Message);
                }
                var transaction = new PaymentTransaction
                {
                    UserId = user.Id,
                    UserFullName = user.FirstName + " " + user.LastName,
                    Fee = fee,
                    Amount = data.Amount,
                    Status = TransactionStatus.Pending,
                    TransactionType = TransactionType.Withdrawal,
                    WalletID = user.Wallet.Id,
                    ReferenceId = withdrawalResponse.Data.Reference,
                    TransferCode = withdrawalResponse.Data.TransferCode,
                    Notes = data.Reason
                };

                var newBalance = user.Wallet.AvailableBalance - (data.Amount + transaction.Fee);

                user.Wallet.AvailableBalance = newBalance;
                user.PaymentTransactions.Add(transaction);

                dbContext.Users.Update(user);
                var dbRes = await dbContext.SaveChangesAsync();
                if (dbRes > 0)
                {
                    await dbTransaction.RollbackAsync();
                    return ResponseDetail<bool>.Failed(false, "Withdrawal initiation failed", 500, "Database error");
                }

                await dbTransaction.CommitAsync();

                await notificationHub.Clients.User(userId.ToString())
                .SendAsync("WalletUpdated", new
                {
                    Balance = user.Wallet.AvailableBalance,
                    Total = user.Wallet.TotalBalance
                });

                return ResponseDetail<bool>.Successful(true, "Withdrawal initiated successfully");
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"While initiating withdrawal for {userId}");
                return ResponseDetail<bool>.Failed("Failed to initiate withdrawal", 500, ex.Message);
            }
        }

        public async Task<ResponseDetail<bool>> VerifyTransactionAsync(string reference)
        {
            await using var dbTransaction = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var result = await (
                                from t in dbContext.Transactions
                                join u in dbContext.Users on t.UserId equals u.Id
                                where t.ReferenceId == reference
                                select new
                                {
                                    u.Id,
                                    Transaction = t,
                                    u.Wallet,
                                    u.PaymentDetails
                                }
                            ).FirstOrDefaultAsync();

                if (result is null)
                {
                    logger.LogInformation($"Transaction with reference {reference} not found while verifying transaction.");
                    return ResponseDetail<bool>.Failed("Transaction not found", 404);
                }

                var userTransaction = result.Transaction;
                if (userTransaction == null)
                {
                    logger.LogInformation($"Transaction with reference {reference} not found while verifying transaction.");
                    return ResponseDetail<bool>.Failed("Transaction not found", 404);
                }

                var verifyReq = await paystack.VerifyPaymentAsync(userTransaction.ReferenceId);
                if (verifyReq.Status && verifyReq.Data != null)
                {
                    if (verifyReq.Data.Status == "success" && verifyReq.Data.Amount == userTransaction.Amount && userTransaction.Status is TransactionStatus.Completed)
                    {
                        await dbTransaction.CommitAsync();
                        return ResponseDetail<bool>.Successful(true, "Transaction already verified");
                    }
                    else if (verifyReq.Data.Status == "success" && verifyReq.Data.Amount == userTransaction.Amount)
                    {
                        var paymentDetail = result.PaymentDetails.FirstOrDefault(x => x.AuthorizationCode == verifyReq.Data.Authorization.AuthorizationCode && x.UserId == result.Id);
                        if (paymentDetail is null)
                        {
                            var newPaymentDetail = new PaymentDetail
                            {
                                UserId = result.Id,
                                AuthorizationCode = verifyReq.Data.Authorization.AuthorizationCode,
                                Last4 = verifyReq.Data.Authorization.Last4,
                                CardType = verifyReq.Data.Authorization.CardType,
                                ExpMonth = verifyReq.Data.Authorization.ExpMonth,
                                Bank = verifyReq.Data.Authorization.Bank,
                                CountryCode = verifyReq.Data.Authorization.CountryCode,
                                CustomerCode = verifyReq.Data.Customer.CustomerCode,
                                CustomerId = verifyReq.Data.Customer.Id.ToString(),
                                ExpYear = verifyReq.Data.Authorization.ExpYear,
                                Reusable = verifyReq.Data.Authorization.Reusable
                            };

                            result.PaymentDetails.Add(newPaymentDetail);
                        }
                        userTransaction.Status = TransactionStatus.Completed;
                        userTransaction.CompletedAt = DateTimeOffset.UtcNow;
                        userTransaction.CreatedAt = verifyReq.Data.CreatedAt.HasValue
                           ? DateTimeOffset.Parse(verifyReq.Data.CreatedAt.Value.ToString())
                           : userTransaction.CreatedAt;
                        result.Wallet.AvailableBalance += userTransaction.Amount;
                        result.Wallet.TotalBalance += userTransaction.Amount;
                        userTransaction.GatewayResponse = verifyReq.Data.GatewayResponse;
                        userTransaction.PaymentMethod = verifyReq.Data.Channel;
                        userTransaction.Fee = verifyReq.Data.Fees;
                        userTransaction.Notes = verifyReq.Message;
                        userTransaction.ModifiedAt = DateTimeOffset.UtcNow;

                        dbContext.Transactions.Update(userTransaction);
                        dbContext.Wallets.Update(result.Wallet);
                        await dbContext.SaveChangesAsync();
                        await dbTransaction.CommitAsync();

                        await notificationHub.Clients.User(result.Id.ToString())
                            .SendAsync("WalletUpdated", new
                            {
                                Balance = result.Wallet.AvailableBalance,
                                Total = result.Wallet.TotalBalance
                            });

                        return ResponseDetail<bool>.Successful(true, "Transaction verified successfully");
                    }
                    else
                    {
                        userTransaction.Status = verifyReq.Data.Status switch
                        {
                            "failed" => TransactionStatus.Failed,
                            "abandoned" => TransactionStatus.Abandoned,
                            "cancelled" => TransactionStatus.Cancelled,
                            _ => TransactionStatus.Failed
                        };
                        userTransaction.ModifiedAt = DateTimeOffset.UtcNow;
                        dbContext.Transactions.Update(userTransaction);
                        await dbContext.SaveChangesAsync();
                        await dbTransaction.CommitAsync();
                        return ResponseDetail<bool>.Failed("Transaction verification failed", 400);
                    }
                }
                else
                {
                    logger.LogError($"Failed to verify transaction for user {result.Id}. Error: {verifyReq.Message}");
                    await dbTransaction.RollbackAsync(); // User asked for rollback on failure
                    return ResponseDetail<bool>.Failed(verifyReq.Message, 500);
                }

            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"while verifying transaction");
                return ResponseDetail<bool>.Failed("An error occured while verifying the transaction", 500, ex.Message);
            }
        }

        public async Task<ResponseDetail<bool>> VerifyTransferAsync(string reference)
        {
            await using var dbTransaction = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var result = await (
                                from t in dbContext.Transactions
                                join u in dbContext.Users on t.UserId equals u.Id
                                where t.ReferenceId == reference
                                select new
                                {
                                    u.Id,
                                    Transaction = t,
                                    u.Wallet
                                }
                            ).FirstOrDefaultAsync();

                if (result is null)
                {
                    logger.LogInformation($"Transfer with reference {reference} not found while verifying transfer.");
                    return ResponseDetail<bool>.Failed("Transfer not found", 404);
                }

                var userTransaction = result.Transaction;
                if (userTransaction == null)
                {
                    logger.LogInformation($"Transfer with reference {reference} not found while verifying transfer.");
                    return ResponseDetail<bool>.Failed("Transfer not found", 404);
                }

                var verifyReq = await paystack.VerifyTransferAsync(userTransaction.ReferenceId);

                if (verifyReq.Status && verifyReq.Data != null)
                {
                    if (verifyReq.Data.Status == "success" && userTransaction.Status is TransactionStatus.Completed)
                    {
                        await dbTransaction.CommitAsync();
                        return ResponseDetail<bool>.Successful(true, "Transfer already verified");
                    }
                    else if (verifyReq.Data.Status == "success")
                    {
                        userTransaction.Status = TransactionStatus.Completed;
                        userTransaction.CompletedAt = DateTimeOffset.UtcNow;
                        userTransaction.CreatedAt = verifyReq.Data.CreatedAt.HasValue
                           ? DateTimeOffset.Parse(verifyReq.Data.CreatedAt.Value.ToString())
                           : userTransaction.CreatedAt;
                        userTransaction.GatewayResponse = verifyReq.Data.GatewayResponse;
                        userTransaction.PaymentMethod = "transfer";
                        userTransaction.Fee = verifyReq.Data.Fees;
                        userTransaction.Notes = verifyReq.Message;
                        userTransaction.ModifiedAt = DateTimeOffset.UtcNow;

                        dbContext.Transactions.Update(userTransaction);
                        await dbContext.SaveChangesAsync();

                        await notificationHub.Clients.User(result.Id.ToString())
                            .SendAsync("TransferVerified", new
                            {
                                Reference = userTransaction.ReferenceId,
                                Status = userTransaction.Status.ToString()
                            });

                        await dbTransaction.CommitAsync();
                        return ResponseDetail<bool>.Successful(true, "Transfer verified successfully");
                    }
                    else
                    {
                        userTransaction.Status = verifyReq.Data.Status switch
                        {
                            "failed" => TransactionStatus.Failed,
                            "abandoned" => TransactionStatus.Abandoned,
                            "cancelled" => TransactionStatus.Cancelled,
                            _ => TransactionStatus.Failed
                        };
                        userTransaction.ModifiedAt = DateTimeOffset.UtcNow;
                        dbContext.Transactions.Update(userTransaction);
                        await dbContext.SaveChangesAsync();

                        result.Wallet.AvailableBalance += userTransaction.Amount;
                        result.Wallet.TotalBalance += userTransaction.Amount;
                        dbContext.Wallets.Update(result.Wallet);
                        await dbContext.SaveChangesAsync();

                        await dbTransaction.CommitAsync();
                        return ResponseDetail<bool>.Failed("Transfer verification failed", 400);
                    }
                }
                else
                {
                    logger.LogError($"Failed to verify transfer with reference {reference}. Error: {verifyReq.Message}");
                    await dbTransaction.RollbackAsync();
                    return ResponseDetail<bool>.Failed(verifyReq.Message, 500);
                }
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"while verifying transfer with reference {reference}");
                return ResponseDetail<bool>.Failed("An error occurred while verifying the transfer", 500, ex.Message);
            }
        }

        public async Task<ResponseDetail<List<GetTransactionDetail>>> GetUserTransactions(Guid userId, int pageNumber, int pageSize)
        {
            try
            {
                var cacheKey = $"User_{userId}_Transactions";
                cache.TryGetValue<List<GetTransactionDetail>>(cacheKey, out var cachedTransactions);
                if (cachedTransactions == null)
                {
                    var transactions = await dbContext.Transactions
                        .Where(t => t.UserId == userId)
                        .OrderByDescending(t => t.CreatedAt)
                        .Select(t => new GetTransactionDetail
                        {
                            Id = t.Id,
                            Amount = t.Amount,
                            Currency = t.Currency.ToString(),
                            CurrencySymbol = t.CurrencySymbol,
                            TransactionDate = t.CreatedAt.DateTime,
                            Status = t.Status.ToString(),
                            Notes = t.Notes,
                            ReferenceId = t.ReferenceId,
                            GatewayResponse = t.GatewayResponse,
                            CompletedAt = t.ModifiedAt,
                            DateCompleted = t.ModifiedAt.HasValue ? DateOnly.FromDateTime(t.ModifiedAt.Value.DateTime) : null,
                            TimeCompleted = t.ModifiedAt.HasValue ? TimeOnly.FromDateTime(t.ModifiedAt.Value.DateTime) : null
                        })
                        .ToListAsync();

                    cachedTransactions = transactions;

                    var cacheOptions = new MemoryCacheEntryOptions()
                        .SetAbsoluteExpiration(TimeSpan.FromMinutes(5))
                        .SetSlidingExpiration(TimeSpan.FromMinutes(2));

                    cache.Set(cacheKey, cachedTransactions, cacheOptions);
                }

                var totalCount = cachedTransactions.Count;
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
                var paginatedTransactions = cachedTransactions
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                if (totalCount < 1)
                {
                    return ResponseDetail<List<GetTransactionDetail>>.SuccessfulPaginatedResponse(paginatedTransactions, totalCount, totalPages, pageNumber, "No transactions found", 204);
                }

                return ResponseDetail<List<GetTransactionDetail>>.SuccessfulPaginatedResponse(paginatedTransactions, totalCount, totalPages, pageNumber, "Transactions retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"fetching transactions for user {userId}");
                return ResponseDetail<List<GetTransactionDetail>>.Failed("Your request failed", 500, "Unexpected error");
            }
        }
    }
}
