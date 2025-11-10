namespace Bara.API.Transactions.DTOs.TransactionDTOs
{
    /// <summary>
    /// Represents the requests body to initiate a wirhdrawal request
    /// </summary>
    public class InitiateWithdrawalDTO
    {
        /// <summary>
        /// The amount to withdraw
        /// </summary>
        public decimal Amount { get; set; }
        /// <summary>
        /// The bank account ID to which the withdrawal will be made
        /// </summary>
        public Guid BankAccountId { get; set; }

        public string Reason { get; set; } = string.Empty;
        public string Currency { get; set; } = "Naira";
        public string Device { get; set; }
    }
}
