namespace Services.MailingService
{
    /// <summary>
    /// Provides predefined email notifications used throughout the application.
    /// </summary>
    public class MailNotifications
    {
        /// <summary>
        /// The subject of the email.
        /// </summary>
        public string Subject { get; set; }

        /// <summary>
        /// The HTML body content of the email.
        /// </summary>
        public string Body { get; set; }

        /// <summary>
        /// The recipient's email address.
        /// </summary>
        public string RecipientEmail { get; set; }

        /// <summary>
        /// The sender's email address.
        /// </summary>
        public string SenderEmail { get; set; }

        /// <summary>
        /// The date and time the email was sent.
        /// </summary>
        public DateTime SentDate { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="MailNotifications"/> class with the specified parameters.
        /// </summary>
        /// <param name="subject">The subject of the email.</param>
        /// <param name="body">The body content of the email.</param>
        /// <param name="recipientEmail">The recipient's email address.</param>
        /// <param name="senderEmail">The sender's email address.</param>
        public MailNotifications(string subject, string body, string recipientEmail, string senderEmail)
        {
            Subject = subject;
            Body = body;
            RecipientEmail = recipientEmail;
            SenderEmail = senderEmail;
            SentDate = DateTime.Now;
        }

        /// <summary>
        /// Generates the base email template layout.
        /// </summary>
        /// <param name="name">The name of the recipient to personalize the email.</param>
        /// <param name="bodyContent">The actual content to insert into the email body.</param>
        /// <returns>An HTML-formatted string representing the full email template.</returns>
        private static string BaseEmailTemplate(string name = "", string bodyContent = "")
        {
            var mail = $@"
                    <html>
                    <head>
                        <meta charset=""UTF-8"">
                        <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                        <title>Bara Platform</title>
                        <style>
                            body {{
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                background-color: #F4F4F4;
                                padding: 20px;
                                margin: 0;
                                color: #DADBDD;
                            }}
                            .bara{{
                                color: #DADBDD;    
                                font-weight: bold;
                                font-size:1rem;
                            }}
                            .email-container {{
                                max-width: 600px;
                                margin: 0 auto;
                                background-color: #111215;
                                padding: 30px;
                                border-radius: 8px;
                                box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
                                border: 1px solid #333740;
                            }}
                            .header {{
                                text-align: center;
                                margin-bottom: 30px;
                                padding-bottom: 20px;
                                border-bottom: 2px solid #BF0000;
                            }}
                            .logo {{
                                font-size: 24px;
                                font-weight: bold;
                                color: #BF0000;
                                margin-bottom: 5px;
                            }}
                            .subtitle {{
                                color: #858990;
                                font-size: 14px;
                            }}
                            .button {{
                                display: inline-block;
                                padding: 12px 24px;
                                margin: 20px 0;
                                color: #FFFFFF !important;
                                background-color: #BF0000;
                                border: none;
                                border-radius: 5px;
                                text-decoration: none;
                                font-weight: 500;
                                font-size: 16px;
                            }}
                            .button:hover {{
                                background-color: #800000;
                            }}
                            p {{
                                line-height: 1.6;
                                margin-bottom: 15px;
                                color: #DADBDD;
                            }}
                            .footer {{
                                margin-top: 30px;
                                padding-top: 20px;
                                border-top: 1px solid #333740;
                                font-size: 14px;
                                color: #858990;
                            }}
                            .contact-info {{
                                margin-top: 20px;
                                font-size: 12px;
                                color: #696D77;
                                text-align: center;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class=""email-container"">
                            <div class=""header"">
                                <div class=""logo"">Bara</div>
                                <div class=""subtitle"">Collaborate. Create. Own.</div>
                            </div>

                            <h3>Hi{(!string.IsNullOrWhiteSpace(name) ? " " + name : "")}, </h3>
                            {bodyContent}

                            <div class=""footer"">
                                <p>Warm regards,<br><strong>The Bara Team</strong></p>
                                <div class=""contact-info"">
                                    <p>This is an automated message from Bara.<br>
                                    Need help? Reach out to our support team @ baraglobalmain@gmail.com.</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>";
            return mail;
        }

        /// <summary>
        /// Constructs a registration confirmation email with token for account verification.
        /// </summary>
        /// <param name="receiver">The email address of the recipient.</param>
        /// <param name="name">The recipient's name.</param>
        /// <param name="token">The account verification token.</param>
        /// <returns>A populated <see cref="MailRequestDTO"/> ready to be sent.</returns>
        public static MailRequestDTO RegistrationConfirmationMailNotification(string receiver, string token, string name = "friend")
        {
            var subject = "WELCOME TO BARA!";
            var body = $@"
                <br/>
                <p>Thank you for joining <b className=""bara"">Bara!!!</b></p>
                <p>Please verify your account with this token <b classNamw=""bara"">{token.ToUpper()}</b></p>
                <p>It expires in 5 mins";
            return new MailRequestDTO
            {
                ReceiverName = name,
                Receiver = receiver,
                Subject = subject,
                Body = BaseEmailTemplate(name, body),
            };
        }

        /// <summary>
        /// Constructs a login notification email with device and location details.
        /// </summary>
        /// <param name="receiver">The email address of the recipient.</param>
        /// <param name="name">The name of the recipient.</param>
        /// <param name="token">The login verification token.</param>
        /// <param name="device">The device used to attempt login.</param>
        /// <param name="ip">The IP address of the login attempt.</param>
        /// <param name="country">The country location of the IP address.</param>
        /// <returns>A populated <see cref="MailRequestDTO"/> ready to be sent.</returns>
        public static MailRequestDTO LoginNotification(string receiver, string name, string token, string device, string ip, string country)
        {
            var subject = "🔐 Login Notification";

            string body = $@"
                    <p>Hi {name},</p>

                    <p>We detected a login attempt to your account.</p>

                    <p>
                        <strong>Device:</strong> {device} <br/>
                        <strong>IP Address:</strong> {ip} <br/>
                        <strong>Location:</strong> {country} <br/>
                        <strong>Time:</strong> {DateTime.UtcNow:dddd, MMMM dd, yyyy 'at' hh:mm tt} (UTC)
                    </p>

                    <p>Please verify this login using the token below:</p>

                    <h2 style='color:#800000'>{token}</h2>
                    <p style='margin-top:-10px;'>This token will expire in <strong>10 minutes</strong>.</p>

                    <br/>
                    <p>If this wasn’t you, please ignore this email or contact our support team immediately.</p>

                    <br/>
                    <p style='color:gray; font-size:0.9em;'>This is an automated message. Please do not reply directly to this email.</p>
                ";

            return new MailRequestDTO
            {
                Receiver = receiver,
                Subject = subject,
                Body = body
            };
        }

        /// <summary>
        /// Constructs an email verification success notification.
        /// </summary>
        /// <param name="receiver">The email address of the recipient.</param>
        /// <param name="name">The name of the recipient.</param>
        /// <returns>A populated <see cref="MailRequestDTO"/> ready to be sent.</returns>
        public static MailRequestDTO EmailVerifiedNotification(string receiver, string name)
        {
            var subject = "EMAIL VERIFIED";
            var body = $@"
                <br/>
                <p>Congratulations {name}, your email has been successfully verified.</p>";
            return new MailRequestDTO
            {
                Receiver = receiver,
                Subject = subject,
                Body = BaseEmailTemplate(name, body),
            };
        }

        /// <summary>
        /// Constructs a successful account verification notification email.
        /// </summary>
        /// <param name="receiver">The email address of the recipient.</param>
        /// <param name="name">The name of the recipient.</param>
        /// <returns>A populated <see cref="MailRequestDTO"/> ready to be sent.</returns>
        public static MailRequestDTO AccountVerificationSuccessNotification(string receiver, string name)
        {
            var subject = "ACCOUNT VERIFICATION SUCCESSFUL";
            var body = $@"
                <br/>
                <p>Congratulations {name}, your account has been successfully verified.</p>";
            return new MailRequestDTO
            {
                Receiver = receiver,
                Subject = subject,
                Body = BaseEmailTemplate(name, body),
            };
        }

        /// <summary>
        /// Constructs a password reset notification email with a reset token.
        /// </summary>
        /// <param name="receiver"></param>
        /// <param name="name"></param>
        /// <param name="token"></param>
        /// <returns></returns>
        public static MailRequestDTO PasswordResetNotification(string receiver, string name, string token)
        {
            var subject = "PASSWORD RESET REQUEST";
            var body = $@"
                <br/>
                <p>Hi {name},</p>
                <p>We received a request to reset your password. Use the token below to reset it:</p>
                <h2 style='color:#800000'>{token}</h2>
                <p style='margin-top:-10px;'>This token will expire in <strong>10 minutes</strong>.</p>
                <br/>
                <p>If you did not request a password reset, please ignore this email or contact our support team.</p>";
            return new MailRequestDTO
            {
                Receiver = receiver,
                Subject = subject,
                Body = BaseEmailTemplate(name, body),
            };
        }

        public static MailRequestDTO WithdrawalInitiationNotification(WithdrawalNotificationDTO data)
        {
            var subject = "WITHDRAWAL INITIATED";
            var body = $@"
                <br/>
                <p>Hi {data.Name},</p>
                <p>Your withdrawal request has been initiated successfully. Here are the details:</p>
                <ul>
                    <li><strong>Amount:</strong> {data.Amount} {data.Currency}</li>
                    <li><strong>Initiated At:</strong> {data.InitiatedAt:dddd, MMMM dd, yyyy 'at' hh:mm tt} (UTC)</li>
                    <li><strong>Device:</strong> {data.Device}</li>
                    <li><strong>IP Address:</strong> {data.Ip}</li>
                    <li><strong>Location:</strong> {data.Country}</li>
                </ul>
                <p>Please confirm this withdrawal using the token below:</p>    
                <h2 style='color:#800000'>{data.Token}</h2>
                <p style='margin-top:-10px;'>This token will expire in <strong>10 minutes</strong>.</p>
                <br/>
                <br/>
                <p>If you did not initiate this withdrawal, please contact our support team immediately.</p>";
            return new MailRequestDTO
            {
                Receiver = data.Receiver,
                Subject = subject,
                Body = BaseEmailTemplate(data.Name, body),
            };
        }
    }
}
