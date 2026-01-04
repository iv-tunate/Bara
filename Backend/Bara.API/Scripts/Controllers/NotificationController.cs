using Bara.API.DataContext;
using Bara.API.Scripts.DTOs;
using Bara.API.Scripts.Enums;
using Bara.API.Scripts.Models;
using Bara.API.Transactions.Enums;
using Bara.API.Utilities.Models;
using Bara.API.Utilities.ToolKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Bara.API.Scripts.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly BaraContext _context;
        private readonly LogHelper<NotificationController> _logHelper;

        public NotificationController(BaraContext context, LogHelper<NotificationController> logHelper)
        {
            _context = context;
            _logHelper = logHelper;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications(int page = 1, int pageSize = 20)
        {
            var userIdStr = User.FindFirstValue("UserId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            try
            {
                var notifications = new List<NotificationDTO>();
                
                int fetchCount = page * pageSize;

                var scriptTransactions = await _context.ScriptTransactions
                    .Where(t => t.ProducerId == userId || t.WriterId == userId)
                    .OrderByDescending(t => t.CreatedAt)
                    .Take(fetchCount)
                    .ToListAsync();

                foreach (var tx in scriptTransactions)
                {
                    string message = "";
                    if (tx.ProducerId == userId) 
                    {
                        message = $"Transaction for '{tx.ScriptTitle}' is {tx.TransactionStatus}.";
                    }
                    else 
                    {
                        message = $"Transaction for '{tx.ScriptTitle}' initiated.";
                        if (tx.TransactionStatus == ScriptTransactionStatus.Completed)
                            message = $"Transaction for '{tx.ScriptTitle}' completed. Funds released.";
                    }

                    notifications.Add(new NotificationDTO
                    {
                        Id = tx.Id.ToString(),
                        Title = "Script Transaction",
                        Message = message,
                        Date = tx.CreatedAt,
                        IsRead = (DateTimeOffset.UtcNow - tx.CreatedAt).TotalHours > 24, 
                        Type = "transaction"
                    });
                }

                var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
                if (wallet != null)
                {
                    var walletTransactions = await _context.Transactions
                        .Where(t => t.WalletID == wallet.Id)
                        .OrderByDescending(t => t.CreatedAt)
                        .Take(fetchCount)
                        .ToListAsync();

                    foreach (var wx in walletTransactions)
                    {
                        var symbol = wx.Currency == Currency.NAIRA ? "₦" : wx.CurrencySymbol;
                        var amount = wx.Amount.ToString("N0");
                        
                        string msg = $"{symbol}{amount} {wx.TransactionType.ToString().ToLower()} - {wx.Status}";
                        if (wx.TransactionType == TransactionType.WalletFunding && wx.Status == TransactionStatus.Completed)
                            msg = $"{symbol}{amount} released to your wallet.";
                        else if (wx.TransactionType == TransactionType.Withdrawal)
                            msg = $"{symbol}{amount} withdrawal {wx.Status.ToString().ToLower()}.";
                        else if (wx.TransactionType == TransactionType.Refund)
                            msg = $"{symbol}{amount} has been refunded to your wallet {wx.Status.ToString().ToLower()}";
                        else if (wx.TransactionType == TransactionType.WalletRelease)
                            msg = $"{symbol}{amount} has been released to your wallet {wx.Status.ToString().ToLower()}";
                        notifications.Add(new NotificationDTO
                            {
                                Id = wx.Id.ToString(),
                                Title = "Payment Update",
                                Message = msg,
                                Date = wx.CreatedAt,
                                IsRead = (DateTimeOffset.UtcNow - wx.CreatedAt).TotalHours > 24,
                                Type = "wallet"
                            });
                    }
                }

                var pagedNotifications = notifications
                    .OrderByDescending(n => n.Date)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                return Ok(new 
                { 
                     Success = true, 
                     Data = pagedNotifications,
                     Page = page,
                     PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                _logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"Getting notifications for {userId}");
                return StatusCode(500, "Internal Server Error");
            }
        }
    }

    public class NotificationDTO
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public DateTimeOffset Date { get; set; }
        public bool IsRead { get; set; }
        public string Type { get; set; }
    }
}
