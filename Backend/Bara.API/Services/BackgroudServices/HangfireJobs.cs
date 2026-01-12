using Bara.API.DataContext;
using Bara.API.Services.FileStorageServices.CloudfareStorage;
using Bara.API.Services.YouVerifyIntegration;
using Bara.API.Utilities.Models;
using Bara.API.Utilities.ToolKit;
using Hangfire;
using Services.FileStorageServices.Interfaces;
using Services.MailingService;
using System.Diagnostics;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace Bara.API.Services.BackgroudServices
{
    /// <summary>
    /// This class is responsible for managing background jobs using Hangfire.
    /// </summary>
    public class HangfireJobs
    {
        private readonly ILogger<HangfireJobs> logger;
        private readonly IMailService mailService;
        private readonly IYouVerifyService youVerify;
        private readonly LogHelper<HangfireJobs> logHelper;
        private readonly IFileStorageService fileStorage;
        private readonly BaraContext _context;
        private readonly IConfiguration _config;
        public HangfireJobs(IMailService mailService, ILogger<HangfireJobs> logger,
            IYouVerifyService youVerify, LogHelper<HangfireJobs> logHelper, IFileStorageService fileStorageService, BaraContext context, IConfiguration config)
        {
            this.mailService = mailService;
            this.logger = logger;
            this.youVerify = youVerify;
            this.logHelper = logHelper;
            fileStorage = fileStorageService;
            _context = context;
            _config = config;
        }

        [AutomaticRetry(Attempts = 3, DelaysInSeconds = [10, 30, 60])]
        public async Task SendMailAsync(MailRequestDTO mail)
        {
            try
            {
                var response = await mailService.SendMail(mail);
                if (!response.IsSuccess)
                {
                    logger.LogError($"Failed to send email to {mail.Receiver}: {response.Message}");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"An error occurred while sending email to {mail.Receiver}");
            }
        }
        [AutomaticRetry(Attempts = 3, DelaysInSeconds = [10, 30, 60])]
        public async Task StartKycProcess(YouVerifyKycDto payload)
        {
            try
            {
                var res = await youVerify.VerifyIdentificationNumberAsync(payload);

                if (!res.Success)
                {
                    logger.LogError($"Failure verifying user on YouVerify: {res.Message}");
                }
                else if (res.Success)
                {
                    logger.LogInformation($"KYC verification in progress for user with ID: {payload.UserId}");
                }
            }
            catch (OperationCanceledException)
            {
                logger.LogWarning($"Background KYC verification timed out for user {payload.UserId}");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Verifying user on Youverify's service");
            }
        }

        [AutomaticRetry(Attempts = 3, DelaysInSeconds = [10, 30, 60])]
        public async Task ProcessDocumentForUpload(string userDirectoryName, IFormFile file)
        {
            try
            {
                var response = await fileStorage.UploadDocumentAsync(userDirectoryName, file);
                if (response.Success is false)
                {
                    logger.LogInformation($"Uploading verification document to {userDirectoryName} was unsuccessful");
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"An exception was thrown while uploading the verification doc for {userDirectoryName}");
            }
        }

        public async Task RunBackupAsync(string adminEmail)
        {
            var timestamp = DateTime.UtcNow;
            var fileName = $"bara_backup_{timestamp:yyyyMMdd_HHmmss}.dump.gz";

            var backupRecord = new DatabaseBackup
            {
                CreatedAt = timestamp,
                Status = "Pending",
                FileName = fileName,
                TriggeredBy = adminEmail
            };
            _context.DatabaseBackups.Add(backupRecord);
            await _context.SaveChangesAsync();

            string dumpPath = Path.Combine(Path.GetTempPath(), fileName);

            try
            {
                var connectionString = _config.GetConnectionString("Connection");
                var builder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString);

                var pgDumpArgs = $"--format=custom --no-owner --no-privileges --host={builder.Host} --port={builder.Port} --username={builder.Username} --dbname={builder.Database} --file=\"{dumpPath}\"";

                var pgDumpPath = @"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe";

                if (!File.Exists(pgDumpPath))
                {
                    throw new FileNotFoundException("pg_dump not found", pgDumpPath);
                }

                var psi = new ProcessStartInfo
                {
                    FileName = pgDumpPath,
                    Arguments = pgDumpArgs,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                if (!string.IsNullOrEmpty(builder.Password))
                {
                    psi.EnvironmentVariables["PGPASSWORD"] = builder.Password;
                }

                using (var process = Process.Start(psi))
                {
                    await process.WaitForExitAsync();
                    if (process.ExitCode != 0)
                    {
                        var err = await process.StandardError.ReadToEndAsync();
                        throw new Exception($"pg_dump failed: {err}");
                    }
                }
                
                await using var fs = File.OpenRead(dumpPath);
                var formFile = new FormFile(fs, 0, fs.Length, "backup", fileName)
                {
                    Headers = new HeaderDictionary(),
                    ContentType = "application/x-gzip"
                };
                var uploadResult = await fileStorage.UploadDocumentAsync("DatabaseBackups", formFile);

                if (!uploadResult.Success)
                    throw new Exception("Upload to R2 failed");
                
                backupRecord.Status = "Success";
                backupRecord.FileUrl = uploadResult.Url;
                backupRecord.FileSize = fs.Length;
                await _context.SaveChangesAsync();

                string signedUrl = uploadResult.Url;
                if (fileStorage is CloudflareR2Service r2Service)
                {
                     signedUrl = r2Service.GenerateSignedUrl(uploadResult.PublicId, TimeSpan.FromDays(7));
                }

                var mailReqBody = new MailRequestDTO
                {
                    Receiver = adminEmail,
                    Subject = "Database Backup Completed",
                    Body = $"Backup completed at {timestamp:u}. Download here (Valid for 7 days): {signedUrl}"
                };
                await mailService.SendMail(mailReqBody);

                logger.LogInformation($"Database backup completed successfully: {fileName}");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Database backup job failed");
                backupRecord.Status = "Failed";
                await _context.SaveChangesAsync();
            }
            finally
            {
                if (File.Exists(dumpPath))
                {
                    try 
                    {
                        File.Delete(dumpPath);
                    }
                    catch (Exception deleteEx)
                    {
                        logger.LogError(deleteEx, $"Failed to delete temp backup file: {dumpPath}");
                    }
                }
            }
        }
    }
}
