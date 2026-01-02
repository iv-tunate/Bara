using Bara.API.Scripts.Enums;
using Bara.API.Utilities.Models;

namespace Bara.API.Scripts.DTOs
{
    /// <summary>
    /// Represents detailed information about a script, including metadata and author details.
    /// </summary>
    // DTOs/ScriptDTO.cs
    public class ScriptDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Logline { get; set; }
        public string Synopsis { get; set; }
        public decimal Price { get; set; }
        public string CurrencySymbol { get; set; }
        public Currency Currency { get; set; }
        public bool IsScriptRegistered { get; set; }
        public string? RegistrationBody { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImagePublicId { get; set; }
        public string? CopyrightNumber { get; set; }
        public IPDealType? OwnershipRights { get; set; }
        public string? ProofUrl { get; set; }
        public Guid? WriterId { get; set; }
        public string WriterName { get; set; }
        public ScriptStatus Status { get; set; }
        public bool IsPremiumScript { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public List<GenreDTO> Genre { get; set; }
        
        public Guid? ActiveNegotiatorId { get; set; }
        public DateTimeOffset? TransactionCreatedAt { get; set; }
        public DateTimeOffset? TransactionExpiresAt { get; set; }
        public bool HasActiveTransaction { get; set; }
    }

    public class GenreDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
