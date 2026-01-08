using System;

namespace Bara.API.Users.DTOs
{
    public class PlatformStatsDTO
    {
        public int TotalUsers { get; set; }
        public int PendingKyc { get; set; }
        public int BlacklistedUsers { get; set; }
        public int TotalScripts { get; set; }
        public decimal TotalPlatformEarnings { get; set; }
    }
}
