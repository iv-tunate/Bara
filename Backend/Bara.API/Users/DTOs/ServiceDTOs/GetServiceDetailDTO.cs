using Bara.API.Scripts.Enums;
using Bara.API.Utilities.Models;

namespace Bara.API.Users.DTOs.ServiceDTOs
{
    /// <summary>
    /// Represents the details of a service offered by a writer in the application.
    /// </summary>
    public class GetServiceDetailDTO
    {
        /// <summary>
        /// The unique identifier for the service.
        /// </summary>
        public Guid Id { get; init; }

        /// <summary>
        /// The name or title of the service.
        /// </summary>
        public string? Name { get; init; }

        /// <summary>
        /// A brief description of the service being offered.
        /// </summary>
        public string? Description { get; init; }

        /// <summary>
        /// The minimum price charged for the service.
        /// </summary>
        public decimal MinPrice { get; init; }

        /// <summary>
        /// The maximum price charged for the service.
        /// </summary>
        public decimal MaxPrice { get; init; }

        /// <summary>
        /// The currency type for the pricing (e.g., Naira, USD).
        /// </summary>
        public Currency Currency { get; init; }

        /// <summary>
        /// The symbol representing the selected currency (e.g., ₦, $, €).
        /// </summary>
        public string? CurrencySymbol { get; init; }

        /// <summary>
        /// The type of intellectual property (IP) arrangement for the service.
        /// </summary>
        public IPDealType IPDealType { get; init; }

        /// <summary>
        /// The percentage of shared rights allocated to the producer (only applies if IP is shared).
        /// </summary>
        public int SharePercentage { get; init; }

        /// <summary>
        /// The type of payment model applied to the service.
        /// </summary>
        public PaymentType PaymentType { get; init; }

        /// <summary>
        /// A list of genres the service applies to (e.g., Drama, Comedy, Thriller).
        /// </summary>
        public List<string>? Genre { get; init; }
    }
}
