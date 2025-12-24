using Bara.API.Scripts.Models;
using System.ComponentModel.DataAnnotations;


namespace Bara.API.Users.Models
{
    /// <summary>
    /// Defines a Writer user in the application, which is a specialized type of User that can create and manage scripts.
    /// </summary>
    public class Writer : User
    {
        public List<BioExperience>? Experiences { get; set; }
        public bool IsPremiumMember { get; set; }
        /// <summary>
        /// The list of services provided by the writer, such as script editing, proofreading, etc.
        /// </summary>
        public List<Service> Services { get; set; } = [];
        public List<Script> Scripts { get; set; } = [];
        //public List<ScriptWritingPostApplicant> Applications { get; set; } = [];
    }
}
