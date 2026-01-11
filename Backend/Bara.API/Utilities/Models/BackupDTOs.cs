
namespace Bara.API.Utilities.Models
{
    public class BackendBackupResponseDTO
    {
        public Guid Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public string FileName { get; set; }
        public long FileSize { get; set; }
        public string FileUrl { get; set; }
        public string TriggeredBy { get; set; }
    }
}
