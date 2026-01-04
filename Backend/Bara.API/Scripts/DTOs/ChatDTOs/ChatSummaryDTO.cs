using System;

namespace Bara.API.Scripts.DTOs.ChatDTOs
{
    public class ChatSummaryDTO
    {
        public Guid ChatId { get; set; }
        public Guid ScriptId { get; set; }
        public string ScriptTitle { get; set; }
        public Guid OtherUserId { get; set; }
        public string OtherUserName { get; set; }
        public string LastMessageContent { get; set; } 
        public DateTimeOffset LastMessageSentAt { get; set; }
        public int UnreadCount { get; set; }
        public bool IsClosed { get; set; }
        public string OtherUserProfilePictureUrl { get; set; }
    }
}
