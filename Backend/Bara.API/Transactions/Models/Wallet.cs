using Bara.API.Utilities.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Transactions.Models
{
    public class Wallet : BaseEntity
    {
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalBalance { get; set; } = 0.00m;
        [Column(TypeName = "decimal(18,2)")]
        public decimal LockedBalance { get; set; } = 0.00m;
        [Column(TypeName = "decimal(18,2)")]
        public decimal AvailableBalance { get; set; } = 0.00m;
        public Currency Currency { get; set; } = Currency.NAIRA;
        public string CurrencySymbol => Currency switch
        {
            Currency.NAIRA => "₦",
            Currency.USD => "$",
            Currency.EUR => "€",
            Currency.GBP => "£",
            _ => "₦"
        };
        [ForeignKey("User")]
        public Guid UserId { get; set; }
        /// <summary>
        /// A list of all transactions associated with a user's wallet.
        /// </summary>
        public List<PaymentTransaction> Transactions { get; set; } = [];
    }
}
