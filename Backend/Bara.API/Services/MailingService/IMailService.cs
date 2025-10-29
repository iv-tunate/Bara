using SharedModule.Utils;

namespace Services.MailingService
{
    /// <summary>
    /// Defines the contract for sending email messages within the system.
    /// </summary>
    public interface IMailService
    {
        /// <summary>
        /// Sends an email using the specified mail request details.
        /// </summary>
        /// <param name="mail">The mail request containing recipient, subject, body, and other details.</param>
        /// <returns>
        /// A <see cref="ResponseDetail{T}"/> containing a boolean value indicating whether the mail was sent successfully.
        /// </returns>
        Task<ResponseDetail<bool>> SendMail(MailRequestDTO mail);
    }
}
