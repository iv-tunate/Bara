using Bara.API.Utilities.Interfaces;
using Ganss.Xss;
using System.Net;

namespace Bara.API.Utilities.Repositories
{
    public class SanitizationService : ISanitizationService
    {
        private readonly HtmlSanitizer sanitizer;
        private readonly ILogger<SanitizationService> logger;

        public SanitizationService(ILogger<SanitizationService> logger)
        {
            this.logger = logger;
            this.sanitizer = new HtmlSanitizer();
            this.sanitizer.AllowedTags.Clear();
            this.sanitizer.AllowedAttributes.Clear();
        }

        public string SanitizeHtml(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            try
            {
                var sanitized = sanitizer.Sanitize(input);
                return sanitized;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error sanitizing HTML content");
                return WebUtility.HtmlEncode(input);
            }
        }

        public string SanitizeUrl(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            try
            {
                if (!Uri.TryCreate(input, UriKind.Absolute, out var uri))
                    return string.Empty;

                if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
                    return string.Empty;

                return uri.AbsoluteUri;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error sanitizing URL");
                return string.Empty;
            }
        }
    }
}
