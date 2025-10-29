using Newtonsoft.Json;

namespace Services.Paystack.DTOs
{
    public class AccountResolveResponse
    {
        /// <summary>
        /// Indicates whether the account resolution was successful.
        /// </summary>
        public bool Status { get; set; }
        /// <summary>
        /// Contains the message or error details if the resolution failed.
        /// </summary>
        public string Message { get; set; }
        /// <summary>
        /// The account details resolved from the Paystack API.
        /// </summary>
        public AccountDetails Data { get; set; }
    }

    public class AccountDetails
    {
        [JsonProperty("account_number")]
        public string AccountNumber { get; set; }
        /// <summary>
        /// The full name of the account holder as registered with the bank.
        /// </summary>
        [JsonProperty("account_name")]
        public string AccountName { get; set; }
        /// <summary>
        /// The unique identifier for the bank account, used by Paystack for verification and transfers.
        /// </summary>
        [JsonProperty("bank_id")]
        public string BankId { get; set; }
    }
}
