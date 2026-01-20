using Bara.API.Users.Models;
using Bara.API.Utilities.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Support.Models
{
    public class SupportChat : BaseEntity
    {
        [ForeignKey("User")]
        public Guid UserId { get; set; }
        public User User { get; set; }

        public bool IsBlocked { get; set; } = false;

        public DateTimeOffset LastMessageAt { get; set; } = DateTimeOffset.UtcNow;
        
        public ICollection<SupportChatMessage> Messages { get; set; } = new List<SupportChatMessage>();
    }
}
