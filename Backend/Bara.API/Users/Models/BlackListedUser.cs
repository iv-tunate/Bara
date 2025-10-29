using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Users.Models
{
    /// <summary>
    /// Represents a blacklisted user in the system, either a producer or writer,
    /// including the reason and timestamp of the blacklist action.
    /// </summary>
    public class BlackListedUser
    {
        /// <summary>
        /// Unique identifier for the blacklist record.
        /// </summary>
        [Key]
        public Guid Id { get; set; }

        /// <summary>
        /// The ID of the user who has been blacklisted.
        /// </summary>
        [ForeignKey(nameof(User))]
        public Guid UserId { get; set; }

        /// <summary>
        /// Navigation property linking to the user who has been blacklisted.
        /// </summary>
        public User? User { get; set; }

        /// <summary>
        /// The full name of the blacklisted user at the time of blacklisting.
        /// Useful for snapshotting the record even if the user's profile changes.
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Optional reason for blacklisting the user, such as policy violation or suspicious activity.
        /// </summary>
        public string? Reason { get; set; }

        /// <summary>
        /// The exact UTC timestamp when the user was blacklisted.
        /// </summary>
        public DateTimeOffset BlackListedAt { get; set; } = DateTimeOffset.UtcNow;

        /// <summary>
        /// The UTC date portion of when the user was blacklisted.
        /// </summary>
        public DateOnly BlackListedAtDate => DateOnly.FromDateTime(BlackListedAt.UtcDateTime);

        /// <summary>
        /// The UTC time portion of when the user was blacklisted.
        /// </summary>
        public TimeOnly BlackListedAtTime => TimeOnly.FromDateTime(BlackListedAt.UtcDateTime);
    }
}
