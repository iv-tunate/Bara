using SharedModule.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserModule.Models
{
    /// <summary>
    /// Defines the authentication profile of a user, including credentials, login history, and verification status.
    /// </summary>
    public class AuthProfile : BaseEntity
    {
        /// <summary>
        /// The user's full name as displayed in the system.
        /// </summary>
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// The user's email address used for login and communication.
        /// </summary>
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }

        /// <summary>
        /// The hashed password of the user.
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// Indicates whether the user account is currently locked.
        /// </summary>
        public bool IsLocked { get; set; }

        /// <summary>
        /// Indicates whether the user has completed full account verification (e.g., identity documents).
        /// </summary>
        public bool IsVerified { get; set; }

        /// <summary>
        /// Indicates whether the user's email address has been verified.
        /// </summary>
        public bool IsEmailVerified { get; set; }

        public bool IsProfileSetupComplete { get; set; }

        /// <summary>
        /// The most recent device used to log in to the account.
        /// </summary>
        public string LastLoginDevice { get; set; } = string.Empty;

        /// <summary>
        /// The most recent IP address used during login.
        /// </summary>
        public string LastLoginIPAddress { get; set; } = string.Empty;

        /// <summary>
        /// The number of failed login attempts.
        /// Used to track brute-force or abuse activity.
        /// </summary>
        public int LoginAttempts { get; set; }

        /// <summary>
        /// The role assigned to the user (e.g., Writer, Producer, Admin).
        /// </summary>
        public string Role { get; set; } = string.Empty;

        /// <summary>
        /// The date and time (in UTC) of the user's last successful login.
        /// </summary>
        public DateTimeOffset? LastLoginAt { get; set; }

        /// <summary>
        /// The date (UTC) of the user's last login attempt.
        /// </summary>
        public DateOnly? LastLoginDate => LastLoginAt.HasValue ? DateOnly.FromDateTime(LastLoginAt.Value.UtcDateTime) : null;

        /// <summary>
        /// The time (UTC) of the user's last login attempt.
        /// </summary>
        public TimeOnly? LastLoginTime => LastLoginAt.HasValue ? TimeOnly.FromDateTime(LastLoginAt.Value.UtcDateTime) : null;

        /// <summary>
        /// The date and time (in UTC) of the user's last logout.
        /// </summary>
        public DateTimeOffset? LastLogoutAt { get; set; }

        /// <summary>
        /// The date (UTC) of the user's last logout.
        /// </summary>
        public DateOnly? LastLogoutDate => LastLogoutAt.HasValue ? DateOnly.FromDateTime(LastLogoutAt.Value.UtcDateTime) : null;

        /// <summary>
        /// The time (UTC) of the user's last logout.
        /// </summary>
        public TimeOnly? LastLogoutTime => LastLogoutAt.HasValue ? TimeOnly.FromDateTime(LastLogoutAt.Value.UtcDateTime) : null;

        /// <summary>
        /// Foreign key linking this authentication profile to the main user record.
        /// </summary>
        [ForeignKey(nameof(User))]
        public Guid UserId { get; set; }
    }
}
