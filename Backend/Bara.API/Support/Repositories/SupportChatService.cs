using Bara.API.Services.SignalR;
using Bara.API.Support.DTOs;
using Bara.API.Support.Interfaces;
using Bara.API.Support.Models;
using Bara.API.Utilities.Interfaces;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.SignalR;

namespace Bara.API.Support.Repositories
{
    public class SupportChatService : ISupportChatService
    {
        private readonly ISupportChatRepository chatRepository;
        private readonly IHubContext<NotificationHub> hubContext;
        private readonly ISanitizationService sanitizationService;
        private readonly ILogger<SupportChatService> logger;

        public SupportChatService(
            ISupportChatRepository chatRepository,
            IHubContext<NotificationHub> hubContext,
            ISanitizationService sanitizationService,
            ILogger<SupportChatService> logger)
        {
            this.chatRepository = chatRepository;
            this.hubContext = hubContext;
            this.sanitizationService = sanitizationService;
            this.logger = logger;
        }

        public async Task<ResponseDetail<SupportChatMessageDTO>> SendMessageAsync(Guid userId, string content, bool isAdmin)
        {
            try
            {
                var chat = await chatRepository.GetChatByUserIdAsync(userId);
                
                if (chat == null)
                {
                    chat = await chatRepository.CreateChatAsync(userId);
                }

                if (chat.IsBlocked && !isAdmin)
                {
                    return ResponseDetail<SupportChatMessageDTO>.Failed("You are blocked from sending messages to support.", 403);
                }

                if (!isAdmin)
                {
                    if (await chatRepository.HasExceededDailyLimitAsync(userId, 50))
                    {
                        return ResponseDetail<SupportChatMessageDTO>.Failed("Daily message limit exceeded.", 429);
                    }
                }

                var sanitizedContent = sanitizationService.SanitizeHtml(content);

                var message = new SupportChatMessage
                {
                    SupportChatId = chat.Id,
                    SenderId = userId,
                    IsAdminSender = isAdmin,
                    Content = sanitizedContent,
                    SentAt = DateTimeOffset.UtcNow,
                    IsRead = false
                };

                await chatRepository.AddMessageAsync(message);
                await chatRepository.UpdateChatTimestampAsync(chat.Id);

                var responseDTO = new SupportChatMessageDTO
                {
                    Id = message.Id,
                    SenderId = message.SenderId,
                    IsAdminSender = message.IsAdminSender,
                    Content = message.Content,
                    SentAt = message.SentAt,
                    IsRead = message.IsRead
                };

                if (isAdmin)
                {
                    await hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveSupportMessage", responseDTO);
                }
                else
                {
                    await hubContext.Clients.Group("Admins").SendAsync("ReceiveSupportMessage", new { UserId = userId, Message = responseDTO });
                }

                return ResponseDetail<SupportChatMessageDTO>.Successful(responseDTO, "Message sent successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error sending support message");
                return ResponseDetail<SupportChatMessageDTO>.Failed("Failed to send message", 500);
            }
        }

        public async Task<ResponseDetail<List<SupportChatMessageDTO>>> GetChatHistoryAsync(Guid userId, int page, int pageSize)
        {
            try
            {
                var history = await chatRepository.GetChatHistoryAsync(userId, page, pageSize);
                return ResponseDetail<List<SupportChatMessageDTO>>.Successful(history, "History retrieved");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error getting chat history");
                return ResponseDetail<List<SupportChatMessageDTO>>.Failed("Failed to retrieve history", 500);
            }
        }

        public async Task<ResponseDetail<List<SupportChatSummaryDTO>>> GetAllChatsAsync(int page, int pageSize, string? searchTerm)
        {
            try
            {
                var chats = await chatRepository.GetAllChatsAsync(page, pageSize, searchTerm);
                return ResponseDetail<List<SupportChatSummaryDTO>>.Successful(chats, "Chats retrieved");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error getting all chats");
                return ResponseDetail<List<SupportChatSummaryDTO>>.Failed("Failed to retrieve chats", 500);
            }
        }

        public async Task<ResponseDetail<bool>> ToggleBlockStatusAsync(Guid userId)
        {
            try
            {
                var chat = await chatRepository.GetChatByUserIdAsync(userId);
                if (chat == null) return ResponseDetail<bool>.Failed("Chat not found", 404);

                var newStatus = !chat.IsBlocked;
                var success = await chatRepository.ToggleBlockStatusAsync(userId, newStatus);
                
                return success 
                    ? ResponseDetail<bool>.Successful(newStatus, newStatus ? "User blocked" : "User unblocked")
                    : ResponseDetail<bool>.Failed("Failed to update status", 500);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error toggling block status");
                return ResponseDetail<bool>.Failed("Error updating status", 500);
            }
        }

        public async Task<ResponseDetail<bool>> MarkAsReadAsync(Guid userId, bool isAdmin)
        {
            try
            {
                var count = await chatRepository.MarkMessagesAsReadAsync(userId, isAdmin);
                return ResponseDetail<bool>.Successful(true, $"{count} messages marked as read");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error marking messages as read");
                return ResponseDetail<bool>.Failed("Error marking messages as read", 500);
            }
        }
    }
}
