using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Transactions.Models
{
    public class PaymentDetail
    {
        public Guid Id { get; set; }
        public string CustomerId { get; set; }
        public string CustomerCode { get; set; }
        public string AuthorizationCode { get; set; }
        public string CardType { get; set; }
        public string Last4 { get; set; }
        public string CountryCode { get; set; }
        public string Bank { get; set; }
        public string ExpMonth { get; set; }
        public string ExpYear { get; set; }
        public bool Reusable { get; set; }
        [ForeignKey("User")]
        public Guid UserId { get; set; }

    }
}
