using System.ComponentModel.DataAnnotations;

namespace ScriptModule.DTOs.ChatDTOs
{
    /// <summary>
    /// Request DTO for sending a message in a script transaction chat.
    /// </summary>
    public class SendMessageRequest
    {
        /// <summary>
        /// The text content of the message.
        /// </summary>
        [Required(ErrorMessage = "Message content is required")]
        [StringLength(2000, ErrorMessage = "Message content cannot exceed 2000 characters")]
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// Optional attachment URL for revised scripts or other files.
        /// </summary>
        [Url(ErrorMessage = "Attachment URL must be a valid URL")]
        public string? AttachmentUrl { get; set; }
    }
}
