namespace Services.FileStorageServices
{
    public class UploadResult
    {
        public bool Success { get; set; }
        public string Url { get; set; }
        public string PublicId { get; set; }
    }
}
