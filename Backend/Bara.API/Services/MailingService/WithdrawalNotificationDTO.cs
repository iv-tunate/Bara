namespace Services.MailingService
{
    public class WithdrawalNotificationDTO
    {
        public string Receiver { get; set; }
        public string Name { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public DateTimeOffset InitiatedAt { get; set; }
        public string Device { get; set; }
        public string Ip { get; set; }
        public string Country { get; set; }
        public string Token { get; set; }
    }
}
