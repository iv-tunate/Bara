using Bara.API.Scripts.Enums;
using SharedModule.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Scripts.Models
{
    public class ScriptWritingPostByProducer : BaseEntity
    {
        public Guid ProducerId { get; set; }
        public required string ProjectTitle { get; set; }
        public required string Premise { get; set; }
        /// <summary>
        /// Represents the genres of the script writing post.
        /// </summary>
        public required List<string> Genres { get; set; } = [];
        /// <summary>
        /// Duration in days for which the script is expected to be delivered.
        /// </summary>
        public int DurationInDays { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public required decimal MinBudget { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxBudget { get; set; }
        public PaymentType PaymentType { get; set; }
        public bool IsOpen { get; set; } = true;
        public IPDealType? IPArrangement { get; set; }

        /// <summary>
        /// If the IP is shared, this defines the percentage share for the producer.
        /// The writer gets (100 - ProducerSharePercentage)%.
        /// Only applicable if IPArrangement == SharedRights.
        /// </summary>
        [Range(1, 99)]
        public int ProducerSharePercentage { get; set; }
        /// <summary>
        /// List of writers who have applied for this post... 
        /// </summary>
        public List<ScriptWritingPostApplicant> Applicants { get; set; } = [];
    }
}
