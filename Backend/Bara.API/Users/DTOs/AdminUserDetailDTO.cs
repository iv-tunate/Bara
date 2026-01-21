using System;
using System.Collections.Generic;

namespace Bara.API.Users.DTOs
{
    public class AdminUserDetailDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string VerificationStatus { get; set; }
        public string PhoneNumber { get; set; }
        public decimal WalletBalance { get; set; }
        public decimal LockedBalance { get; set; }
        public decimal TotalBalance { get; set; }
        public decimal TotalEarnings { get; set; }
        public string Currency { get; set; }
        public bool IsVerified { get; set; }
        public bool IsBlacklisted { get; set; }
        public string? Bio { get; set; }
        public string? ProfileImageUrl { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        public List<AdminUserScriptDTO> Scripts { get; set; } = new();
        public List<AdminUserTransactionDTO> Transactions { get; set; } = new();
        public List<AdminUserScriptTransactionDTO> ScriptTransactions { get; set; } = new();
    }

    public class AdminUserScriptDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Status { get; set; }
        public string Price { get; set; }
        public string CurrencySymbol { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class AdminUserTransactionDTO
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Type { get; set; }
        public string Reference { get; set; }
        public string Status { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class AdminUserScriptTransactionDTO
    {
        public Guid Id { get; set; }
        public string ScriptTitle { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
