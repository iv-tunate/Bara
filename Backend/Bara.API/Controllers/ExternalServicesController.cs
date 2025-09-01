using Infrastructure.DataContext;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.YouVerifyIntegration;
using SharedModule.Utils;

namespace Bara.API.Controllers
{
    [Route("api/external_services")]
    [ApiController]
    public class ExternalServicesController : ControllerBase
    {
        private readonly ILogger<UtilityController> logger;
        private readonly LogHelper<UtilityController> logHelper;
        private readonly IYouVerifyService youVerify;
        private readonly BaraContext dbContext;

        public ExternalServicesController(ILogger<UtilityController> logger, LogHelper<UtilityController> logHelper, IYouVerifyService youVerify, BaraContext baraContext)
        {
            this.logger = logger;
            this.logHelper = logHelper;
            this.youVerify = youVerify;
            dbContext = baraContext;
        }

        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpPost("youverify/verify/{userId}")]
        public async Task<IActionResult> VerifyUser(Guid userId, [FromBody] YouVerifyKycDto payload)
        {
            try
            {
                if (!dbContext.Users.Any(u => u.Id == userId))
                {
                    return NotFound(ResponseDetail<string>.Failed("User not found", 404, "Not Found"));
                }
                var response = await youVerify.VerifyIdentificationNumberAsync(payload);
                if (response.Success is false)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, response);
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Initiating KYC verification for user");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occured", 500, "Internal server error"));
            }
        }
    }
}
