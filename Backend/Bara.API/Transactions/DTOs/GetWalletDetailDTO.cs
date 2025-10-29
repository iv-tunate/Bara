using SharedModule.Models;

namespace Bara.API.Transactions.DTOs
{
    public record GetWalletDetailDTO
    {
        public Guid Id { get; init; }
        public decimal TotalBalance { get; init; }
        public decimal AvailableBalance { get; init; }
        public decimal LockedBalance { get; init; }
        public Currency Currency { get; init; }
        public string? CurrencySymbol { get; init; }
        public Guid UserId { get; init; }
    }
}
