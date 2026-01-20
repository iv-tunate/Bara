using Bara.API.Support.DTOs;
using Bara.API.Utilities.ToolKit;

namespace Bara.API.Support.Interfaces
{
    public interface ISupportChatService
    {
        Task<ResponseDetail<SupportChatMessageDTO>> SendMessageAsync(Guid userId, string content, bool isAdmin);
        Task<ResponseDetail<List<SupportChatMessageDTO>>> GetChatHistoryAsync(Guid userId, int page, int pageSize);
        Task<ResponseDetail<List<SupportChatSummaryDTO>>> GetAllChatsAsync(int page, int pageSize, string? searchTerm);
        Task<ResponseDetail<bool>> ToggleBlockStatusAsync(Guid userId);
        Task<ResponseDetail<bool>> MarkAsReadAsync(Guid userId, bool isAdmin);
    }
}
