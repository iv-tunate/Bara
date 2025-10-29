namespace Services.YouVerifyIntegration
{
    /// <summary>
    /// Represents the KYC data required for a YouVerify verification request.
    /// </summary>
    public record YouVerifyKycDto
    {
        /// <summary>
        /// The unique identifier for the subject (e.g., BVN, NIN, etc.).
        /// </summary>
        public required string Id { get; init; }

        /// <summary>
        /// The document type for verification (e.g., "bvn", "nin", "passport").
        /// </summary>
        public required string Type { get; init; }

        /// <summary>
        /// The last name of the subject for additional identity matching.
        /// </summary>
        public string LastName { get; init; } = default!;

        /// <summary>
        /// Indicates whether the subject has consented to the verification.
        /// </summary>
        public bool IsSubjectConsent { get; init; } = true;

        public Guid UserId { get; init; }
        public int RetryCount { get; set; } = 0;
    }
}
