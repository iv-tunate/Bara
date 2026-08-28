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
                var attachmentPayloads = new List<object>();
                if (mail.Attachments != null)
                {
                    foreach (var a in mail.Attachments)
                    {
                        using var ms = new MemoryStream();
                        await a.CopyToAsync(ms); 
                        
                        attachmentPayloads.Add(new
                        {
                            content = Convert.ToBase64String(ms.ToArray()),
                            filename = a.FileName,
                            name = a.FileName 
                        });
                    }
                }

                var payload = new
                {
                    sender = new { email = secrets.BrevoSenderEmail, name = secrets.BrevoSenderName }, 
                    to = new[] { new { email = mail.Receiver, name = mail.ReceiverName } },
                    subject = mail.Subject,
                    textContent = Regex.Replace(mail.Body, "<.*?>", string.Empty), 
                    htmlContent = mail.Body, 
                    attachment = attachmentPayloads.Any() ? attachmentPayloads : null 
                };

                using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
                request.Headers.Add("api-key", secrets.BrevoAPIKey); 
                request.Content = JsonContent.Create(payload);

                var response = await http.SendAsync(request);

                if (response.IsSuccessStatusCode)
                {
                    logger.LogInformation($"Mail to {mail.Receiver} was successfully sent");
                    return ResponseDetail<bool>.Successful(true);
                }
                
                var errorBody = await response.Content.ReadAsStringAsync();
                logger.LogError($"Failed to send mail to {mail.Receiver}: {errorBody}");
                return ResponseDetail<bool>.Failed(errorBody, (int)response.StatusCode, "Brevo Error");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"An exception occurred while sending mail to {mail?.Receiver}");
                return ResponseDetail<bool>.Failed(ex.Message, ex.HResult, "Caught Exception");
            }
        }

    }
}
