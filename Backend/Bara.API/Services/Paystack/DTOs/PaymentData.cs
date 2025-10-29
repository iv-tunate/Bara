namespace Services.Paystack.DTOs
{
    public class PaymentData
    {
        public string AuthorizationUrl { get; set; }
        public string AccessCode { get; set; }
        public string Reference { get; set; }
    }
}
