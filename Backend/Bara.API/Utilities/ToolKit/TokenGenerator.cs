using System.Security.Cryptography;

namespace Bara.API.Utilities.ToolKit
{
    public static class TokenGenerator
    {

        public static string GeneratePaymentReference(string prefix = "BARA")
        {
            var buffer = RandomNumberGenerator.GetBytes(12);
            var randomHex = Convert.ToHexString(buffer);   
            var randomGuid = Guid.NewGuid().ToByteArray();
            var guidHex = Convert.ToHexString(randomGuid);
            return $"{prefix}-{DateTime.UtcNow:yyyyMMddHHmmss}-{randomHex}-{guidHex}";
        }

    }
}
