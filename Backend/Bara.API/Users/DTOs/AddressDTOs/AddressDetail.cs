namespace Bara.API.Users.DTOs.AddressDTOs
{
    /// <summary>
    /// Represents the details of an address associated with a user or entity.
    /// </summary>

    public record class AddressDetail
    {
        public required string Street { get; init; }
        public required string City { get; init; }
        public required string State { get; init; }
        public required string Country { get; init; }
        public string PostalCode { get; init; } = "";
        public string AdditionalDetails { get; init; } = "";
    }

}
