using Bara.API.Scripts.DTOs.ChatDTOs;
using Bara.API.Scripts.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedModule.Utils;
using System.Security.Claims;

namespace Bara.API.Scripts.Controllers
{
    /// <summary>
    /// Controller for managing chat functionality between producers and writers during script transactions.
    /// </summary>
    [ApiController]
    [Route("api")]
    public class ChatController : ControllerBase
    {
        private readonly IChatService chatService;
        private readonly ILogger<ChatController> logger;
        private readonly LogHelper<ChatController> logHelper;

        public ChatController(IChatService chatService, ILogger<ChatController> logger, LogHelper<ChatController> logHelper)
        {
            this.chatService = chatService;
            this.logger = logger;
            this.logHelper = logHelper;
        }

        /// <summary>
        /// Sends a message in a script transaction chat as a producer.
        /// </summary>
        /// <param name="producerId">The ID of the producer sending the message</param>
        /// <param name="chatId">The ID of the chat to send the message to</param>
        /// <param name="request">The message content and optional attachment</param>
        /// <returns>The sent message details</returns>
        [Authorize(Policy = "VerifiedOnly")]
        [HttpPost("producers/{producerId}/chats/{chatId}/messages")]
        public async Task<IActionResult> SendMessageAsProducer(Guid producerId, Guid chatId, [FromBody] SendMessageRequest request)
        {
            try
            {
                // Validate the producer ID matches the authenticated user
                var authenticatedUserId = GetAuthenticatedUserId();
                if (authenticatedUserId != producerId)
                {
                    logger.LogWarning("Producer {ProducerId} attempted to send message as different user {AuthenticatedUserId}",
                        producerId, authenticatedUserId);
                    return Forbid("You can only send messages as yourself");
                }

                var result = await chatService.SendMessageAsync(producerId, chatId, request);

                if (!result.IsSuccess)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While sending message as producer - ProducerId: {producerId}, ChatId: {chatId}");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while sending the message", 500));
            }
        }

        /// <summary>
        /// Sends a message in a script transaction chat as a writer.
        /// </summary>
        /// <param name="writerId">The ID of the writer sending the message</param>
        /// <param name="chatId">The ID of the chat to send the message to</param>
        /// <param name="request">The message content and optional attachment</param>
        /// <returns>The sent message details</returns>
        [Authorize(Policy = "VerifiedOnly")]
        [HttpPost("writers/{writerId}/chats/{chatId}/messages")]
        public async Task<IActionResult> SendMessageAsWriter(Guid writerId, Guid chatId, [FromBody] SendMessageRequest request)
        {
            try
            {
                // Validate the writer ID matches the authenticated user
                var authenticatedUserId = GetAuthenticatedUserId();
                if (authenticatedUserId != writerId)
                {
                    logger.LogWarning("Writer {WriterId} attempted to send message as different user {AuthenticatedUserId}",
                        writerId, authenticatedUserId);
                    return Forbid("You can only send messages as yourself");
                }

                var result = await chatService.SendMessageAsync(writerId, chatId, request);

                if (!result.IsSuccess)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While sending message as writer - WriterId: {writerId}, ChatId: {chatId}");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while sending the message", 500));
            }
        }

        /// <summary>
        /// Retrieves chat history for a producer.
        /// </summary>
        /// <param name="producerId">The ID of the producer requesting the chat history</param>
        /// <param name="chatId">The ID of the chat to retrieve</param>
        /// <returns>The complete chat history</returns>
        [Authorize(Policy = "VerifiedOnly")]
        [HttpGet("producers/{producerId}/chats/{chatId}/messages")]
        public async Task<IActionResult> GetChatHistoryAsProducer(Guid producerId, Guid chatId)
        {
            try
            {
                // Validate the producer ID matches the authenticated user
                var authenticatedUserId = GetAuthenticatedUserId();
                if (authenticatedUserId != producerId)
                {
                    logger.LogWarning("Producer {ProducerId} attempted to access chat as different user {AuthenticatedUserId}",
                        producerId, authenticatedUserId);
                    return Forbid("You can only access your own chats");
                }

                var result = await chatService.GetChatHistoryAsync(producerId, chatId);

                if (!result.IsSuccess)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While getting chat history as producer - ProducerId: {producerId}, ChatId: {chatId}");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while retrieving chat history", 500));
            }
        }

        /// <summary>
        /// Retrieves chat history for a writer.
        /// </summary>
        /// <param name="writerId">The ID of the writer requesting the chat history</param>
        /// <param name="chatId">The ID of the chat to retrieve</param>
        /// <returns>The complete chat history</returns>
        [Authorize(Policy = "VerifiedOnly")]
        [HttpGet("writers/{writerId}/chats/{chatId}/messages")]
        public async Task<IActionResult> GetChatHistoryAsWriter(Guid writerId, Guid chatId)
        {
            try
            {
                // Validate the writer ID matches the authenticated user
                var authenticatedUserId = GetAuthenticatedUserId();
                if (authenticatedUserId != writerId)
                {
                    logger.LogWarning("Writer {WriterId} attempted to access chat as different user {AuthenticatedUserId}",
                        writerId, authenticatedUserId);
                    return Forbid("You can only access your own chats");
                }

                var result = await chatService.GetChatHistoryAsync(writerId, chatId);

                if (!result.IsSuccess)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While getting chat history as writer - WriterId: {writerId}, ChatId: {chatId}");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while retrieving chat history", 500));
            }
        }

        /// <summary>
        /// Marks messages as read for a user.
        /// </summary>
        /// <param name="userId">The ID of the user marking messages as read</param>
        /// <param name="chatId">The ID of the chat to mark messages as read</param>
        /// <returns>Success or failure response</returns>
        [Authorize(Policy = "VerifiedOnly")]
        [HttpPatch("users/{userId}/chats/{chatId}/messages:markRead")]
        public async Task<IActionResult> MarkMessagesAsRead(Guid userId, Guid chatId)
        {
            try
            {
                // Validate the user ID matches the authenticated user
                var authenticatedUserId = GetAuthenticatedUserId();
                if (authenticatedUserId != userId)
                {
                    logger.LogWarning("User {UserId} attempted to mark messages as read for different user {AuthenticatedUserId}",
                        userId, authenticatedUserId);
                    return Forbid("You can only mark your own messages as read");
                }

                var result = await chatService.MarkMessagesAsReadAsync(userId, chatId);

                if (!result.IsSuccess)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While marking messages as read - UserId: {userId}, ChatId: {chatId}");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while marking messages as read", 500));
            }
        }

        /// <summary>
        /// Gets the authenticated user's ID from the JWT token.
        /// </summary>
        /// <returns>The authenticated user's ID</returns>
        private Guid GetAuthenticatedUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Invalid user ID in token");
        }
    }
}
