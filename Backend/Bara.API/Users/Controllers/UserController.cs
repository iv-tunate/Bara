using Bara.API.Users.DTOs;
using Bara.API.Users.DTOs.UserDTO;
using Bara.API.Users.Enums;
using Bara.API.Users.Interfaces.UserInterfaces;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bara.API.Users.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> logger;
        private readonly LogHelper<UserController> logHelper;
        private readonly IUserService userService;

        public UserController(ILogger<UserController> logger, LogHelper<UserController> logHelper, IUserService userService)
        {
            this.logHelper = logHelper;
            this.logger = logger;
            this.userService = userService;
        }

        /// <summary>
        /// Registers a new user on the platform.
        /// </summary>
        /// <param name="payload"></param>
        /// <returns></returns>
        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] RegisterDTO payload)
        {
            try
            {
                var registrationResponse = await userService.BeginRegistration(payload);
                if (registrationResponse.IsSuccess)
                {
                    return Ok(registrationResponse);
                }
                else if (registrationResponse.StatusCode == 409)
                {
                    return Conflict(registrationResponse);
                }
                else
                {
                    return BadRequest(registrationResponse);
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception {ex.GetType().Name} was thrown at {ex.Source} while registering user: {payload.Email}..." +
                    $"\nBase Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ResponseDetail<string>.Failed("Your request failed...", 500, "Error"));
            }
        }

        /// <summary>
        /// Registers a new admin user on the platform.
        /// </summary>
        /// <param name="payload"></param>
        /// <returns></returns>
        //[Authorize(Roles = "Admin")]
        [HttpPost("admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterDTO payload)
        {
            try
            {
                payload.Type = Role.Admin;
                var registrationResponse = await userService.BeginRegistration(payload);
                if (registrationResponse.IsSuccess)
                {
                    return Ok(registrationResponse);
                }
                else if (registrationResponse.StatusCode == 409)
                {
                    return Conflict(registrationResponse);
                }
                else
                {
                    return BadRequest(registrationResponse);
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception {ex.GetType().Name} was thrown at {ex.Source} while registering admin: {payload.Email}..." +
                    $"\nBase Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ResponseDetail<string>.Failed("Your request failed...", 500, "Error"));
            }
        }

        /// <summary>
        /// Adds bank details for a user.
        /// </summary>
        /// <param name="payload"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpPost("bank-details/{userId}")]
        public async Task<IActionResult> AddBankDetails([FromBody] PostBankDetailDTO payload, Guid userId)
        {
            try
            {
                var response = await userService.AddBankDetail(payload, userId);
                if (response.IsSuccess)
                {
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Adding bank detail failed with status code 500: {Message}", response.Message);
                    return StatusCode(500, response);
                }
                else
                {
                    logger.LogError("Adding bank detail failed with status code {response}", response);
                    return StatusCode(response.StatusCode, response);
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Adding bank detail");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occured", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Retrieves all bank details for a user.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpGet("bank-details/{userId}")]
        public async Task<IActionResult> GetBankDetails(Guid userId)
        {
            try
            {
                var response = await userService.GetAllBankDetails(userId);
                if (response.IsSuccess)
                {
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Retrieving bank detail failed with status code 500: {Message}", response.Message);
                    return StatusCode(500, response);
                }
                else
                {
                    logger.LogError("Retrieving bank detail failed with status code {response}", response);
                    return StatusCode(response.StatusCode, response);
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Retrieving bank detail");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occured", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Retrieves a specific bank detail by its ID for a user.
        /// </summary>
        /// <param name="bankDetailId"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpGet("bank-detail/{bankDetailId}/{userId}")]
        public async Task<IActionResult> GetBankDetailById(Guid bankDetailId, Guid userId)
        {
            try
            {
                var response = await userService.GetBankDetail(bankDetailId, userId);
                if (response.IsSuccess)
                {
                    return Ok(response);
                }
                else if (response.StatusCode == 500)
                {
                    logger.LogError("Retrieving bank detail by id failed with status code 500: {Message}", response.Message);
                    return StatusCode(500, response);
                }
                else
                {
                    logger.LogError("Retrieving bank detail by id failed with status code {response}", response);
                    return StatusCode(response.StatusCode, response);
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Retrieving bank detail by id");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occured", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Manually retries KYC verification for a user. Admin-only endpoint.
        /// </summary>
        /// <param name="payload">The unique identifiers and verification details for the user</param>
        /// <returns>Returns 200 OK if retry was successful, 400/404 if validation fails, or 500 on error</returns>
        [Authorize(Roles = "Admin")]
        [HttpPost("retry-kyc")]
        public async Task<IActionResult> RetryKycVerification([FromBody] RetryKycDTO payload)
        {
            try
            {
                var response = await userService.RetryKycVerification(payload);
                if (response.IsSuccess)
                {
                    return Ok(response);
                }
                else if (response.StatusCode == 404)
                {
                    logger.LogWarning("KYC retry failed for user {UserId}: User not found", payload.UserId);
                    return NotFound(response);
                }
                else
                {
                    logger.LogWarning("KYC retry failed for user {UserId}: {Message}", payload.UserId, response.Message);
                    return BadRequest(response);
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Retrying KYC for user {payload.UserId}");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occurred while retrying KYC verification", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Retrieves all users. Admin-only endpoint.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
        {
            var response = await userService.GetAllUsers(pageNumber, pageSize);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Retrieves detailed information about a user. Admin-only endpoint.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("detail/{userId}")]
        public async Task<IActionResult> GetAdminUserDetail(Guid userId)
        {
            var response = await userService.GetAdminUserDetail(userId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Searches for users. Admin-only endpoint.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string query, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 25)
        {
            var response = await userService.SearchUsers(query, pageNumber, pageSize);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Retrieves total earnings for a user. Admin-only endpoint.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("earnings/{userId}")]
        public async Task<IActionResult> GetTotalEarnings(Guid userId)
        {
            var response = await userService.GetTotalEarnings(userId);
            return StatusCode(response.StatusCode, response);
        }
    }
}
