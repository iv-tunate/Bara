using Bara.API.Transactions.Interfaces;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bara.API.Transactions.Controllers
{
    /// <summary>
    /// Controller for managing wallet operations including balance retrieval and wallet details.
    /// </summary>
    [Route("api/wallet")]
    [ApiController]
    public class WalletController : ControllerBase
    {
        private readonly ILogger<WalletController> logger;
        private readonly LogHelper<WalletController> logHelper;
        private readonly IWalletService walletService;

        public WalletController(
            ILogger<WalletController> logger,
            LogHelper<WalletController> logHelper,
            IWalletService walletService)
        {
            this.walletService = walletService;
            this.logHelper = logHelper;
            this.logger = logger;
        }

        /// <summary>
        /// Retrieves the wallet balance for a specific user.
        /// </summary>
        /// <param name="userId">The ID of the user whose wallet balance to retrieve</param>
        /// <returns>The user's wallet balance information</returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpGet("balance/{userId}")]
        public async Task<IActionResult> GetWalletBalance(Guid userId)
        {
            try
            {
                var response = await walletService.GetWalletDetailsAsync(userId);
                if (response == null)
                {
                    return NotFound(ResponseDetail<object>.Failed("Wallet not found for the specified user", 404, "Not Found"));
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While getting wallet balance for user: {userId}");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while retrieving wallet balance", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Retrieves detailed wallet information for a specific user.
        /// </summary>
        /// <param name="userId">The ID of the user whose wallet details to retrieve</param>
        /// <returns>Detailed wallet information including all balances</returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpGet("details/{userId}")]
        public async Task<IActionResult> GetWalletDetails(Guid userId)
        {
            try
            {
                var response = await walletService.GetWalletDetailsAsync(userId);
                if (response == null)
                {
                    return NotFound(ResponseDetail<object>.Failed("Wallet not found for the specified user", 404, "Not Found"));
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name,
                    $"While getting wallet details for user: {userId}");
                return StatusCode(500, ResponseDetail<object>.Failed("An error occurred while retrieving wallet details", 500, "Internal server error"));
            }
        }
    }
}
