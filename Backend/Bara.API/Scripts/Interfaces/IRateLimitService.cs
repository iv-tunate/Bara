namespace Bara.API.Scripts.Interfaces
{
    public interface IRateLimitService
    {
        bool IsAllowed(Guid userId, Guid chatId, int maxMessagesPerMinute = 10);
        Task ResetAsync(Guid userId, Guid chatId);
    }
}
