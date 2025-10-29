namespace Bara.API.Scripts.Models
{
    public class ScriptGenre
    {
        public Guid ScriptId { get; set; }
        public Guid GenreId { get; set; }
        public Script Script { get; set; }
        public Genre Genre { get; set; }
    }
}
