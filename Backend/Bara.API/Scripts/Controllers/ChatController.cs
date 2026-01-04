using Bara.API.Scripts.DTOs.ChatDTOs;
using Bara.API.Scripts.Interfaces;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bara.API.Scripts.Controllers
{
    /// <summary>
    /// Controller for managing chat functionality between producers and writers during script transactions.
    /// </summary>
    [ApiController]
    [Route("api/chat")]
    [Authorize(Policy = "VerifiedOnly", Roles ="Writer, Producer, Admin")]
    public class ChatsController : ControllerBase
    {
        private readonly IChatService chatService;
        private readonly ILogger<ChatsController> logger;
        private readonly LogHelper<ChatsController> logHelper;

        public ChatsController(
            IChatService chatService,
            ILogger<ChatsController> logger,
            LogHelper<ChatsController> logHelper)
        {
            this.chatService = chatService;
            this.logger = logger;
            this.logHelper = logHelper;
        }


        [HttpPost("{chatId}/messages")]
        public async Task<IActionResult> SendMessage(Guid chatId, [FromBody] SendMessageRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(ResponseDetail<object>.Failed("Request body cannot be empty", 400));
                }

                var userId = GetAuthenticatedUserId();
                var result = await chatService.SendMessageAsync(userId, chatId, request);

                if (!result.IsSuccess)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While sending message - ChatId: {chatId}");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while sending the message", 500));
            }
        }

        [HttpGet("{chatId}/messages")]
        public async Task<IActionResult> GetChatHistory(Guid chatId, int Page, int PageSize)
        {
            try
            {
                var userId = GetAuthenticatedUserId();
                var result = await chatService.GetChatHistoryAsync(userId, chatId, Page, PageSize);

                if (!result.IsSuccess)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While getting chat history - ChatId: {chatId}");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while retrieving chat history", 500));
            }
        }

        [HttpPatch("{chatId}/messages/mark-read")]
        public async Task<IActionResult> MarkMessagesAsRead(Guid chatId)
        {
            try
            {
                var userId = GetAuthenticatedUserId();
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
                    $"While marking messages as read - ChatId: {chatId}");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while marking messages as read", 500));
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateChat([FromBody] CreateChatRequest chatRequest)
        {
            try
            {
                if (chatRequest == null)
                {
                    return BadRequest(ResponseDetail<object>.Failed("Request body cannot be empty", 400));
                }

                var result = await chatService.CreateChatAsync(chatRequest);

                if (!result.IsSuccess)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return CreatedAtAction(nameof(GetChatHistory), new { chatId = result.Data }, result);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    "While creating chat");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while creating chat", 500));
            }
        }

        [HttpPatch("{chatId}/close")]
        public async Task<IActionResult> CloseChat(Guid chatId)
        {
            try
            {
                var result = await chatService.CloseChatAsync(chatId);

                if (!result.IsSuccess)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While closing chat - ChatId: {chatId}");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while closing chat", 500));
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetChats(int Page = 1, int PageSize = 20)
        {
            try
            {
                var userId = GetAuthenticatedUserId();
                var result = await chatService.GetUserChatsAsync(userId, Page, PageSize);

                if (!result.IsSuccess)
                {
                    return StatusCode(result.StatusCode, result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    "While getting user chats");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while retrieving chats", 500));
            }
        }

        /// <summary>
        /// Gets the authenticated user's ID from the JWT token.
        /// </summary>
        /// <returns>The authenticated user's ID</returns>
        private Guid GetAuthenticatedUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                userIdClaim = User.FindFirst("UserId")?.Value;
            }

            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            
            var claims = string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}"));
            logger.LogError($"[AuthError] IsAuthenticated: {User.Identity?.IsAuthenticated}. Claims: {claims}");

            throw new UnauthorizedAccessException("Invalid user ID in token");
        }
    }
}
