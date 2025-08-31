using ScriptModule.DTOs;
using ScriptModule.Enums;
using ScriptModule.Models;
using SharedModule.Utils;

namespace ScriptModule.Interfaces
{
    public interface IScriptService
    {
        /// <summary>
        /// Retrieves a script detail by its ID.
        /// </summary>
        /// <param name="scriptId">The ID of the script to retrieve.</param>
        /// <param name="writerId">The ID of the writer ID who owns the script.</param>
        /// <returns>The script detail with the specified script ID and writer ID, or null if not found.</returns>
        Task<ResponseDetail<Script>> GetScriptById(Guid scriptId, Guid? writerId);

        /// <summary>
        /// Retrieves all scripts details associated with a specific writer.
        /// </summary>
        /// <param name="writerId">The ID of the writer whose scripts are to be retrieved.</param>
        /// <returns>A list of scripts details associated with the specified writer.</returns>
        Task<ResponseDetail<List<Script>>> GetScriptsByWriterId(Guid writerId, int pageNumber, int pageSize);

        /// <summary>
        /// Retrieves all scripts details
        /// </summary>
        /// <returns>A list of scripts details</returns>
        Task<ResponseDetail<List<Script>>> GetScripts(int pageNumber, int pageSize);

        /// <summary>
        /// Retrieves the actual script
        /// </summary>
        /// <param name="scriptId">The ID of the script to be retrieved</param>
        /// <returns>A script file</returns>
        Task<ResponseDetail<GetScriptDTO>> DownloadScript(Guid scriptId);

        /// <summary>
        /// Adds a new script.
        /// </summary>
        /// <param name="scriptDetails">Represents the details of the script </param>
        /// <param name="writerId">Represents the id of the writer</param>
        /// <returns>A script</returns>
        Task<ResponseDetail<Script>> AddScript(PostScriptDetailDTO scriptDetails, Guid writerId);

        /// <summary>
        /// Updates a script.
        /// </summary>
        /// <param name="scriptDetails">Represents the details of the script </param>
        /// <param name="writerId">Represents the id of the writer</param>
        /// <param name="scriptId">Represents the id of the script to be updated</param>
        Task<ResponseDetail<Script>> UpdateScript(PostScriptDetailDTO scriptDetails, Guid writerId, Guid scriptId);

        /// <summary>
        /// Deletes a script.
        /// </summary>
        /// <param name="scriptId">Represents the id of the script to be deleted</param>
        /// <param name="writerId">Represents the id of the writer</param>
        Task<ResponseDetail<bool>> DeleteScript(Guid scriptId, Guid writerId);

        /// <summary>
        /// Initiates a script transaction by escrowing funds from producer to purchase a script.
        /// </summary>
        /// <param name="producerId">The ID of the producer purchasing the script</param>
        /// <param name="request">The transaction initiation request details</param>
        /// <returns>A response containing the script transaction details</returns>
        Task<ResponseDetail<ScriptTransactionResponse>> InitiateScriptTransactionAsync(Guid producerId, InitiateScriptTransactionRequest request);

        /// <summary>
        /// Completes a script transaction by releasing escrowed funds to the writer and delivering the script.
        /// </summary>
        /// <param name="producerId">The ID of the producer completing the transaction</param>
        /// <param name="scriptId">The ID of the script being purchased</param>
        /// <returns>A response containing the completed transaction details</returns>
        Task<ResponseDetail<ScriptTransactionResponse>> CompleteScriptTransactionAsync(Guid producerId, Guid scriptId);

        /// <summary>
        /// Cancels a script transaction by refunding escrowed funds to the producer.
        /// </summary>
        /// <param name="producerId">The ID of the producer cancelling the transaction</param>
        /// <param name="scriptId">The ID of the script transaction to cancel</param>
        /// <returns>A response containing the cancelled transaction details</returns>
        Task<ResponseDetail<ScriptTransactionResponse>> CancelScriptTransactionAsync(Guid producerId, Guid scriptId);

        /// <summary>
        /// Updates the status of a script 
        /// </summary>
        /// <param name="status"></param>
        /// <param name="scriptId"></param>
        /// <param name="writerId"></param>
        /// <returns>A script object</returns>
        Task<ResponseDetail<Script>> UpdateScriptStatus(ScriptStatus status, Guid scriptId, Guid writerId);
    }
}
