namespace Services.Paystack.DTOs
{
    public class CreateRecipientRequest
    {
        public string Type { get; set; } = "nuban";
        public string Name { get; set; }
        public string AccountNumber { get; set; }
        public string BankCode { get; set; }
        public string Currency { get; set; } = "NGN";
    }
}
