using Bara.API.Scripts.Events;

namespace Bara.API.Scripts.Interfaces
{
    public interface INotificationService
    {
        Task NotifyMessageSentAsync(MessageSentEvent domainEvent);
        Task NotifyMessagesReadAsync(MessagesReadEvent domainEvent);
        Task NotifyChatClosedAsync(ChatClosedEvent domainEvent);
    }
}
