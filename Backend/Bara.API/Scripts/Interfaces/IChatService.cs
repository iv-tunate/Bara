using Bara.API.Scripts.DTOs.ChatDTOs;
using Bara.API.Utilities.ToolKit;

namespace Bara.API.Scripts.Interfaces
{
    /// <summary>
    /// Service interface for managing chat functionality between producers and writers during script transactions.
    /// </summary>
    public interface IChatService
    {
        /// <summary>
        /// Sends a message in a script transaction chat.
        /// </summary>
        /// <param name="userId">The ID of the user sending the message</param>
        /// <param name="chatId">The ID of the chat to send the message to</param>
        /// <param name="request">The message content and optional attachment</param>
        /// <returns>A response containing the sent message details</returns>
        Task<ResponseDetail<ChatMessageResponse>> SendMessageAsync(Guid userId, Guid chatId, SendMessageRequest request);

        /// <summary>
        /// Retrieves the chat history for a script transaction.
        /// </summary>
        /// <param name="userId">The ID of the user requesting the chat history</param>
        /// <param name="chatId">The ID of the chat to retrieve</param>
        /// <param name="page">The page number for pagination (default is 1)</param>
        /// <param name="pageSize">The number of messages per page (default is 20)</param>
        /// <returns>A response containing the complete chat history</returns>
        Task<ResponseDetail<List<ChatMessageResponse>>> GetChatHistoryAsync(Guid userId, Guid chatId, int page = 1, int pageSize = 20);

        /// <summary>
        /// Marks all unread messages in a chat as read for the requesting user.
        /// </summary>
        /// <param name="userId">The ID of the user marking messages as read</param>
        /// <param name="chatId">The ID of the chat to mark messages as read</param>
        /// <returns>A response indicating success or failure</returns>
        Task<ResponseDetail<bool>> MarkMessagesAsReadAsync(Guid userId, Guid chatId);

        /// <summary>
        /// Creates a new chat for a script transaction.
        /// </summary>
        /// <returns>A response containing the created chat ID</returns>
        Task<ResponseDetail<Guid>> CreateChatAsync(CreateChatRequest request);

        /// <summary>
        /// Closes a chat when a script transaction is completed or cancelled.
        /// </summary>
        /// <param name="chatId">The ID of the chat to close</param>
        /// <returns>A response indicating success or failure</returns>
        Task<ResponseDetail<bool>> CloseChatAsync(Guid chatId);

        /// <summary>
        /// Retrieves all chats for a specific user.
        /// </summary>
        /// <returns>A response containing the list of chats</returns>
        Task<ResponseDetail<List<ChatSummaryDTO>>> GetUserChatsAsync(Guid userId, int page = 1, int pageSize = 20);
    }
    }
}
