using Services.Paystack.DTOs;

namespace Services.Paystack
{
    /// <summary>
    /// Interface for Paystack service operations.
    /// </summary>
    public interface IPaystackService
    {
        /// <summary>
        /// Initializes a payment transaction with Paystack.
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        Task<PaymentInitResponse> InitializePaymentAsync(PaymentInitRequest request);
        /// <summary>
        /// Verifies a payment transaction with Paystack using the provided reference.
        /// </summary>
        /// <param name="reference"></param>
        /// <returns></returns>
        Task<PaymentVerifyResponse> VerifyPaymentAsync(string reference);

        /// <summary>
        /// Verifies a transfer transaction with Paystack using the provided reference.
        /// </summary>
        /// <param name="reference"></param>
        /// <returns></returns>
        Task<PaymentVerifyResponse> VerifyTransferAsync(string reference);
        /// <summary>
        /// Initiates a withdrawal request to Paystack.
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        Task<WithdrawalResponse> InitiateWithdrawalAsync(WithdrawalRequest request);
        /// <summary>
        /// Creates a recipient on Paystack for payouts.
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        Task<RecipientData> CreateRecipientAsync(CreateRecipientRequest request);
        /// <summary>
        /// Fetches a list of banks supported by Paystack.
        /// </summary>
        /// <returns></returns>
        Task<List<BankData>> GetBanksAsync();
        /// <summary>
        /// Resolves a bank account number to verify its validity and retrieve account details.
        /// </summary>
        /// <param name="accountNumber"></param>
        /// <param name="bankCode"></param>
        /// <returns></returns>
        Task<AccountResolveResponse> ResolveAccountNumber(string accountNumber, string bankCode);
    }
}
