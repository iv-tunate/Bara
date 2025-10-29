using ScriptModule.Enums;
using SharedModule.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ScriptModule.Models
{
    /// <summary>
    /// Defines the script entity which contains all the metadata and publishing details of a script.
    /// </summary>
    public class Script : BaseEntity
    {
        /// <summary>
        /// The title of the script.
        /// </summary>
        [MaxLength(200)]
        public required string Title { get; set; }

        ///// <summary>
        ///// The genre of the script (e.g., Drama, Thriller, Comedy).
        ///// </summary>
        //[MaxLength(30)]
        //public required string Genre { get; set; }

        /// <summary>
        /// A compelling one-liner that pitches the story.
        /// </summary>
        public required string Logline { get; set; }

        /// <summary>
        /// A detailed overview or summary of the script's storyline.
        /// </summary>
        public required string Synopsis { get; set; }

        /// <summary>
        /// The listed price of the script for purchase.
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public required decimal Price { get; set; }

        /// <summary>
        /// The internal storage path to the script file.
        /// </summary>
        public required string Path { get; set; }

        /// <summary>
        /// The publicly accessible URL to the script file.
        /// </summary>
        public required string Url { get; set; }

        /// <summary>
        /// The timestamp indicating when the script was uploaded.
        /// </summary>
        public DateTimeOffset UploadedOn { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// The date component of the upload timestamp.
        /// </summary>
        public DateOnly UploadedDate => DateOnly.FromDateTime(UploadedOn.UtcDateTime);

        /// <summary>
        /// The time component of the upload timestamp.
        /// </summary>
        public TimeOnly UploadedTime => TimeOnly.FromDateTime(UploadedOn.UtcDateTime);

        /// <summary>
        /// The currency in which the script is priced.
        /// </summary>
        public Currency Currency { get; set; } = Currency.NAIRA;

        /// <summary>
        /// Gets the symbol for the current currency.
        /// </summary>
        public string CurrencySymbol => Currency switch
        {
            Currency.NAIRA => "₦",
            Currency.USD => "$",
            Currency.EUR => "€",
            Currency.GBP => "£",
            _ => "₦"
        };

        /// <summary>
        /// Indicates whether the script has been officially registered with a legal body.
        /// </summary>
        public bool IsScriptRegistered { get; set; }

        /// <summary>
        /// The name of the organization with which the script is registered.
        /// </summary>
        public string? RegistrationBody { get; set; }

        /// <summary>
        /// The URL or filename of the script's cover image or poster.
        /// </summary>
        [DataType(DataType.ImageUrl)]
        public string? Image { get; set; }

        /// <summary>
        /// The copyright number associated with the script.
        /// </summary>
        public string? CopyrightNumber { get; set; }

        /// <summary>
        /// The type of IP ownership rights associated with the script (e.g., Exclusive, Shared).
        /// </summary>
        public IPDealType? OwnershipRights { get; set; }

        /// <summary>
        /// A URL to the proof document for copyright or ownership.
        /// </summary>
        public string? ProofUrl { get; set; }

        /// <summary>
        /// The foreign key that links the script to its writer.
        /// </summary>
        [ForeignKey("Writer")]
        public Guid? WriterId { get; set; }

        /// <summary>
        /// The full name of the writer who owns the script.
        /// </summary>
        public required string WriterName { get; set; }

        /// <summary>
        /// The current availability status of the script.
        /// </summary>
        public ScriptStatus Status { get; set; } = ScriptStatus.Available;
        /// <summary>
        /// 
        /// </summary>
        public List<Genre> Genres { get; set; }
    }
}
