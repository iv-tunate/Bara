using Bara.API.Services.BackgroudServices;
using Bara.API.Services.YouVerifyIntegration;
using Bara.API.Users.Enums;
using Hangfire;

namespace Bara.API.Utilities.Helpers
{
    /// <summary>
    /// Static helper class for initiating KYC verification processes.
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
    }
}
