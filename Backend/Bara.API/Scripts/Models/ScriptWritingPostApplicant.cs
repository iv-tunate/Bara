using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Scripts.Models
{
    public class ScriptWritingPostApplicant
    {
        public Guid WriterId { get; set; }
        public required string WriterName { get; set; } = string.Empty;
        public DateTimeOffset AppliedAt { get; set; } = DateTime.UtcNow;
        public DateOnly AppliedDate => DateOnly.FromDateTime(AppliedAt.UtcDateTime);
        public TimeOnly AppliedTime => TimeOnly.FromDateTime(AppliedAt.UtcDateTime);
        [ForeignKey(nameof(ScriptWritingPost))]
        public Guid ScriptWritingPostByProducerId { get; set; }
        public ScriptWritingPostByProducer? ScriptWritingPost { get; set; }
    }
}
