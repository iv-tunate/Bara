using Bara.API.Transactions.DTOs;
using Bara.API.Users.DTOs.AddressDTOs;
using Bara.API.Users.DTOs.ServiceDTOs;
using Bara.API.Users.Models;

namespace Bara.API.Users.DTOs.WriterDTOs
{
    /// <summary>
    /// Represents the details of a writer, including personal information,
    /// contact details, verification status, services offered, and account metadata.
    /// </summary>
    public class GetWriterDetailDTO
    {
        /// <summary>
        /// The unique identifier of the writer.
        /// </summary>
        public Guid Id { get; init; }

        /// <summary>
        /// The full display name of the writer.
        /// </summary>
        public string? Name { get; init; }

        /// <summary>
        /// The writer's first name.
        /// </summary>
        public string? FirstName { get; init; }

        /// <summary>
        /// The writer's last name.
        /// </summary>
        public string? LastName { get; init; }

        /// <summary>
        /// The writer's middle name, if provided.
        /// </summary>
        public string? MiddleName { get; init; }

        /// <summary>
        /// The writer's email address.
        /// </summary>
        public string? Email { get; init; }

        /// <summary>
        /// The writer's phone number.
        /// </summary>
        public string? PhoneNumber { get; init; }

        /// <summary>
        /// Represents the past or current project experiences of a writer.
        /// </summary>
        public List<BioExperience>? Experiences { get; init; }

        /// <summary>
        /// A brief biography or description provided by the user.
        /// </summary>
        public string Bio { get; set; } = string.Empty;

        /// <summary>
        /// Indicates whether the writer's email has been verified.
        /// </summary>
        public bool IsEmailVerified { get; init; }

        /// <summary>
        /// Indicates whether the writer is a premium member.
        /// </summary>
        public bool IsPremium { get; init; }

        /// <summary>
        /// The writer’s physical or contact address.
        /// </summary>
        public AddressDetail? Address { get; init; }

        /// <summary>
        /// Indicates whether the writer has completed the verification process.
        /// </summary>
        public bool IsVerified { get; set; }

        /// <summary>
        /// The current verification status of the writer (e.g., Pending, Approved, Rejected).
        /// </summary>
        public string VerificationStatus { get; set; }

        /// <summary>
        /// Indicates whether the writer has been blacklisted.
        /// </summary>
        public bool IsBlacklisted { get; init; }

        /// <summary>
        /// The role assigned to the writer (e.g., "Writer").
        /// </summary>
        public string Role { get; init; }

        /// <summary>
        /// A list of services the writer provides (e.g., editing, proofreading).
        /// </summary>
        public List<GetServiceDetailDTO>? Services { get; init; }

        /// <summary>
        /// The writer’s wallet details, including balance and currency.
        /// </summary>
        public GetWalletDetailDTO Wallet { get; init; }

        public DateOnly DateOfBirth { get; init; }

        /// <summary>
        /// The exact timestamp when the writer was created in the system.
        /// </summary>
        public DateTimeOffset CreatedAt { get; init; }

        /// <summary>
        /// The date component of the writer's creation timestamp.
        /// </summary>
        public DateOnly DateCreated { get; init; }

        /// <summary>
        /// The time component of the writer's creation timestamp.
        /// </summary>
        public TimeOnly TimeCreated { get; init; }

        /// <summary>
        /// The timestamp of the last modification to the writer's record.
        /// </summary>
        public DateTimeOffset? ModifiedAt { get; init; }

        /// <summary>
        /// The date component of the writer's last modification timestamp.
        /// </summary>
        public DateOnly? DateModified { get; init; }

        /// <summary>
        /// The time component of the writer's last modification timestamp.
        /// </summary>
        public TimeOnly? TimeModified { get; init; }

        public string ProfileImageUrl { get; init; }
        public string ProfileImagePublicId { get; init; }
        public string PortfolioUrl { get; set; }
    }
}
