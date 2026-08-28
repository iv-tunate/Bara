namespace Bara.API.Utilities.Settings
{
    public class Secrets
    {
        public string YouVerifyTestAPIKEY { get; set; }
        public string YouVerifyLiveAPIKEY { get; set; }
        public string YouVerifyWebhookSigningSecret { get; set; }
        public string CloudinaryAPIKEY { get; set; }
        public string CloudinaryAPISecret { get; set; }
        public string CloudinaryURL { get; set; }
        public string CloudinaryName { get; set; }
        public string CloudinaryFolderName { get; set; }
        public string JwtSickRit { get; set; }
        public string[] Issuers { get; set; }
        public string IpInfoKey { get; set; }
        public string RabbitMqHost { get; set; }
        public int RabbitMqPort { get; set; }
        public string RabbitMqUsername { get; set; }
        public string RabbitMqPassword { get; set; }
        public string PaystackSecret { get; set; }
        public string PaystackTestSecret { get; set; }
        public string PaystackPublic { get; set; }
        public string PaystackTestPublic { get; set; }
        public string ExchangeAPIKey { get; set; }
        public string R2BucketName { get; set; }
        public string R2SecretAccessKey { get; set; }
        public string R2AccessKeyId { get; set; }
        public string BrevoAPIKey { get; set; }
        public string BrevoSenderEmail { get; set; }
        public string BrevoSenderName { get; set; }
    }
}
