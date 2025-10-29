namespace Services.FileStorageServices
{
    /// <summary>
    /// Represents details about a stored file.
    /// </summary>
    public record FileDetailResponse
    {
        /// <summary>
        /// The name of the file (including extension).
        /// </summary>
        public string Name { get; init; }

        /// <summary>
        /// The relative path to the file in the storage system.
        /// </summary>
        public string Path { get; init; }

        /// <summary>
        /// The public or accessible URL to the file.
        /// </summary>
        public string Url { get; init; }

        /// <summary>
        /// The file extension (e.g., .pdf, .docx, .jpg).
        /// </summary>
        public string FilExtension { get; init; }
    }

    /// <summary>
    /// Represents a paginated response of folders retrieved from a file storage provider.
    /// </summary>
    public class FolderResponse
    {
        /// <summary>
        /// The list of folders retrieved.
        /// </summary>
        public List<Folder> Folders { get; set; }

        /// <summary>
        /// The cursor to fetch the next set of results, if pagination is supported.
        /// </summary>
        public string? NextCursor { get; set; }

        /// <summary>
        /// The total number of folders available.
        /// </summary>
        public int TotalCount { get; set; }
    }

    /// <summary>
    /// Represents a single folder within a file storage system.
    /// </summary>
    public class Folder
    {
        /// <summary>
        /// The name of the folder.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The path to the folder in the storage hierarchy.
        /// </summary>
        public string Path { get; set; }

        /// <summary>
        /// The external identifier assigned to the folder by the storage provider (e.g., Cloudinary folder ID).
        /// </summary>
        public string ExternalId { get; set; }
    }
}
