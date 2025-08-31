namespace ScriptModule.DTOs.ChatDTOs
{
    /// <summary>
    /// Response DTO containing the complete chat history for a script transaction.
    /// </summary>
    public class ChatHistoryResponse
    {
        /// <summary>
        /// The unique identifier of the chat.
        /// </summary>
        public Guid ChatId { get; set; }

        /// <summary>
        /// The title of the script being discussed.
        /// </summary>
        public string ScriptTitle { get; set; } = string.Empty;

        /// <summary>
        /// The list of messages in the chat, ordered by sent time.
        /// </summary>
        public List<ChatMessageResponse> Messages { get; set; } = new List<ChatMessageResponse>();

        /// <summary>
        /// The number of unread messages for the requesting user.
        /// </summary>
        public int UnreadCount { get; set; }

        /// <summary>
        /// Whether the chat has been closed (transaction completed/cancelled).
        /// </summary>
        public bool IsClosed { get; set; }

        /// <summary>
        /// The ID of the producer in this chat.
        /// </summary>
        public Guid ProducerId { get; set; }

        /// <summary>
        /// The name of the producer in this chat.
        /// </summary>
        public string ProducerName { get; set; } = string.Empty;

        /// <summary>
        /// The ID of the writer in this chat.
        /// </summary>
        public Guid WriterId { get; set; }

        /// <summary>
        /// The name of the writer in this chat.
        /// </summary>
        public string WriterName { get; set; } = string.Empty;
    }
}
