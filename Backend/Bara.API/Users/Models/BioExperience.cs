using SharedModule.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Users.Models
{
    public class BioExperience : BaseEntity
    {
        [ForeignKey(nameof(Writer))]
        public Guid WriterId { get; set; }
        public Writer Writer { get; set; }
        public required string Description { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public string Project { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public bool IsCurrent { get; set; } = false;
    }
}
