using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Services.ExternalAPI_Integration;
using Services.SignalR;
using SharedModule.Settings;
using SharedModule.Utils;

namespace Services.YouVerifyIntegration
{
    public class YouVerifyService : IYouVerifyService
    {
        private readonly ExternalApiIntegrationService apiService;
        private readonly Secrets secrets;
        private readonly AppSettings settings;
        private readonly ILogger<YouVerifyService> logger;
        private readonly LogHelper<YouVerifyService> logHelper;
        private readonly IHubContext<NotificationHub> notificationHub;

        /// <summary>
        /// Urls
        /// </summary>
        private readonly string BaseUrl;
        private readonly string BVN_URL;
        private readonly string Passport_URL;
        private readonly string NIN_URL;
        private readonly string Drivers_License_URL;

        public YouVerifyService(ExternalApiIntegrationService apiService, IOptions<Secrets> appSecrets,
            IOptions<AppSettings> appSettings, ILogger<YouVerifyService> logger, LogHelper<YouVerifyService> logHelper, IHubContext<NotificationHub> hubContext)
        {
            this.apiService = apiService;
            notificationHub = hubContext;
            this.logger = logger;
            this.logHelper = logHelper;
            secrets = appSecrets.Value;
            settings = appSettings.Value;
            BaseUrl = settings.YouVerifyBaseUrl;
            BVN_URL = $"{settings.YouVerify_BVN_VerificationUrl}";
            Passport_URL = $"{settings.YouVerify_International_Passport_VerificationUrl}";
            NIN_URL = $"{settings.YouVerify_NIN_VerificationUrl}";
            Drivers_License_URL = $"{settings.YouVerify_Drivers_License_VerificationUrl}";
        }

        public async Task<YouVerifyKickoffResponse> VerifyIdentificationNumberAsync(YouVerifyKycDto details)
        {
            try
            {
                var url = details.Type switch
                {
                    "BVN" => BVN_URL,
                    "NIN" => NIN_URL,
                    "International_Passport" => Passport_URL,
                    "Drivers_License" => Drivers_License_URL,
                    _ => throw new ArgumentException($"Unsupported document type: {details.Type}")
                };

                object body = details.Type switch
                {
                    "BVN" or "NIN" or "Drivers_License" => new
                    {
                        id = details.Id,
                        isSubjectConsent = true,
                    },
                    "International_Passport" => new
                    {
                        id = details.Id,
                        isSubjectConsent = true,
                        lastName = details.LastName,
                    },
                    _ => throw new ArgumentException($"Unsupported document type: {details.Type}")
                };

                var reqBody = apiService.SerializeReqBody(body);
                var request = await apiService.SendPostRequest(reqBody, url, null, "YouVerify");

                var response = new YouVerifyKickoffResponse();

                if (!request.IsSuccessStatusCode)
                {
                    var statusCode = (int)request.StatusCode;
                    var errorResponse = await request.Content.ReadAsStringAsync();
                    var error = JsonConvert.DeserializeObject<YouVerifyErrorResponse>(errorResponse)
                        ?? new YouVerifyErrorResponse { Message = "Unknown error" };


                    if (statusCode >= 500)
                    {
                        if (details.RetryCount < 3)
                        {
                            details.RetryCount++;

                            BackgroundJob.Schedule<YouVerifyService>(
                                s => s.RetryVerification(details),
                                TimeSpan.FromMinutes(10)
                            );
                            response = new YouVerifyKickoffResponse
                            {
                                Success = false,
                                Status = "retrying",
                                Message = $"Temporary issue. Retrying verification... (Attempt {details.RetryCount}/3)"
                            };
                            logger.LogInformation($"Verification failed for {details.Id} with status code {statusCode}: {error.Message}. Retrying attempt {details.RetryCount}/3");
                            await NotifyKycFailure(details.UserId, $"A temporary issue has occurred... Retrying verification process");
                        }
                        else
                        {
                            response = new YouVerifyKickoffResponse
                            {
                                Success = false,
                                Status = "error",
                                Message = "We couldn't verify your ID after multiple attempts. Please contact support."
                            };
                            logger.LogError($"Verification failed for {details.UserId} after 3 attempts: {error.Message}");
                            await NotifyKycFailure(details.UserId, "We couldn't verify your ID after multiple attempts. Please contact support.");
                        }
                    }
                    else if (statusCode >= 400 && statusCode < 500)
                    {
                        response = new YouVerifyKickoffResponse
                        {
                            Success = false,
                            Status = "error",
                            Message = "There was a problem with the information provided. Please contact support."
                        };
                        await NotifyKycFailure(details.UserId, "There was a problem with the information provided. Please contact support.");
                    }

                    logger.LogError($"Verification failed for {details.Id} with status code {statusCode}: {error.Message}");
                    return response;
                }
                else
                {
                    response = new YouVerifyKickoffResponse
                    {
                        Success = true,
                        Status = "completed",
                        Message = "Operation initiated successfully",
                    };
                }

                return response;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Verifying user on YouVerify's service");
                return new YouVerifyKickoffResponse
                {
                    Success = false,
                    Status = "error",
                    Message = $"An error occurred while verifying ID: {ex.Message}"
                };
            }
        }
        private async Task RetryVerification(YouVerifyKycDto payload)
        {
            try
            {

                var result = await VerifyIdentificationNumberAsync(payload);

                if (!result.Success && result.Status != "retrying")
                {
                    logger.LogError($"Final verification failure for {payload.Id}: {result.Message}");
                    await NotifyKycFailure(payload.UserId, result.Message);
                }
                else if (result.Success)
                {
                    logger.LogInformation($"Retry verification successful for {payload.Id}");
                }
            }
            catch (OperationCanceledException)
            {
                logger.LogWarning($"Retry verification was cancelled for {payload.Id}");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Retrying verification for {payload.Id}");
                await NotifyKycFailure(payload.UserId, "An error occurred while retrying your ID verification. Please contact support.");
            }
        }

        private Task NotifyKycFailure(Guid userId, string message)
        {
            return notificationHub.Clients.User(userId.ToString()).SendAsync("KycFailed", new
            {
                message,
                time = DateTime.UtcNow
            });
        }
    }
}
