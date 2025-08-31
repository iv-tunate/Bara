namespace ScriptModule.DTOs
{
    /// <summary>
    /// Represents the request data for initiating a script transaction between a producer and writer.
    /// </summary>
    public record InitiateScriptTransactionRequest
    {
        /// <summary>
        /// Gets or sets the unique identifier of the script to be purchased.
        /// </summary>
        public Guid ScriptId { get; init; }

        /// <summary>
        /// Gets or sets the unique identifier of the writer who owns the script.
        /// </summary>
        public Guid WriterId { get; init; }

        /// <summary>
        /// Gets or sets an optional idempotency key to prevent duplicate transactions.
        /// If provided, subsequent requests with the same key will return the existing transaction.
        /// </summary>
        public string? IdempotencyKey { get; init; }
    }
}
