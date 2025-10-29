namespace Services.Paystack.DTOs
{
    public class PaymentInitRequest
    {
        public Guid UserId { get; set; }
        public string CustomerName { get; set; }
        public decimal Amount { get; set; }
        public string Email { get; set; }
        public string Currency { get; set; } = "NGN";
        public string CallbackUrl { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
        public Guid TransactionId { get; set; }
    }
}
