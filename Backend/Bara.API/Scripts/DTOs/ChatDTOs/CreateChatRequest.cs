namespace Bara.API.Scripts.DTOs.ChatDTOs
{
    public class CreateChatRequest
    {
        public Guid ScriptId { get; set; }
        public Guid ProducerId { get; set; }
        public Guid WriterId { get; set; }
        public string ScriptTitle { get; set; }
        public string ProducerName { get; set; }
        public string WriterName { get; set; }
    }
}