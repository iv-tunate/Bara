using Bara.API.Services.BackgroudServices;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using Bara.API.Services.YouVerifyIntegration;
using Bara.API.Users.DTOs.DocumentDTOs;
using Bara.API.Users.Enums;
using Hangfire;
using System.Text.RegularExpressions;

namespace Bara.API.Utilities.ToolKit
{
    /// <summary>
    /// Helper class for initiating KYC verification processes.
    /// Centralizes KYC logic to avoid code duplication across repositories.
    /// </summary>
    public static class KycHelper
    {
        /// <summary>
        /// Initiates the KYC verification process for a user by creating a YouVerifyKycDto
        /// and enqueueing a background job via Hangfire.
        /// </summary>
        /// <param name="verificationNumber">The verification document number (BVN, NIN, etc.)</param>
        /// <param name="documentType">The type of verification document</param>
        /// <param name="userId">The unique identifier of the user</param>
        /// <param name="lastName">User's last name (required for some verification types)</param>
        public static void InitiateKycProcess(
            string verificationNumber,
            DocumentType documentType,
            Guid userId,
            string lastName)
        {
            var kycDetail = new YouVerifyKycDto
            {
                Id = verificationNumber,
                Type = documentType.ToString(),
                UserId = userId,
                LastName = lastName,
            };

            BackgroundJob.Enqueue<HangfireJobs>(hangfire => hangfire.StartKycProcess(kycDetail));
        }

        /// <summary>
        /// Verifies that the verification number on the uploaded PDF document matches the verification number entered by the user.
        /// </summary>
        /// <param name="verificationNumber">The verification document number (BVN, NIN, etc.)</param>
        /// <param name="document">The uploaded document details</param>
        public static async Task<bool> VerifyDocumentNumber(string verificationNumber, PostDocumentDetailDTO document)
        {
            try
            {
                using var stream = document.Document.OpenReadStream(); 

                var pdfText = ExtractTextFromPdf(stream);

                verificationNumber = verificationNumber?.Trim();

                var numberPattern = document.Type switch
                {
                    DocumentType.BVN => @"\b\d{11}\b",
                    DocumentType.NIN => @"\b\d{11}\b",
                    DocumentType.International_Passport => @"\b[A-Z]\d{8}\b",
                    DocumentType.Drivers_License => @"\b[A-Z0-9\-]+\b",
                    _ => @"\b[\w\-]+\b"
                };

                var regex = new Regex(
                    numberPattern,
                    RegexOptions.IgnoreCase
                );

                var matches = regex.Matches(pdfText);

                var foundMatch = matches
                    .Cast<Match>()
                    .Any(m => string.Equals(m.Value.Trim(), verificationNumber,
                        StringComparison.OrdinalIgnoreCase));

                return foundMatch;
            }
            catch
            {
                return false;
            }
        }

        private static string ExtractTextFromPdf(Stream stream)
        {
            using var pdf = PdfDocument.Open(stream);

            var builder = new System.Text.StringBuilder();

            foreach (Page page in pdf.GetPages())
            {
                builder.AppendLine(page.Text);
            }

            return builder.ToString();
        }
    }
}
