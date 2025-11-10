using Bara.API.Users.DTOs.AddressDTOs;
using Bara.API.Users.DTOs.DocumentDTOs;
using Bara.API.Users.DTOs.ServiceDTOs;
using Bara.API.Users.Enums;

namespace Bara.API.Users.DTOs.WriterDTOs
{
    /// <summary>
    /// Represents the details required to register a new writer in the system.
    /// </summary>
    public record class PostWriterDetailDTO
    {
        /// <summary>
        /// The writer's first name.
        /// </summary>
        public required string FirstName { get; init; }

        /// <summary>
        /// The writer's last name.
        /// </summary>
        public required string LastName { get; init; }

        /// <summary>
        /// The writer's middle name, if available.
        /// </summary>
        public string MiddleName { get; init; }

        /// <summary>
        /// The writer's phone number, including country code.
        /// </summary>
        public required string PhoneNumber { get; init; }

        /// <summary>
        /// The gender of the writer.
        /// </summary>
        public required Gender Gender { get; init; }
        /// <summary>
        /// A brief biography or description provided by the user.
        /// </summary>
        public string Bio { get; set; } = string.Empty;

        /// <summary>
        /// The writer's date of birth.
        /// </summary>
        public required DateOnly DateOfBirth { get; init; }

        /// <summary>
        /// Indicates whether the writer is a premium member.
        /// </summary>
        public bool IsPremiumMember { get; init; } = false;

        /// <summary>
        /// The address details of the writer.
        /// </summary>
        public AddressDetail AddressDetail { get; init; }

        /// <summary>
        /// Represents the experiences of a writer including their bio description, projects, organization, etc.
        /// </summary>
        public List<BioExperienceDTO>? Experiences { get; init; }

        /// <summary>
        /// The verification document submitted by the writer for identity confirmation.
        /// </summary>
        public required PostDocumentDetailDTO VerificationDocument { get; init; }

        /// <summary>
        /// The list of services the writer wants to offer on registration (e.g., editing, proofreading).
        /// </summary>
        public List<PostServiceDetailDTO>? PostServiceDetail { get; init; }

        public string ProfileImageUrl { get; init; }
        public string ProfileImagePublicId { get; init; }
        public string PortfolioUrl { get; set; }
    }
}
