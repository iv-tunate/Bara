using SharedModule.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Users.Models
{
    /// <summary>
    /// Defines the address of entities within the application
    /// </summary>
    public class Address : BaseEntity
    {
        //[Key]
        //public Guid Id { get; set; }
        [DataType(DataType.Text)]
        public required string Street { get; set; } = string.Empty;
        public required string City { get; set; } = string.Empty;
        public required string State { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        [DataType(DataType.PostalCode)]
        public string? PostalCode { get; set; }
        public string AdditionalDetails { get; set; } = "";
        public string? ProofOfAddressDocument { get; set; }
        [ForeignKey("User")]
        public Guid UserId { get; set; } = Guid.Empty;
    }
}
