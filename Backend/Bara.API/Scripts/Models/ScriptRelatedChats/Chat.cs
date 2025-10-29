using SharedModule.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Scripts.Models.ScriptRelatedChats
{
    public class Chat : BaseEntity
    {
        /// <summary>
        /// Gets or sets the ID of the script involved in the transaction.
        /// </summary>
        [ForeignKey("Script")]
        public Guid ScriptId { get; set; }

        /// <summary>
        /// Gets or sets the title of the script at the time of the transaction.
        /// Stored as denormalized data for quick access.
        /// </summary>
        public string ScriptTitle { get; set; }

        /// <summary>
        /// Gets or sets the ID of the producer who is purchasing the script.
        /// </summary>
        [ForeignKey("Producer")]
        public Guid ProducerId { get; set; }

        /// <summary>
        /// Gets or sets the display name of the producer at the time of the transaction.
        /// Stored as denormalized data for consistency in historical records.
        /// </summary>
        public string ProducerName { get; set; }

        /// <summary>
        /// Gets or sets the ID of the writer who authored the script.
        /// </summary>
        [ForeignKey("Writer")]
        public Guid WriterId { get; set; }

        /// <summary>
        /// Gets or sets the display name of the writer at the time of the transaction.
        /// Stored as denormalized data for consistency in historical records.
        /// </summary>
        public string WriterName { get; set; }

        /// <summary>
        /// Collection of messages exchanged in the chat.
        /// </summary>
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();

        /// <summary>
        /// Marks if the chat has been closed (e.g. after delivery).
        /// </summary>
        public bool IsClosed { get; set; } = false;

    }
}
