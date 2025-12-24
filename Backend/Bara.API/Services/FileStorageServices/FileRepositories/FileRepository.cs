using Bara.API.DataContext;
using Bara.API.Services.BackgroudServices;
using Bara.API.Users.DTOs.DocumentDTOs;
using Bara.API.Users.Models;
using Bara.API.Utilities.Settings;
using Bara.API.Utilities.ToolKit;
using Microsoft.Extensions.Options;
using Services.FileStorageServices.Interfaces;

namespace Bara.API.Services.FileStorageServices.FileRepositories
{
    /// <summary>
    /// Service class for handling file operations and saving them to the database
    /// </summary>
    public class FileRepository : IFileService
    {
        private readonly IFileStorageService storageService;
        private readonly BaraContext context;
        private readonly AppSettings settings;
        private readonly Secrets secrets;
        private readonly ILogger<FileRepository> logger;
        private readonly HangfireJobs hangfire;
        public FileRepository(IFileStorageService fileStorageService, BaraContext baraContext,
            IOptions<AppSettings> settings, IOptions<Secrets> secrets, ILogger<FileRepository> logger, HangfireJobs hangfire)
        {
            storageService = fileStorageService;
            context = baraContext;
            this.settings = settings.Value;
            this.secrets = secrets.Value;
            this.logger = logger;
            this.hangfire = hangfire;
        }

        public async Task<ResponseDetail<Document>> ProcessDocumentForUpload(Guid userId, string userDirectoryName, PostDocumentDetailDTO documentDetail)
        {
            try
            {
                var file = documentDetail.Document;
                long limit = 2 * 1024 * 1024;
                var fileSizeExceedLimit = file.Length > limit;
                if (fileSizeExceedLimit)
                {
                    return ResponseDetail<Document>.Failed($"Document exceeds limit of {limit}", 413, "File Limit Exceeded");
                }

                var allowedExtensions = new[] { ".pdf" };
                var allowedMimeTypes = new[] { "application/pdf" };

                var fileName = file.FileName.Trim();
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

                var fileFormatIsAcceptable = allowedExtensions.Contains(fileExtension) &&
                                             allowedMimeTypes.Contains(file.ContentType);
                if (!fileFormatIsAcceptable)
                {
                    return ResponseDetail<Document>.Failed($"File format {fileExtension} or mime type {file.ContentType} is not supported. " +
                                                                    $"Allowed Extensions are: {string.Join(", ", allowedExtensions)}..." +
                                                                    $"\n Allowed mime types are: {string.Join(", ", allowedMimeTypes)}", 415, "Invalid File Type");
                }
                //var documentNumberValidation = await KycHelper.VerifyDocumentNumber(documentDetail.VerificationNumber, documentDetail);
                //if (documentNumberValidation is false)
                //{
                //    return ResponseDetail<Document>.Failed($"The number on the uploaded {documentDetail.Type} verification document doesn't match the submitted {documentDetail.Type} number." +
                //        $" Please ensure they match ", 400, "Invalid Verification Number");
                //}
                var uploadResult = await storageService.UploadDocumentAsync(userDirectoryName, file);
                if (!uploadResult.Success)
                {
                    logger.LogError($"An error occured while uploading the verification document for user: {userDirectoryName} ");
                    return ResponseDetail<Document>.Failed("An error occurred while processing the verification document. Please try again later.", 500, "Upload Failed");
                }
                var document = new Document
                {
                    Size = file.Length,
                    DocumentType = documentDetail.Type,
                    FileExtension = fileExtension,
                    Name = fileName,
                    IdentificationNumber = documentDetail.VerificationNumber,
                    Path = $"{uploadResult.PublicId}",
                    DocumentUrl = $"{uploadResult.Url}",
                    UserId = userId,
                };

                await context.Documents.AddAsync(document);
                await context.SaveChangesAsync();

                return ResponseDetail<Document>.Successful(document, "Document uploaded successfully");
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception: {ex.GetType().Name} was thrown while processing the document...\nBase Exception: {ex.GetBaseException().GetType()}", $"Exception Code: {ex.HResult}");
                return ResponseDetail<Document>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }
    }
}
