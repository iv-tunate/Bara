using Bara.API.Scripts.Enums;
using Bara.API.Utilities.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Users.Models
{
    /// <summary>
    /// Represents a service offered by a writer, such as script editing, proofreading, or ghostwriting.
    /// Each service includes pricing, genre, intellectual property terms, and more.
    /// </summary>
    public class Service : BaseEntity
    {
        /// <summary>
        /// The name of the service (e.g., "Script Proofreading").
        /// </summary>
        [DataType(DataType.Text), MaxLength(60)]
        public required string Name { get; set; }

        /// <summary>
        /// A short description of what the service entails.
        /// </summary>
        [DataType(DataType.Text), MaxLength(200)]
        public required string Description { get; set; }

        /// <summary>
        /// The minimum price the writer is willing to accept for this service.
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public required decimal MinPrice { get; set; }

        /// <summary>
        /// The maximum price the writer is willing to accept for this service.
        /// Useful for flexible negotiations or premium scopes.
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxPrice { get; set; }

        /// <summary>
        /// The currency in which the service is priced.
        /// Defaults to Naira.
        /// </summary>
        public Currency Currency { get; set; } = Currency.NAIRA;

        /// <summary>
        /// Returns the symbol corresponding to the selected currency.
        /// For display purposes in UI or documentation.
        /// </summary>
        public string CurrencySymbol => Currency switch
        {
            Currency.NAIRA => "₦",
            Currency.USD => "$",
            Currency.EUR => "€",
            Currency.GBP => "£",
            _ => "₦"
        };

        /// <summary>
        /// Specifies the intellectual property arrangement for the service.
        /// Determines whether full rights or shared rights are assigned to the producer.
        /// </summary>
        public IPDealType IPDealType { get; set; }

        /// <summary>
        /// The percentage of intellectual property rights shared with the producer.
        /// Applicable only if <see cref="IPDealType"/> is set to <c>SharedRights</c>.
        /// The writer retains (100 - SharePercentage)% of rights.
        /// </summary>
        [Range(1, 99)]
        public int SharePercentage { get; set; }

        /// <summary>
        /// The type of payment arrangement for this service (e.g., Full upfront, Milestone-based).
        /// </summary>
        public PaymentType PaymentType { get; set; }

        /// <summary>
        /// A list of genres this service applies to (e.g., Drama, Thriller, Comedy).
        /// </summary>
        public List<string> Genre { get; set; } = [];

        /// <summary>
        /// Foreign key referencing the writer who offers this service.
        /// </summary>
        [ForeignKey(nameof(Writer))]
        public Guid WriterId { get; set; }

        /// <summary>
        /// Navigation property to the writer offering this service.
        /// </summary>
        public Writer? Writer { get; set; }
    }
}
