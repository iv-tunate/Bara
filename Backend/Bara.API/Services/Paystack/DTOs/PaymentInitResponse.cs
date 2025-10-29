namespace Services.Paystack.DTOs
{
    public class PaymentInitResponse
    {
        public bool Status { get; set; }
        public string Message { get; set; }
        public PaymentData Data { get; set; }
    }
}
