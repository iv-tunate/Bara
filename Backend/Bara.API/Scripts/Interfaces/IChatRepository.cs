using Bara.API.Scripts.Models.ScriptRelatedChats;

namespace Bara.API.Scripts.Interfaces
{
    /// <summary>
    /// Repository interface for chat data access operations.
    /// </summary>
    public interface IChatRepository
    {
        /// <summary>
        /// Creates a new chat in the database.
        /// </summary>
        /// <param name="chat">The chat entity to create</param>
        /// <returns>The created chat with its assigned ID</returns>
        Task<Chat> CreateChatAsync(Chat chat);

        /// <summary>
        /// Retrieves a chat by its ID, including messages.
        /// </summary>
        /// <param name="chatId">The ID of the chat to retrieve</param>
        /// <returns>The chat entity with messages, or null if not found</returns>
        Task<Chat?> GetChatByIdAsync(Guid chatId);

        /// <summary>
        /// Retrieves a chat by script transaction participants.
        /// </summary>
        /// <param name="scriptId">The ID of the script</param>
        /// <param name="producerId">The ID of the producer</param>
        /// <param name="writerId">The ID of the writer</param>
        /// <returns>The chat entity, or null if not found</returns>
        Task<Chat?> GetChatByParticipantsAsync(Guid scriptId, Guid producerId, Guid writerId);

        /// <summary>
        /// Adds a message to a chat.
        /// </summary>
        /// <param name="message">The message to add</param>
        /// <returns>The created message with its assigned ID</returns>
        Task<ChatMessage> AddMessageAsync(ChatMessage message);

        /// <summary>
        /// Marks messages as read for a specific user in a chat.
        /// </summary>
        /// <param name="chatId">The ID of the chat</param>
        /// <param name="userId">The ID of the user marking messages as read</param>
        /// <returns>The number of messages marked as read</returns>
        Task<int> MarkMessagesAsReadAsync(Guid chatId, Guid userId);

        /// <summary>
        /// Gets the count of unread messages for a user in a chat.
        /// </summary>
        /// <param name="chatId">The ID of the chat</param>
        /// <param name="userId">The ID of the user</param>
        /// <returns>The number of unread messages</returns>
        Task<int> GetUnreadMessageCountAsync(Guid chatId, Guid userId);

        /// <summary>
        /// Closes a chat by setting its IsClosed flag to true.
        /// </summary>
        /// <param name="chatId">The ID of the chat to close</param>
        /// <returns>True if the chat was successfully closed, false otherwise</returns>
        Task<bool> CloseChatAsync(Guid chatId);

        /// <summary>
        /// Checks if a user has access to a specific chat.
        /// </summary>
        /// <param name="chatId">The ID of the chat</param>
        /// <param name="userId">The ID of the user</param>
        /// <returns>True if the user has access, false otherwise</returns>
        Task<bool> UserHasAccessToChatAsync(Guid chatId, Guid userId);
    }
}
