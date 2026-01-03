using Bara.API.Scripts.DTOs;
using Bara.API.Scripts.Enums;
using Bara.API.Scripts.Models;
using Bara.API.Utilities.ToolKit;

namespace Bara.API.Scripts.Interfaces
{
    public interface IScriptService
    {
        /// <summary>
        /// Retrieves a script detail by its ID.
        /// </summary>
        /// <param name="scriptId">The ID of the script to retrieve.</param>
        /// <param name="writerId">The ID of the writer ID who owns the script.</param>
        /// <returns>The script detail with the specified script ID and writer ID, or null if not found.</returns>
        Task<ResponseDetail<ScriptDTO>> GetScriptById(Guid scriptId, Guid? writerId);

        /// <summary>
        /// Retrieves all scripts details associated with a specific writer.
        /// </summary>
        /// <param name="writerId">The ID of the writer whose scripts are to be retrieved.</param>
        /// <returns>A list of scripts details associated with the specified writer.</returns>
        Task<ResponseDetail<List<ScriptDTO>>> GetScriptsByWriterId(Guid writerId, int pageNumber, int pageSize);

        /// <summary>
        /// Retrieves all scripts details
        /// </summary>
        /// <returns>A list of scripts details</returns>
        Task<ResponseDetail<List<ScriptDTO>>> GetScripts(int pageNumber, int pageSize);

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
        Task<ResponseDetail<ScriptDTO>> AddScript(PostScriptDetailDTO scriptDetails, Guid writerId);

        /// <summary>
        /// Updates a script.
        /// </summary>
        /// <param name="scriptDetails">Represents the details of the script </param>
        /// <param name="writerId">Represents the id of the writer</param>
        /// <param name="scriptId">Represents the id of the script to be updated</param>
        Task<ResponseDetail<Script>> UpdateScript(PostScriptDetailDTO scriptDetails, Guid writerId, Guid scriptId);

        /// <summary>
        /// Updates the actual script content (PDF file) by replacing the existing file in storage.
        /// </summary>
        /// <param name="scriptId">The ID of the script to update</param>
        /// <param name="writerId">The ID of the writer who owns the script</param>
        /// <param name="newFile">The new script file to upload</param>
        /// <returns>A success response with updated script details</returns>
        Task<ResponseDetail<ScriptDTO>> UpdateScriptContent(Guid scriptId, Guid writerId, IFormFile newFile);

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

        /// <summary>
        /// Retrieves scripts filtered by genre with pagination.
        /// </summary>
        /// <param name="genre">The genre to filter by</param>
        /// <param name="pageNumber">The page number for pagination</param>
        /// <param name="pageSize">The number of items per page</param>
        /// <returns>A paginated list of scripts in the specified genre</returns>
        Task<ResponseDetail<List<ScriptDTO>>> GetScriptsByGenre(Guid genre, int pageNumber, int pageSize);

        /// <summary>
        /// Searches scripts by title, description, or genre with pagination.
        /// </summary>
        /// <param name="searchTerm">The search term to filter scripts</param>
        /// <param name="pageNumber">The page number for pagination</param>
        /// <param name="pageSize">The number of items per page</param>
        /// <returns>A paginated list of scripts matching the search criteria</returns>
        Task<ResponseDetail<List<ScriptDTO>>> SearchScripts(string searchTerm, int pageNumber, int pageSize);

        /// <summary>
        /// Fetches all available genres.
        /// </summary>
        /// <returns>A list of genres</returns>
        Task<ResponseDetail<List<Genre>>> GetGenres();

        /// <summary>
        /// Retrieves scripts that a producer has initiated transactions for, filtered by transaction status.
        /// </summary>
        /// <param name="producerId">The ID of the producer</param>
        /// <param name="status">Filter by transaction status: "initiated", "completed", or "all"</param>
        /// <param name="pageNumber">The page number for pagination</param>
        /// <param name="pageSize">The number of items per page</param>
        /// <returns>A paginated list of scripts with transaction metadata</returns>
        Task<ResponseDetail<List<ScriptDTO>>> GetProducerScriptsByTransaction(Guid producerId, string status, int pageNumber, int pageSize);
    }
}
