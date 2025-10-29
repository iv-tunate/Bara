namespace Bara.API.Users.DTOs.DocumentDTOs
{
    /// <summary>
    /// Represents the retrieved details of a document associated with a user.
    /// </summary>
    /// <param name="Id"></param>
    /// <param name="Name"></param>
    /// <param name="DocumentType"></param>
    /// <param name="IdentificationNumber"></param>
    /// <param name="URL"></param>
    /// <param name="Path"></param>
    /// <param name="FileExtension"></param>
    public record GetDocumentDetailDTO(
        Guid Id,
        string Name,
        string DocumentType,
        string IdentificationNumber,
        string? URL,
        string Path,
        string FileExtension
    );
}
