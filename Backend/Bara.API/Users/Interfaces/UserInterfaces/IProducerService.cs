using Bara.API.Users.DTOs.ProducerDTOs;
using Bara.API.Utilities.ToolKit;

namespace Bara.API.Users.Interfaces.UserInterfaces
{
    /// <summary>
    /// Provides services for managing producer profiles including creation, update, deletion, and retrieval.
    /// </summary>
    public interface IProducerService
    {
        /// <summary>
        /// Registers a new producer with the provided profile, contact, and verification details.
        /// </summary>
        /// <param name="producerDetailDTO">
        /// A <see cref="PostProducerDetailDTO"/> containing the producer’s first and last names, 
        /// contact information (email, phone number), date of birth, gender, address, a verification document, and optional bio.
        /// </param>
        /// <param name="userId">The unique identifier for the user profile</param>
        /// <returns>
        /// A <see cref="ResponseDetail{T}"/> containing the full details of the created producer as a <see cref="GetProducerDetailDTO"/>.
        /// </returns>
        Task<ResponseDetail<GetProducerDetailDTO>> AddProducer(PostProducerDetailDTO producerDetailDTO, Guid userId);

        /// <summary>
        /// Updates an existing producer's profile with the specified ID using the provided information.
        /// </summary>
        /// <param name="producerDetailDTO">
        /// A <see cref="PostProducerDetailDTO"/> containing updated profile data such as name, phone number, address, 
        /// verification document, and bio.
        /// </param>
        /// <param name="producerId">The unique identifier of the producer to update.</param>
        /// <returns>
        /// A <see cref="ResponseDetail{T}"/> containing the updated producer profile as a <see cref="GetProducerDetailDTO"/>.
        /// </returns>
        Task<ResponseDetail<GetProducerDetailDTO>> UpdateProducer(UpdateProducerDetailDTO producerDetailDTO, Guid producerId);

        /// <summary>
        /// Deletes a producer’s profile permanently from the system.
        /// </summary>
        /// <param name="producerId">The unique identifier of the producer to delete.</param>
        /// <returns>
        /// A boolean value indicating whether the deletion was successful.
        /// </returns>
        Task<bool> DeleteProducer(Guid producerId);

        /// <summary>
        /// Retrieves the complete profile details of a specific producer.
        /// </summary>
        /// <param name="producerId">The unique identifier of the producer to retrieve.</param>
        /// <returns>
        /// A <see cref="ResponseDetail{T}"/> containing the full profile details including verification status, wallet,
        /// bio, role, and audit information in a <see cref="GetProducerDetailDTO"/>.
        /// </returns>
        Task<ResponseDetail<GetProducerDetailDTO>> GetProducer(Guid producerId);
    }

}
