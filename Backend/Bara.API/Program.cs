using AspNetCoreRateLimit;
using Hangfire;
using Hangfire.PostgreSql;
using Infrastructure.DataContext;
using Infrastructure.Repositories.FileRepositories;
using Infrastructure.Repositories.ScriptRepositories;
using Infrastructure.Repositories.UserRepositories;
using Infrastructure.Repositories.TransactionRepositories;
using TransactionModule.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ScriptModule.Interfaces;
using Serilog;
using Services.BackgroudServices;
using Services.ExternalAPI_Integration;
using Services.FileStorageServices.CloudinaryStorage;
using Services.FileStorageServices.Interfaces;
using Services.MailingService;
using Services.MailingService.SendGrid;
using Services.Paystack;
using Services.SignalR;
using Services.YouVerifyIntegration;
using SharedModule.Settings;
using SharedModule.Utils;
using System.Text;
using System.Text.Json.Serialization;
using UserModule.Interfaces.UserInterfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.  
//Console.WriteLine($"ENVIRONMENT: {builder.Environment.EnvironmentName}");
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle  
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//builder.Services.AddDbContext<BaraContext>(options =>
//   options.UseSqlServer(builder.Configuration.GetConnectionString("Connection")));
builder.Services.AddDbContext<BaraContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("Connection"));
});
builder.Configuration
    .AddJsonFile("appsettings.json", optional: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
builder.Services.Configure<Secrets>(builder.Configuration.GetSection("Secrets"));

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddMemoryCache();

//builder.Services.AddHangfire(config =>
//{
//    config.UseSqlServerStorage(builder.Configuration.GetConnectionString("Connection"))
//        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
//        .UseSimpleAssemblyNameTypeSerializer()
//        .UseRecommendedSerializerSettings();
//});
var cs = builder.Configuration.GetConnectionString("Connection");
//Console.WriteLine($"ConnectionString: {cs}");

builder.Services.AddHangfire(config =>
{
    config.UsePostgreSqlStorage(options =>
    {
        options.UseNpgsqlConnection(builder.Configuration.GetConnectionString("Connection"));
    });
});

builder.Services.AddHangfireServer();
GlobalJobFilters.Filters.Add(new AutomaticRetryAttribute
{
    Attempts = 2,
    DelaysInSeconds = [10, 30],
    OnAttemptsExceeded = AttemptsExceededAction.Fail
});

builder.Services.AddScoped<HangfireJobs>();

builder.Host.UseSerilog((context, config) => config.ReadFrom.Configuration(context.Configuration));

builder.Services.AddMemoryCache();

builder.Services.AddScoped<IYouVerifyService, YouVerifyService>();
builder.Services.AddTransient<ExternalApiIntegrationService>();
builder.Services.AddTransient<IFileStorageService, CloudinaryService>();
builder.Services.AddTransient<IFileService, FileRepository>();
builder.Services.AddTransient<IMailService, SendGridService>();
builder.Services.AddTransient<IWriterService, WriterRepository>();
builder.Services.AddTransient<IScriptService, ScriptRepository>();
builder.Services.AddTransient<IProducerService, ProducerRepository>();
builder.Services.AddTransient<IAuthService, AuthRepository>();
builder.Services.AddTransient<IUserService, UserRepository>();
builder.Services.AddScoped<IPaystackService, PaystackService>();
builder.Services.AddTransient<IWalletService, WalletService>();
builder.Services.AddScoped(typeof(LogHelper<>));

builder.Services.AddSignalR();
builder.Services.AddHealthChecks();
//var retryPolicy = HttpPolicyExtensions
//    .HandleTransientHttpError()
//    .OrResult(msg => (int)msg.StatusCode == 429) 
//    .WaitAndRetryAsync(
//        retryCount: 3,
//        sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), 
//        onRetry: (outcome, timespan, retryAttempt, context) =>
//        {
//            Console.WriteLine($"Retrying... Attempt {retryAttempt}");
//        });
//builder.Services.AddHttpClient("default", client =>
//{
//    client.Timeout = TimeSpan.FromSeconds(30);
//    client.DefaultRequestHeaders.Add("Accept", "application/json");
//})
//.AddPolicyHandler(retryPolicy);

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins:Origins").Get<string[]>() ?? ["*"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowRegisterdOrigins",
        builder => builder.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod());
});

builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

builder.Services.AddHttpClient("YouVerify", client =>
{
    client.BaseAddress = new Uri($"{builder.Configuration["AppSettings:YouVerifyBaseUrl"]}");
    client.DefaultRequestHeaders.Add("token", $"{builder.Configuration["Secrets:YouVerifyTestAPIKEY"]}");
    //client.DefaultRequestHeaders.Add("token", builder.Configuration["Secrets:YouVerifyLiveAPIKEY"]);  
});

builder.Services.AddHttpClient("Cloudinary", client =>
{
    client.BaseAddress = new Uri($"{builder.Configuration["AppSettings:CloudinaryBaseUrl"]}/{builder.Configuration["Secrets:CloudinaryName"]}");
});
var secretsConfig = builder.Configuration.GetSection("Secrets").Get<Secrets>();
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes($"{builder.Configuration["Secrets:JwtSickRit"]}")),
        ValidIssuers = secretsConfig.Issuers,
        RoleClaimType = "Role",
        NameClaimType = "UserId",
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["AccessToken"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notification"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorizationBuilder()
.AddPolicy("VerifiedOnly", policy =>
{
    policy.RequireClaim("VerificationStatus", "Verified");
});

//builder.Services.AddAuthorizationBuilder()
//    .AddPolicy("SwaggerAccess", policy =>
//        policy.RequireRole("Admin"));

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("bara", new OpenApiInfo { Title = "Bara-API" });

    var basePath = AppContext.BaseDirectory;
    var xmlDocs = Directory.GetFiles(basePath, "*.xml");

    foreach (var xmlPath in xmlDocs)
    {
        options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
    }

    options.AddSecurityDefinition(name: "Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by your token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer",
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            []
        }
    });
});

//Console.WriteLine($"ENVIRONMENT: {builder.Environment.EnvironmentName}");
var app = builder.Build();

// Configure the HTTP request pipeline.  
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI(s =>
//    {
//        s.SwaggerEndpoint("/swagger/bara/swagger.json", "Bara-API");
//        s.RoutePrefix = "docs";
//        s.ConfigObject.AdditionalItems["persistAuthorization"] = true;
//    });
//}

app.UseSerilogRequestLogging();
app.UseHttpsRedirection();
app.UseSwagger();
app.UseSwaggerUI(s =>
{
    s.SwaggerEndpoint("/swagger/bara/swagger.json", "Bara-API");
    //s.RoutePrefix = "docs";
    s.ConfigObject.AdditionalItems["persistAuthorization"] = true;
});
//app.Use(async (context, next) =>
//{
//    if (context.Request.Path.StartsWithSegments("/swagger") &&
//        !context.User.IsInRole("Admin"))

//    {
//        context.Response.StatusCode = 403;
//        await context.Response.WriteAsync("Forbidden");
//        return;
//    }
//    await next();
//});


app.UseCors("AllowRegisterdOrigins");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/notification");
app.MapHealthChecks("/health");
app.Run();
