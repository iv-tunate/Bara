using Bara.API.Transactions.DTOs;

namespace Bara.API.Transactions.Interfaces
{
    public interface IWalletService
    {
        Task<decimal> GetWalletBalanceAsync(Guid userId);
        Task<GetWalletDetailDTO?> GetWalletDetailsAsync(Guid userId);

        /// <summary>
        /// Locks funds in producer's wallet and reflects pending amount in writer's wallet for script transaction.
        /// </summary>
        /// <param name="producerId">The ID of the producer</param>
        /// <param name="writerId">The ID of the writer</param>
        /// <param name="amount">The total amount to lock</param>
        /// <param name="fee">The platform fee (10%)</param>
        /// <returns>True if the operation was successful</returns>
        Task<bool> LockFundsForScriptTransactionAsync(Guid producerId, Guid writerId, decimal amount, decimal fee);

        /// <summary>
        /// Releases locked funds to writer and finalizes producer's payment for completed script transaction.
        /// </summary>
        /// <param name="producerId">The ID of the producer</param>
        /// <param name="writerId">The ID of the writer</param>
        /// <param name="amount">The total amount</param>
        /// <param name="writerShare">The writer's share (90%)</param>
        /// <returns>True if the operation was successful</returns>
        Task<bool> ReleaseFundsForScriptTransactionAsync(Guid producerId, Guid writerId, decimal amount, decimal writerShare);

        /// <summary>
        /// Refunds locked funds back to producer and removes pending amount from writer's wallet for cancelled transaction.
        /// </summary>
        /// <param name="producerId">The ID of the producer</param>
        /// <param name="writerId">The ID of the writer</param>
        /// <param name="amount">The total amount to refund</param>
        /// <param name="writerShare">The writer's share to remove</param>
        /// <returns>True if the operation was successful</returns>
        Task<bool> RefundFundsForScriptTransactionAsync(Guid producerId, Guid writerId, decimal amount, decimal writerShare);
    }
}
