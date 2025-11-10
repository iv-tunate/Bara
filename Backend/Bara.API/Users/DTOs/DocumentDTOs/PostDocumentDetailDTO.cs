using Bara.API.Users.Enums;

namespace Bara.API.Users.DTOs.DocumentDTOs
{
    /// <summary>
    /// Represents the details required to upload a verification document during user registration or verification.
    /// </summary>
    public record class PostDocumentDetailDTO
    {
        /// <summary>
        /// The type of document provided for verification (e.g., National ID, Driver's License, Passport).
        /// </summary>
        public required DocumentType Type { get; init; }

        /// <summary>
        /// The identification number associated with the document (e.g., NIN, Passport Number).
        /// </summary>
        public required string VerificationNumber { get; init; }

        /// <summary>
        /// The uploaded document file to be verified. This must be a valid IFormFile (e.g., PDF, PNG, JPG).
        /// </summary>
        public required IFormFile Document { get; init; }
    }

}
