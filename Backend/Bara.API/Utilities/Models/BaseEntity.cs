using System.ComponentModel.DataAnnotations;

namespace Bara.API.Utilities.Models
{
    /// <summary>
    /// This class contains properties that might be needed for different models
    /// </summary>
    public abstract class BaseEntity
    {
        [Key]
        public virtual Guid Id { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTime.UtcNow;
        public DateOnly DateCreated => DateOnly.FromDateTime(CreatedAt.UtcDateTime);
        public TimeOnly TimeCreated => TimeOnly.FromDateTime(CreatedAt.UtcDateTime);
        public DateTimeOffset? ModifiedAt { get; set; }
        public DateOnly? DateModified => ModifiedAt.HasValue ? DateOnly.FromDateTime(ModifiedAt.Value.UtcDateTime) : null;
        public TimeOnly? TimeModified => ModifiedAt.HasValue ? TimeOnly.FromDateTime(ModifiedAt.Value.UtcDateTime) : null;
    }
}
