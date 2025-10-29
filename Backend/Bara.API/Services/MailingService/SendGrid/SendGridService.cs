using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using SharedModule.Settings;
using SharedModule.Utils;
using System.Text.RegularExpressions;

namespace Services.MailingService.SendGrid
{
    public class SendGridService : IMailService
    {
        private readonly Secrets secrets;
        private readonly AppSettings settings;
        private readonly ILogger<SendGridService> logger;
        public SendGridService(IOptions<Secrets> appSecrets, IOptions<AppSettings> appSettings, ILogger<SendGridService> logger)
        {
            secrets = appSecrets.Value;
            settings = appSettings.Value;
            this.logger = logger;
        }
        public async Task<ResponseDetail<bool>> SendMail(MailRequestDTO mail)
        {
            try
            {
                var client = new SendGridClient(secrets.SendGridApiKey);

                var from = new EmailAddress(settings.Sender, settings.SenderName);
                var to = new EmailAddress(mail.Receiver, mail.ReceiverName);

                var msg = new SendGridMessage
                {
                    From = from,
                    Subject = mail.Subject,
                };
                msg.AddTo(to);

                var htmlBody = mail.Body;
                var plainTextBody = Regex.Replace(htmlBody, "<.*?>", string.Empty);

                msg.AddContent(MimeType.Text, plainTextBody);
                msg.AddContent(MimeType.Html, htmlBody);

                if (mail.Attachments != null && mail.Attachments.Count > 0)
                {
                    foreach (var file in mail.Attachments)
                    {
                        using var ms = new MemoryStream();
                        await file.CopyToAsync(ms);
                        var fileBytes = ms.ToArray();
                        var base64File = Convert.ToBase64String(fileBytes);

                        msg.AddAttachment(file.FileName, base64File);
                    }
                }

                var response = await client.SendEmailAsync(msg);

                if (response.IsSuccessStatusCode)
                {
                    logger.LogInformation($"Mail to {mail.Receiver} was successfully sent");
                    return ResponseDetail<bool>.Successful(true);
                }
                else
                {
                    var errorBody = await response.Body.ReadAsStringAsync();
                    logger.LogError($"Failed to send mail to {mail.Receiver}: {errorBody}");
                    return ResponseDetail<bool>.Failed(errorBody, (int)response.StatusCode, "SendGrid Error");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"An exception occurred while sending mail to {mail?.Receiver}");
                return ResponseDetail<bool>.Failed(ex.Message, ex.HResult, "Caught Exception");
            }
        }
    }
}
