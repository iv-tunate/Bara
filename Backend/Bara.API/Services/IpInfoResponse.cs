namespace Services
{
    /// <summary>
    /// Represents the response model returned from an external IP geolocation service.
    /// </summary>
    internal class IpInfoResponse
    {
        /// <summary>
        /// Gets or sets the public IP address of the client.
        /// </summary>
        public string Ip { get; set; }

        /// <summary>
        /// Gets or sets the country associated with the IP address.
        /// </summary>
        public string Country { get; set; }
    }
}

