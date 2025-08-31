using Infrastructure.DataContext;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ScriptModule.DTOs.ChatDTOs;
using ScriptModule.Interfaces;
using ScriptModule.Models.ScriptRelatedChats;
using Services.SignalR;
using SharedModule.Utils;

namespace Infrastructure.Repositories.ScriptRepositories
{
    /// <summary>
    /// Service implementation for managing chat functionality between producers and writers during script transactions.
    /// </summary>
    public class ChatService : IChatService
    {
        private readonly IChatRepository chatRepository;
        private readonly BaraContext dbContext;
        private readonly ILogger<ChatService> logger;
        private readonly LogHelper<ChatService> logHelper;
        private readonly IHubContext<NotificationHub> notificationHub;

        public ChatService(
            IChatRepository chatRepository,
            BaraContext dbContext,
            ILogger<ChatService> logger,
            LogHelper<ChatService> logHelper,
            IHubContext<NotificationHub> notificationHub)
        {
            this.chatRepository = chatRepository;
            this.dbContext = dbContext;
            this.logger = logger;
            this.logHelper = logHelper;
            this.notificationHub = notificationHub;
        }

        /// <summary>
        /// Sends a message in a script transaction chat.
        /// </summary>
        /// <param name="userId">The ID of the user sending the message</param>
        /// <param name="chatId">The ID of the chat to send the message to</param>
        /// <param name="request">The message content and optional attachment</param>
        /// <returns>A response containing the sent message details</returns>
        public async Task<ResponseDetail<ChatMessageResponse>> SendMessageAsync(Guid userId, Guid chatId, SendMessageRequest request)
        {
            var correlationId = Guid.NewGuid();
            
            try
            {
                // Validate user has access to this chat
                var hasAccess = await chatRepository.UserHasAccessToChatAsync(chatId, userId);
                if (!hasAccess)
                {
                    logger.LogWarning("User {UserId} attempted to send message to chat {ChatId} without access - CorrelationId: {CorrelationId}", 
                        userId, chatId, correlationId);
                    return ResponseDetail<ChatMessageResponse>.Failed("Access denied to this chat", 403);
                }

                // Get chat to validate it exists and is not closed
                var chat = await chatRepository.GetChatByIdAsync(chatId);
                if (chat == null)
                {
                    logger.LogWarning("Chat {ChatId} not found - CorrelationId: {CorrelationId}", chatId, correlationId);
                    return ResponseDetail<ChatMessageResponse>.Failed("Chat not found", 404);
                }

                if (chat.IsClosed)
                {
                    logger.LogWarning("User {UserId} attempted to send message to closed chat {ChatId} - CorrelationId: {CorrelationId}", 
                        userId, chatId, correlationId);
                    return ResponseDetail<ChatMessageResponse>.Failed("Cannot send messages to a closed chat", 400);
                }

                // Get sender information
                var sender = await dbContext.Users
                    .Where(u => u.Id == userId)
                    .Select(u => new { u.Id, u.FirstName, u.LastName })
                    .FirstOrDefaultAsync();

                if (sender == null)
                {
                    logger.LogWarning("Sender {UserId} not found - CorrelationId: {CorrelationId}", userId, correlationId);
                    return ResponseDetail<ChatMessageResponse>.Failed("Sender not found", 404);
                }

                // Create the message
                var message = new ChatMessage
                {
                    ChatId = chatId,
                    UserId = userId,
                    SenderName = $"{sender.FirstName} {sender.LastName}",
                    Content = request.Content,
                    AttachmentUrl = request.AttachmentUrl,
                    SentAt = DateTimeOffset.UtcNow,
                    IsRead = false
                };

                // Save the message
                var savedMessage = await chatRepository.AddMessageAsync(message);

                // Create response
                var response = new ChatMessageResponse
                {
                    MessageId = savedMessage.Id,
                    SenderId = savedMessage.UserId,
                    SenderName = savedMessage.SenderName,
                    Content = savedMessage.Content,
                    AttachmentUrl = savedMessage.AttachmentUrl,
                    SentAt = savedMessage.SentAt,
                    IsRead = savedMessage.IsRead
                };

                // Send SignalR notification to the other party
                var recipientId = userId == chat.ProducerId ? chat.WriterId : chat.ProducerId;
                await notificationHub.Clients.User(recipientId.ToString())
                    .SendAsync("MessageReceived", new
                    {
                        ChatId = chatId,
                        Message = response,
                        ScriptTitle = chat.ScriptTitle
                    });

                logger.LogInformation("Message sent successfully - CorrelationId: {CorrelationId}, ChatId: {ChatId}, SenderId: {SenderId}", 
                    correlationId, chatId, userId);

                return ResponseDetail<ChatMessageResponse>.Successful(response, "Message sent successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While sending message - CorrelationId: {correlationId}, ChatId: {chatId}, UserId: {userId}");
                return ResponseDetail<ChatMessageResponse>.Failed("Failed to send message", 500);
            }
        }

        /// <summary>
        /// Retrieves the chat history for a script transaction.
        /// </summary>
        /// <param name="userId">The ID of the user requesting the chat history</param>
        /// <param name="chatId">The ID of the chat to retrieve</param>
        /// <returns>A response containing the complete chat history</returns>
        public async Task<ResponseDetail<ChatHistoryResponse>> GetChatHistoryAsync(Guid userId, Guid chatId)
        {
            var correlationId = Guid.NewGuid();
            
            try
            {
                // Validate user has access to this chat
                var hasAccess = await chatRepository.UserHasAccessToChatAsync(chatId, userId);
                if (!hasAccess)
                {
                    logger.LogWarning("User {UserId} attempted to access chat {ChatId} without permission - CorrelationId: {CorrelationId}", 
                        userId, chatId, correlationId);
                    return ResponseDetail<ChatHistoryResponse>.Failed("Access denied to this chat", 403);
                }

                // Get chat with messages
                var chat = await chatRepository.GetChatByIdAsync(chatId);
                if (chat == null)
                {
                    logger.LogWarning("Chat {ChatId} not found - CorrelationId: {CorrelationId}", chatId, correlationId);
                    return ResponseDetail<ChatHistoryResponse>.Failed("Chat not found", 404);
                }

                // Get unread count for this user
                var unreadCount = await chatRepository.GetUnreadMessageCountAsync(chatId, userId);

                // Map messages to response DTOs
                var messages = chat.Messages.Select(m => new ChatMessageResponse
                {
                    MessageId = m.Id,
                    SenderId = m.UserId,
                    SenderName = m.SenderName,
                    Content = m.Content,
                    AttachmentUrl = m.AttachmentUrl,
                    SentAt = m.SentAt,
                    IsRead = m.IsRead
                }).ToList();

                // Create response
                var response = new ChatHistoryResponse
                {
                    ChatId = chat.Id,
                    ScriptTitle = chat.ScriptTitle,
                    Messages = messages,
                    UnreadCount = unreadCount,
                    IsClosed = chat.IsClosed,
                    ProducerId = chat.ProducerId,
                    ProducerName = chat.ProducerName,
                    WriterId = chat.WriterId,
                    WriterName = chat.WriterName
                };

                // Mark messages as read for this user
                await chatRepository.MarkMessagesAsReadAsync(chatId, userId);

                // Send SignalR notification about read status
                var otherUserId = userId == chat.ProducerId ? chat.WriterId : chat.ProducerId;
                await notificationHub.Clients.User(otherUserId.ToString())
                    .SendAsync("MessagesRead", new
                    {
                        ChatId = chatId,
                        ReadByUserId = userId
                    });

                logger.LogInformation("Chat history retrieved successfully - CorrelationId: {CorrelationId}, ChatId: {ChatId}, UserId: {UserId}", 
                    correlationId, chatId, userId);

                return ResponseDetail<ChatHistoryResponse>.Successful(response, "Chat history retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, 
                    $"While retrieving chat history - CorrelationId: {correlationId}, ChatId: {chatId}, UserId: {userId}");
                return ResponseDetail<ChatHistoryResponse>.Failed("Failed to retrieve chat history", 500);
            }
        }

        /// <summary>
        /// Marks all unread messages in a chat as read for the requesting user.
        /// </summary>
        /// <param name="userId">The ID of the user marking messages as read</param>
        /// <param name="chatId">The ID of the chat to mark messages as read</param>
        /// <returns>A response indicating success or failure</returns>
        public async Task<ResponseDetail<bool>> MarkMessagesAsReadAsync(Guid userId, Guid chatId)
        {
            var correlationId = Guid.NewGuid();

            try
            {
                // Validate user has access to this chat
                var hasAccess = await chatRepository.UserHasAccessToChatAsync(chatId, userId);
                if (!hasAccess)
                {
                    logger.LogWarning("User {UserId} attempted to mark messages as read in chat {ChatId} without access - CorrelationId: {CorrelationId}",
                        userId, chatId, correlationId);
                    return ResponseDetail<bool>.Failed("Access denied to this chat", 403);
                }

                // Mark messages as read
                var markedCount = await chatRepository.MarkMessagesAsReadAsync(chatId, userId);

                if (markedCount > 0)
                {
                    // Get chat info for SignalR notification
                    var chat = await chatRepository.GetChatByIdAsync(chatId);
                    if (chat != null)
                    {
                        // Send SignalR notification to the other party
                        var otherUserId = userId == chat.ProducerId ? chat.WriterId : chat.ProducerId;
                        await notificationHub.Clients.User(otherUserId.ToString())
                            .SendAsync("MessagesRead", new
                            {
                                ChatId = chatId,
                                ReadByUserId = userId,
                                MarkedCount = markedCount
                            });
                    }
                }

                logger.LogInformation("Messages marked as read - CorrelationId: {CorrelationId}, ChatId: {ChatId}, UserId: {UserId}, Count: {Count}",
                    correlationId, chatId, userId, markedCount);

                return ResponseDetail<bool>.Successful(true, $"{markedCount} messages marked as read");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While marking messages as read - CorrelationId: {correlationId}, ChatId: {chatId}, UserId: {userId}");
                return ResponseDetail<bool>.Failed("Failed to mark messages as read", 500);
            }
        }

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
        public async Task<ResponseDetail<Guid>> CreateChatAsync(Guid scriptId, string scriptTitle, Guid producerId, string producerName, Guid writerId, string writerName)
        {
            var correlationId = Guid.NewGuid();

            try
            {
                // Check if chat already exists for these participants
                var existingChat = await chatRepository.GetChatByParticipantsAsync(scriptId, producerId, writerId);
                if (existingChat != null)
                {
                    logger.LogInformation("Chat already exists - CorrelationId: {CorrelationId}, ChatId: {ChatId}",
                        correlationId, existingChat.Id);
                    return ResponseDetail<Guid>.Successful(existingChat.Id, "Chat already exists");
                }

                // Create new chat
                var chat = new Chat
                {
                    ScriptId = scriptId,
                    ScriptTitle = scriptTitle,
                    ProducerId = producerId,
                    ProducerName = producerName,
                    WriterId = writerId,
                    WriterName = writerName,
                    IsClosed = false
                };

                var createdChat = await chatRepository.CreateChatAsync(chat);

                logger.LogInformation("Chat created successfully - CorrelationId: {CorrelationId}, ChatId: {ChatId}, ScriptId: {ScriptId}",
                    correlationId, createdChat.Id, scriptId);

                return ResponseDetail<Guid>.Successful(createdChat.Id, "Chat created successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While creating chat - CorrelationId: {correlationId}, ScriptId: {scriptId}, ProducerId: {producerId}, WriterId: {writerId}");
                return ResponseDetail<Guid>.Failed("Failed to create chat", 500);
            }
        }

        /// <summary>
        /// Closes a chat when a script transaction is completed or cancelled.
        /// </summary>
        /// <param name="chatId">The ID of the chat to close</param>
        /// <returns>A response indicating success or failure</returns>
        public async Task<ResponseDetail<bool>> CloseChatAsync(Guid chatId)
        {
            var correlationId = Guid.NewGuid();

            try
            {
                // Get chat info before closing for SignalR notification
                var chat = await chatRepository.GetChatByIdAsync(chatId);
                if (chat == null)
                {
                    logger.LogWarning("Chat {ChatId} not found for closing - CorrelationId: {CorrelationId}", chatId, correlationId);
                    return ResponseDetail<bool>.Failed("Chat not found", 404);
                }

                // Close the chat
                var success = await chatRepository.CloseChatAsync(chatId);
                if (!success)
                {
                    logger.LogWarning("Failed to close chat {ChatId} - CorrelationId: {CorrelationId}", chatId, correlationId);
                    return ResponseDetail<bool>.Failed("Failed to close chat", 500);
                }

                // Send SignalR notifications to both participants
                await notificationHub.Clients.User(chat.ProducerId.ToString())
                    .SendAsync("ChatClosed", new
                    {
                        ChatId = chatId,
                        ScriptTitle = chat.ScriptTitle,
                        ClosedAt = DateTimeOffset.UtcNow
                    });

                await notificationHub.Clients.User(chat.WriterId.ToString())
                    .SendAsync("ChatClosed", new
                    {
                        ChatId = chatId,
                        ScriptTitle = chat.ScriptTitle,
                        ClosedAt = DateTimeOffset.UtcNow
                    });

                logger.LogInformation("Chat closed successfully - CorrelationId: {CorrelationId}, ChatId: {ChatId}",
                    correlationId, chatId);

                return ResponseDetail<bool>.Successful(true, "Chat closed successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While closing chat - CorrelationId: {correlationId}, ChatId: {chatId}");
                return ResponseDetail<bool>.Failed("Failed to close chat", 500);
            }
        }
    }
}
