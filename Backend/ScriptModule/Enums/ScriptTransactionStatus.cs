namespace ScriptModule.Enums
{
    /// <summary>
    /// Defines the status of a script transaction between a producer and writer.
    /// </summary>
    public enum ScriptTransactionStatus
    {
        /// <summary>
        /// Transaction has been initiated and funds are escrowed.
        /// </summary>
        Initiated,

        /// <summary>
        /// Transaction has been completed and funds released to the writer.
        /// </summary>
        Completed,

        /// <summary>
        /// Transaction has been cancelled and funds refunded to the producer.
        /// </summary>
        Cancelled
    }
}
