using Bara.API.Scripts.Enums;

namespace Bara.API.Scripts.DTOs
{
    /// <summary>
    /// Request model for updating script status.
    /// </summary>
    public class UpdateScriptStatusRequest
    {
        /// <summary>
        /// The new status for the script.
        /// </summary>
        public required ScriptStatus Status { get; set; }
    }
}
