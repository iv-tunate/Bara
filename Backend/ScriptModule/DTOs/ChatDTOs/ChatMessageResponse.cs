namespace ScriptModule.DTOs.ChatDTOs
{
    /// <summary>
    /// Response DTO representing a single chat message.
    /// </summary>
    public class ChatMessageResponse
    {
        /// <summary>
        /// The unique identifier of the message.
        /// </summary>
        public Guid MessageId { get; set; }

        /// <summary>
        /// The unique identifier of the user who sent the message.
        /// </summary>
        public Guid SenderId { get; set; }

        /// <summary>
        /// The display name of the sender.
        /// </summary>
        public string SenderName { get; set; } = string.Empty;

        /// <summary>
        /// The text content of the message.
        /// </summary>
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Optional attachment URL for files or revised scripts.
        /// </summary>
        public string? AttachmentUrl { get; set; }

        /// <summary>
        /// The timestamp when the message was sent.
        /// </summary>
        public DateTimeOffset SentAt { get; set; }

        /// <summary>
        /// Whether the message has been read by the recipient.
        /// </summary>
        public bool IsRead { get; set; }
    }
}
