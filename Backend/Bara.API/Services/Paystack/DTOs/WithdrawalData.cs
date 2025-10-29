using Newtonsoft.Json;

namespace Services.Paystack.DTOs
{
    public class WithdrawalData
    {
        [JsonProperty("transfer_code")]
        public string TransferCode { get; set; }
        public string Reference { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
        public long Recipient { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public string Reason { get; set; }
        public string Currency { get; set; }
        public string Id { get; set; }
    }
}
