namespace Bara.API.Utilities.Models
{
    public class DatabaseBackup
    {
        public Guid Id { get; set; }
        public string FileName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public long FileSize { get; set; }
        public string? FileUrl { get; set; } 
        public string Status { get; set; }
        public string TriggeredBy { get; set; }
    }
}
