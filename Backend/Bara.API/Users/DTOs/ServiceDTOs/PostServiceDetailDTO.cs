using SharedModule.Models;

namespace Bara.API.Users.DTOs.ServiceDTOs
{
    /// <summary>
    /// Represents the details required to create or update a service offered by a user, 
    /// such as a writer or producer.
    /// </summary>
    public record PostServiceDetailDTO
    {
        /// <summary>
        /// The name or title of the service (e.g., Script Writing, Proofreading).
        /// </summary>
        public required string Name { get; init; }

        /// <summary>
        /// A brief description of what the service entails.
        /// </summary>
        public required string Description { get; init; }

        /// <summary>
        /// The minimum price the user charges for this service.
        /// </summary>
        public required decimal MinPrice { get; init; }

        /// <summary>
        /// The maximum price the user charges for this service.
        /// </summary>
        public required decimal MaxPrice { get; init; }

        /// <summary>
        /// The currency in which the service will be priced (e.g., Naira, USD).
        /// </summary>
        public Currency Currency { get; init; }

        /// <summary>
        /// The intellectual property deal type for the service (e.g., Full Rights, Shared Rights).
        /// </summary>
        public IPDealType IPDealType { get; init; }

        /// <summary>
        /// The percentage of shared IP rights allocated to the producer.
        /// This is only applicable if <see cref="IPDealType"/> is set to shared rights.
        /// </summary>
        public int SharePercentage { get; init; }

        /// <summary>
        /// The payment structure for the service (e.g., One-time, Installment).
        /// </summary>
        public PaymentType PaymentType { get; init; }

        /// <summary>
        /// A list of genres the service is tailored for (e.g., Drama, Sci-Fi, Romance).
        /// </summary>
        public List<string> Genre { get; init; } = [];
    }
}
