namespace Bara.API.Scripts.Enums
{
    /// <summary>
    /// Defines the intellectual property (IP) deal type between a writer and a producer
    /// </summary>
    public enum IPDealType
    {
        /// <summary>
        /// Writer retains all rights to the script
        /// </summary>
        WriterRetainsRights,
        /// <summary>
        /// Producer retains all rights to the script
        /// </summary>
        ProducerRetainsRights,
        /// <summary>
        /// Rights are shared between writer and producer
        /// </summary>
        SharedRights,
    }
}
