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
                            WalletId = x.Wallet.Id
                        }).FirstOrDefaultAsync();

                if (user == null)
                {
                    logger.LogInformation($"User with ID {userId} not found while initiating transaction.");
                    return ResponseDetail<object>.Failed("User not found", 404);
                }

                var referenceId = TokenGenerator.GeneratePaymentReference();

                 decimal fee = (data.Amount * 0.018m) + 100m;
                decimal totalCharge = data.Amount + fee;

                var transaction = new PaymentTransaction
                {
                    UserId = user.Id,
                    UserFullName = user.FullName,
                    Amount = data.Amount, 
                    Fee = fee,           
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
                    var frontendUrl = config["FrontendBaseUrl"] ?? "http://localhost:3000";
                    
                    var paymentInitRequest = new PaymentInitRequest
                    {
                        Amount = totalCharge, 
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
                                    new { display_name = "User Name", variable_name = "user_name", value = user.FullName },
                                    new { display_name = "Fee", variable_name = "fee", value = fee }
                                } 
                            }
                        },
                    };

                    var paymentResponse = await paystack.InitializePaymentAsync(paymentInitRequest);
                    logger.LogInformation($"Paystack sent a response at the point of initializing payment for {user.FullName}..... || \n {paymentResponse}");
                    if (paymentResponse.Status)
                    {
                        transaction.Status = TransactionStatus.Pending;
                        transaction.AccessCode = paymentResponse.Data.AccessCode;

                        dbContext.Transactions.Update(transaction);
                        await dbContext.SaveChangesAsync();
                        await dbTransaction.CommitAsync();

                        cache.Remove($"User_{userId}_Transactions");

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
                        logger.LogError($"Failed to initialize payment for user {user.FullName}. Error: {paymentResponse}");
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

                cache.Remove($"User_{userId}_Transactions");

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
            try
            {
                var result = await dbContext.Transactions
                    .Where(t => t.ReferenceId == reference)
                    .Select(t => new
                    {
                        Transaction = t,
                        User = t.User,
                        Wallet = t.User.Wallet,
                        PaymentDetail = t.User.PaymentDetails
                            .FirstOrDefault(pd => pd.AuthorizationCode == t.ReferenceId) 
                    })
                    .FirstOrDefaultAsync();

                if (result == null)
                {
                    logger.LogInformation($"Transaction with reference {reference} not found.");
                    return ResponseDetail<bool>.Failed("Transaction not found", 404);
                }
                if (result.Transaction.Status == TransactionStatus.Completed)
                {
                    logger.LogInformation($"Transaction with reference {reference} has already been completed.");
                    return ResponseDetail<bool>.Successful(true, "Transaction already verified");
                }
                var transaction = result.Transaction;
                var wallet = result.Wallet;
                var user = result.User;

                var verifyReq = await paystack.VerifyPaymentAsync(transaction.ReferenceId);

                if (!verifyReq.Status || verifyReq.Data == null)
                {
                    logger.LogError($"Failed to verify transaction for user {user.Id}. Error: {verifyReq.Message}");
                    return ResponseDetail<bool>.Failed(verifyReq.Message, 500);
                }

                var gatewayAmount = verifyReq.Data.Amount;
                var expectedTotal = transaction.Amount + transaction.Fee;

                if (verifyReq.Data.Status == "success"
                    && gatewayAmount == expectedTotal
                    && transaction.Status == TransactionStatus.Completed)
                {
                    cache.Remove($"User_{user.Id}_Transactions");
                    return ResponseDetail<bool>.Successful(true, "Transaction already verified");
                }

                if (verifyReq.Data.Status == "success" && gatewayAmount == expectedTotal)
                {
                    await using var dbTransaction = await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

                    try
                    {
                        var authCode = verifyReq.Data.Authorization.AuthorizationCode;

                        var existingPaymentDetail = await dbContext.PaymentDetail
                            .FirstOrDefaultAsync(p => p.UserId == user.Id && p.AuthorizationCode == authCode);

                        if (existingPaymentDetail == null)
                        {
                            dbContext.PaymentDetail.Add(new PaymentDetail
                            {
                                UserId = user.Id,
                                AuthorizationCode = authCode,
                                Last4 = verifyReq.Data.Authorization.Last4,
                                CardType = verifyReq.Data.Authorization.CardType,
                                ExpMonth = verifyReq.Data.Authorization.ExpMonth,
                                ExpYear = verifyReq.Data.Authorization.ExpYear,
                                Bank = verifyReq.Data.Authorization.Bank,
                                CountryCode = verifyReq.Data.Authorization.CountryCode,
                                CustomerCode = verifyReq.Data.Customer.CustomerCode,
                                CustomerId = verifyReq.Data.Customer.Id.ToString(),
                                Reusable = verifyReq.Data.Authorization.Reusable
                            });
                        }

                        transaction.Status = TransactionStatus.Completed;
                        transaction.CompletedAt = DateTimeOffset.UtcNow;
                        transaction.ModifiedAt = DateTimeOffset.UtcNow;
                        transaction.GatewayResponse = verifyReq.Data.GatewayResponse;
                        transaction.PaymentMethod = verifyReq.Data.Channel;
                        transaction.Fee = verifyReq.Data.Fees;
                        transaction.Notes = verifyReq.Message;

                        wallet.AvailableBalance += transaction.Amount;
                        wallet.TotalBalance += transaction.Amount;

                        dbContext.Transactions.Update(transaction);
                        dbContext.Wallets.Update(wallet);

                        await dbContext.SaveChangesAsync();
                        await dbTransaction.CommitAsync();

                        cache.Remove($"User_{user.Id}_Transactions");

                        await notificationHub.Clients.User(user.Id.ToString())
                            .SendAsync("WalletUpdated", new
                            {
                                Balance = wallet.AvailableBalance,
                                Total = wallet.TotalBalance
                            });

                        return ResponseDetail<bool>.Successful(true, "Transaction verified successfully");
                    }
                    catch (Exception ex)
                    {
                        await dbTransaction.RollbackAsync();

                        logger.LogCritical(ex, "CRITICAL: Paystack charged but Wallet update failed for Reference {Reference}", reference);

                        dbContext.ChangeTracker.Clear();

                        var fallbackTrans = await dbContext.Transactions.FindAsync(transaction.Id);
                        if (fallbackTrans != null)
                        {
                            fallbackTrans.Status = TransactionStatus.Failed;
                            fallbackTrans.Notes = $"PAYSTACK CHARGED - MANUAL ATTENTION NEEDED. Error: {ex.Message}";
                            fallbackTrans.GatewayResponse = "Approved";

                            dbContext.Transactions.Update(fallbackTrans);
                            await dbContext.SaveChangesAsync();
                        }

                        cache.Remove($"User_{user.Id}_Transactions");

                        return ResponseDetail<bool>.Failed("Payment received but wallet update failed. Please contact support.", 500);
                    }
                }

                transaction.Status = verifyReq.Data.Status switch
                {
                    "failed" => TransactionStatus.Failed,
                    "abandoned" => TransactionStatus.Abandoned,
                    "cancelled" => TransactionStatus.Cancelled,
                    _ => TransactionStatus.Failed
                };

                transaction.Notes = verifyReq.Message;
                transaction.ModifiedAt = DateTimeOffset.UtcNow;

                dbContext.Transactions.Update(transaction);
                await dbContext.SaveChangesAsync();

                cache.Remove($"User_{user.Id}_Transactions");

                return ResponseDetail<bool>.Failed($"Transaction verification {verifyReq.Data.Status}", 400);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"while verifying transaction {reference}");
                return ResponseDetail<bool>.Failed("An error occurred while verifying the transaction", 500, ex.Message);
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
                        
                        cache.Remove($"User_{result.Id}_Transactions");

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

                        cache.Remove($"User_{result.Id}_Transactions");

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
                            TransactionType = t.TransactionType.ToString(),
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
