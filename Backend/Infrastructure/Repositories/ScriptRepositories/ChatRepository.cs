using Infrastructure.DataContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ScriptModule.Interfaces;
using ScriptModule.Models.ScriptRelatedChats;
using SharedModule.Utils;

namespace Infrastructure.Repositories.ScriptRepositories
{
    /// <summary>
    /// Repository implementation for chat data access operations.
    /// </summary>
    public class ChatRepository : IChatRepository
    {
        private readonly BaraContext dbContext;
        private readonly ILogger<ChatRepository> logger;
        private readonly LogHelper<ChatRepository> logHelper;

        public ChatRepository(BaraContext dbContext, ILogger<ChatRepository> logger, LogHelper<ChatRepository> logHelper)
        {
            this.dbContext = dbContext;
            this.logger = logger;
            this.logHelper = logHelper;
        }

        /// <summary>
        /// Creates a new chat in the database.
        /// </summary>
        /// <param name="chat">The chat entity to create</param>
        /// <returns>The created chat with its assigned ID</returns>
        public async Task<Chat> CreateChatAsync(Chat chat)
        {
            try
            {
                dbContext.Chats.Add(chat);
                await dbContext.SaveChangesAsync();
                return chat;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While creating chat for script {chat.ScriptId}");
                throw;
            }
        }

        /// <summary>
        /// Retrieves a chat by its ID, including messages.
        /// </summary>
        /// <param name="chatId">The ID of the chat to retrieve</param>
        /// <returns>The chat entity with messages, or null if not found</returns>
        public async Task<Chat?> GetChatByIdAsync(Guid chatId)
        {
            try
            {
                return await dbContext.Chats
                    .Include(c => c.Messages.OrderBy(m => m.SentAt))
                    .FirstOrDefaultAsync(c => c.Id == chatId);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While retrieving chat {chatId}");
                return null;
            }
        }

        /// <summary>
        /// Retrieves a chat by script transaction participants.
        /// </summary>
        /// <param name="scriptId">The ID of the script</param>
        /// <param name="producerId">The ID of the producer</param>
        /// <param name="writerId">The ID of the writer</param>
        /// <returns>The chat entity, or null if not found</returns>
        public async Task<Chat?> GetChatByParticipantsAsync(Guid scriptId, Guid producerId, Guid writerId)
        {
            try
            {
                return await dbContext.Chats
                    .Include(c => c.Messages.OrderBy(m => m.SentAt))
                    .FirstOrDefaultAsync(c => c.ScriptId == scriptId && 
                                            c.ProducerId == producerId && 
                                            c.WriterId == writerId);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While retrieving chat for script {scriptId}, producer {producerId}, writer {writerId}");
                return null;
            }
        }

        /// <summary>
        /// Adds a message to a chat.
        /// </summary>
        /// <param name="message">The message to add</param>
        /// <returns>The created message with its assigned ID</returns>
        public async Task<ChatMessage> AddMessageAsync(ChatMessage message)
        {
            try
            {
                dbContext.ChatMessages.Add(message);
                await dbContext.SaveChangesAsync();
                return message;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While adding message to chat {message.ChatId}");
                throw;
            }
        }

        /// <summary>
        /// Marks messages as read for a specific user in a chat.
        /// </summary>
        /// <param name="chatId">The ID of the chat</param>
        /// <param name="userId">The ID of the user marking messages as read</param>
        /// <returns>The number of messages marked as read</returns>
        public async Task<int> MarkMessagesAsReadAsync(Guid chatId, Guid userId)
        {
            try
            {
                var unreadMessages = await dbContext.ChatMessages
                    .Where(m => m.ChatId == chatId && m.UserId != userId && !m.IsRead)
                    .ToListAsync();

                foreach (var message in unreadMessages)
                {
                    message.IsRead = true;
                }

                await dbContext.SaveChangesAsync();
                return unreadMessages.Count;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While marking messages as read for chat {chatId}, user {userId}");
                return 0;
            }
        }

        /// <summary>
        /// Gets the count of unread messages for a user in a chat.
        /// </summary>
        /// <param name="chatId">The ID of the chat</param>
        /// <param name="userId">The ID of the user</param>
        /// <returns>The number of unread messages</returns>
        public async Task<int> GetUnreadMessageCountAsync(Guid chatId, Guid userId)
        {
            try
            {
                return await dbContext.ChatMessages
                    .CountAsync(m => m.ChatId == chatId && m.UserId != userId && !m.IsRead);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While getting unread count for chat {chatId}, user {userId}");
                return 0;
            }
        }

        /// <summary>
        /// Closes a chat by setting its IsClosed flag to true.
        /// </summary>
        /// <param name="chatId">The ID of the chat to close</param>
        /// <returns>True if the chat was successfully closed, false otherwise</returns>
        public async Task<bool> CloseChatAsync(Guid chatId)
        {
            try
            {
                var chat = await dbContext.Chats.FirstOrDefaultAsync(c => c.Id == chatId);
                if (chat == null) return false;

                chat.IsClosed = true;
                await dbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While closing chat {chatId}");
                return false;
            }
        }

        /// <summary>
        /// Checks if a user has access to a specific chat.
        /// </summary>
        /// <param name="chatId">The ID of the chat</param>
        /// <param name="userId">The ID of the user</param>
        /// <returns>True if the user has access, false otherwise</returns>
        public async Task<bool> UserHasAccessToChatAsync(Guid chatId, Guid userId)
        {
            try
            {
                return await dbContext.Chats
                    .AnyAsync(c => c.Id == chatId && (c.ProducerId == userId || c.WriterId == userId));
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While checking user access for chat {chatId}, user {userId}");
                return false;
            }
        }
    }
}
