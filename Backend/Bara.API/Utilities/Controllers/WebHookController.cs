using Bara.API.Services;
using Bara.API.Services.Paystack;
using Bara.API.Services.YouVerifyIntegration;
using Bara.API.Transactions.Interfaces;
using Bara.API.Users.Interfaces.UserInterfaces;
using Bara.API.Utilities.Settings;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Text;

namespace Bara.API.Utilities.Controllers
{
    [Route("api/webhooks")]
    [ApiController]

    public class WebHookController : ControllerBase
    {
        private readonly IYouVerifyService youVerify;
        private readonly Secrets secrets;
        private readonly LogHelper<WebHookController> logHelper;
        private readonly ILogger<WebHookController> logger;
        private readonly IUserService userService;
        private readonly ITransactionService transactionService;
        public WebHookController(IYouVerifyService youVerifyService, IOptions<Secrets> secretOptions, ITransactionService transactionService,
            LogHelper<WebHookController> logHelper, IUserService userService, ILogger<WebHookController> logger)
        {
            youVerify = youVerifyService;
            secrets = secretOptions.Value;
            this.logHelper = logHelper;
            this.userService = userService;
            this.logger = logger;
            this.transactionService = transactionService;
        }

        //[HttpPost("youverify")]
        //public async Task<IActionResult> ReceiveKycVerificationResponse([FromBody] YouVerifyWebhookEvent payload)
        //{
        //    try
        //    {
        //        Request.EnableBuffering();

        //        var isValid = YouVerifyWebhookVerifier.IsValidYouVerifySignature(Request, secrets.YouVerifyWebhookSigningSecret);
        //        if (!isValid)
        //        {
        //            return Unauthorized("Invalid webhook signature");
        //        }
        //        logger.LogInformation("Received YouVerify webhook event {Payload}", payload);
        //        var isSuccessful = false;
        //        if (payload.Data.DataValidation == true)
        //        {
        //            isSuccessful = true;
        //        }
        //        var updateUserReq = await userService.UpdateUserVerificationStatus(payload.Data.IdNumber, payload.Data.DateOfBirth, isSuccessful, payload.Data.FirstName, payload.Data.LastName, payload.Data.Type);

        //        return Ok();
        //    }
        //    catch (Exception ex)
        //    {
        //        logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Receiving KYC verification response from YouVerify");
        //        return BadRequest(new { message = "An error occurred while processing the request." });
        //    }
        //}

        [HttpPost("youverify")]
        public async Task<IActionResult> ReceiveKycVerificationResponse()
        {
            try
            {
                Request.EnableBuffering();
                using var reader = new StreamReader(Request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true);

                string rawBody = await reader.ReadToEndAsync();
                Request.Body.Position = 0;

                logger.LogInformation("YouVerify sent a webhook event {Payload}", rawBody);
                var isValid = YouVerifyWebhookVerifier.IsValidYouVerifySignature(rawBody, Request.Headers["x-youverify-signature"], secrets.YouVerifyWebhookSigningSecret);
                if (!isValid)
                {
                    logger.LogInformation("Invalid webhook signature from You verify");
                    return Unauthorized("Invalid webhook signature");
                }

                var payload = JsonConvert.DeserializeObject<YouVerifyWebhookEvent>(rawBody);

                if (payload == null)
                {
                    logger.LogWarning("Received null payload from YouVerify webhook");
                    return BadRequest("Invalid payload");
                }

                logger.LogInformation("Processing YouVerify webhook for ID: {IdNumber}", payload.Data.IdNumber);
                var updateUserReq = await userService.UpdateUserVerificationStatus(
                    payload.Data.IdNumber,
                    payload.Data.DateOfBirth,
                    payload.Data.FirstName,
                    payload.Data.LastName,
                    payload.Data.Type);

                if (updateUserReq.IsSuccess)
                {
                    logger.LogInformation("Successfully updated verification status via webhook for ID: {IdNumber}", payload.Data.IdNumber);
                    return Ok();
                }
                else
                {
                    logger.LogWarning("Failed to update verification status via webhook: {Message}", updateUserReq.Message);
                    // Return 400 or 404 so YouVerify retries or indicates failure in their logs
                    return StatusCode(updateUserReq.StatusCode, new { message = updateUserReq.Message });
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Receiving KYC verification response from YouVerify");
                return BadRequest(new { message = "An error occurred while processing the request." });
            }
        }

        [HttpPost("paystack-webhook")]
        public async Task<IActionResult> ReceivePaystackWebhook()
        {
            try
            {
                Request.EnableBuffering();

                using var reader = new StreamReader(Request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, leaveOpen: true);
                string rawBody = await reader.ReadToEndAsync();

                Request.Body.Position = 0;

                if (!Request.Headers.TryGetValue("x-paystack-signature", out var signatureHeader))
                {
                    logger.LogWarning("Paystack signature header missing");
                    return Unauthorized("Signature header missing");
                }

                string secret = secrets.PaystackTestSecret;
                if (!PaystackWebhookVerifier.IsValidPaystackSignature(rawBody, signatureHeader, secret))
                {
                    logger.LogWarning("Invalid webhook signature from Paystack");
                    return Unauthorized("Invalid webhook signature");
                }

                logger.LogInformation("Received valid Paystack webhook: {Payload}", rawBody);

                var payload = JsonConvert.DeserializeObject<PaystackWebhookPayload>(rawBody);

                if (payload == null || payload.Data == null) 
                {
                    logger.LogError("Invalid payload received from Paystack webhook");
                    return BadRequest("Invalid payload");
                }
                else if (string.IsNullOrEmpty(payload.Data.Reference))
                {
                    logger.LogError("Reference is missing in the payload");
                    return BadRequest("Invalid payload");
                }
                string reference = payload.Data.Reference;
                if (payload.Event.Contains("charge"))
                {
                    await transactionService.VerifyTransactionAsync(reference); 
                }
                else if (payload.Event.Contains("transfer"))
                {
                    await transactionService.VerifyTransferAsync(reference); 
                }

                return Ok();
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Receiving Paystack webhook");
                return BadRequest(new { message = "An error occurred while processing the request." });
            }
        }
    }
}
