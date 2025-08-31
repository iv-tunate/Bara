using Infrastructure.DataContext;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Services.ExternalAPI_Integration;
using Services.MailingService;
using Services.Paystack;
using Services.Paystack.DTOs;
using Services.SignalR;
using SharedModule.Models;
using SharedModule.Settings;
using SharedModule.Utils;
using System.Security.Cryptography;
using TransactionModule.DTOs.TransactionDTOs;
using TransactionModule.Enums;
using TransactionModule.Interfaces;
using TransactionModule.Models;

namespace Infrastructure.Repositories.TransactionRepositories
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
        public TransactionRepository(IPaystackService paystackService, LogHelper<TransactionRepository> logHelper,
            ILogger<TransactionRepository> logger, BaraContext context, IMailService mailer,
            IHubContext<NotificationHub> notificationHub, ExternalApiIntegrationService externalApiIntegrationService,
            IOptions<Secrets> appSecrets, IMemoryCache cache)
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
        }
        public async Task<ResponseDetail<object>> InitiateTransactionAsync(TransactionInitDTO data, Guid userId)
        {
            try
            {
                var user = await dbContext.Users.Where(x => x.Id == userId)
                        .Select(x => new
                        {
                            x.Id,
                            x.Email,
                            x.AuthProfile.FullName,
                            walletId = x.Wallet.Id
                        }).FirstOrDefaultAsync();
                if (user == null)
                {
                    logger.LogInformation($"User with ID {userId} not found while initiating transaction.");
                    return ResponseDetail<object>.Failed("User not found", 404);
                }

                var transaction = new PaymentTransaction
                {
                    UserId = user.Id,
                    UserFullName = user.FullName,
                    Amount = data.Amount,
                    Status = TransactionStatus.Initiated,
                    TransactionType = TransactionType.WalletFunding,
                    WalletID = user.walletId
                };

                await dbContext.Transactions.AddAsync(transaction);
                var dbRes = await dbContext.SaveChangesAsync();
                if (dbRes > 1)
                {
                    var paymentInitRequest = new PaymentInitRequest
                    {
                        Amount = data.Amount,
                        Email = user.Email,
                        Currency = Currency.NAIRA.ToString(),
                        TransactionId = transaction.Id,
                        UserId = user.Id,
                        CustomerName = user.FullName,
                        Metadata = new Dictionary<string, object>
                        {
                            { "UserId", user.Id },
                            { "CustomerName", user.FullName },
                            { "Email", user.Email },
                            { "TransactionId", transaction.Id }
                        },
                    };
                    var paymentResponse = await paystack.InitializePaymentAsync(paymentInitRequest);
                    if (paymentResponse.Status)
                    {
                        transaction.ReferenceId = paymentResponse.Data.Reference;
                        transaction.Status = TransactionStatus.Pending;
                        transaction.AccessCode = paymentResponse.Data.AccessCode;
                        await dbContext.SaveChangesAsync();
                        return ResponseDetail<object>.Successful(new
                        {
                            transaction.Id,
                            paymentUrl = paymentResponse.Data.AuthorizationUrl,
                        }, "Transaction initiated successfully");
                    }
                    else
                    {
                        transaction.Status = TransactionStatus.Failed;
                        await dbContext.SaveChangesAsync();
                        logger.LogError($"Failed to initialize payment for user {user.FullName}. Error: {paymentResponse.Message}");
                        return ResponseDetail<object>.Failed(paymentResponse.Message, 500);
                    }
                }
                else
                {
                    logger.LogError($"Failed to save transaction for user {user.FullName}. Database error.");
                    return ResponseDetail<object>.Failed("Failed to initiate transaction", 500);
                }
            }
            catch (Exception ex)
            {
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
                    return ResponseDetail<bool>.Failed(false, "Invalid or expired token", 400, "Invalid Token");
                }
                cache.Remove(cacheKey);

                var recipientCode = user.BankDetails.Where(x => x.Id == data.BankAccountId)
                                                    .Select(x => x.RecipientCode).FirstOrDefault();

                var availableBal = user.Wallet.AvailableBalance;
                var fee = data.Amount * 0.016m; //1.6% fee
                if (availableBal < data.Amount)
                {
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
                    return ResponseDetail<bool>.Failed(false, "Withdrawal initiation failed", 500, "Database error");
                }
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
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"While initiating withdrawal for {userId}");
                return ResponseDetail<bool>.Failed("Failed to initiate withdrawal", 500, ex.Message);
            }
        }

        public async Task<ResponseDetail<bool>> VerifyTransactionAsync(string reference)
        {
            //var transaction = await dbContext.Database.BeginTransactionAsync();
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
                    return ResponseDetail<bool>.Failed("Transaction not found", 404);
                }

                var verifyReq = await paystack.VerifyPaymentAsync(userTransaction.ReferenceId);
                if (verifyReq.Status && verifyReq.Data != null)
                {
                    if (verifyReq.Data.Status == "success" && verifyReq.Data.Amount == userTransaction.Amount && userTransaction.Status is TransactionStatus.Completed)
                    {
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
                        return ResponseDetail<bool>.Failed("Transaction verification failed", 400);
                    }
                }
                else
                {
                    logger.LogError($"Failed to verify transaction for user {result.Id}. Error: {verifyReq.Message}");
                    return ResponseDetail<bool>.Failed(verifyReq.Message, 500);
                }

            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"while verifying transaction");
                return ResponseDetail<bool>.Failed("An error occured while verifying the transaction", 500, ex.Message);
            }
        }

        public async Task<ResponseDetail<bool>> VerifyTransferAsync(string reference)
        {
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
                    return ResponseDetail<bool>.Failed("Transfer not found", 404);
                }

                var verifyReq = await paystack.VerifyTransferAsync(userTransaction.ReferenceId);

                if (verifyReq.Status && verifyReq.Data != null)
                {
                    if (verifyReq.Data.Status == "success" && userTransaction.Status is TransactionStatus.Completed)
                    {
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

                        return ResponseDetail<bool>.Failed("Transfer verification failed", 400);
                    }
                }
                else
                {
                    logger.LogError($"Failed to verify transfer with reference {reference}. Error: {verifyReq.Message}");
                    return ResponseDetail<bool>.Failed(verifyReq.Message, 500);
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"while verifying transfer with reference {reference}");
                return ResponseDetail<bool>.Failed("An error occurred while verifying the transfer", 500, ex.Message);
            }
        }
    }
}
