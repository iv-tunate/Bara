using Microsoft.AspNetCore.SignalR;

namespace Services.SignalR
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            //var userId = Context.User?.FindFirst("UserId")?.Value;
            var userId = Context.User?.Identity?.Name;
            Console.WriteLine($"🎉 Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"⚠️ Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendNotification(string message)
        {
            Console.WriteLine($"📢 Sending notification to all clients: {message}");
            await Clients.All.SendAsync("ReceiveNotification", message);
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}
