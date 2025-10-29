namespace Services.Paystack.DTOs
{
    public class WithdrawalRequest
    {
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
        public string RecipientCode { get; set; }
        public string Reason { get; set; }
        public string Currency { get; set; } = "NGN";
    }
}
