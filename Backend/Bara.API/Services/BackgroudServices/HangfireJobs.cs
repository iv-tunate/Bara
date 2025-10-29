using Hangfire;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Services.FileStorageServices.Interfaces;
using Services.MailingService;
using Services.YouVerifyIntegration;
using SharedModule.Utils;
using IMailService = Services.MailingService.IMailService;

namespace Services.BackgroudServices
{
    /// <summary>
    /// This class is responsible for managing background jobs using Hangfire.
    /// </summary>
    public class HangfireJobs
    {
        private readonly ILogger<HangfireJobs> logger;
        private readonly IMailService mailService;
        private readonly IYouVerifyService youVerify;
        private readonly LogHelper<HangfireJobs> logHelper;
        private readonly IFileStorageService fileStorage;
        public HangfireJobs(IMailService mailService, ILogger<HangfireJobs> logger,
            IYouVerifyService youVerify, LogHelper<HangfireJobs> logHelper, IFileStorageService fileStorageService)
        {
            this.mailService = mailService;
            this.logger = logger;
            this.youVerify = youVerify;
            this.logHelper = logHelper;
            this.fileStorage = fileStorageService;
        }

        [AutomaticRetry(Attempts = 3, DelaysInSeconds = [10, 30, 60])]
        public async Task SendMailAsync(MailRequestDTO mail)
        {
            try
            {
                var response = await mailService.SendMail(mail);
                if (!response.IsSuccess)
                {
                    logger.LogError($"Failed to send email to {mail.Receiver}: {response.Message}");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"An error occurred while sending email to {mail.Receiver}");
            }
        }
        [AutomaticRetry(Attempts = 3, DelaysInSeconds = [10, 30, 60])]
        public async Task StartKycProcess(YouVerifyKycDto payload)
        {
            try
            {


                var res = await youVerify.VerifyIdentificationNumberAsync(payload);

                if (!res.Success)
                {
                    logger.LogError($"Failure verifying user on YouVerify: {res.Message}");
                }
                else if (res.Success)
                {
                    logger.LogInformation($"Background KYC verification successful for user {payload.UserId}");
                }
            }
            catch (OperationCanceledException)
            {
                logger.LogWarning($"Background KYC verification timed out for user {payload.UserId}");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Verifying user on Youverify's service");
            }
        }

        [AutomaticRetry(Attempts = 3, DelaysInSeconds = [10, 30, 60])]
        public async Task ProcessDocumentForUpload(string userDirectoryName, IFormFile file)
        {
            try
            {
                var response = await fileStorage.UploadDocumentAsync(userDirectoryName, file);
                if (response.Success is false)
                {
                    logger.LogInformation($"Uploading verification document to {userDirectoryName} was unsuccessful");
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"An exception was thrown while uploading the verification doc for {userDirectoryName}");
            }
        }
    }
}
