using Bara.API.DataContext;
using Bara.API.Services.Paystack;
using Bara.API.Services.SignalR;
using Bara.API.Transactions.DTOs;
using Bara.API.Transactions.Interfaces;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Bara.API.Transactions.Repositories
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

        public async Task<GetWalletDetailDTO?> GetWalletDetailsAsync(Guid userId)
        {
            try
            {
                var wallet = await dbContext.Wallets
                    .FirstOrDefaultAsync(w => w.UserId == userId);

                if (wallet == null)
                {
                    return null;
                }

                return new GetWalletDetailDTO
                {
                    Id = wallet.Id,
                    TotalBalance = wallet.TotalBalance,
                    AvailableBalance = wallet.AvailableBalance,
                    LockedBalance = wallet.LockedBalance,
                    Currency = wallet.Currency,
                    CurrencySymbol = wallet.CurrencySymbol,
                    UserId = wallet.UserId
                };
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While getting wallet details for user: {userId}");
                return null;
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
