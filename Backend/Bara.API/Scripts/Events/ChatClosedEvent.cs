using Bara.API.Events;

namespace Bara.API.Scripts.Events
{
    public class ChatClosedEvent : DomainEvent
    {
        public Guid ChatId { get; set; }
        public Guid ProducerId { get; set; }
        public Guid WriterId { get; set; }
        public string ScriptTitle { get; set; }
    }
}
