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
