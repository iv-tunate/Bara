namespace Bara.API.Users.DTOs
{
    public class PostBankDetailDTO
    {
        /// <summary>
        /// The 10-digit NUBAN (Nigeria Uniform Bank Account Number) format account number.
        /// Required for bank transfers and account verification.
        /// Example: "0123456789"
        /// </summary>
        public string AccountNumber { get; set; }

        /// <summary>
        /// The full name of the bank where the account is held.
        /// Retrieved from Paystack's bank list API during account verification.
        /// Example: "First Bank of Nigeria", "Guaranty Trust Bank"
        /// </summary>
        public string BankName { get; set; }

        /// <summary>
        /// The unique 3-digit numerical code assigned to each bank by the Central Bank of Nigeria.
        /// Used by Paystack API to identify which bank to transfer money to.
        /// Example: "011" (First Bank), "058" (GTBank), "044" (Access Bank)
        /// </summary>
        public string BankCode { get; set; }

        /// <summary>
        /// The unique identifier for the bank account, used by Paystack for verification and transfers.
        /// </summary>
        public string BankId { get; set; }

        /// <summary>
        /// The type of bank account, typically "nuban" for Nigerian accounts.
        /// </summary>
        public string BankType { get; set; } = "nuban";

        /// <summary>
        /// The account holder's full name as registered with the bank.
        /// Retrieved during account verification to ensure account number matches actual holder.
        /// Example: "John Olumide Adebayo"
        /// </summary>
        public string AccountName { get; set; }

        /// <summary>
        /// Indicates whether this bank account is currently active for withdrawals.
        /// Provides soft-delete functionality for bank accounts.
        /// </summary>
        public bool IsActive { get; set; } = true;
    }
}
