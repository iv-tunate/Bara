using Newtonsoft.Json;
namespace Services.Paystack
{
    public class PaystackWebhookPayload
    {
        [JsonProperty("event")]
        public string Event { get; set; }

        [JsonProperty("data")]
        public PaystackPaymentRequest Data { get; set; }
    }

    public class PaystackPaymentRequest
    {
        [JsonProperty("id")]
        public long Id { get; set; }

        [JsonProperty("domain")]
        public string Domain { get; set; }

        [JsonProperty("amount")]
        public decimal Amount { get; set; }

        [JsonProperty("currency")]
        public string Currency { get; set; }

        [JsonProperty("due_date")]
        public DateTime? DueDate { get; set; }

        [JsonProperty("has_invoice")]
        public bool HasInvoice { get; set; }

        [JsonProperty("invoice_number")]
        public string InvoiceNumber { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("metadata")]
        public PaystackMetadata Metadata { get; set; }

        [JsonProperty("request_code")]
        public string RequestCode { get; set; }

        [JsonProperty("status")]
        public string Status { get; set; }

        [JsonProperty("paid")]
        public bool Paid { get; set; }

        [JsonProperty("paid_at")]
        public DateTime? PaidAt { get; set; }

        [JsonProperty("offline_reference")]
        public string OfflineReference { get; set; }

        [JsonProperty("customer")]
        public long Customer { get; set; }

        [JsonProperty("created_at")]
        public DateTime CreatedAt { get; set; }
    }

    public class PaystackMetadata
    {
        [JsonProperty("reference")]
        public string Reference { get; set; }
        [JsonProperty("user_id")]
        public string UserId { get; set; }

        [JsonProperty("customer_name")]
        public string CustomerName { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("transaction_id")]
        public string TransactionId { get; set; }

    }
    public class PaystackNotification
    {
        [JsonProperty("sent_at")]
        public DateTime SentAt { get; set; }

        [JsonProperty("channel")]
        public string Channel { get; set; }
    }

}

