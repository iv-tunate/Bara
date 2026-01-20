using Bara.API.DataContext;
using Bara.API.Support.DTOs;
using Bara.API.Support.Interfaces;
using Bara.API.Support.Models;
using Microsoft.EntityFrameworkCore;

namespace Bara.API.Support.Repositories
{
    public class SupportChatRepository : ISupportChatRepository
    {
        private readonly BaraContext dbContext;

        public SupportChatRepository(BaraContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<SupportChat?> GetChatByUserIdAsync(Guid userId)
        {
            return await dbContext.SupportChats
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<SupportChat> CreateChatAsync(Guid userId)
        {
            var chat = new SupportChat
            {
                UserId = userId,
                LastMessageAt = DateTimeOffset.UtcNow
            };
            
            await dbContext.SupportChats.AddAsync(chat);
            await dbContext.SaveChangesAsync();
            return chat;
        }

        public async Task<SupportChatMessage> AddMessageAsync(SupportChatMessage message)
        {
            await dbContext.SupportChatMessages.AddAsync(message);
            await dbContext.SaveChangesAsync();
            return message;
        }

        public async Task<List<SupportChatMessageDTO>> GetChatHistoryAsync(Guid userId, int page, int pageSize)
        {
            return await dbContext.SupportChatMessages
                .Where(m => m.SupportChat.UserId == userId)
                .OrderByDescending(m => m.SentAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new SupportChatMessageDTO
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    IsAdminSender = m.IsAdminSender,
                    Content = m.Content,
                    SentAt = m.SentAt,
                    IsRead = m.IsRead
                })
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }

        public async Task<List<SupportChatSummaryDTO>> GetAllChatsAsync(int page, int pageSize, string? searchTerm)
        {
            var query = dbContext.SupportChats
                .Include(c => c.User)
                .ThenInclude(u => u.AuthProfile)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(c => 
                    c.User.AuthProfile.FullName.ToLower().Contains(searchTerm) || 
                    c.User.Email.ToLower().Contains(searchTerm));
            }

            var chats = await query
                .OrderByDescending(c => c.LastMessageAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new
                {
                    c.UserId,
                    UserName = c.User.AuthProfile.FullName,
                    UserEmail = c.User.Email,
                    UserProfileImage = c.User.ProfileImageUrl,
                    c.IsBlocked,
                    LastMessage = c.Messages.OrderByDescending(m => m.SentAt).Select(m => m.Content).FirstOrDefault(),
                    LastMessageAt = c.LastMessageAt,
                    UnreadCount = c.Messages.Count(m => !m.IsRead && !m.IsAdminSender)
                })
                .ToListAsync();

            return chats.Select(c => new SupportChatSummaryDTO
            {
                UserId = c.UserId,
                UserName = c.UserName,
                UserEmail = c.UserEmail,
                UserProfileImage = c.UserProfileImage,
                IsBlocked = c.IsBlocked,
                LastMessage = c.LastMessage ?? "",
                LastMessageAt = c.LastMessageAt,
                UnreadCount = c.UnreadCount
            }).ToList();
        }

        public async Task<bool> ToggleBlockStatusAsync(Guid userId, bool isBlocked)
        {
            var chat = await dbContext.SupportChats.FirstOrDefaultAsync(c => c.UserId == userId);
            if (chat == null) return false;

            chat.IsBlocked = isBlocked;
            return await dbContext.SaveChangesAsync() > 0;
        }

        public async Task<int> MarkMessagesAsReadAsync(Guid userId, bool asAdmin)
        {
            var query = dbContext.SupportChatMessages
                .Where(m => m.SupportChat.UserId == userId && !m.IsRead);

            if (asAdmin)
                query = query.Where(m => !m.IsAdminSender);
            else
                query = query.Where(m => m.IsAdminSender);

            var messages = await query.ToListAsync();
            foreach (var msg in messages)
            {
                msg.IsRead = true;
            }

            return await dbContext.SaveChangesAsync();
        }

        public async Task<bool> HasExceededDailyLimitAsync(Guid userId, int limit)
        {
            var yesterday = DateTimeOffset.UtcNow.AddDays(-1);
            var count = await dbContext.SupportChatMessages
                .CountAsync(m => m.SupportChat.UserId == userId && 
                                 m.SenderId == userId && 
                                 m.SentAt > yesterday);
            return count >= limit;
        }

        public async Task UpdateChatTimestampAsync(Guid chatId)
        {
            var chat = await dbContext.SupportChats.FindAsync(chatId);
            if (chat != null)
            {
                chat.LastMessageAt = DateTimeOffset.UtcNow;
                await dbContext.SaveChangesAsync();
            }
        }
    }
}
