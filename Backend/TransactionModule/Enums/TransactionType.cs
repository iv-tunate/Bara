namespace TransactionModule.Enums
{
    public enum TransactionType
    {
        /// <summary>
        /// Payment for a script writing service, typically from a producer to a writer.
        /// </summary>
        ScriptPurchase,
        /// <summary>
        /// Payment for a service provided by a writer, such as editing or proofreading.
        /// </summary>
        ServicePayment,
        /// <summary>
        /// Refund for a transaction, typically when a service or script is not delivered as expected.
        /// </summary>
        Refund,
        /// <summary>
        /// Commission earned by a System.
        /// </summary>
        Commission,
        /// <summary>
        /// Producer's funding their wallet to pay for scripts or services.
        /// </summary>
        WalletFunding,
        WalletRelease,
        /// <summary>
        /// Withdrawal of funds from a user's wallet, typically to a bank account or payment service.
        /// </summary>
        Withdrawal,
        /// <summary>
        /// Payment made by writers to suscribe for premium privileges in the application.
        /// </summary>
        PremiumSubscriptionPayment,

        /// <summary>
        /// Escrowed payment for script purchase, held until transaction completion or cancellation.
        /// </summary>
        ScriptEscrow,

    }
}
