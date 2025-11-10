namespace Bara.API.Scripts.DTOs
{
    /// <summary>
    /// Represents detailed information about a script, including metadata and author details.
    /// </summary>
    public class GetScriptDetailDTO
    {
        /// <summary>
        /// The unique identifier of the script.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// The title of the script.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// The genre of the script (e.g., Drama, Comedy, Sci-Fi).
        /// </summary>
        public string Genre { get; set; }

        /// <summary>
        /// A brief and catchy one-liner summarizing the story.
        /// </summary>
        public string Logline { get; set; }

        /// <summary>
        /// A short synopsis or overview of the script's storyline.
        /// </summary>
        public string Synopsis { get; set; }

        /// <summary>
        /// The price set for purchasing the script.
        /// </summary>
        public decimal Price { get; set; }

        /// <summary>
        /// Indicates whether the script is registered (e.g., "Registered", "Not Registered").
        /// </summary>
        public string ScriptRegistrationStatus { get; set; }

        /// <summary>
        /// The name of the organization or agency where the script is registered.
        /// </summary>
        public string RegistrationBody { get; set; }

        /// <summary>
        /// The URL or file name of the cover image associated with the script.
        /// </summary>
        public string Image { get; set; }

        /// <summary>
        /// The copyright registration number of the script.
        /// </summary>
        public string CopyrightNumber { get; set; }

        /// <summary>
        /// The ownership right type for the script (e.g., "Exclusive", "Shared").
        /// </summary>
        public string OwnershipRight { get; set; }

        /// <summary>
        /// The current status of the script in the system (e.g., "Published", "Draft").
        /// </summary>
        public string ScriptStatus { get; set; }

        /// <summary>
        /// The unique identifier of the writer who owns the script.
        /// </summary>
        public string Writer { get; set; }

        /// <summary>
        /// The full name of the writer who owns the script.
        /// </summary>
        public string WriterName { get; set; }

        /// <summary>
        /// The internal file path of the script document.
        /// </summary>
        public string Path { get; set; }

        /// <summary>
        /// The public-facing URL to download or view the script.
        /// </summary>
        public string Url { get; set; }
    }
}
