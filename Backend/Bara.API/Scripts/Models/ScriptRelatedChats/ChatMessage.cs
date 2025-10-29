using SharedModule.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Scripts.Models.ScriptRelatedChats
{
    public class ChatMessage : BaseEntity
    {
        /// <summary>
        /// The ID of the chat this message belongs to.
        /// </summary>
        [ForeignKey("Chat")]
        public Guid ChatId { get; set; }

        /// <summary>
        /// The ID of the user who sent the message.
        /// </summary>
        [ForeignKey("User")]
        public Guid UserId { get; set; }

        /// <summary>
        /// The display name of the sender at the time of sending.
        /// </summary>
        public string SenderName { get; set; }

        /// <summary>
        /// The actual text content of the message.
        /// </summary>
        public string Content { get; set; }

        /// <summary>
        /// Optional attachment URL (e.g., revised script file).
        /// </summary>
        public string AttachmentUrl { get; set; }

        /// <summary>
        /// Timestamp of when the message was sent.
        /// </summary>
        public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;

        /// <summary>
        /// Whether the recipient has read the message.
        /// </summary>
        public bool IsRead { get; set; } = false;
    }
}
