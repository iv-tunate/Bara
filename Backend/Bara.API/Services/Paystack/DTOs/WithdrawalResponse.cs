namespace Services.Paystack.DTOs
{
    public class WithdrawalResponse
    {
        public bool Status { get; set; }
        public string Message { get; set; }
        public WithdrawalData Data { get; set; }
    }
}
