using Bara.API.Scripts.Events;
using Bara.API.Scripts.Interfaces;
using Bara.API.Services.SignalR;
using Microsoft.AspNetCore.SignalR;

namespace Bara.API.Scripts.Repositories
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> notificationHub;
        private readonly ILogger<NotificationService> logger;

        public NotificationService(
            IHubContext<NotificationHub> notificationHub,
            ILogger<NotificationService> logger)
        {
            this.notificationHub = notificationHub;
            this.logger = logger;
        }

        public async Task NotifyMessageSentAsync(MessageSentEvent domainEvent)
        {
            try
            {
                await notificationHub.Clients.User(domainEvent.RecipientId.ToString())
                    .SendAsync("MessageReceived", new
                    {
                        ChatId = domainEvent.ChatId,
                        Message = domainEvent.Message,
                        ScriptTitle = domainEvent.ScriptTitle
                    });

                logger.LogInformation(
                    "Message notification sent - CorrelationId: {CorrelationId}, ChatId: {ChatId}, RecipientId: {RecipientId}",
                    domainEvent.CorrelationId, domainEvent.ChatId, domainEvent.RecipientId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex,
                    "Failed to send message notification - CorrelationId: {CorrelationId}, ChatId: {ChatId}",
                    domainEvent.CorrelationId, domainEvent.ChatId);
            }
        }

        public async Task NotifyMessagesReadAsync(MessagesReadEvent domainEvent)
        {
            try
            {
                await notificationHub.Clients.User(domainEvent.OtherUserId.ToString())
                    .SendAsync("MessagesRead", new
                    {
                        ChatId = domainEvent.ChatId,
                        ReadByUserId = domainEvent.UserId,
                        MarkedCount = domainEvent.MarkedCount
                    });

                logger.LogInformation(
                    "Messages read notification sent - CorrelationId: {CorrelationId}, ChatId: {ChatId}, UserId: {UserId}",
                    domainEvent.CorrelationId, domainEvent.ChatId, domainEvent.UserId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex,
                    "Failed to send messages read notification - CorrelationId: {CorrelationId}, ChatId: {ChatId}",
                    domainEvent.CorrelationId, domainEvent.ChatId);
            }
        }

        public async Task NotifyChatClosedAsync(ChatClosedEvent domainEvent)
        {
            try
            {
                var closureInfo = new
                {
                    ChatId = domainEvent.ChatId,
                    ScriptTitle = domainEvent.ScriptTitle,
                    ClosedAt = DateTimeOffset.UtcNow
                };

                await notificationHub.Clients.User(domainEvent.ProducerId.ToString())
                    .SendAsync("ChatClosed", closureInfo);

                await notificationHub.Clients.User(domainEvent.WriterId.ToString())
                    .SendAsync("ChatClosed", closureInfo);

                logger.LogInformation(
                    "Chat closed notification sent - CorrelationId: {CorrelationId}, ChatId: {ChatId}",
                    domainEvent.CorrelationId, domainEvent.ChatId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex,
                    "Failed to send chat closed notification - CorrelationId: {CorrelationId}, ChatId: {ChatId}",
                    domainEvent.CorrelationId, domainEvent.ChatId);
            }
        }
    }
}
