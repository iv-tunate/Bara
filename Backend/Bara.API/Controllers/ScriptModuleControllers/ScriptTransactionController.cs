using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScriptModule.DTOs;
using ScriptModule.Interfaces;
using SharedModule.Utils;
using System.Security.Claims;

namespace Bara.API.Controllers.ScriptModuleControllers
{
    /// <summary>
    /// Controller for managing script transactions between producers and writers.
    /// Handles the initiation, completion, and cancellation of script purchases.
    /// </summary>
    [ApiController]
    [Route("api/producers/{producerId}/scripts")]
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
        /// <param name="producerId">The ID of the producer purchasing the script</param>
        /// <param name="request">The transaction initiation request containing script and writer details</param>
        /// <returns>A response containing the initiated transaction details</returns>
        [HttpPost("transactions:initiate")]
        public async Task<ActionResult<ResponseDetail<ScriptTransactionResponse>>> InitiateScriptTransaction(
            [FromRoute] Guid producerId, 
            [FromBody] InitiateScriptTransactionRequest request)
        {
            try
            {
                // Validate that the authenticated user matches the producer ID
                var authenticatedUserId = GetAuthenticatedUserId();
                if (authenticatedUserId != producerId)
                {
                    logger.LogWarning("Unauthorized access attempt - AuthenticatedUserId: {AuthenticatedUserId}, RequestedProducerId: {ProducerId}", 
                        authenticatedUserId, producerId);
                    return Forbid("You can only initiate transactions for your own account");
                }

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
                logger.LogError(ex, "Error initiating script transaction - ProducerId: {ProducerId}, ScriptId: {ScriptId}", 
                    producerId, request.ScriptId);
                return StatusCode(500, ResponseDetail<ScriptTransactionResponse>.Failed("An error occurred while initiating the transaction", 500));
            }
        }

        /// <summary>
        /// Completes a script transaction by releasing escrowed funds to the writer and delivering the script to the producer.
        /// This action finalizes the purchase and cannot be undone.
        /// </summary>
        /// <param name="producerId">The ID of the producer completing the transaction</param>
        /// <param name="scriptId">The ID of the script being purchased</param>
        /// <returns>A response containing the completed transaction details</returns>
        [HttpPost("{scriptId}/transactions:complete")]
        public async Task<ActionResult<ResponseDetail<ScriptTransactionResponse>>> CompleteScriptTransaction(
            [FromRoute] Guid producerId, 
            [FromRoute] Guid scriptId)
        {
            try
            {
                // Validate that the authenticated user matches the producer ID
                var authenticatedUserId = GetAuthenticatedUserId();
                if (authenticatedUserId != producerId)
                {
                    logger.LogWarning("Unauthorized access attempt - AuthenticatedUserId: {AuthenticatedUserId}, RequestedProducerId: {ProducerId}", 
                        authenticatedUserId, producerId);
                    return Forbid("You can only complete transactions for your own account");
                }

                var result = await scriptService.CompleteScriptTransactionAsync(producerId, scriptId);
                
                if (result.IsSuccess)
                {
                    logger.LogInformation("Script transaction completed successfully - ProducerId: {ProducerId}, ScriptId: {ScriptId}, TransactionId: {TransactionId}", 
                        producerId, scriptId, result.Data?.ScriptTransactionId);
                    return Ok(result);
                }
                else
                {
                    logger.LogWarning("Failed to complete script transaction - ProducerId: {ProducerId}, ScriptId: {ScriptId}, Error: {Error}", 
                        producerId, scriptId, result.Message);
                    return StatusCode(result.StatusCode, result);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error completing script transaction - ProducerId: {ProducerId}, ScriptId: {ScriptId}", 
                    producerId, scriptId);
                return StatusCode(500, ResponseDetail<ScriptTransactionResponse>.Failed("An error occurred while completing the transaction", 500));
            }
        }

        /// <summary>
        /// Cancels a script transaction by refunding escrowed funds to the producer.
        /// This action can only be performed within 14 days of transaction initiation.
        /// </summary>
        /// <param name="producerId">The ID of the producer cancelling the transaction</param>
        /// <param name="scriptId">The ID of the script transaction to cancel</param>
        /// <returns>A response containing the cancelled transaction details</returns>
        [HttpPost("{scriptId}/transactions:cancel")]
        public async Task<ActionResult<ResponseDetail<ScriptTransactionResponse>>> CancelScriptTransaction(
            [FromRoute] Guid producerId, 
            [FromRoute] Guid scriptId)
        {
            try
            {
                // Validate that the authenticated user matches the producer ID
                var authenticatedUserId = GetAuthenticatedUserId();
                if (authenticatedUserId != producerId)
                {
                    logger.LogWarning("Unauthorized access attempt - AuthenticatedUserId: {AuthenticatedUserId}, RequestedProducerId: {ProducerId}", 
                        authenticatedUserId, producerId);
                    return Forbid("You can only cancel transactions for your own account");
                }

                var result = await scriptService.CancelScriptTransactionAsync(producerId, scriptId);
                
                if (result.IsSuccess)
                {
                    logger.LogInformation("Script transaction cancelled successfully - ProducerId: {ProducerId}, ScriptId: {ScriptId}, TransactionId: {TransactionId}", 
                        producerId, scriptId, result.Data?.ScriptTransactionId);
                    return Ok(result);
                }
                else
                {
                    logger.LogWarning("Failed to cancel script transaction - ProducerId: {ProducerId}, ScriptId: {ScriptId}, Error: {Error}", 
                        producerId, scriptId, result.Message);
                    return StatusCode(result.StatusCode, result);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error cancelling script transaction - ProducerId: {ProducerId}, ScriptId: {ScriptId}", 
                    producerId, scriptId);
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
