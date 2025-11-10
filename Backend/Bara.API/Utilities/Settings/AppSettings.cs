namespace Bara.API.Utilities.Settings
{
    public class AppSettings
    {
        //You Verify
        public string YouVerifyBaseUrl { get; set; }
        public string YouVerify_BVN_VerificationUrl { get; set; }
        public string YouVerify_Drivers_License_VerificationUrl { get; set; }
        public string YouVerify_NIN_VerificationUrl { get; set; }
        public string YouVerify_International_Passport_VerificationUrl { get; set; }

        //File Storage
        public string AzureBlobStoragePath { get; set; }

        //Cloudinary
        public string CloudinaryStoragePath { get; set; }
        public string CloudinaryBaseURL { get; set; }

        //Mailer
        public string Sender { get; set; }
        public string SenderName { get; set; }
        public int Port { get; set; }
        public string Server { get; set; }
        public string Password { get; set; }

        //Mailer (SMTP)
        public string SMTP_Server { get; set; }
        public string SMTP_Sender { get; set; }
        public int SMTP_Port { get; set; }
        public string SMTP_DisplayName { get; set; }
        public string SMTP_Password { get; set; }

        // JWT


        //TEST CREDENTIALS
    }
}
