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
        /// Verifies a paystack transaction for a user.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="reference"></param>
        /// <returns></returns>
        Task<ResponseDetail<bool>> VerifyTransactionAsync(Guid userId, string reference);
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
    }
}
