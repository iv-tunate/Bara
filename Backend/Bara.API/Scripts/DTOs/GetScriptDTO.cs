namespace Bara.API.Scripts.DTOs
{
    /// <summary>
    /// Represents the details of a script file retrieved from the system.
    /// </summary>
    public class GetScriptDTO
    {
        /// <summary>
        /// The name or filename of the script (e.g., "MyScript.pdf").
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The MIME type of the file (e.g., "application/pdf", "text/plain").
        /// </summary>
        public string ContentType { get; set; }

        /// <summary>
        /// The byte array representing the file content of the script.
        /// Can be returned for direct download or preview purposes.
        /// </summary>
        public byte[] File { get; set; }
    }

}
