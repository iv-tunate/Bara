using Microsoft.AspNetCore.Http;

namespace Services.MailingService
{
    /// <summary>
    /// Represents the details required to send an email message.
    /// </summary>
    public class MailRequestDTO
    {
        /// <summary>
        /// Gets or sets the email address of the receiver.
        /// </summary>
        public required string Receiver { get; set; }

        /// <summary>
        /// Gets or sets the name address of the receiver.
        /// </summary>
        public string ReceiverName { get; set; }

        /// <summary>
        /// Gets or sets the subject line of the email.
        /// Defaults to "Bara Notification" if not specified.
        /// </summary>
        public string Subject { get; set; } = "Bara Notification";

        /// <summary>
        /// Gets or sets the HTML or plain text body of the email.
        /// </summary>
        public required string Body { get; set; }

        /// <summary>
        /// Gets or sets the optional list of files to be attached to the email.
        /// </summary>
        public List<IFormFile>? Attachments { get; set; }
    }
}

