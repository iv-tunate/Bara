namespace Bara.API.Users.Models
{
    /// <summary>
    /// Defines the producer entity which is also a type of User
    /// </summary>
    public class Producer : User
    {
        //public override string Bio { get; set; }
        ///// <summary>
        ///// The list of script writing posts created by the producer.
        ///// </summary>
        //public List<ScriptWritingPostByProducer> ScriptWritingPosts { get; set; } = [];

        /// <summary>
        /// The list of scripts purchased by the producer.
        /// </summary>
        public List<Script> PurchasedScripts { get; set; } = [];

        //public List<Transaction> Transactions { get; set; } = [];
        //public List<ScriptWritingPostByProducer> ScriptWritingPosts { get; set; } = [];
    }
}
