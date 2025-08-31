using ScriptModule.DTOs.ChatDTOs;
using SharedModule.Utils;

namespace ScriptModule.Interfaces
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
        /// <returns>A response containing the complete chat history</returns>
        Task<ResponseDetail<ChatHistoryResponse>> GetChatHistoryAsync(Guid userId, Guid chatId);

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
        /// <param name="scriptId">The ID of the script</param>
        /// <param name="scriptTitle">The title of the script</param>
        /// <param name="producerId">The ID of the producer</param>
        /// <param name="producerName">The name of the producer</param>
        /// <param name="writerId">The ID of the writer</param>
        /// <param name="writerName">The name of the writer</param>
        /// <returns>A response containing the created chat ID</returns>
        Task<ResponseDetail<Guid>> CreateChatAsync(Guid scriptId, string scriptTitle, Guid producerId, string producerName, Guid writerId, string writerName);

        /// <summary>
        /// Closes a chat when a script transaction is completed or cancelled.
        /// </summary>
        /// <param name="chatId">The ID of the chat to close</param>
        /// <returns>A response indicating success or failure</returns>
        Task<ResponseDetail<bool>> CloseChatAsync(Guid chatId);
    }
}
