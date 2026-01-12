using Amazon.S3;
using Amazon.S3.Model;
using Bara.API.Utilities.Settings;
using Microsoft.Extensions.Options;
using Services.FileStorageServices;
using Services.FileStorageServices.Interfaces;

namespace Bara.API.Services.FileStorageServices.CloudfareStorage
{
    public class CloudflareR2Service : IFileStorageService
    {
        private readonly ILogger<CloudflareR2Service> _logger;
        private readonly Secrets _secrets;
        private readonly AppSettings settings;
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private readonly string _baseFolder;

        public CloudflareR2Service(
            IOptions<Secrets> secrets,
            ILogger<CloudflareR2Service> logger, IOptions<AppSettings> settings)
        {
            _secrets = secrets.Value;
            _logger = logger;
            this.settings = settings.Value;
            _bucketName = secrets.Value.R2BucketName;
            _baseFolder = "bara"; 

            var config = new AmazonS3Config
            {
                ServiceURL = settings.Value.R2Endpoint, 
                ForcePathStyle = true 
            };

            _s3Client = new AmazonS3Client(secrets.Value.R2AccessKeyId,
                secrets.Value.R2SecretAccessKey, config);
        }

        public async Task<UploadResult> UploadDocumentAsync(string userDirectoryName, IFormFile file)
        {
            var result = new UploadResult();
            try
            {
                var key = $"{_baseFolder}/{userDirectoryName}/documents/{file.FileName}";

                using var stream = file.OpenReadStream();
                var putRequest = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key,
                    InputStream = stream,
                    ContentType = file.ContentType,
                    
                };

                var response = await _s3Client.PutObjectAsync(putRequest);
                _logger.LogInformation("Cloudfare returned this response {response:} while trying to upload a document", response);
                result.Success = response.HttpStatusCode == System.Net.HttpStatusCode.OK;
                result.Url = $"{settings.R2PublicUrl}/{key}";
                result.PublicId = key;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed uploading document to R2 for {userDirectoryName}");
                return result;
            }
        }

        public async Task<(MemoryStream?, string)> DownloadAsync(string urlOrKey)
        {
            try
            {
                var key = urlOrKey.Replace($"{settings.R2PublicUrl}/", "");

                var getRequest = new GetObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };

                using var response = await _s3Client.GetObjectAsync(getRequest);
                using var memoryStream = new MemoryStream();
                await response.ResponseStream.CopyToAsync(memoryStream);
                memoryStream.Position = 0;

                return (memoryStream, response.Headers.ContentType ?? "application/octet-stream");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed downloading file {urlOrKey} from R2");
                return default;
            }
        }

        public async Task<bool> DeleteAsync(string key)
        {
            try
            {
                var deleteRequest = new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };

                var response = await _s3Client.DeleteObjectAsync(deleteRequest);
                return response.HttpStatusCode == System.Net.HttpStatusCode.NoContent;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed deleting {key} from R2");
                return false;
            }
        }

        public string GenerateSignedUrl(string key, TimeSpan expiry)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = key,
                Expires = DateTime.UtcNow.Add(expiry)
            };

            return _s3Client.GetPreSignedURL(request);
        }

        public async Task<UploadResult> UploadScriptAsync(string userDirectoryName, IFormFile file)
        {
            var result = new UploadResult();
            try
            {
                var key = $"{_baseFolder}/{userDirectoryName}/scripts/{file.FileName}";

                using var stream = file.OpenReadStream();
                var putRequest = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key,
                    InputStream = stream,
                    ContentType = file.ContentType
                };

                var response = await _s3Client.PutObjectAsync(putRequest);

                result.Success = response.HttpStatusCode == System.Net.HttpStatusCode.OK;
                result.Url = $"{settings.R2PublicUrl}/{key}";
                result.PublicId = key;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed uploading document to R2 for {userDirectoryName}");
                return result;
            }
        }
    }
}
