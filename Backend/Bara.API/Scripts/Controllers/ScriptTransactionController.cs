using Bara.API.Scripts.DTOs;
using Bara.API.Scripts.Interfaces;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bara.API.Scripts.Controllers
{
    /// <summary>
    /// Controller for managing script transactions between producers and writers.
    /// Handles the initiation, completion, and cancellation of script purchases.
    /// </summary>
    [ApiController]
    [Route("api/script-transaction")]
    [Authorize(Policy = "VerifiedOnly")]
    public class ScriptTransactionController : ControllerBase
    {
        private readonly IScriptService scriptService;
        private readonly ILogger<ScriptTransactionController> logger;

        /// <summary>
        /// Initializes a new instance of the ScriptTransactionController.
        /// </summary>
        /// <param name="scriptService">The script service for handling transactions</param>
        /// <param name="logger">The logger for this controller</param>
        public ScriptTransactionController(IScriptService scriptService, ILogger<ScriptTransactionController> logger)
        {
            this.scriptService = scriptService;
            this.logger = logger;
        }

        /// <summary>
        /// Initiates a script transaction by escrowing funds from the producer's wallet.
        /// The funds are locked for 14 days, after which the transaction is automatically completed.
        /// </summary>
        /// <param name="request">The transaction initiation request containing script and writer details</param>
        /// <returns>A response containing the initiated transaction details</returns>
        [HttpPost("initiate")]
        public async Task<ActionResult<ResponseDetail<ScriptTransactionResponse>>> InitiateScriptTransaction(
            [FromBody] InitiateScriptTransactionRequest request)
        {
            try
            {
                var producerId = GetAuthenticatedUserId();
                if (producerId == Guid.Empty)
                {
                    return Unauthorized(ResponseDetail<ScriptTransactionResponse>.Failed("User not authenticated", 401));
                }

                logger.LogInformation("Initiating script transaction - ProducerId: {ProducerId}, ScriptId: {ScriptId}", producerId, request.ScriptId);

                var result = await scriptService.InitiateScriptTransactionAsync(producerId, request);

                if (result.IsSuccess)
                {
                    logger.LogInformation("Script transaction initiated successfully - ProducerId: {ProducerId}, ScriptId: {ScriptId}, TransactionId: {TransactionId}",
                        producerId, request.ScriptId, result.Data?.ScriptTransactionId);
                    return Ok(result);
                }
                else
                {
                    logger.LogWarning("Failed to initiate script transaction - ProducerId: {ProducerId}, ScriptId: {ScriptId}, Error: {Error}",
                        producerId, request.ScriptId, result.Message);
                    return StatusCode(result.StatusCode, result);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error initiating script transaction - ScriptId: {ScriptId}", request.ScriptId);
                return StatusCode(500, ResponseDetail<ScriptTransactionResponse>.Failed("An error occurred while initiating the transaction", 500));
            }
        }

        /// <summary>
        /// Completes a script transaction by releasing escrowed funds to the writer and delivering the script to the producer.
        /// This action finalizes the purchase and cannot be undone.
        /// </summary>
        /// <param name="scriptId">The ID of the script being purchased</param>
        /// <param name="scriptTransactionId">The ID of the transaction to complete</param>
        /// <returns>A response containing the completed transaction details</returns>
        [HttpPost("complete/{scriptId}/{scriptTransactionId}")]
        public async Task<ActionResult<ResponseDetail<ScriptTransactionResponse>>> CompleteScriptTransaction(
            [FromRoute] Guid scriptId,
            [FromRoute] Guid scriptTransactionId)
        {
            try
            {
                var producerId = GetAuthenticatedUserId();
                if (producerId == Guid.Empty)
                {
                    return Unauthorized(ResponseDetail<ScriptTransactionResponse>.Failed("User not authenticated", 401));
                }

                logger.LogInformation("Completing script transaction - ProducerId: {ProducerId}, ScriptId: {ScriptId}, TransactionId: {TransactionId}", 
                    producerId, scriptId, scriptTransactionId);

                var result = await scriptService.CompleteScriptTransactionAsync(producerId, scriptId, scriptTransactionId);

                if (result.IsSuccess)
                {
                    logger.LogInformation("Script transaction completed successfully - TransactionId: {TransactionId}", result.Data?.ScriptTransactionId);
                    return Ok(result);
                }
                else
                {
                    logger.LogWarning("Failed to complete script transaction - TransactionId: {TransactionId}, Error: {Error}", scriptTransactionId, result.Message);
                    return StatusCode(result.StatusCode, result);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error completing script transaction - ScriptId: {ScriptId}, TransactionId: {TransactionId}", scriptId, scriptTransactionId);
                return StatusCode(500, ResponseDetail<ScriptTransactionResponse>.Failed("An error occurred while completing the transaction", 500));
            }
        }

        /// <summary>
        /// Cancels a script transaction by refunding escrowed funds to the producer.
        /// This action can only be performed within 14 days of transaction initiation.
        /// </summary>
        /// <param name="scriptId">The ID of the script transaction to cancel</param>
        /// <param name="scriptTransactionId">The ID of the transaction to cancel</param>
        /// <returns>A response containing the cancelled transaction details</returns>
        [HttpPost("cancel/{scriptId}/{scriptTransactionId}")]
        public async Task<ActionResult<ResponseDetail<ScriptTransactionResponse>>> CancelScriptTransaction(
            [FromRoute] Guid scriptId,
            [FromRoute] Guid scriptTransactionId)
        {
            try
            {
                var userId = GetAuthenticatedUserId(); 
                if (userId == Guid.Empty)
                {
                    return Unauthorized(ResponseDetail<ScriptTransactionResponse>.Failed("User not authenticated", 401));
                }

                logger.LogInformation("Cancelling script transaction - UserId: {UserId}, ScriptId: {ScriptId}, TransactionId: {TransactionId}", 
                    userId, scriptId, scriptTransactionId);

                var result = await scriptService.CancelScriptTransactionAsync(userId, scriptId, scriptTransactionId);

                if (result.IsSuccess)
                {
                    logger.LogInformation("Script transaction cancelled successfully - TransactionId: {TransactionId}", result.Data?.ScriptTransactionId);
                    return Ok(result);
                }
                else
                {
                    logger.LogWarning("Failed to cancel script transaction - TransactionId: {TransactionId}, Error: {Error}", scriptTransactionId, result.Message);
                    return StatusCode(result.StatusCode, result);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error cancelling script transaction - ScriptId: {ScriptId}, TransactionId: {TransactionId}", scriptId, scriptTransactionId);
                return StatusCode(500, ResponseDetail<ScriptTransactionResponse>.Failed("An error occurred while cancelling the transaction", 500));
            }
        }

        /// <summary>
        /// Gets the authenticated user's ID from the JWT claims.
        /// </summary>
        /// <returns>The authenticated user's ID</returns>
        private Guid GetAuthenticatedUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.Identity?.Name;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }
    }
}
