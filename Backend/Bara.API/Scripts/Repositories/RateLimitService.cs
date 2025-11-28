using Bara.API.Scripts.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;

namespace Bara.API.Scripts.Repositories
{
    public class RateLimitService : IRateLimitService
    {
        // private readonly IDistributedCache cache;
        private readonly IMemoryCache cache;
        private readonly ILogger<RateLimitService> logger;
        private const string CacheKeyPrefix = "ratelimit:chat:";
        public RateLimitService(IMemoryCache cache, ILogger<RateLimitService> logger)
        {
            this.cache = cache;
            this.logger = logger;
        }

        public bool IsAllowed(Guid userId, Guid chatId, int maxMessagesPerMinute = 10)
        {
            var cacheKey = $"{CacheKeyPrefix}{userId}:{chatId}";

            try
            {
                int count = cache.Get<int>(cacheKey);

                if (count >= maxMessagesPerMinute)
                {
                    logger.LogWarning("Rate limit exceeded - UserId: {UserId}, ChatId: {ChatId}", userId, chatId);
                    return false;
                }

                cache.Set(
                    cacheKey,
                    count + 1,
                    new MemoryCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1)
                    });

                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error checking rate limit - UserId: {UserId}, ChatId: {ChatId}", userId, chatId);
                return true;
            }
        }
        //public async Task<bool> IsAllowedAsync(Guid userId, Guid chatId, int maxMessagesPerMinute = 10)
        //{
        //    var cacheKey = $"{CacheKeyPrefix}{userId}:{chatId}";

        //    try
        //    {
        //      //  var countStr = await cache.GetStringAsync(cacheKey);
        //        var countStr = cache.Get<string>(cacheKey);
        //        int count = string.IsNullOrEmpty(countStr) ? 0 : int.Parse(countStr);

        //        if (count >= maxMessagesPerMinute)
        //        {
        //            logger.LogWarning("Rate limit exceeded for UserId: {UserId}, ChatId: {ChatId}", userId, chatId);
        //            return false;
        //        }

        //        //await cache.SetStringAsync(
        //        //    cacheKey,
        //        //    (count + 1).ToString(),
        //        //    new DistributedCacheEntryOptions
        //        //    {
        //        //        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1)
        //        //    });
        //        cache.Set(
        //            cacheKey,
        //            (count + 1).ToString(),
        //            new MemoryCacheEntryOptions
        //            {
        //                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1)
        //            });

        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.LogError(ex, "Error checking rate limit for UserId: {UserId}, ChatId: {ChatId}", userId, chatId);
        //        return true;
        //    }
        //}

        public async Task ResetAsync(Guid userId, Guid chatId)
        {
            var cacheKey = $"{CacheKeyPrefix}{userId}:{chatId}";
            //await cache.RemoveAsync(cacheKey);
            cache.Remove(cacheKey);
        }
    }
}
