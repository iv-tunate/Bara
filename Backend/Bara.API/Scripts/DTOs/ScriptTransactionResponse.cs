using Bara.API.Scripts.Enums;

namespace Bara.API.Scripts.DTOs
{
    /// <summary>
    /// Represents the response data for script transaction operations.
    /// Contains comprehensive details about the transaction state and financial breakdown.
    /// </summary>
    public record ScriptTransactionResponse
    {
        /// <summary>
        /// Gets or sets the unique identifier of the script transaction.
        /// </summary>
        public Guid ScriptTransactionId { get; init; }

        /// <summary>
        /// Gets or sets the unique identifier of the associated payment transaction.
        /// </summary>
        public Guid PaymentTransactionId { get; init; }

        /// <summary>
        /// Gets or sets the current delivery status of the script transaction.
        /// </summary>
        public ScriptDeliveryStatus Status { get; init; }

        /// <summary>
        /// Gets or sets the date and time when the transaction expires (14 days from initiation).
        /// After this time, the transaction will be automatically completed.
        /// </summary>
        public DateTimeOffset ExpiresAt { get; init; }

        /// <summary>
        /// Gets or sets the total amount paid by the producer for the script.
        /// </summary>
        public decimal Amount { get; init; }

        /// <summary>
        /// Gets or sets the platform fee (10% of the total amount).
        /// </summary>
        public decimal Fee { get; init; }

        /// <summary>
        /// Gets or sets the writer's share (90% of the total amount).
        /// </summary>
        public decimal WriterShare { get; init; }

        /// <summary>
        /// Gets or sets the currency symbol for display purposes.
        /// </summary>
        public string CurrencySymbol { get; init; } = "₦";

        /// <summary>
        /// Gets or sets the title of the script involved in the transaction.
        /// </summary>
        public string ScriptTitle { get; init; } = string.Empty;

        /// <summary>
        /// Gets or sets the name of the writer involved in the transaction.
        /// </summary>
        public string WriterName { get; init; } = string.Empty;
    }
}
