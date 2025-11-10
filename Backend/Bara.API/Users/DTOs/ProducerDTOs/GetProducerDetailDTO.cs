using Bara.API.Transactions.DTOs;
using Bara.API.Users.DTOs.AddressDTOs;
using Bara.API.Users.Enums;

namespace Bara.API.Users.DTOs.ProducerDTOs
{
    /// <summary>
    /// Represents the detailed profile information of a producer user in the system.
    /// </summary>
    public record GetProducerDetailDTO
    {
        /// <summary>
        /// The unique identifier of the producer.
        /// </summary>
        public Guid Id { get; init; }

        /// <summary>
        /// The full name of the producer (e.g., FirstName + MiddleName + LastName).
        /// </summary>
        public string Name { get; init; } = default!;

        /// <summary>
        /// The first name of the producer.
        /// </summary>
        public string FirstName { get; init; } = default!;

        /// <summary>
        /// The last name (surname) of the producer.
        /// </summary>
        public string LastName { get; init; } = default!;

        /// <summary>
        /// The middle name of the producer, if available.
        /// </summary>
        public string MiddleName { get; init; } = default!;

        public string ProfileImageUrl { get; init; }
        public string ProfileImagePublicId { get; init; }
        public string PortfolioUrl { get; set; }
        /// <summary>
        /// The email address of the producer.
        /// </summary>
        public string Email { get; init; } = default!;

        /// <summary>
        /// The phone number of the producer.
        /// </summary>
        public string PhoneNumber { get; init; } = default!;

        /// <summary>
        /// Indicates whether the producer's email has been verified.
        /// </summary>
        public bool IsEmailVerified { get; init; }

        /// <summary>
        /// The address information associated with the producer.
        /// </summary>
        public AddressDetail? Address { get; init; }

        /// <summary>
        /// Indicates whether the producer has been verified by the system.
        /// </summary>
        public bool IsVerified { get; init; }

        /// <summary>
        /// The current verification status of the producer (e.g., Pending, Approved, Rejected).
        /// </summary>
        public VerificationStatus VerificationStatus { get; init; }

        /// <summary>
        /// Indicates whether the producer has been blacklisted.
        /// </summary>
        public bool IsBlacklisted { get; init; }

        /// <summary>
        /// The system-defined role of the user (e.g., "Producer").
        /// </summary>
        public string Role { get; init; }

        /// <summary>
        /// A short biography or description provided by the producer.
        /// </summary>
        public string Bio { get; init; }

        /// <summary>
        /// The producer's wallet information including balance and currency.
        /// </summary>
        public GetWalletDetailDTO Wallet { get; init; }

        public DateOnly DateOfBirth { get; init; }

        /// <summary>
        /// The full timestamp when the producer's profile was created.
        /// </summary>
        public DateTimeOffset CreatedAt { get; init; }

        /// <summary>
        /// The date part of the creation timestamp.
        /// </summary>
        public DateOnly DateCreated { get; init; }

        /// <summary>
        /// The time part of the creation timestamp.
        /// </summary>
        public TimeOnly TimeCreated { get; init; }

        /// <summary>
        /// The full timestamp when the producer's profile was last modified, if applicable.
        /// </summary>
        public DateTimeOffset? ModifiedAt { get; init; }

        /// <summary>
        /// The date part of the last modification timestamp.
        /// </summary>
        public DateOnly? DateModified { get; init; }

        /// <summary>
        /// The time part of the last modification timestamp.
        /// </summary>
        public TimeOnly? TimeModified { get; init; }
    }
}
