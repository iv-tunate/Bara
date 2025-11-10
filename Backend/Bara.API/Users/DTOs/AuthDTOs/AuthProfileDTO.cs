namespace Bara.API.Users.DTOs.AuthDTOs
{
    /// <summary>
    /// Represents authentication-related profile metadata for a user.
    /// </summary>
    public class AuthProfileDTO
    {
        /// <summary>
        /// Indicates whether the user's account is currently locked due to too many failed login attempts or administrative action.
        /// </summary>
        public bool IsLocked { get; set; }

        /// <summary>
        /// Indicates whether the user's account has been marked as deleted or deactivated.
        /// </summary>
        public bool IsDeleted { get; set; }

        /// <summary>
        /// Indicates whether the user's identity has been fully verified (e.g., via documents or other means).
        /// </summary>
        public bool IsVerified { get; set; }

        /// <summary>
        /// Indicates whether the user's email address has been verified.
        /// </summary>
        public bool IsEmailVerified { get; set; }

        /// <summary>
        /// Describes the last device used to log into the system (e.g., browser or OS details).
        /// </summary>
        public string LastLoginDevice { get; set; } = string.Empty;

        /// <summary>
        /// The number of failed login attempts made by the user.
        /// </summary>
        public int LoginAttempts { get; set; }

        /// <summary>
        /// The role assigned to the user (e.g., Writer, Producer, Admin).
        /// </summary>
        public string Role { get; set; }

        /// <summary>
        /// Timestamp of the last login event.
        /// </summary>
        public DateTimeOffset LastLoginAt { get; set; }

        /// <summary>
        /// The date portion of the last login time.
        /// </summary>
        public DateOnly LastLoginDate { get; set; }

        /// <summary>
        /// The time portion of the last login time.
        /// </summary>
        public TimeOnly LastLoginTime { get; set; }

        /// <summary>
        /// Timestamp of the last logout event.
        /// </summary>
        public DateTimeOffset LastLogoutAt { get; set; }

        /// <summary>
        /// The date portion of the last logout time.
        /// </summary>
        public DateOnly LastLogoutDate { get; set; }

        /// <summary>
        /// The time portion of the last logout time.
        /// </summary>
        public TimeOnly LastLogoutTime { get; set; }
    }
}
