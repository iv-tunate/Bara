using ScriptModule.Models;
using System.ComponentModel.DataAnnotations;


namespace UserModule.Models
{
    /// <summary>
    /// Defines a Writer user in the application, which is a specialized type of User that can create and manage scripts.
    /// </summary>
    public class Writer : User
    {
        /// <summary>
        /// A brief biography or description provided by the user.
        /// </summary>
        [DataType(DataType.Text), MaxLength(200)]
        public string Bio { get; set; } = string.Empty;
        public List<BioExperience> Experiences { get; set; }
        public bool IsPremiumMember { get; set; }
        /// <summary>
        /// The list of services provided by the writer, such as script editing, proofreading, etc.
        /// </summary>
        public List<Service> Services { get; set; } = [];
        public List<Script> Scripts { get; set; } = [];
        //public List<ScriptWritingPostApplicant> Applicarions { get; set; } = [];
    }
}
