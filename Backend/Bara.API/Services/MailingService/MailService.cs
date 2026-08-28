using Bara.API.Utilities.Settings;
using Bara.API.Utilities.ToolKit;
using Microsoft.Extensions.Options;
using Services.MailingService;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;


namespace Bara.API.Services.MailingService
{
    public class MailService : IMailService
    {
        private readonly Secrets secrets;
        private readonly AppSettings settings;
        private readonly ILogger<MailService> logger;
        private readonly IHttpClientFactory httpClientFactory;

        public MailService(IOptions<Secrets> appSecrets, IOptions<AppSettings> appSettings, ILogger<MailService> logger, IHttpClientFactory httpClientFactory)
        {
            secrets = appSecrets.Value;
            settings = appSettings.Value;
            this.logger = logger;
            this.httpClientFactory = httpClientFactory;
        }
        public async Task<ResponseDetail<bool>> SendMail(MailRequestDTO mail)
        {
            try
            {
                var http = httpClientFactory.CreateClient();
                http.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("api-key", secrets.BrevoAPIKey);

                var payload = new
                {
                    from = new { email = secrets.BrevoSenderEmail, name = secrets.BrevoSenderName },
                    to = new[] { new { email = mail.Receiver, name = mail.ReceiverName } },
                    subject = mail.Subject,
                    text = Regex.Replace(mail.Body, "<.*?>", string.Empty),
                    html = mail.Body,
                    attachments = mail.Attachments?.Select(a =>
                    {
                        using var ms = new MemoryStream();
                        a.CopyTo(ms);
                        return new
                        {
                            content = Convert.ToBase64String(ms.ToArray()),
                            filename = a.FileName,
                            type = a.ContentType,
                            disposition = "attachment"
                        };
                    }).ToList()
                };

                var response = await http.PostAsJsonAsync(
                    "https://api.brevo.com/v3/smtp/email",
                    payload
                );

                if (response.IsSuccessStatusCode)
                {
                    logger.LogInformation($"Mail to {mail.Receiver} was successfully sent");
                    return ResponseDetail<bool>.Successful(true);
                }
                else
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    logger.LogError($"Failed to send mail to {mail.Receiver}: {errorBody}");
                    return ResponseDetail<bool>.Failed(errorBody, (int)response.StatusCode, "Brevo Error");
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
