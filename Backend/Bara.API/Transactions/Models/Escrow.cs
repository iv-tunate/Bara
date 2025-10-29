using Bara.API.Transactions.Enums;
using Bara.API.Utilities.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bara.API.Transactions.Models
{
    public class Escrow : BaseEntity
    {
        //[Key]
        //public Guid Id { get; set; }
        [ForeignKey(nameof(Transaction))]
        public Guid? TransactionId { get; set; }
        public PaymentTransaction? Transaction { get; set; }
        [ForeignKey(nameof(Wallet))]
        public Guid? WalletId { get; set; }
        public Wallet? Wallet { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        public EscrowStatus Status { get; set; }
        public DateTimeOffset LockedAt { get; set; } = DateTime.UtcNow;
        public DateTimeOffset? ReleasedAt { get; set; }
        public string? Reason { get; set; }
    }
}
