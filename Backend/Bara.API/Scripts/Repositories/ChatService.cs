using Bara.API.DataContext;
using Bara.API.Scripts.DTOs.ChatDTOs;
using Bara.API.Scripts.Events;
using Bara.API.Scripts.Interfaces;
using Bara.API.Scripts.Models.ScriptRelatedChats;
using Bara.API.Utilities.Interfaces;
using Bara.API.Utilities.ToolKit;
using Microsoft.EntityFrameworkCore;

namespace Bara.API.Scripts.Repositories
{
    /// <summary>
    /// Service implementation for managing chat functionality between producers and writers during script transactions.
    /// </summary>
    public class ChatService : IChatService
    {
        private readonly IChatRepository chatRepository;
        private readonly BaraContext dbContext;
        private readonly INotificationService notificationService;
        private readonly IChatValidator validator;
        private readonly ISanitizationService sanitizationService;
        private readonly IRateLimitService rateLimitService;
        private readonly ILogger<ChatService> logger;
        private readonly LogHelper<ChatService> logHelper;

        public ChatService(
            IChatRepository chatRepository,
            BaraContext dbContext,
            INotificationService notificationService,
            IChatValidator validator,
            ISanitizationService sanitizationService,
            IRateLimitService rateLimitService,
            ILogger<ChatService> logger,
            LogHelper<ChatService> logHelper)
        {
            this.chatRepository = chatRepository;
            this.dbContext = dbContext;
            this.notificationService = notificationService;
            this.validator = validator;
            this.sanitizationService = sanitizationService;
            this.rateLimitService = rateLimitService;
            this.logger = logger;
            this.logHelper = logHelper;
        }

        public async Task<ResponseDetail<ChatMessageResponse>> SendMessageAsync(
            Guid userId, Guid chatId, SendMessageRequest request)
        {
            var correlationId = Guid.NewGuid();

            try
            {
                var isAllowed = rateLimitService.IsAllowed(userId, chatId);
                if (!isAllowed)
                {
                    logger.LogWarning("Rate limit exceeded - UserId: {UserId}, ChatId: {ChatId}, CorrelationId: {CorrelationId}",
                        userId, chatId, correlationId);
                    return ResponseDetail<ChatMessageResponse>.Failed("Too many messages. Please wait before sending another.", 429);
                }

                var validation = validator.ValidateSendMessageRequest(request);
                if (!validation.IsValid)
                {
                    logger.LogWarning("Invalid message request - CorrelationId: {CorrelationId}, Error: {Error}",
                        correlationId, validation.Message);
                    return ResponseDetail<ChatMessageResponse>.Failed(validation.Message, validation.StatusCode);
                }

                var hasAccess = await chatRepository.UserHasAccessToChatAsync(chatId, userId);
                if (!hasAccess)
                {
                    logger.LogWarning(
                        "User {UserId} attempted to send message to chat {ChatId} without access - CorrelationId: {CorrelationId}",
                        userId, chatId, correlationId);
                    return ResponseDetail<ChatMessageResponse>.Failed("Access denied to this chat", 403);
                }

                var chat = await chatRepository.GetChatByIdAsync(chatId);
                var existsValidation = validator.ValidateChatExists(chat);
                if (!existsValidation.IsValid)
                {
                    logger.LogWarning("Chat {ChatId} not found - CorrelationId: {CorrelationId}", chatId, correlationId);
                    return ResponseDetail<ChatMessageResponse>.Failed(existsValidation.Message, existsValidation.StatusCode);
                }

                var closedValidation = validator.ValidateChatNotClosed(chat);
                if (!closedValidation.IsValid)
                {
                    logger.LogWarning(
                        "User {UserId} attempted to send message to closed chat {ChatId} - CorrelationId: {CorrelationId}",
                        userId, chatId, correlationId);
                    return ResponseDetail<ChatMessageResponse>.Failed(closedValidation.Message, closedValidation.StatusCode);
                }

                var sender = await dbContext.Users
                    .Where(u => u.Id == userId)
                    .Select(u => new { u.Id, u.FirstName, u.LastName })
                    .FirstOrDefaultAsync();

                if (sender == null)
                {
                    logger.LogWarning("Sender {UserId} not found - CorrelationId: {CorrelationId}", userId, correlationId);
                    return ResponseDetail<ChatMessageResponse>.Failed("Sender not found", 404);
                }

                var sanitizedContent = sanitizationService.SanitizeHtml(request.Content);
                var sanitizedUrl = string.IsNullOrEmpty(request.AttachmentUrl)
                    ? null
                    : sanitizationService.SanitizeUrl(request.AttachmentUrl);

                var message = new ChatMessage
                {
                    ChatId = chatId,
                    UserId = userId,
                    SenderName = $"{sender.FirstName} {sender.LastName}",
                    Content = sanitizedContent,
                    AttachmentUrl = sanitizedUrl,
                    SentAt = DateTimeOffset.UtcNow,
                    IsRead = false
                };

                var savedMessage = await chatRepository.AddMessageAsync(message);

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

                var recipientId = userId == chat.ProducerId ? chat.WriterId : chat.ProducerId;
                var messageSentEvent = new MessageSentEvent
                {
                    ChatId = chatId,
                    SenderId = userId,
                    RecipientId = recipientId,
                    Message = response,
                    ScriptTitle = chat.ScriptTitle
                };

                await notificationService.NotifyMessageSentAsync(messageSentEvent);

                logger.LogInformation(
                    "Message sent successfully - CorrelationId: {CorrelationId}, ChatId: {ChatId}, SenderId: {SenderId}",
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

        public async Task<ResponseDetail<List<ChatMessageResponse>>> GetChatHistoryAsync(
            Guid userId, Guid chatId, int page = 1, int pageSize = 20)
        {
            var correlationId = Guid.NewGuid();

            try
            {
                var hasAccess = await chatRepository.UserHasAccessToChatAsync(chatId, userId);
                if (!hasAccess)
                {
                    logger.LogWarning(
                        "User {UserId} attempted to access chat {ChatId} without permission - CorrelationId: {CorrelationId}",
                        userId, chatId, correlationId);
                    return ResponseDetail<List<ChatMessageResponse>>.Failed("Access denied to this chat", 403);
                }

                var chat = await chatRepository.GetChatByIdAsync(chatId);
                if (chat == null)
                {
                    logger.LogWarning("Chat {ChatId} not found - CorrelationId: {CorrelationId}", chatId, correlationId);
                    return ResponseDetail<List<ChatMessageResponse>>.Failed("Chat not found", 404);
                }

                int skip = (page - 1) * pageSize;
                int totalMessages = chat.Messages.Count;
                int totalPages = (int)Math.Ceiling((double)totalMessages / pageSize);

                var paginatedMessages = chat.Messages
                    .OrderBy(m => m.SentAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .Select(m => new ChatMessageResponse
                    {
                        MessageId = m.Id,
                        SenderId = m.UserId,
                        SenderName = m.SenderName,
                        Content = m.Content,
                        AttachmentUrl = m.AttachmentUrl,
                        SentAt = m.SentAt,
                        IsRead = m.IsRead
                    })
                    .ToList();

                logger.LogInformation(
                    "Chat history retrieved successfully - CorrelationId: {CorrelationId}, ChatId: {ChatId}, UserId: {UserId}, Page: {Page}, PageSize: {PageSize}, Total: {Total}",
                    correlationId, chatId, userId, page, pageSize, totalMessages);

                return ResponseDetail<List<ChatMessageResponse>>.SuccessfulPaginatedResponse(
                    paginatedMessages,
                    totalMessages,
                    totalPages,
                    page,
                    "Chat history retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While retrieving chat history - CorrelationId: {correlationId}, ChatId: {chatId}, UserId: {userId}");
                return ResponseDetail<List<ChatMessageResponse>>.Failed("Failed to retrieve chat history", 500);
            }
        }

        public async Task<ResponseDetail<bool>> MarkMessagesAsReadAsync(Guid userId, Guid chatId)
        {
            var correlationId = Guid.NewGuid();

            try
            {
                var hasAccess = await chatRepository.UserHasAccessToChatAsync(chatId, userId);
                if (!hasAccess)
                {
                    logger.LogWarning(
                        "User {UserId} attempted to mark messages as read in chat {ChatId} without access - CorrelationId: {CorrelationId}",
                        userId, chatId, correlationId);
                    return ResponseDetail<bool>.Failed("Access denied to this chat", 403);
                }

                var markedCount = await chatRepository.MarkMessagesAsReadAsync(chatId, userId);

                if (markedCount > 0)
                {
                    var chat = await chatRepository.GetChatByIdAsync(chatId);
                    if (chat != null)
                    {
                        var otherUserId = userId == chat.ProducerId ? chat.WriterId : chat.ProducerId;
                        var messagesReadEvent = new MessagesReadEvent
                        {
                            ChatId = chatId,
                            UserId = userId,
                            OtherUserId = otherUserId,
                            MarkedCount = markedCount
                        };

                        await notificationService.NotifyMessagesReadAsync(messagesReadEvent);
                    }
                }

                logger.LogInformation(
                    "Messages marked as read - CorrelationId: {CorrelationId}, ChatId: {ChatId}, UserId: {UserId}, Count: {Count}",
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

        public async Task<ResponseDetail<Guid>> CreateChatAsync(CreateChatRequest request)
        {
            var correlationId = Guid.NewGuid();

            try
            {
                var existingChat = await chatRepository.GetChatByParticipantsAsync(request.ScriptId, request.ProducerId, request.WriterId);
                if (existingChat != null)
                {
                    logger.LogInformation(
                        "Chat already exists - CorrelationId: {CorrelationId}, ChatId: {ChatId}",
                        correlationId, existingChat.Id);
                    return ResponseDetail<Guid>.Successful(existingChat.Id, "Chat already exists");
                }

                var chat = new Chat
                {
                    ScriptId = request.ScriptId,
                    ScriptTitle = request.ScriptTitle,
                    ProducerId = request.ProducerId,
                    ProducerName = request.ProducerName,
                    WriterId = request.WriterId,
                    WriterName = request.WriterName,
                    IsClosed = false,
                    CreatedAt = DateTimeOffset.UtcNow
                };

                var createdChat = await chatRepository.CreateChatAsync(chat);

                logger.LogInformation(
                    "Chat created successfully - CorrelationId: {CorrelationId}, ChatId: {ChatId}, ScriptId: {ScriptId}",
                    correlationId, createdChat.Id, request.ScriptId);

                return ResponseDetail<Guid>.Successful(createdChat.Id, "Chat created successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While creating chat - CorrelationId: {correlationId}, ScriptId: {request.ScriptId}");
                return ResponseDetail<Guid>.Failed("Failed to create chat", 500);
            }
        }

        public async Task<ResponseDetail<bool>> CloseChatAsync(Guid chatId)
        {
            var correlationId = Guid.NewGuid();

            try
            {
                var chat = await chatRepository.GetChatByIdAsync(chatId);
                if (chat == null)
                {
                    logger.LogWarning("Chat {ChatId} not found for closing - CorrelationId: {CorrelationId}",
                        chatId, correlationId);
                    return ResponseDetail<bool>.Failed("Chat not found", 404);
                }

                var success = await chatRepository.CloseChatAsync(chatId);
                if (!success)
                {
                    logger.LogWarning("Failed to close chat {ChatId} - CorrelationId: {CorrelationId}",
                        chatId, correlationId);
                    return ResponseDetail<bool>.Failed("Failed to close chat", 500);
                }

                var chatClosedEvent = new ChatClosedEvent
                {
                    ChatId = chatId,
                    ProducerId = chat.ProducerId,
                    WriterId = chat.WriterId,
                    ScriptTitle = chat.ScriptTitle
                };

                await notificationService.NotifyChatClosedAsync(chatClosedEvent);

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

        public async Task<ResponseDetail<List<ChatSummaryDTO>>> GetUserChatsAsync(Guid userId, int page = 1, int pageSize = 20)
        {
            var correlationId = Guid.NewGuid();
            try
            {
                var chatSummaries = await chatRepository.GetUserChatsAsync(userId, page, pageSize);

                return ResponseDetail<List<ChatSummaryDTO>>.Successful(chatSummaries, "Chats retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                   $"While retrieving user chats - CorrelationId: {correlationId}, UserId: {userId}");
                return ResponseDetail<List<ChatSummaryDTO>>.Failed("Failed to retrieve chats", 500);
            }
        }
    }
}
