using Newtonsoft.Json;

namespace Bara.API.Scripts.Models
{
    public class Genre
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        [JsonIgnore]
        public List<Script> Scripts { get; set; }
    }
}
