using Infrastructure.DataContext;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Services.Paystack;
using Services.SignalR;
using SharedModule.Utils;
using TransactionModule.Interfaces;

namespace Infrastructure.Repositories.TransactionRepositories
{
    /// <summary>
    /// Service for managing wallet operations including funding, withdrawals, and script transaction escrow.
    /// </summary>
    public class WalletService : IWalletService
    {
        private readonly BaraContext dbContext;
        private readonly ILogger<WalletService> logger;
        private readonly IHubContext<NotificationHub> notificationHub;
        private readonly LogHelper<WalletService> logHelper;
        private readonly IPaystackService paystackService;

        public WalletService(
            BaraContext dbContext, 
            ILogger<WalletService> logger, 
            IHubContext<NotificationHub> notificationHub, 
            LogHelper<WalletService> logHelper,
            IPaystackService paystackService)
        {
            this.dbContext = dbContext;
            this.logger = logger;
            this.notificationHub = notificationHub;
            this.logHelper = logHelper;
            this.paystackService = paystackService;
        }

        public Task<string> FundWalletAsync(Guid userId, decimal amount, string email)
        {
            throw new NotImplementedException("Use TransactionRepository.InitiateTransactionAsync for wallet funding");
        }

        public Task<bool> ProcessPaymentCallbackAsync(string reference)
        {
            throw new NotImplementedException("Use TransactionRepository.VerifyTransactionAsync for payment callbacks");
        }

        public Task<bool> WithdrawFundsAsync(Guid userId, decimal amount, Guid bankAccountId)
        {
            throw new NotImplementedException("Use TransactionRepository.InitiateWithdrawalAsync for withdrawals");
        }

        public Task<bool> ProcessScriptPaymentAsync(Guid producerId, Guid writerId, Guid scriptId, decimal amount)
        {
            throw new NotImplementedException("Use script transaction methods for script payments");
        }

        public async Task<decimal> GetWalletBalanceAsync(Guid userId)
        {
            try
            {
                var wallet = await dbContext.Wallets
                    .FirstOrDefaultAsync(w => w.UserId == userId);
                
                return wallet?.AvailableBalance ?? 0;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While getting wallet balance for user: {userId}");
                return 0;
            }
        }

        public async Task<bool> LockFundsForScriptTransactionAsync(Guid producerId, Guid writerId, decimal amount, decimal fee)
        {
            try
            {
                using var transaction = await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead);

                var producer = await dbContext.Users
                    .Include(u => u.Wallet)
                    .FirstOrDefaultAsync(u => u.Id == producerId);

                var writer = await dbContext.Users
                    .Include(u => u.Wallet)
                    .FirstOrDefaultAsync(u => u.Id == writerId);

                if (producer?.Wallet == null || writer?.Wallet == null)
                    return false;

                var writerShare = amount - fee;

                // Lock funds in producer's wallet
                producer.Wallet.AvailableBalance -= amount;
                producer.Wallet.LockedBalance += amount;

                // Reflect pending amount in writer's wallet (locked, not available)
                writer.Wallet.LockedBalance += writerShare;
                writer.Wallet.TotalBalance += writerShare;

                dbContext.Wallets.UpdateRange(producer.Wallet, writer.Wallet);
                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                // Send SignalR notifications
                await notificationHub.Clients.User(producerId.ToString())
                    .SendAsync("WalletUpdated", new
                    {
                        Balance = producer.Wallet.AvailableBalance,
                        Total = producer.Wallet.TotalBalance,
                        Locked = producer.Wallet.LockedBalance
                    });

                await notificationHub.Clients.User(writerId.ToString())
                    .SendAsync("WalletUpdated", new
                    {
                        Balance = writer.Wallet.AvailableBalance,
                        Total = writer.Wallet.TotalBalance,
                        Locked = writer.Wallet.LockedBalance
                    });

                return true;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While locking funds for script transaction - Producer: {producerId}, Writer: {writerId}");
                return false;
            }
        }

        public async Task<bool> ReleaseFundsForScriptTransactionAsync(Guid producerId, Guid writerId, decimal amount, decimal writerShare)
        {
            try
            {
                using var transaction = await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead);

                var producer = await dbContext.Users
                    .Include(u => u.Wallet)
                    .FirstOrDefaultAsync(u => u.Id == producerId);

                var writer = await dbContext.Users
                    .Include(u => u.Wallet)
                    .FirstOrDefaultAsync(u => u.Id == writerId);

                if (producer?.Wallet == null || writer?.Wallet == null)
                    return false;

                // Finalize producer's payment (remove from locked and total)
                producer.Wallet.LockedBalance -= amount;
                producer.Wallet.TotalBalance -= amount;

                // Release funds to writer (move from locked to available)
                writer.Wallet.LockedBalance -= writerShare;
                writer.Wallet.AvailableBalance += writerShare;

                dbContext.Wallets.UpdateRange(producer.Wallet, writer.Wallet);
                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                // Send SignalR notifications
                await notificationHub.Clients.User(producerId.ToString())
                    .SendAsync("WalletUpdated", new
                    {
                        Balance = producer.Wallet.AvailableBalance,
                        Total = producer.Wallet.TotalBalance,
                        Locked = producer.Wallet.LockedBalance
                    });

                await notificationHub.Clients.User(writerId.ToString())
                    .SendAsync("WalletUpdated", new
                    {
                        Balance = writer.Wallet.AvailableBalance,
                        Total = writer.Wallet.TotalBalance,
                        Locked = writer.Wallet.LockedBalance
                    });

                return true;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While releasing funds for script transaction - Producer: {producerId}, Writer: {writerId}");
                return false;
            }
        }

        public async Task<bool> RefundFundsForScriptTransactionAsync(Guid producerId, Guid writerId, decimal amount, decimal writerShare)
        {
            try
            {
                using var transaction = await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead);

                var producer = await dbContext.Users
                    .Include(u => u.Wallet)
                    .FirstOrDefaultAsync(u => u.Id == producerId);

                var writer = await dbContext.Users
                    .Include(u => u.Wallet)
                    .FirstOrDefaultAsync(u => u.Id == writerId);

                if (producer?.Wallet == null || writer?.Wallet == null)
                    return false;

                // Refund producer (move from locked back to available)
                producer.Wallet.LockedBalance -= amount;
                producer.Wallet.AvailableBalance += amount;

                // Remove pending amount from writer's wallet
                writer.Wallet.LockedBalance -= writerShare;
                writer.Wallet.TotalBalance -= writerShare;

                dbContext.Wallets.UpdateRange(producer.Wallet, writer.Wallet);
                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                // Send SignalR notifications
                await notificationHub.Clients.User(producerId.ToString())
                    .SendAsync("WalletUpdated", new
                    {
                        Balance = producer.Wallet.AvailableBalance,
                        Total = producer.Wallet.TotalBalance,
                        Locked = producer.Wallet.LockedBalance
                    });

                await notificationHub.Clients.User(writerId.ToString())
                    .SendAsync("WalletUpdated", new
                    {
                        Balance = writer.Wallet.AvailableBalance,
                        Total = writer.Wallet.TotalBalance,
                        Locked = writer.Wallet.LockedBalance
                    });

                return true;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While refunding funds for script transaction - Producer: {producerId}, Writer: {writerId}");
                return false;
            }
        }
    }
}
