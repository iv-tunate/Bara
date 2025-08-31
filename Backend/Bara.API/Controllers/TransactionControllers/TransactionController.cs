using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedModule.Utils;
using TransactionModule.DTOs.TransactionDTOs;
using TransactionModule.Interfaces;

namespace Bara.API.Controllers.TransactionControllers
{
    [Route("api/transaction")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly ILogger<TransactionController> logger;
        private readonly LogHelper<TransactionController> logHelper;
        private readonly ITransactionService transactionService;
        public TransactionController(ILogger<TransactionController> logger, LogHelper<TransactionController> logHelper, ITransactionService transactionService)
        {
            this.transactionService = transactionService;
            this.logHelper = logHelper;
            this.logger = logger;
        }

        /// <summary>
        /// Initiates a paystack transaction for a user.
        /// </summary>
        /// <param name="payload"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpPost("initiate/{userId}")]
        public async Task<IActionResult> InitiateTransaction([FromBody] TransactionInitDTO payload, Guid userId)
        {
            try
            {
                var response = await transactionService.InitiateTransactionAsync(payload, userId);
                if (response.IsSuccess)
                {
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Transaction initiation failed with status code 500: {Message}", response.Message);
                    return StatusCode(500, response);
                }
                else
                {
                    logger.LogError("Transaction initiation failed with status code {response}", response);
                    return StatusCode(response.StatusCode, response);
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Initiating transaction");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occured", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Verifies a paystack payment transaction using reference.
        /// </summary>
        /// <param name="reference"></param>
        /// <returns></returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpPost("verify-payment/{reference}")]
        public async Task<IActionResult> VerifyPayment(string reference)
        {
            try
            {
                var response = await transactionService.VerifyTransactionAsync(reference);
                if (response.IsSuccess)
                {
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Payment verification failed with status code 500: {Message}", response.Message);
                    return StatusCode(500, response);
                }
                else
                {
                    logger.LogError("Payment verification failed with status code {response}", response);
                    return StatusCode(response.StatusCode, response);
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Verifying payment");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occured", 500, "Internal server error"));
            }
        }
    }
}
