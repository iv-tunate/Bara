using Bara.API.Scripts.Interfaces;
using Bara.API.Services.BackgroudServices;
using Bara.API.Services.SignalR;
using Bara.API.Services.YouVerifyIntegration;
using Bara.API.Users.Interfaces.UserInterfaces;
using Bara.API.Utilities.Settings;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using Services.FileStorageServices.Interfaces;
using Services.MailingService;


namespace BaraTests.Utils
{
    public class BaseTestFixture
    {
        protected readonly IYouVerifyService youVerify;
        protected readonly AppSettings settings;
        protected readonly Secrets secrets;
        protected readonly HangfireJobs hangfire;
        protected readonly IFileService fileService;
        protected readonly IFileStorageService fileStorageService;
        protected readonly IMailService mailService;
        protected readonly IScriptService scriptService;
        protected readonly IWriterService writerService;
        protected readonly IProducerService producerService;
        protected readonly IAuthService authService;
        protected readonly IUserService userService;
        protected readonly IHubContext<NotificationHub> hubContext;
        protected BaseTestFixture()
        {
            youVerify = TestStartUp.Resolve<IYouVerifyService>();
            settings = TestStartUp.Resolve<IOptions<AppSettings>>().Value;
            secrets = TestStartUp.Resolve<IOptions<Secrets>>().Value;
            hangfire = TestStartUp.Resolve<HangfireJobs>();
            fileService = TestStartUp.Resolve<IFileService>();
            fileStorageService = TestStartUp.Resolve<IFileStorageService>();
            mailService = TestStartUp.Resolve<IMailService>();
            scriptService = TestStartUp.Resolve<IScriptService>();
            writerService = TestStartUp.Resolve<IWriterService>();
            producerService = TestStartUp.Resolve<IProducerService>();
            authService = TestStartUp.Resolve<IAuthService>();
            userService = TestStartUp.Resolve<IUserService>();
            hubContext = TestStartUp.Resolve<IHubContext<NotificationHub>>();
        }
    }
}
