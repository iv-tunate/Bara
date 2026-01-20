using Bara.API.Support.DTOs;
using Bara.API.Support.Interfaces;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Bara.API.Support.Controllers
{
    [Route("api/support")]
    [ApiController]
    [Authorize]
    public class SupportChatController : ControllerBase
    {
        private readonly ISupportChatService chatService;
        private readonly ILogger<SupportChatController> logger;

        public SupportChatController(ISupportChatService chatService, ILogger<SupportChatController> logger)
        {
            this.chatService = chatService;
            this.logger = logger;
        }

        [HttpPost("message")]
        public async Task<IActionResult> SendMessage([FromBody] SendSupportMessageRequest request)
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");
            
            if (isAdmin) return BadRequest("Admins should use /api/support/admin/message");

            var result = await chatService.SendMessageAsync(userId, request.Content, false);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetMyHistory(int page = 1, int pageSize = 20)
        {
            var userId = GetUserId();
            var result = await chatService.GetChatHistoryAsync(userId, page, pageSize);
            return StatusCode(result.StatusCode, result);
        }
        
        [HttpPatch("read")]
        public async Task<IActionResult> MarkAsRead()
        {
            var userId = GetUserId();
            var result = await chatService.MarkAsReadAsync(userId, false);
            return StatusCode(result.StatusCode, result);
        }

        // --- Admin Endpoints ---

        [Authorize(Roles = "Admin")]
        [HttpPost("admin/message")]
        public async Task<IActionResult> AdminSendMessage([FromBody] AdminSendSupportMessageRequest request)
        {
            var result = await chatService.SendMessageAsync(request.TargetUserId, request.Content, true);
            return StatusCode(result.StatusCode, result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/history/{userId}")]
        public async Task<IActionResult> AdminGetHistory(Guid userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var result = await chatService.GetChatHistoryAsync(userId, page, pageSize);
            return StatusCode(result.StatusCode, result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/users")]
        public async Task<IActionResult> GetUsersChats(int page = 1, int pageSize = 20, string? search = null)
        {
            var result = await chatService.GetAllChatsAsync(page, pageSize, search);
            return StatusCode(result.StatusCode, result);
        }


        
        [Authorize(Roles = "Admin")]
        [HttpPatch("admin/block/{userId}")]
        public async Task<IActionResult> ToggleBlock(Guid userId)
        {
            var result = await chatService.ToggleBlockStatusAsync(userId);
            return StatusCode(result.StatusCode, result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("admin/read/{userId}")]
        public async Task<IActionResult> AdminMarkAsRead(Guid userId)
        {
            var result = await chatService.MarkAsReadAsync(userId, true);
            return StatusCode(result.StatusCode, result);
        }
        
        private Guid GetUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("UserId")?.Value;
            if (Guid.TryParse(idClaim, out var id)) return id;
            throw new UnauthorizedAccessException("Invalid User ID");
        }
    }

    public class AdminSendSupportMessageRequest
    {
        public Guid TargetUserId { get; set; }
        public string Content { get; set; }
    }
}
