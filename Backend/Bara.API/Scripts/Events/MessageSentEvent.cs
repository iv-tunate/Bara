using Bara.API.Events;
using Bara.API.Scripts.DTOs.ChatDTOs;

namespace Bara.API.Scripts.Events
{
    public class MessageSentEvent : DomainEvent
    {
        public Guid ChatId { get; set; }
        public Guid SenderId { get; set; }
        public Guid RecipientId { get; set; }
        public ChatMessageResponse Message { get; set; }
        public string ScriptTitle { get; set; }
    }
}
