using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Net.Http.Json;
using System.Text;

namespace Services.ExternalAPI_Integration
{
    /// <summary>
    /// Service for integrating with external APIs using HttpClient.
    /// Provides methods for sending GET and POST requests and retrieving IP-related information.
    /// </summary>
    public class ExternalApiIntegrationService(IHttpClientFactory clientFactory, ILogger<ExternalApiIntegrationService> log)
    {
        private readonly IHttpClientFactory httpClient = clientFactory;
        private readonly ILogger<ExternalApiIntegrationService> logger = log;

        /// <summary>
        /// Serializes an object into a JSON-formatted <see cref="StringContent"/> suitable for HTTP requests.
        /// </summary>
        /// <param name="reqBody">The request body object to serialize.</param>
        /// <returns>A <see cref="StringContent"/> instance containing the serialized JSON.</returns>
        public StringContent SerializeReqBody(object reqBody)
        {
            var json = JsonConvert.SerializeObject(reqBody);
            var result = new StringContent(json, Encoding.UTF8, "application/json");
            return result;
        }

        /// <summary>
        /// Sends a POST request to the specified URL with optional headers.
        /// </summary>
        /// <param name="jsonBody">The JSON-formatted request body.</param>
        /// <param name="url">The endpoint to which the POST request is sent.</param>
        /// <param name="keyValuePairs">Optional headers to add to the request.</param>
        /// <param name="clientName">The named HTTP client to use (default is "default").</param>
        /// <returns>An <see cref="HttpResponseMessage"/> representing the response.</returns>
        public async Task<HttpResponseMessage> SendPostRequest(StringContent jsonBody, string url, Dictionary<string, string>? keyValuePairs = null, string clientName = "default")
        {
            try
            {
                var client = httpClient.CreateClient(clientName);

                if (keyValuePairs != null)
                {
                    foreach (var kvp in keyValuePairs)
                    {
                        if (!client.DefaultRequestHeaders.Contains(kvp.Key))
                            client.DefaultRequestHeaders.Add(kvp.Key, kvp.Value);
                    }
                }

                var response = await client.PostAsync(url, jsonBody);
                return response;
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Sends a GET request to the specified URL with optional headers.
        /// </summary>
        /// <param name="url">The endpoint to which the GET request is sent.</param>
        /// <param name="keyValuePairs">Optional headers to add to the request.</param>
        /// <param name="clientName">The named HTTP client to use (default is "default").</param>
        /// <returns>An <see cref="HttpResponseMessage"/> representing the response.</returns>
        public async Task<HttpResponseMessage> GetRequest(string url, Dictionary<string, string>? keyValuePairs = null, string clientName = "default")
        {
            try
            {
                var client = httpClient.CreateClient(clientName);
                if (keyValuePairs != null)
                {
                    foreach (var kvp in keyValuePairs)
                    {
                        if (!client.DefaultRequestHeaders.Contains(kvp.Key))
                            client.DefaultRequestHeaders.Add(kvp.Key, kvp.Value);
                    }
                }
                var res = await client.GetAsync(url);
                return res;
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Retrieves the user's public IP address and country using the IPInfo API.
        /// </summary>
        /// <param name="token">The API token for authenticating with the IPInfo service.</param>
        /// <returns>A tuple containing the user's IP address and country. If failed, returns ("Unknown", "Unknown").</returns>
        public async Task<(string Ip, string Country)> GetIpAndCountryAsync(string token)
        {
            try
            {
                var url = $"https://ipinfo.io/lite/me?token={token}";
                var response = await httpClient.CreateClient().GetFromJsonAsync<IpInfoResponse>(url);

                if (response == null || string.IsNullOrWhiteSpace(response.Ip))
                    throw new Exception("Could not retrieve IP info");

                return (response.Ip, response.Country);
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception of type {ex.GetType().Name} was thrown while fetching IP details");
                return ("Unknown", "Unknown");
            }
        }
    }
}
