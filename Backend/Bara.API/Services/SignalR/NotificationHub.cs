using Microsoft.AspNetCore.SignalR;

namespace Bara.API.Services.SignalR
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.Identity?.Name;
            var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            if (role == "Admin")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
            }
            
            if (userId != null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            }

            Console.WriteLine($"Client connected: {Context.ConnectionId}, User: {userId}, Role: {role}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendNotification(string message)
        {
            Console.WriteLine($"Sending notification to all clients: {message}");
            await Clients.All.SendAsync("ReceiveNotification", message);
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}
