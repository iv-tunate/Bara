namespace Services.Paystack.DTOs
{
    public class CreateRecipientResponse
    {
        public bool Status { get; set; }
        public string Message { get; set; }
        public RecipientData Data { get; set; }
    }
}
