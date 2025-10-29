using Bara.API.DataContext;
using Bara.API.Scripts.Interfaces;
using Bara.API.Services.BackgroudServices;
using Bara.API.Services.FileStorageServices.FileRepositories;
using Bara.API.Services.YouVerifyIntegration;
using Bara.API.Users.Interfaces.UserInterfaces;
using Bara.API.Users.Repositories;
using Bara.API.Utilities.Settings;
using Bara.API.Utilities.ToolKit;
using Hangfire;
using Infrastructure.Repositories.ScriptRepositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Services.ExternalAPI_Integration;
using Services.FileStorageServices.CloudinaryStorage;
using Services.FileStorageServices.Interfaces;
using Services.MailingService;
using Services.MailingService.SendGrid;
using System.Text;
using System.Text.Json.Serialization;

namespace BaraTests.Utils
{
    internal class TestStartUp
    {
        private static IServiceProvider _provider;

        static TestStartUp()
        {
            _provider = Build();
        }
        public static IServiceProvider Build()
        {
            var services = new ServiceCollection();

            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("Utils/test.config.json", false, false)
                .Build();

            services.Configure<AppSettings>(configuration.GetSection("AppSettings"));
            services.Configure<Secrets>(configuration.GetSection("Secrets"));
            services.AddTransient<ExternalApiIntegrationService>();
            services.AddTransient<IYouVerifyService, YouVerifyService>();
            services.AddScoped<HangfireJobs>();
            services.AddTransient<IFileStorageService, CloudinaryService>();
            services.AddTransient<IFileService, FileRepository>();
            services.AddTransient<IMailService, SendGridService>();
            services.AddTransient<IWriterService, WriterRepository>();
            services.AddTransient<IScriptService, ScriptRepository>();
            services.AddTransient<IProducerService, ProducerRepository>();
            services.AddTransient<IAuthService, AuthRepository>();
            services.AddTransient<IUserService, UserRepository>();
            services.AddDbContext<BaraContext>(options =>
            {
                options.UseSqlServer(configuration.GetConnectionString("Connection"));
            });
            services.AddSignalR();
            services.AddScoped(typeof(LogHelper<>));

            services.AddHttpClient("YouVerify", client =>
            {
                client.BaseAddress = new Uri(configuration["AppSettings:YouVerifyBaseUrl"]);
                client.DefaultRequestHeaders.Add("token", configuration["Secrets:YouVerifyTestAPIKEY"]);
                //client.DefaultRequestHeaders.Add("token", configuration["Secrets:YouVerifyLiveAPIKEY"]);
            });
            var secretsConfig = configuration.GetSection("Secrets").Get<Secrets>();
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes($"{configuration["Secrets: JwtSickCrit"]}")),
                    ValidIssuers = secretsConfig.Issuers,
                };
            });
            services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });
            services.AddMemoryCache();

            services.AddHangfire(config =>
            {
                config.UseSqlServerStorage(configuration.GetConnectionString("Connection"))
                    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                    .UseSimpleAssemblyNameTypeSerializer()
                    .UseRecommendedSerializerSettings();
            });
            services.AddHangfireServer();
            GlobalJobFilters.Filters.Add(new AutomaticRetryAttribute
            {
                Attempts = 2,
                DelaysInSeconds = [10, 30],
                OnAttemptsExceeded = AttemptsExceededAction.Fail
            });

            services.AddLogging();

            return services.BuildServiceProvider();
        }

        public static T Resolve<T>() where T : notnull
        => _provider.GetRequiredService<T>();
    }
}
