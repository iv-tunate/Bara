using System.Security.Cryptography;
using System.Text;

namespace Services.Paystack
{
    public class PaystackWebhookVerifier
    {
        public static bool IsValidPaystackSignature(string body, string signatureHeader, string secret)
        {
            using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(secret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(body));
            string hashString = BitConverter.ToString(hash).Replace("-", "").ToLower();

            return hashString == signatureHeader.ToString().ToLower();
        }
    }
}
