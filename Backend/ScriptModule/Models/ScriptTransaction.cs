using ScriptModule.Enums;
using ScriptModule.Models.ScriptRelatedChats;
using SharedModule.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace ScriptModule.Models
{
    /// <summary>
    /// Represents a financial transaction between a producer and a writer
    /// for the purchase and delivery of a script.
    /// </summary>
    public class ScriptTransaction : BaseEntity
    {
        /// <summary>
        /// Gets or sets the ID of the script involved in the transaction.
        /// </summary>
        [ForeignKey("Script")]
        public Guid ScriptId { get; set; }

        /// <summary>
        /// Gets or sets the title of the script at the time of the transaction.
        /// Stored as denormalized data for quick access.
        /// </summary>
        public string ScriptTitle { get; set; }

        /// <summary>
        /// Gets or sets the ID of the producer who is purchasing the script.
        /// </summary>
        [ForeignKey("Producer")]
        public Guid ProducerId { get; set; }

        /// <summary>
        /// Gets or sets the display name of the producer at the time of the transaction.
        /// Stored as denormalized data for consistency in historical records.
        /// </summary>
        public string ProducerName { get; set; }

        /// <summary>
        /// Gets or sets the ID of the writer who authored the script.
        /// </summary>
        [ForeignKey("Writer")]
        public Guid WriterId { get; set; }

        /// <summary>
        /// Gets or sets the display name of the writer at the time of the transaction.
        /// Stored as denormalized data for consistency in historical records.
        /// </summary>
        public string WriterName { get; set; }

        /// <summary>
        /// Gets or sets the total amount paid by the producer for the script.
        /// This includes the writer’s share and the platform fee.
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        /// <summary>
        /// Gets or sets the amount allocated to the writer from the transaction.
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal WriterAmount { get; set; }

        /// <summary>
        /// Gets or sets the platform fee charged on the transaction.
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal PlatformFee { get; set; }

        /// <summary>
        /// Gets or sets the ID of the corresponding payment transaction
        /// (e.g., from the payment gateway or wallet system).
        /// </summary>
        [ForeignKey("PaymentTransaction")]
        public Guid PaymentTransactionId { get; set; }

        /// <summary>
        /// Gets or sets the current delivery status of the script.
        /// Defaults to <see cref="ScriptDeliveryStatus.InProgress"/>.
        /// </summary>
        public ScriptDeliveryStatus Status { get; set; } = ScriptDeliveryStatus.InProgress;

        /// <summary>
        /// Gets or sets the transaction status for this script transaction.
        /// Defaults to <see cref="ScriptTransactionStatus.Initiated"/>.
        /// </summary>
        public ScriptTransactionStatus TransactionStatus { get; set; } = ScriptTransactionStatus.Initiated;

        /// <summary>
        /// Gets or sets the date and time when this transaction expires (14 days from initiation).
        /// After this time, the transaction will be automatically completed.
        /// </summary>
        public DateTimeOffset? ExpiresAt { get; set; }

        /// <summary>
        /// Gets or sets the idempotency key used to prevent duplicate transactions.
        /// </summary>
        public string? IdempotencyKey { get; set; }

        /// <summary>
        /// Gets or sets the total amount for this script transaction.
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        /// <summary>
        /// Gets or sets the platform fee (10% of the total amount).
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal Fee { get; set; }

        /// <summary>
        /// Gets or sets the writer's share (90% of the total amount).
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal WriterShare { get; set; }

        /// <summary>
        /// Gets or sets the currency for this transaction.
        /// </summary>
        public Currency Currency { get; set; } = Currency.NAIRA;

        /// <summary>
        /// Gets or sets any comments or notes between the Writer on producer regarding the script.
        /// </summary>
        public Chat? ScriptComments { get; set; }
        /// <summary>
        /// Gets or sets the date and time when the writer was paid,
        /// or <c>null</c> if payment has not yet been made.
        /// </summary>
        public DateTimeOffset? WriterPaidAt { get; set; }

        /// <summary>
        /// Extracts the date component from <see cref="WriterPaidAt"/>.
        /// </summary>
        public DateOnly WriterPaidDate => WriterPaidAt.HasValue ? DateOnly.FromDateTime(WriterPaidAt.Value.UtcDateTime) : DateOnly.MinValue;
        /// <summary>
        /// Extracts the time component from <see cref="WriterPaidAt"/>.
        /// </summary>
        public TimeOnly WriterPaidTime => WriterPaidAt.HasValue ? TimeOnly.FromDateTime(WriterPaidAt.Value.UtcDateTime) : TimeOnly.MinValue;
    }
}
