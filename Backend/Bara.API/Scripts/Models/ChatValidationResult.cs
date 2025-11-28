namespace Bara.API.Scripts.Models
{
    public class ChatValidationResult
    {
        public bool IsValid { get; }
        public string Message { get; }
        public int StatusCode { get; }

        private ChatValidationResult(bool isValid, string message = "", int statusCode = 0)
        {
            IsValid = isValid;
            Message = message;
            StatusCode = statusCode;
        }

        public static ChatValidationResult Success() => new(true);
        public static ChatValidationResult Failure(string message, int statusCode = 400)
            => new(false, message, statusCode);
    }
}
