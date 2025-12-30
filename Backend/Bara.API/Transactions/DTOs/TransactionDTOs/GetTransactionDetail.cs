namespace Bara.API.Transactions.DTOs.TransactionDTOs
{
    /// <summary>
    /// Represents the details of a transaction.
    /// </summary>
    public record GetTransactionDetail
    {
        /// <summary>
        /// Represents the unique identifier for the transaction.
        /// </summary>
        public Guid Id { get; init; }
        /// <summary>
        /// Represents the amount involved in the transaction.
        /// </summary>
        public decimal Amount { get; init; }
        public string Currency { get; init; }
        public string CurrencySymbol { get; init; } = "₦";
        /// <summary>
        /// Represents the date and time when the transaction occurred.
        /// </summary>
        public DateTime TransactionDate { get; init; }
        /// <summary>
        /// Represents the status of the transaction (e.g., Completed, Pending, Failed).
        /// </summary>
        public string Status { get; init; }
        public string TransactionType { get; init; }
        /// <summary>
        /// Represents any additional details or notes about the transaction.
        /// </summary>
        public string? Notes { get; init; }
        public Guid? ProducerId { get; init; }
        public Guid? WriterId { get; init; }
        public Guid? ScriptId { get; init; }
        public string? ReferenceId { get; init; }
        /// <summary>
        /// Optional response from the payment gateway or service provider.
        /// </summary>
        public string? GatewayResponse { get; init; }
        public Guid? PaymentDetailId { get; init; }
        public DateTimeOffset? CompletedAt { get; init; }
        public DateOnly? DateCompleted { get; init; }
        public TimeOnly? TimeCompleted { get; init; }
    }
}
