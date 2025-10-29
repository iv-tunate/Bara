using Newtonsoft.Json;

namespace Services.Paystack.DTOs
{
    public class PaymentVerifyResponse
    {
        public bool Status { get; set; }
        public string Message { get; set; }
        public PaymentVerificationData? Data { get; set; }
    }

    public class PaymentVerificationData
    {
        public string Domain { get; set; }
        public string Status { get; set; }
        public string Reference { get; set; }
        public decimal Amount { get; set; }
        public string GatewayResponse { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string Channel { get; set; }
        public string Currency { get; set; }
        public decimal Fees { get; set; }
        public AuthorizationData? Authorization { get; set; }
        public CustomerData? Customer { get; set; }
        public RecipientTransferData? Recipient { get; set; }
        [JsonProperty("transfer_code")]
        public string? TransferCode { get; set; }
        public string? Reason { get; set; }
    }

    public class AuthorizationData
    {
        public string AuthorizationCode { get; set; }
        public string Bin { get; set; }
        public string Last4 { get; set; }
        public string ExpMonth { get; set; }
        public string ExpYear { get; set; }
        public string CardType { get; set; }
        public string Bank { get; set; }
        public string CountryCode { get; set; }
        public bool Reusable { get; set; }
    }

    public class CustomerData
    {
        public long Id { get; set; }
        public string Email { get; set; }
        public string CustomerCode { get; set; }
    }

    public class RecipientTransferData
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string RecipientCode { get; set; }
        public RecipientDetails? Details { get; set; }
    }

    public class RecipientDetails
    {
        public string BankName { get; set; }
        public string AccountNumber { get; set; }
    }
}
