using Bara.API.Events;

namespace Bara.API.Scripts.Events
{
    public class MessagesReadEvent : DomainEvent
    {
        public Guid ChatId { get; set; }
        public Guid UserId { get; set; }
        public Guid OtherUserId { get; set; }
        public int MarkedCount { get; set; }
    }
}
