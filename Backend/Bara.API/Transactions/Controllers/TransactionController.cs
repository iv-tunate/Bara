using Bara.API.Transactions.DTOs.TransactionDTOs;
using Bara.API.Transactions.Interfaces;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bara.API.Transactions.Controllers
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

        /// <summary>
        /// Retrieves paginated transaction history for a specific user.
        /// </summary>
        /// <param name="userId">The ID of the user whose transactions to retrieve</param>
        /// <param name="pageNumber">The page number for pagination</param>
        /// <param name="pageSize">The number of items per page</param>
        /// <returns>A paginated list of user transactions</returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpGet("user/{userId}/transactions/{pageNumber}/{pageSize}")]
        public async Task<IActionResult> GetUserTransactions(Guid userId, int pageNumber, int pageSize)
        {
            try
            {
                var response = await transactionService.GetUserTransactions(userId, pageNumber, pageSize);
                if (response.IsSuccess)
                {
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Get user transactions failed with status code 500: {Message}", response.Message);
                    return StatusCode(500, response);
                }

                logger.LogError("Get user transactions failed {response}", response);
                return StatusCode(response.StatusCode, response);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Getting transactions for user {userId}");
                return StatusCode(500, ResponseDetail<string>.Failed("Your request failed", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Initiates a withdrawal request. Sends a 6-digit verification token to the user's email.
        /// </summary>
        /// <param name="payload">The withdrawal request details including amount and bank account ID</param>
        /// <param name="userId">The ID of the user initiating the withdrawal</param>
        /// <returns>Success message indicating token was sent</returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpPost("withdraw/initiate/{userId}")]
        public async Task<IActionResult> InitiateWithdrawal([FromBody] InitiateWithdrawalDTO payload, Guid userId)
        {
            try
            {
                var response = await transactionService.InitiateWithdrawalProcess(userId, payload);
                if (response.IsSuccess)
                {
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Withdrawal initiation failed with status code 500: {Message}", response.Message);
                    return StatusCode(500, response);
                }
                else
                {
                    logger.LogWarning("Withdrawal initiation failed: {Message}", response.Message);
                    return StatusCode(response.StatusCode, response);
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Initiating withdrawal for user {userId}");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occurred", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Confirms a withdrawal request using the email verification token.
        /// Verifies the token and initiates the Paystack transfer.
        /// </summary>
        /// <param name="payload">The withdrawal request details including amount and bank account ID</param>
        /// <param name="userId">The ID of the user confirming the withdrawal</param>
        /// <param name="token">The 6-digit verification token sent to user's email</param>
        /// <returns>Success message if withdrawal was processed</returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpPost("withdraw/confirm/{userId}/{token}")]
        public async Task<IActionResult> ConfirmWithdrawal([FromBody] InitiateWithdrawalDTO payload, Guid userId, string token)
        {
            try
            {
                var response = await transactionService.ContinueWithdrawalInitiation(userId, token, payload);
                if (response.IsSuccess)
                {
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Withdrawal confirmation failed with status code 500: {Message}", response.Message);
                    return StatusCode(500, response);
                }
                else
                {
                    logger.LogWarning("Withdrawal confirmation failed: {Message}", response.Message);
                    return StatusCode(response.StatusCode, response);
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Confirming withdrawal for user {userId}");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occurred", 500, "Internal server error"));
            }
        }
    }
}
