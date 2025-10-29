using Microsoft.AspNetCore.Http;
using ScriptModule.Enums;
using ScriptModule.Models;

namespace ScriptModule.DTOs
{
    /// <summary>
    /// Represents the details required to post or upload a script.
    /// </summary>
    public class PostScriptDetailDTO
    {
        /// <summary>
        /// The title of the script.
        /// </summary>
        public required string Title { get; set; }

        /// <summary>
        /// The genre of the script (e.g., drama, thriller, comedy).
        /// </summary>
        public required List<Genre> Genre { get; set; }

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
        /// Indicates whether the script has been officially registered (e.g., with WGA or a copyright office).
        /// </summary>
        public bool IsScriptRegistered { get; set; }

        /// <summary>
        /// The name of the organization or body where the script was registered, if applicable.
        /// </summary>
        public string? RegistrationBody { get; set; }

        /// <summary>
        /// The actual script file to be uploaded (PDF, DOCX, etc.).
        /// </summary>
        public required IFormFile File { get; set; }

        /// <summary>
        /// A URL or base64 representation of the cover image or thumbnail for the script.
        /// </summary>
        public string? Image { get; set; }

        /// <summary>
        /// The copyright number or certificate ID, if available.
        /// </summary>
        public string? CopyrightNumber { get; set; }

        /// <summary>
        /// The ownership or IP deal arrangement selected for this script (e.g., Exclusive, Shared).
        /// </summary>
        public IPDealType? OwnershipRights { get; set; }

        /// <summary>
        /// A URL pointing to a document or image that proves IP ownership or copyright.
        /// </summary>
        public string? ProofUrl { get; set; }
    }
}
