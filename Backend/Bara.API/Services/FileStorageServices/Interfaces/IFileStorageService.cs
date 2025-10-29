using Microsoft.AspNetCore.Http;

namespace Services.FileStorageServices.Interfaces
{
    /// <summary>
    /// Defines the contract for file storage operations, including upload, download, and deletion.
    /// </summary>
    public interface IFileStorageService
    {
        /// <summary>
        /// Uploads a user document (e.g., ID card, proof of address) to a designated directory.
        /// </summary>
        /// <param name="userDirectoryName">The unique folder name for the user.</param>
        /// <param name="file">The document to be uploaded.</param>
        /// <returns>An upload result containting the success status, file url and public id</returns>
        Task<UploadResult> UploadDocumentAsync(string userDirectoryName, IFormFile file);

        /// <summary>
        /// Uploads a script (e.g., screenplay, draft) to a designated directory.
        /// </summary>
        /// <param name="userDirectoryName">The unique folder name for the user.</param>
        /// <param name="file">The script file to be uploaded.</param>
        /// <returns>An upload result containting the success status, file url and public id</returns>
        Task<UploadResult> UploadScriptAsync(string userDirectoryName, IFormFile file);

        /// <summary>
        /// Downloads a file from the specified storage path.
        /// </summary>
        /// <param name="publicId">The public id of file.</param>
        /// <returns>A tuple containing the file stream and its content type.</returns>
        Task<(MemoryStream stream, string contentType)> DownloadAsync(string publicId);

        /// <summary>
        /// Deletes a file from the specified storage path.
        /// </summary>
        /// <param name="publicId">The public id of file.</param>
        /// <returns>True if deletion is successful; otherwise, false.</returns>
        Task<bool> DeleteAsync(string publicId);
    }
}
