using Newtonsoft.Json;

namespace Services.YouVerifyIntegration
{
    /// <summary>
    /// Represents the successful response structure from YouVerify after a verification request.
    /// </summary>
    public class YouVerifyResponse
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("statusCode")]
        public int StatusCode { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }

        [JsonProperty("data")]
        public ResponseData Data { get; set; } = default!;
    }

    /// <summary>
    /// Represents the error response structure from YouVerify when a request fails.
    /// </summary>
    public class YouVerifyErrorResponse
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("statusCode")]
        public int StatusCode { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }
    }

    /// <summary>
    /// Represents the payload of verification data returned by YouVerify.
    /// </summary>
    public class ResponseData
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("firstName")]
        public string FirstName { get; set; }

        [JsonProperty("lastName")]
        public string LastName { get; set; }

        [JsonProperty("middleName")]
        public string MiddleName { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("mobile")]
        public string Mobile { get; set; }

        [JsonProperty("dateOfBirth")]
        public string DateOfBirth { get; set; }
        [JsonProperty("gender")]
        public string Gender { get; set; }
    }

    public class YouVerifyWebhookEvent
    {
        [JsonProperty("event")]
        public string Event { get; set; }
        [JsonProperty("data")]
        public IdentityVerificationData Data { get; set; }
    }

    public class IdentityVerificationData
    {
        [JsonProperty("firstName")]
        public string FirstName { get; set; }
        [JsonProperty("lastName")]
        public string LastName { get; set; }
        [JsonProperty("gender")]
        public string Gender { get; set; }
        [JsonProperty("idNumber")]
        public string IdNumber { get; set; }
        [JsonProperty("type")]
        public string Type { get; set; }
        [JsonProperty("dateOfBirth")]
        public string DateOfBirth { get; set; }
        [JsonProperty("dataValidation")]
        public bool DataValidation { get; set; }
        [JsonProperty("validations")]
        public Validations Validations { get; set; }
    }

    public class Validations
    {
        [JsonProperty("dateOfBirth")]
        public ValidationField DateOfBirth { get; set; }
    }

    public class ValidationField
    {
        [JsonProperty("validated")]
        public bool Validated { get; set; }
        [JsonProperty("value")]
        public string Value { get; set; }
    }

    public class YouVerifyKickoffResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        [JsonProperty("data")]
        public ResponseData? Data { get; set; }
    }
}
