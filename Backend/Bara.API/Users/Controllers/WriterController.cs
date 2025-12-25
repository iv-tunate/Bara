using Bara.API.Users.DTOs.WriterDTOs;
using Bara.API.Users.Interfaces.UserInterfaces;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bara.API.Users.Controllers
{
    [Route("api/writer")]
    [ApiController]
    public class WriterController : ControllerBase
    {
        private readonly IWriterService writerService;
        private readonly ILogger<WriterController> logger;
        public WriterController(IWriterService writerService, ILogger<WriterController> logger)
        {
            this.logger = logger;
            this.writerService = writerService;
        }

        /// <summary>
        /// Registers a new writer profile on the platform.
        /// </summary>
        /// <param name="writerDetail">
        /// The detailed information required to register a writer, including name, bio, email, optional profile image, and credentials.
        /// </param>
        /// <param name="userId">
        /// The unique identifier of the user creating the writer profile, typically the ID of the user account making the request.
        /// </param>
        /// <returns>
        /// Returns 200 OK with the newly created writer profile if successful,  
        /// 400 Bad Request if the request is malformed or fails validation,  
        /// or 500 Internal Server Error if something goes wrong on the server.
        /// </returns>

        [HttpPost("create-profile/{userId}")]
        public async Task<IActionResult> AddWriter([FromForm] PostWriterDetailDTO writerDetail, Guid userId)
        {
            try
            {
                if (writerDetail == null || !ModelState.IsValid)
                {
                    return BadRequest("Writer request body is null or invalid");
                }
                var response = await writerService.AddWriter(writerDetail, userId);
                if (response.IsSuccess)
                {
                    return Ok(response);
                }
                else
                {
                    return BadRequest(response);
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception {ex.GetType()} was thrown at {ex.Source} while creating a new writer profile: {writerDetail.FirstName} {writerDetail.LastName}...\nBase Exception {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}");
                return StatusCode(500, ResponseDetail<string>.Failed("Your request failed...", 500, "Error"));
            }
        }

        /// <summary>
        /// Fetches a specific writer's complete profile using their unique identifier.
        /// </summary>
        /// <param name="writerId">
        /// The unique ID of the writer whose profile is being requested.
        /// </param>
        /// <returns>
        /// Returns 200 OK with the writer's profile if found,  
        /// 400 Bad Request if the writer is not found or an error occurs during processing,  
        /// or 500 Internal Server Error if an unexpected error happens.
        /// </returns>
        [Authorize(Roles = "Writer, Admin, Producer")]
        [HttpGet("profile/{writerId}")]
        public async Task<IActionResult> GetWriterDetail(Guid writerId)
        {
            try
            {
                var res = await writerService.GetWriterDetail(writerId);
                if (res.IsSuccess is false)
                {
                    return BadRequest(res);
                }
                return Ok(res);
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception {ex.GetType().Name} was thrown at {ex.Source} while fetching writer profile..." +
                    $"\nBase Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}", ex.Message);
                return StatusCode(500, ResponseDetail<string>.Failed("Your request failed...", 500, "Error"));
            }
        }
    }
}