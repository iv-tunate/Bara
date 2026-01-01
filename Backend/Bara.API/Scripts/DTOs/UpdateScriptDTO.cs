using Bara.API.Scripts.Enums;

namespace Bara.API.Scripts.DTOs
{
    /// <summary>
    /// Represents the details required to update an existing script.
    /// Excludes file uploads (script PDF and cover image).
    /// </summary>
    public class UpdateScriptDTO
    {
        /// <summary>
        /// The title of the script.
        /// </summary>
        public required string Title { get; set; }

        /// <summary>
        /// The genre IDs of the script.
        /// </summary>
        public required List<Guid> GenreId { get; set; }

        /// <summary>
        /// A one-sentence summary or hook of the script.
        /// </summary>
        public required string Logline { get; set; }

        /// <summary>
        /// A detailed summary or outline of the script's plot.
        /// </summary>
        public required string Synopsis { get; set; }

        /// <summary>
        /// The selling price of the script.
        /// </summary>
        public required decimal Price { get; set; }

        /// <summary>
        /// The currency in which the script is priced.
        /// </summary>
        public Currency Currency { get; set; }

        /// <summary>
        /// Indicates whether the script has been officially registered.
        /// </summary>
        public bool IsScriptRegistered { get; set; }

        /// <summary>
        /// The name of the organization or body where the script was registered, if applicable.
        /// </summary>
        public string? RegistrationBody { get; set; }

        /// <summary>
        /// The copyright number or certificate ID, if available.
        /// </summary>
        public string? CopyrightNumber { get; set; }

        /// <summary>
        /// The ownership or IP deal arrangement selected for this script.
        /// </summary>
        public IPDealType? OwnershipRights { get; set; }

        /// <summary>
        /// A URL pointing to a document or image that proves IP ownership or copyright.
        /// </summary>
        public string? ProofUrl { get; set; }

        /// <summary>
        /// The current availability status of the script.
        /// </summary>
        public ScriptStatus? Status { get; set; }
    }
}
