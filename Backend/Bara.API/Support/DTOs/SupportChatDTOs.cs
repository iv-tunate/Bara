
namespace Bara.API.Support.DTOs
{
    public class SendSupportMessageRequest
    {
        public string Content { get; set; }
    }

    public class SupportChatMessageDTO
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public bool IsAdminSender { get; set; }
        public string Content { get; set; }
        public DateTimeOffset SentAt { get; set; }
        public bool IsRead { get; set; }
    }

    public class SupportChatSummaryDTO
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string UserProfileImage { get; set; }
        public string LastMessage { get; set; }
        public DateTimeOffset LastMessageAt { get; set; }
        public bool IsBlocked { get; set; }
        public int UnreadCount { get; set; }
    }
}
