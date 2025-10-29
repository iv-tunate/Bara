using SharedModule.Utils;
using UserModule.DTOs.DocumentDTOs;
using UserModule.Models;

namespace Services.FileStorageServices.Interfaces
{
    /// <summary>
    /// Defines the contract for processing and handling document uploads for users.
    /// </summary>
    public interface IFileService
    {
        /// <summary>
        /// Processes and uploads a user's verification document to storage.
        /// </summary>
        /// <param name="userId">The unique identifier of the user</param>
        /// <param name="userDirectoryName">The base directory or folder name assigned to the user.</param>
        /// <param name="documentDetail">The document details including file, metadata, and type.</param>
        /// <returns>A <see cref="ResponseDetail{Document}"/> containing the document.</returns>
        Task<ResponseDetail<Document>> ProcessDocumentForUpload(Guid userId, string userDirectoryName, PostDocumentDetailDTO documentDetail);
    }
}
