using Bara.API.Users.Enums;
using SharedModule.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Users.Models
{
    /// <summary>
    /// Represents a verification document submitted by a user to verify their identity.
    /// </summary>
    public class Document : BaseEntity
    {
        /// <summary>
        /// The identification number shown on the document (e.g., NIN, BVN, Passport Number).
        /// </summary>
        public required string IdentificationNumber { get; set; }

        /// <summary>
        /// The type of document provided for verification (e.g., National ID, Passport).
        /// </summary>
        public required DocumentType DocumentType { get; set; }

        /// <summary>
        /// Indicates whether the document has been verified by the platform or a third party.
        /// </summary>
        public bool IsVerified { get; set; }

        /// <summary>
        /// The accessible URL to the uploaded document file.
        /// This may be null if the document hasn't been uploaded yet.
        /// </summary>
        [DataType(DataType.Upload)]
        public string? DocumentUrl { get; set; }

        /// <summary>
        /// The original file name of the document uploaded by the user.
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// The internal or CDN path where the document is stored.
        /// Used by the system to retrieve or serve the document securely.
        /// </summary>
        [DataType(DataType.Url)]
        public required string Path { get; set; }

        /// <summary>
        /// The file extension of the uploaded document (e.g., .pdf, .png).
        /// </summary>
        public string? FileExtension { get; set; }

        /// <summary>
        /// The size of the uploaded file in bytes.
        /// </summary>
        public long Size { get; set; }
        [ForeignKey("User")]
        public required Guid UserId { get; set; } = Guid.Empty;
    }
}
