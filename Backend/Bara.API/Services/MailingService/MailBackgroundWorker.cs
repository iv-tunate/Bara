using Microsoft.Extensions.Hosting;

namespace Services.MailingService
{
    internal class MailBackgroundWorker : BackgroundService
    {
        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            throw new NotImplementedException();
        }
    }
}
