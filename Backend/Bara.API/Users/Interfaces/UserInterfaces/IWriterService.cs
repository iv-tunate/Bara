using Bara.API.Users.DTOs.WriterDTOs;
using SharedModule.Utils;
namespace Bara.API.Users.Interfaces.UserInterfaces
{
    /// <summary>
    /// Provides writer-related services such as registration, profile updates, deletion, and retrieval.
    /// </summary>
    public interface IWriterService
    {
        /// <summary>
        /// Registers a new writer with the provided profile information, services, address, and verification document.
        /// </summary>
        /// <param name="writerDetail">
        /// A <see cref="PostWriterDetailDTO"/> containing the writer’s full name, email, password, bio, gender, date of birth, 
        /// premium membership flag, address details, verification document, and optionally, offered services.
        /// </param>
        /// <param name="userId">The user profile id </param>
        /// <returns>
        /// A <see cref="ResponseDetail{T}"/> containing the full created profile in <see cref="GetWriterDetailDTO"/> format.
        /// </returns>
        Task<ResponseDetail<GetWriterDetailDTO>> AddWriter(PostWriterDetailDTO writerDetail, Guid userId);

        /// <summary>
        /// Retrieves a specific writer's profile by their unique identifier.
        /// </summary>
        /// <param name="writerId">The unique ID of the writer to retrieve.</param>
        /// <returns>
        /// A <see cref="ResponseDetail{T}"/> containing the writer’s full profile in <see cref="GetWriterDetailDTO"/> format.
        /// </returns>
        Task<ResponseDetail<GetWriterDetailDTO>> GetWriterDetail(Guid writerId);

        /// <summary>
        /// Retrieves a paginated list of writers with their profile information.
        /// </summary>
        /// <param name="pageNumber">The page number to fetch.</param>
        /// <param name="pageSize">The number of records per page.</param>
        /// <returns>
        /// A <see cref="ResponseDetail{T}"/> containing a list of <see cref="GetWriterDetailDTO"/> objects.
        /// </returns>
        Task<ResponseDetail<List<GetWriterDetailDTO>>> GetWriters(int pageNumber, int pageSize);

        /// <summary>
        /// Updates an existing writer’s profile using the provided new details.
        /// </summary>
        /// <param name="writerId">The unique identifier of the writer to update.</param>
        /// <param name="updateWriterDetail">
        /// A <see cref="PostWriterDetailDTO"/> containing the updated information such as name, bio, address, premium status, etc.
        /// </param>
        /// <returns>
        /// A <see cref="ResponseDetail{T}"/> containing the updated writer profile in <see cref="GetWriterDetailDTO"/> format.
        /// </returns>
        Task<ResponseDetail<GetWriterDetailDTO>> UpdateWriterDetail(Guid writerId, PostWriterDetailDTO updateWriterDetail);

        /// <summary>
        /// Permanently deletes a writer’s profile by their unique identifier.
        /// </summary>
        /// <param name="writerId">The ID of the writer to delete.</param>
        /// <returns>
        /// A <see cref="ResponseDetail{T}"/> indicating whether the deletion was successful.
        /// </returns>
        Task<ResponseDetail<bool>> DeleteWriter(Guid writerId);
    }
}
