using Bara.API.DataContext;
using Bara.API.Services.BackgroudServices;
using Bara.API.Services.Paystack;
using Bara.API.Utilities.Models;
using Bara.API.Utilities.ToolKit;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Services.FileStorageServices.Interfaces;

namespace Bara.API.Utilities.Controllers
{
    [Route("api/utilities")]
    [ApiController]
    public class UtilityController : ControllerBase
    {
        private readonly ILogger<UtilityController> logger;
        private readonly LogHelper<UtilityController> logHelper;
        private readonly BaraContext _context;
        private readonly IPaystackService paystackService;
        private readonly IFileStorageService storageService;
        public UtilityController(ILogger<UtilityController> logger, LogHelper<UtilityController> logHelper, IPaystackService paystackService, Bara.API.DataContext.BaraContext context, IFileStorageService storageService)
        {
            this.logger = logger;
            this.logHelper = logHelper;
            this.paystackService = paystackService;
            _context = context;
            this.storageService = storageService;
        }

        /// <summary>
        /// Fetches a list of banks from Paystack.
        /// </summary>
        /// <returns></returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpGet("banks")]
        public async Task<IActionResult> GetBanks()
        {
            try
            {
                var response = await paystackService.GetBanksAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Fetching banks");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occured", 500, "Internal server error"));
            }
        }

        /// <summary>
        /// Resolves a bank account number to retrieve the account holder's name.
        /// Uses Paystack's account resolution API to verify account details.
        /// </summary>
        /// <param name="accountNumber">The 10-digit NUBAN account number</param>
        /// <param name="bankCode">The bank's code from the banks list</param>
        /// <returns>Account details including the account holder's name</returns>
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpGet("resolve-account/{accountNumber}/{bankCode}")]
        public async Task<IActionResult> ResolveAccount(string accountNumber, string bankCode)
        {
            try
            {
                if (string.IsNullOrEmpty(accountNumber) || accountNumber.Length != 10)
                {
                    return BadRequest(ResponseDetail<string>.Failed("Account number must be 10 digits", 400));
                }

                if (string.IsNullOrEmpty(bankCode))
                {
                    return BadRequest(ResponseDetail<string>.Failed("Bank code is required", 400));
                }

                var response = await paystackService.ResolveAccountNumber(accountNumber, bankCode);
                
                if (response.Status)
                {
                    return Ok(ResponseDetail<object>.Successful(new 
                    { 
                        accountName = response.Data.AccountName,
                        accountNumber = response.Data.AccountNumber,
                        bankId = response.Data.BankId
                    }, "Account resolved successfully"));
                }
                else
                {
                    return BadRequest(ResponseDetail<string>.Failed(response.Message ?? "Unable to resolve account", 400));
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Resolving account {accountNumber}");
                return StatusCode(500, ResponseDetail<string>.Failed("An error occurred while resolving account", 500, "Internal server error"));
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("admin/backups/run")]
        public IActionResult RunBackup()
        {
            var userEmail = User.FindFirst("Email")?.Value;
            if (string.IsNullOrEmpty(userEmail) || !userEmail.Equals("baraglobalmain@gmail.com", StringComparison.OrdinalIgnoreCase))
                return Forbid();

            BackgroundJob.Enqueue<HangfireJobs>(job => job.RunBackupAsync(userEmail));
            return Ok(ResponseDetail<string>.Successful("Backup job enqueued. You will receive an email when done."));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/backups")]
        public async Task<IActionResult> GetBackups()
        {
            var userEmail = User.FindFirst("Email")?.Value;
            if (string.IsNullOrEmpty(userEmail) || !userEmail.Equals("baraglobalmain@gmail.com", StringComparison.OrdinalIgnoreCase))
                return Forbid();

            var backups = await _context.DatabaseBackups
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BackendBackupResponseDTO
                {
                    Id = b.Id,
                    CreatedAt = b.CreatedAt,
                    Status = b.Status,
                    FileName = b.FileName,
                    FileSize = b.FileSize,
                    FileUrl = b.FileUrl,
                    TriggeredBy = b.TriggeredBy
                }).ToListAsync();

            return Ok(ResponseDetail<List<BackendBackupResponseDTO>>.Successful(backups));
        }
        [Authorize(Roles = "Admin, Producer, Writer")]
        [HttpDelete("file/{publicId}")]
        public async Task<IActionResult> DeleteFile(string publicId)
        {
            try
            {
                await storageService.DeleteAsync(publicId);
                return Ok(ResponseDetail<bool>.Successful(true, "File deleted successfully"));
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"deleting file {publicId}");
                return StatusCode(500, ResponseDetail<bool>.Failed(false, "An error occurred while deleting file", 500, "Internal server error"));
            }
        }
    }
}
