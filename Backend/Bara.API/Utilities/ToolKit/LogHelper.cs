namespace Bara.API.Utilities.ToolKit
{
    public class LogHelper<T>
    {
        private readonly ILogger<T> logger;
        public LogHelper(ILogger<T> logger)
        {
            this.logger = logger;
        }
        public void LogExceptionError(string name, string baseEx, string when = "performing this operation", string message = "")
        {
            logger.LogError($"An exception of type: {name} was thrown while {when}", message);
        }
    }
}
