using SharedModule.Utils;
using TransactionModule.DTOs.TransactionDTOs;

namespace TransactionModule.Interfaces
{
    public interface ITransactionService
    {
        /// <summary>
        /// Initiates a paystack transaction for a user.
        /// </summary>
        /// <param name="data"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        Task<ResponseDetail<object>> InitiateTransactionAsync(TransactionInitDTO data, Guid userId);
        /// <summary>
        /// Verifies a paystack transaction using the reference.
        /// </summary>
        /// <param name="reference"></param>
        /// <returns></returns>
        Task<ResponseDetail<bool>> VerifyTransactionAsync(string reference);

        /// <summary>
        /// Verifies a paystack transfer using the reference.
        /// </summary>
        /// <param name="reference"></param>
        /// <returns></returns>
        Task<ResponseDetail<bool>> VerifyTransferAsync(string reference);

        //Task<ResponseDetail<bool>> ProcessScriptPurchaseAsync(Guid producerId, Guid writerId, Guid scriptId, decimal amount);
        /// <summary>
        /// Initiates a withdrawal request for a user to their bank account after it has been confirmed on our system.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="data"></param>
        /// <param name="token"></param>
        /// <returns></returns>
        Task<ResponseDetail<bool>> ContinueWithdrawalInitiation(Guid userId, string token, InitiateWithdrawalDTO data);

        Task<ResponseDetail<bool>> InitiateWithdrawalProcess(Guid userId, InitiateWithdrawalDTO data);

        /// <summary>
        /// Retrieves paginated transaction history for a specific user.
        /// </summary>
        /// <param name="userId">The ID of the user whose transactions to retrieve</param>
        /// <param name="pageNumber">The page number for pagination</param>
        /// <param name="pageSize">The number of items per page</param>
        /// <returns>A paginated list of user transactions</returns>
        Task<ResponseDetail<List<GetTransactionDetail>>> GetUserTransactions(Guid userId, int pageNumber, int pageSize);
    }
}
