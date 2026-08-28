using Bara.API.Utilities.Settings;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Services.ExternalAPI_Integration;
using Services.FileStorageServices.Interfaces;
using System.Net;

namespace Services.FileStorageServices.CloudinaryStorage
{
    public class CloudinaryService : IFileStorageService
    {
        private readonly string CloudinaryBaseURL = "";
        const string FOLDER_URL = "/folders/:folder";
        const string Search_FOLDER_URL = "/folders/search";

        private readonly AppSettings settings;
        private readonly Secrets secrets;
        private readonly ILogger<CloudinaryService> logger;
        private readonly ExternalApiIntegrationService integrationService;
        private readonly string BaseFolder = "";
        public CloudinaryService(IOptions<Secrets> secrets, IOptions<AppSettings> appSettings, ILogger<CloudinaryService> logger, ExternalApiIntegrationService externalApiIntegrationService)
        {
            this.secrets = secrets.Value;
            settings = appSettings.Value;
            CloudinaryBaseURL = $"{settings.CloudinaryBaseURL}/{secrets.Value.CloudinaryName}";
            this.logger = logger;
            BaseFolder = secrets.Value.CloudinaryFolderName;
            integrationService = externalApiIntegrationService;
        }
        public async Task<bool> DeleteAsync(string publicId)
        {
            try
            {
                var deletionParams = new DeletionParams(publicId)
                {
                    ResourceType = ResourceType.Raw,
                };
                var cloudinary = new Cloudinary(new Account(secrets.CloudinaryName, secrets.CloudinaryAPIKEY, secrets.CloudinaryAPISecret));
                var result = await cloudinary.DestroyAsync(deletionParams);

                return result.Result == "ok";
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception: {ex.GetType().Name} was thrown while deleting file {publicId}...\nBase Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}");
                return false;
            }
        }

        //Direct download
        public async Task<(MemoryStream?, string)> DownloadAsync(string urlOrPublicId)
        {
            try
            {
                logger.LogWarning($"[CloudinaryService] DownloadAsync called with: {urlOrPublicId}");
                var cloudinary = new Cloudinary(new Account(secrets.CloudinaryName, secrets.CloudinaryAPIKEY, secrets.CloudinaryAPISecret));

                string resourceUrl;
                
                if (urlOrPublicId.StartsWith("http://") || urlOrPublicId.StartsWith("https://"))
                {
                    resourceUrl = urlOrPublicId;
                    logger.LogWarning("[CloudinaryService] Using provided full URL.");
                }
                else
                {
                    resourceUrl = cloudinary.Api.Url
                        .ResourceType("raw")
                        .Action("upload")
                        //These two things no dey necessary tbf but woo... i sha leave am there
                        .Transform(new Transformation().Flags("attachment"))
                        .Signed(true)
                        .Secure(true)
                        .BuildUrl(urlOrPublicId);
                    logger.LogWarning($"[CloudinaryService] Generated Signed URL: {resourceUrl}");
                }

                var response = await integrationService.GetRequest(resourceUrl);
                if (!response.IsSuccessStatusCode)
                {
                    logger.LogWarning($"Cloudinary download failed with status {response.StatusCode} for {resourceUrl}. Content: {await response.Content.ReadAsStringAsync()}");
                    return default;
                }
                var stream = await response.Content.ReadAsStreamAsync();
                var contentHeader = new FileExtensionContentTypeProvider();
                if (!contentHeader.TryGetContentType(resourceUrl, out var contentType))
                {
                    contentType = "application/octet-stream";
                }
                var memoryStream = new MemoryStream();
                await stream.CopyToAsync(memoryStream);
                memoryStream.Seek(0, SeekOrigin.Begin);
                return (memoryStream, contentType);
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception: {ex.GetType().Name} was thrown while downloading file from {urlOrPublicId} on Cloudinary...\n" +
                    $"Base Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}", ex.Message);
                return default;
            }
        }

        public async Task<UploadResult> UploadDocumentAsync(string userDirectoryName, IFormFile file)
        {
            var result = new UploadResult();
            try
            {
                var cloudinary = new Cloudinary(new Account(secrets.CloudinaryName, secrets.CloudinaryAPIKEY, secrets.CloudinaryAPISecret));

                var documentFolder = $"{BaseFolder}/{userDirectoryName}/documents";

                var uploadParams = new RawUploadParams
                {
                    File = new FileDescription(file.FileName, file.OpenReadStream()),
                    Folder = documentFolder
                };

                var uploadResult = await cloudinary.UploadAsync(uploadParams);
                result.Success = uploadResult.StatusCode == HttpStatusCode.OK;
                result.Url = uploadResult.Url.ToString();
                result.PublicId = uploadResult.PublicId;
                return result;
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception: {ex.GetType().Name} was thrown while uploading to Cloudinary for {userDirectoryName}...\nBase Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}");
                return result;
            }
        }
        public async Task<UploadResult> UploadScriptAsync(string userDirectoryName, IFormFile file)
        {
            var result = new UploadResult();
            try
            {
                var cloudinary = new Cloudinary(new Account(secrets.CloudinaryName, secrets.CloudinaryAPIKEY, secrets.CloudinaryAPISecret));

                var scriptFolder = $"{BaseFolder}/{userDirectoryName}/scripts";

                var uploadParams = new RawUploadParams
                {
                    File = new FileDescription(file.FileName, file.OpenReadStream()),
                    Folder = scriptFolder,
                };

                var uploadResult = await cloudinary.UploadAsync(uploadParams);
                result.Success = uploadResult.StatusCode == HttpStatusCode.OK;
                result.Url = uploadResult.Url.ToString();
                result.PublicId = uploadResult.PublicId;
                return result;
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception: {ex.GetType().Name} was thrown while uploading to Cloudinary for {userDirectoryName}...\nBase Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}");
                return result;
            }
        }

        public string GenerateSignedUrl(string publicId, TimeSpan validFor)
        {
            try
            {
                var cloudinary = new Cloudinary(new Account(
                    secrets.CloudinaryName,
                    secrets.CloudinaryAPIKEY,
                    secrets.CloudinaryAPISecret));

                if (string.IsNullOrWhiteSpace(publicId))
                    throw new ArgumentException("publicId cannot be null or empty");

                var signedUrl = cloudinary.Api.Url
                    .ResourceType("raw")
                    .Action("upload")
                    .Transform(new Transformation().Flags("attachment"))
                    .Signed(true)
                    .Secure(true)
                    .BuildUrl(publicId);


                return signedUrl;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, $"Failed to generate signed URL for publicId: {publicId}");
                return null;
            }
        }

        private async Task<FolderResponse> GetAllFolders()
        {
            try
            {
                var cloudinary = new Cloudinary
                {

                };
                var folders = await cloudinary.SubFoldersAsync(secrets.CloudinaryFolderName);
                return new FolderResponse
                {
                    Folders = folders.Folders.Select(f => new Folder
                    {
                        Name = f.Name,
                        Path = f.Path,
                    }).ToList(),
                    NextCursor = null,
                    TotalCount = folders.TotalCount
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching folders: {ex.Message}");
            }
        }
    }
}
