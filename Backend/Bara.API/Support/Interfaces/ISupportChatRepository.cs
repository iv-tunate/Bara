using Bara.API.Support.Models;
using Bara.API.Support.DTOs;

namespace Bara.API.Support.Interfaces
{
    public interface ISupportChatRepository
    {
        Task<SupportChat?> GetChatByUserIdAsync(Guid userId);
        Task<SupportChat> CreateChatAsync(Guid userId);
        Task<SupportChatMessage> AddMessageAsync(SupportChatMessage message);
        Task<List<SupportChatMessageDTO>> GetChatHistoryAsync(Guid userId, int page, int pageSize);
        Task<List<SupportChatSummaryDTO>> GetAllChatsAsync(int page, int pageSize, string? searchTerm);
        Task<bool> ToggleBlockStatusAsync(Guid userId, bool isBlocked);
        Task<int> MarkMessagesAsReadAsync(Guid userId, bool asAdmin);
        Task<bool> HasExceededDailyLimitAsync(Guid userId, int limit);
        Task UpdateChatTimestampAsync(Guid chatId);
    }
}
