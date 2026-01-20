using Bara.API.Utilities.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Support.Models
{
    public class SupportChatMessage : BaseEntity
    {
        [ForeignKey("SupportChat")]
        public Guid SupportChatId { get; set; }
        public SupportChat SupportChat { get; set; }

        public Guid SenderId { get; set; }
        
        public bool IsAdminSender { get; set; }
        
        public string Content { get; set; }
        
        public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;
        
        public bool IsRead { get; set; } = false;
    }
}
