using Bara.API.DataContext;
using Bara.API.Scripts.DTOs;
using Bara.API.Scripts.DTOs.ChatDTOs;
using Bara.API.Scripts.Enums;
using Bara.API.Scripts.Interfaces;
using Bara.API.Scripts.Models;
using Bara.API.Services.SignalR;
using Bara.API.Transactions.Enums;
using Bara.API.Transactions.Interfaces;
using Bara.API.Transactions.Models;
using Bara.API.Utilities.Settings;
using Bara.API.Utilities.ToolKit;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Bara.API.Utilities.Interfaces;
using Services.FileStorageServices.Interfaces;
using Services.MailingService;

namespace Bara.API.Scripts.Repositories
{
    public class ScriptRepository : IScriptService
    {
        private readonly IFileStorageService cloudinary;
        private readonly ILogger<ScriptRepository> logger;
        private readonly BaraContext dbContext;
        private readonly AppSettings settings;
        private readonly Secrets secrets;
        private readonly IMemoryCache memoryCache;
        private readonly IWalletService walletService;
        private readonly IMailService mailService;
        private readonly IHubContext<NotificationHub> notificationHub;
        private readonly IChatService chatService;
        private readonly IExchangeRateService _exchangeRateService;
        private readonly LogHelper<ScriptRepository> logHelper;

        private const string ALL_SCRIPTS_CACHE_KEY = "All_Scripts_Cache";
        public ScriptRepository(IFileStorageService fileStorageService, ILogger<ScriptRepository> logger, LogHelper<ScriptRepository> logHelper, BaraContext baraContext, IOptions<Secrets> secrets, IOptions<AppSettings> appSettings, IMemoryCache memoryCache, IWalletService walletService, IMailService mailService, IHubContext<NotificationHub> notificationHub, IChatService chatService, IExchangeRateService exchangeRateService)
        {
            cloudinary = fileStorageService;
            this.logger = logger;
            dbContext = baraContext;
            this.secrets = secrets.Value;
            settings = appSettings.Value;
            this.memoryCache = memoryCache;
            this.walletService = walletService;
            this.mailService = mailService;
            this.notificationHub = notificationHub;
            this.chatService = chatService;
            _exchangeRateService = exchangeRateService;
            this.logHelper = logHelper;
        }
        public async Task<ResponseDetail<ScriptDTO>> AddScript(PostScriptDetailDTO scriptDetails, Guid writerId)
        {
            try
            {
                var writer = await dbContext.Writers.Select(x => new { x.Id, x.FirstName, x.LastName, x.AuthProfile.IsVerified, x.IsPremiumMember }).FirstOrDefaultAsync(x => x.Id == writerId);
                if (writer is null)
                {
                    return ResponseDetail<ScriptDTO>.Failed($"Writer with profileId {writerId} does not exist");
                }
                if (writer.IsVerified is false)
                {
                    return ResponseDetail<ScriptDTO>.Failed($"You can't access this resource yet because your account has not been verified", 403, "Forbidden");
                }

                var script = scriptDetails.File;
                var sizeLimit = 10 * 1024 * 1024;
                var scriptName = script.FileName.ToUpper().Trim();
                var scriptExtension = Path.GetExtension(scriptName).ToLower();

                var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
                var allowedMimeTypes = new[]
                {
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/pdf"
                };

                var scriptFormatIsAcceptable = allowedExtensions.Contains(scriptExtension) && allowedMimeTypes.Contains(script.ContentType);
                if (!scriptFormatIsAcceptable)
                {
                    return ResponseDetail<ScriptDTO>.Failed($"An invalid script format was uploaded. The allowed extensions are: " +
                                                                    $"{string.Join(", ", allowedExtensions)}...\n" +
                                                                    $"Allowed mime types are: {string.Join(", ", allowedMimeTypes)}", 415, "Invalid File Type");
                }

                var scriptExceedsLimit = script.Length > sizeLimit;
                if (scriptExceedsLimit)
                {
                    return ResponseDetail<ScriptDTO>.Failed($"Script exceeds limit of {sizeLimit}", 413, "File Limit Exceeded");
                }

                var userDirectoryName = $"{writer.FirstName ?? "test"}_{writer.LastName ?? "test"}-{writerId}";
                var uploadScriptResponse = await cloudinary.UploadScriptAsync(userDirectoryName, script);
                if (uploadScriptResponse == null || !uploadScriptResponse.Success)
                {
                    logger.LogError($"An error occured while uploading the script titled {scriptDetails.Title} for {writer.FirstName} {writer.LastName}");
                    return ResponseDetail<ScriptDTO>.Failed($"An error occured while uploading the script", 500, "Umexpected Error");
                }

                var genres = await dbContext.Genres
                        .Where(g => scriptDetails.GenreId.Contains(g.Id))
                        .ToListAsync();
                if (!genres.Any())
                {
                    return ResponseDetail<ScriptDTO>.Failed("Invalid genres selected.");
                }
                var newScriptDetail = new Script
                {
                    Genres = genres,
                    Logline = scriptDetails.Logline,
                    OwnershipRights = scriptDetails.OwnershipRights,
                    ImageUrl = scriptDetails.ImageUrl,
                    ImagePublicId = scriptDetails.ImagePublicId,
                    CopyrightNumber = scriptDetails.CopyrightNumber ?? " ",
                    Currency = scriptDetails.Currency,
                    IsScriptRegistered = scriptDetails.IsScriptRegistered,
                    Price = scriptDetails.Price,
                    ProofUrl = scriptDetails.ProofUrl,
                    RegistrationBody = scriptDetails.RegistrationBody,
                    Synopsis = scriptDetails.Synopsis,
                    Title = scriptDetails.Title.ToUpper(),
                    WriterId = writerId,
                    WriterName = $"{writer.FirstName}-{writer.LastName}",
                    Path = $"{uploadScriptResponse.PublicId}",
                    Url = $"{uploadScriptResponse.Url}",
                    IsPremiumScript = writer.IsPremiumMember
                };

                await dbContext.Scripts.AddAsync(newScriptDetail);
                await dbContext.SaveChangesAsync();

                memoryCache.Remove(ALL_SCRIPTS_CACHE_KEY);
                memoryCache.Remove($"Writer_{writerId}_Scripts");

                var responseScript = new ScriptDTO
                {
                    Id = newScriptDetail.Id,
                    Title = newScriptDetail.Title,
                    Logline = newScriptDetail.Logline,
                    Synopsis = newScriptDetail.Synopsis,
                    Price = newScriptDetail.Price,
                    CurrencySymbol = newScriptDetail.CurrencySymbol,
                    Currency = newScriptDetail.Currency,
                    IsScriptRegistered = newScriptDetail.IsScriptRegistered,
                    RegistrationBody = newScriptDetail.RegistrationBody,
                    ImageUrl = newScriptDetail.ImageUrl,
                    ImagePublicId = newScriptDetail.ImagePublicId,
                    CopyrightNumber = newScriptDetail.CopyrightNumber,
                    OwnershipRights = newScriptDetail.OwnershipRights,
                    ProofUrl = newScriptDetail.ProofUrl,
                    WriterId = newScriptDetail.WriterId,
                    WriterName = newScriptDetail.WriterName,
                    Status = newScriptDetail.Status,
                    IsPremiumScript = newScriptDetail.IsPremiumScript,
                    CreatedAt = newScriptDetail.CreatedAt,

                    Genre = genres.Select(g => new GenreDTO
                    {
                        Id = g.Id,
                        Name = g.Name,
                        Description = g.Description
                    }).ToList()
                };
                return ResponseDetail<ScriptDTO>.Successful(responseScript, "Script added successfully", 201);
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception was thrown while adding a script, \nException: {ex.GetType().Name}\n Base Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}");
                return ResponseDetail<ScriptDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public async Task<ResponseDetail<bool>> DeleteScript(Guid scriptId, Guid writerId)
        {
            try
            {
                var writerCacheKey = $"Writer_{writerId}_Scripts";
                var writerScriptsCache = memoryCache.TryGetValue<List<Script>>(writerCacheKey, out var writerScripts);
                if (writerScriptsCache && writerScripts != null)
                {
                    var scriptInWriterCache = writerScripts.FirstOrDefault(x => x.Id == scriptId);
                    if (scriptInWriterCache != null)
                        writerScripts.Remove(scriptInWriterCache);
                }

                var allcriptsCache = memoryCache.TryGetValue<List<Script>>(ALL_SCRIPTS_CACHE_KEY, out var allScripts);
                if (allcriptsCache && allScripts != null)
                {
                    var scriptInAll = allScripts.FirstOrDefault(x => x.Id == scriptId);
                    if (scriptInAll != null)
                        allScripts.Remove(scriptInAll);
                }

                var script = await dbContext.Scripts.FindAsync(scriptId);
                if (script is null)
                {
                    return ResponseDetail<bool>.Failed("Invalid script Id");
                }
                if (script.Status == ScriptStatus.Deleted)
                {
                    return ResponseDetail<bool>.Failed("Script already deleted");
                }
                var deleteFromStorage = await cloudinary.DeleteAsync(script.Path);
                if (!deleteFromStorage)
                {
                    return ResponseDetail<bool>.Failed("An error occurred while deleting the script", 500, "Unexpected Error");
                }

                script.Status = ScriptStatus.Deleted;
                await dbContext.SaveChangesAsync();

                return ResponseDetail<bool>.Successful(true, "Script deleted successfully");
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception was thrown while deleting script. \nException: {ex.GetType().Name}\n Base Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}");
                return ResponseDetail<bool>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public async Task<ResponseDetail<ScriptDTO>> GetScriptById(Guid scriptId, Guid? writerId)
        {
            try
            {
                ScriptDTO script;

                if (writerId.HasValue)
                {
                    var writerCacheKey = $"Writer_{writerId}_Scripts";
                    memoryCache.TryGetValue<List<ScriptDTO>>(writerCacheKey, out var writerScriptsList);
                    if (writerScriptsList is not null)
                    {
                        script = writerScriptsList.FirstOrDefault(x => x.Id == scriptId);
                        if (script is not null)
                        {
                            return ResponseDetail<ScriptDTO>.Successful(script);
                        }
                    }

                    script = await dbContext.Scripts.Include(x => x.Genres).Select(s => new ScriptDTO
                    {
                        Id = s.Id,
                        Title = s.Title,
                        Logline = s.Logline,
                        Synopsis = s.Synopsis,
                        Price = s.Price,
                        CurrencySymbol = s.CurrencySymbol,
                        Currency = s.Currency,
                        IsScriptRegistered = s.IsScriptRegistered,
                        RegistrationBody = s.RegistrationBody,
                        ImageUrl = s.ImageUrl,
                        ImagePublicId = s.ImagePublicId,
                        CopyrightNumber = s.CopyrightNumber,
                        OwnershipRights = s.OwnershipRights,
                        ProofUrl = s.ProofUrl,
                        WriterId = s.WriterId,
                        WriterName = s.WriterName,
                        Status = s.Status,
                        IsPremiumScript = s.IsPremiumScript,
                        CreatedAt = s.CreatedAt,
                        Genre = s.Genres.Select(g => new GenreDTO
                        {
                            Id = g.Id,
                            Name = g.Name,
                        }).ToList() ?? new List<GenreDTO>()
                    }).FirstOrDefaultAsync(x => x.Id == scriptId && x.WriterId == writerId);
                }
                else
                {
                    script = await dbContext.Scripts.Include(x => x.Genres).Select(s => new ScriptDTO
                    {
                        Id = s.Id,
                        Title = s.Title,
                        Logline = s.Logline,
                        Synopsis = s.Synopsis,
                        Price = s.Price,
                        CurrencySymbol = s.CurrencySymbol,
                        Currency = s.Currency,
                        IsScriptRegistered = s.IsScriptRegistered,
                        RegistrationBody = s.RegistrationBody,
                        ImageUrl = s.ImageUrl,
                        ImagePublicId = s.ImagePublicId,
                        CopyrightNumber = s.CopyrightNumber,
                        OwnershipRights = s.OwnershipRights,
                        ProofUrl = s.ProofUrl,
                        WriterId = s.WriterId,
                        WriterName = s.WriterName,
                        Status = s.Status,
                        IsPremiumScript = s.IsPremiumScript,
                        CreatedAt = s.CreatedAt,
                        Genre = s.Genres.Select(g => new GenreDTO
                        {
                            Id = g.Id,
                            Name = g.Name,
                        }).ToList() ?? new List<GenreDTO>()
                    }).FirstOrDefaultAsync(x => x.Id == scriptId);
                }

                if (script == null)
                {
                    return ResponseDetail<ScriptDTO>.Failed($"Script not found", 404, "Not Found");
                }

                return ResponseDetail<ScriptDTO>.Successful(script);
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception was thrown while script... \nException: {ex.GetType().Name}\n Base Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}");
                return ResponseDetail<ScriptDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public async Task<ResponseDetail<List<ScriptDTO>>> GetScripts(int pageNumber, int pageSize)
        {
            try
            {
                memoryCache.TryGetValue<List<ScriptDTO>>(ALL_SCRIPTS_CACHE_KEY, out var allScripts);
                if (allScripts == null)
                {

                    allScripts = await dbContext.Scripts
                                .Where(x => x.Status == ScriptStatus.Available)
                                .OrderBy(x => x.IsPremiumScript)
                                .ThenByDescending(x => x.CreatedAt)
                                .AsNoTracking()
                                .Select(s => new ScriptDTO
                                {
                                    Id = s.Id,
                                    Title = s.Title,
                                    Logline = s.Logline,
                                    Synopsis = s.Synopsis,
                                    Price = s.Price,
                                    CurrencySymbol = s.CurrencySymbol,
                                    Currency = s.Currency,
                                    IsScriptRegistered = s.IsScriptRegistered,
                                    RegistrationBody = s.RegistrationBody,
                                    ImageUrl = s.ImageUrl,
                                    ImagePublicId = s.ImagePublicId,
                                    CopyrightNumber = s.CopyrightNumber,
                                    OwnershipRights = s.OwnershipRights,
                                    ProofUrl = s.ProofUrl,
                                    WriterId = s.WriterId,
                                    WriterName = s.WriterName,
                                    Status = s.Status,
                                    IsPremiumScript = s.IsPremiumScript,
                                    CreatedAt = s.CreatedAt,
                                    Genre = s.Genres.Select(g => new GenreDTO
                                    {
                                        Id = g.Id,
                                        Name = g.Name,
                                        Description = g.Description
                                    }).ToList()
                                })
                                .ToListAsync();

                    var cacheOptions = new MemoryCacheEntryOptions()
                        .SetAbsoluteExpiration(TimeSpan.FromMinutes(10))
                        .SetSlidingExpiration(TimeSpan.FromMinutes(5));

                    memoryCache.Set(ALL_SCRIPTS_CACHE_KEY, allScripts, cacheOptions);
                }

                var totalCount = allScripts.Count;
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
                var paginatedScripts = allScripts
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                if (totalCount < 1)
                {
                    return ResponseDetail<List<ScriptDTO>>.SuccessfulPaginatedResponse(paginatedScripts, totalCount, totalPages, pageNumber, "No available script(s)", 204);
                }

                return ResponseDetail<List<ScriptDTO>>.SuccessfulPaginatedResponse(paginatedScripts, totalCount, totalPages, pageNumber);
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception {ex.GetType().Name} while fetching scripts...\n Base Exception{ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}");
                return ResponseDetail<List<ScriptDTO>>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public async Task<ResponseDetail<List<ScriptDTO>>> GetScriptsByWriterId(Guid writerId, int pageNumber, int pageSize)
        {
            try
            {
                var cacheKey = $"Writer_{writerId}'s_Scripts";
                memoryCache.TryGetValue<List<ScriptDTO>>(cacheKey, out var cachedScripts);
                if (cachedScripts is null)
                {
                    cachedScripts = await dbContext.Scripts
                                                    .Where(x => x.WriterId == writerId && x.Status != ScriptStatus.Deleted)
                                                    .OrderByDescending(x => x.CreatedAt)
                                                    .AsNoTracking()
                                                    .Select(s => new ScriptDTO
                                                    {
                                                        Id = s.Id,
                                                        Title = s.Title,
                                                        Logline = s.Logline,
                                                        Synopsis = s.Synopsis,
                                                        Price = s.Price,
                                                        CurrencySymbol = s.CurrencySymbol,
                                                        Currency = s.Currency,
                                                        IsScriptRegistered = s.IsScriptRegistered,
                                                        RegistrationBody = s.RegistrationBody,
                                                        ImageUrl = s.ImageUrl,
                                                        ImagePublicId = s.ImagePublicId,
                                                        CopyrightNumber = s.CopyrightNumber,
                                                        OwnershipRights = s.OwnershipRights,
                                                        ProofUrl = s.ProofUrl,
                                                        WriterId = s.WriterId,
                                                        WriterName = s.WriterName,
                                                        Status = s.Status,
                                                        IsPremiumScript = s.IsPremiumScript,
                                                        CreatedAt = s.CreatedAt,
                                                        HasActiveTransaction = dbContext.ScriptTransactions.Any(st => st.ScriptId == s.Id && st.TransactionStatus == ScriptTransactionStatus.Initiated),
                                                        TransactionExpiresAt = dbContext.ScriptTransactions
                                                            .Where(st => st.ScriptId == s.Id && st.TransactionStatus == ScriptTransactionStatus.Initiated)
                                                            .Select(st => st.ExpiresAt)
                                                            .FirstOrDefault(),
                                                        ActiveNegotiatorId = dbContext.ScriptTransactions
                                                            .Where(st => st.ScriptId == s.Id && st.TransactionStatus == ScriptTransactionStatus.Initiated)
                                                            .Select(st => st.ProducerId)
                                                            .FirstOrDefault(),
                                                        Genre = s.Genres.Select(g => new GenreDTO
                                                        {
                                                            Id = g.Id,
                                                            Name = g.Name,
                                                            Description = g.Description
                                                        }).ToList()
                                                    })
                                                    .ToListAsync();

                    var cacheOptions = new MemoryCacheEntryOptions()
                       .SetAbsoluteExpiration(TimeSpan.FromMinutes(2)) // Reduced cache time for transaction accuracy
                       .SetSlidingExpiration(TimeSpan.FromMinutes(1));
                    memoryCache.Set(cacheKey, cachedScripts, cacheOptions);
                }

                if (cachedScripts is null)
                {
                    return ResponseDetail<List<ScriptDTO>>.Failed($"Writer with Id: {writerId} does not exist", 400, "Invalid User");
                }

                var totalCount = cachedScripts.Count;
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
                var paginatedResult = cachedScripts
                                        .Skip((pageNumber - 1) * pageSize)
                                        .Take(pageSize)
                                        .ToList();

                if (totalCount < 1)
                {
                    return ResponseDetail<List<ScriptDTO>>.SuccessfulPaginatedResponse(paginatedResult, totalCount, totalPages, pageNumber, "You have no script(s)", 204);
                }

                return ResponseDetail<List<ScriptDTO>>.SuccessfulPaginatedResponse(paginatedResult, totalCount, totalPages, pageNumber, "Scripts retrieved successfully");
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception {ex.InnerException} was thrown while retrieving scripts for writer: {writerId}... \nBase Exception{ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}");
                return ResponseDetail<List<ScriptDTO>>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public async Task<ResponseDetail<GetScriptDTO>> DownloadScript(Guid scriptId)
        {
            try
            {
                var script = await dbContext.Scripts.FindAsync(scriptId);
                if (script == null)
                {
                    return ResponseDetail<GetScriptDTO>.Failed($"Script with id {scriptId} doesn't exist", 404, "Not Found");
                }

                var (stream, contentType) = await cloudinary.DownloadAsync(script.Path);
                var fileBytes = stream.ToArray();

                return ResponseDetail<GetScriptDTO>.Successful(new GetScriptDTO
                {
                    ContentType = contentType,
                    File = fileBytes,
                    Name = script.Title
                });
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception {ex.GetType().Name} was thrown while downloading script with ID: {scriptId}... Base Exception {ex.GetBaseException().GetType().Name}", ex.Message);
                return ResponseDetail<GetScriptDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public async Task<ResponseDetail<Script>> UpdateScript(PostScriptDetailDTO scriptDetails, Guid writerId, Guid scriptId)
        {
            try
            {
                var writer = await dbContext.Writers
                    .Select(x => new { x.Id, x.FirstName, x.LastName, x.AuthProfile.IsVerified })
                    .FirstOrDefaultAsync(x => x.Id == writerId);

                if (writer is null)
                {
                    return ResponseDetail<Script>.Failed($"Writer with ID {writerId} does not exist", 404, "Not Found");
                }

                if (writer.IsVerified is false)
                {
                    return ResponseDetail<Script>.Failed("You cannot access this resource yet because your account has not been verified", 403, "Forbidden");
                }

                var script = await dbContext.Scripts
                    .Include(s => s.Genres)
                    .FirstOrDefaultAsync(s => s.Id == scriptId);

                if (script is null)
                {
                    return ResponseDetail<Script>.Failed($"Script with ID {scriptId} does not exist", 404, "Not Found");
                }

                if (script.WriterId != writerId)
                {
                    return ResponseDetail<Script>.Failed("You do not have permission to update this script", 403, "Forbidden");
                }

                var genres = await dbContext.Genres
                    .Where(g => scriptDetails.GenreId.Contains(g.Id))
                    .ToListAsync();

                if (!genres.Any())
                {
                    return ResponseDetail<Script>.Failed("Invalid genres selected", 400, "Bad Request");
                }

                script.Title = scriptDetails.Title.ToUpper();
                script.Logline = scriptDetails.Logline;
                script.Synopsis = scriptDetails.Synopsis;
                script.Price = scriptDetails.Price;
                script.Currency = scriptDetails.Currency;
                script.IsScriptRegistered = scriptDetails.IsScriptRegistered;
                script.RegistrationBody = scriptDetails.RegistrationBody;
                script.CopyrightNumber = scriptDetails.CopyrightNumber ?? " ";
                script.OwnershipRights = scriptDetails.OwnershipRights;
                script.ProofUrl = scriptDetails.ProofUrl;
                script.Genres = genres;
                script.ModifiedAt = DateTimeOffset.UtcNow;

                dbContext.Scripts.Update(script);
                await dbContext.SaveChangesAsync();

                memoryCache.Remove(ALL_SCRIPTS_CACHE_KEY);
                memoryCache.Remove($"Writer_{writerId}_Scripts");
                memoryCache.Remove($"Writer_{writerId}'s_Scripts");

                logger.LogInformation($"Script {scriptId} updated successfully by writer {writerId}");

                return ResponseDetail<Script>.Successful(script, "Script updated successfully");
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception was thrown while updating script {scriptId}. \\nException: {ex.GetType().Name}\\n Base Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}");
                return ResponseDetail<Script>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public async Task<ResponseDetail<Script>> UpdateScriptStatus(ScriptStatus status, Guid scriptId, Guid writerId)
        {
            try
            {
                var script = await dbContext.Scripts.FirstOrDefaultAsync(s => s.Id == scriptId);

                if (script is null)
                {
                    return ResponseDetail<Script>.Failed($"Script with ID {scriptId} does not exist", 404, "Not Found");
                }

                if (script.WriterId != writerId)
                {
                    return ResponseDetail<Script>.Failed("You do not have permission to update this script's status", 403, "Forbidden");
                }

                if (!Enum.IsDefined(typeof(ScriptStatus), status))
                {
                    return ResponseDetail<Script>.Failed("Invalid script status value", 400, "Bad Request");
                }

                script.Status = status;
                script.ModifiedAt = DateTimeOffset.UtcNow;

                dbContext.Scripts.Update(script);
                await dbContext.SaveChangesAsync();

                memoryCache.Remove(ALL_SCRIPTS_CACHE_KEY);
                memoryCache.Remove($"Writer_{writerId}_Scripts");
                memoryCache.Remove($"Writer_{writerId}'s_Scripts");

                logger.LogInformation($"Script {scriptId} status updated to {status} by writer {writerId}");

                return ResponseDetail<Script>.Successful(script, "Script status updated successfully");
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception was thrown while updating script status for {scriptId}. \\nException: {ex.GetType().Name}\\n Base Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}");
                return ResponseDetail<Script>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public async Task<ResponseDetail<ScriptTransactionResponse>> InitiateScriptTransactionAsync(Guid producerId, InitiateScriptTransactionRequest request)
        {
            var correlationId = Guid.NewGuid();
            logger.LogInformation("Starting script transaction initiation - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}",
                correlationId, producerId, request.ScriptId);

            try
            {
                using var transaction = await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead);

                var script = await dbContext.Scripts
                    .FirstOrDefaultAsync(s => s.Id == request.ScriptId);

                if (script == null)
                {
                    logger.LogWarning("Script not found - CorrelationId: {CorrelationId}, ScriptId: {ScriptId}", correlationId, request.ScriptId);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Script not found", 404);
                }

                if (script.Status != ScriptStatus.Available)
                {
                    logger.LogWarning("Script not available - CorrelationId: {CorrelationId}, ScriptId: {ScriptId}, Status: {Status}",
                        correlationId, request.ScriptId, script.Status);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Script is not available for purchase", 400);
                }

                var producer = await dbContext.Producers

                    .Include(p => p.Wallet)
                    .FirstOrDefaultAsync(p => p.Id == producerId);

                if (producer?.Wallet == null)
                {
                    logger.LogWarning("Producer not found - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}", correlationId, producerId);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Producer not found", 404);
                }

                var writer = await dbContext.Writers
                    .Include(w => w.Wallet)
                    .FirstOrDefaultAsync(w => w.Id == request.WriterId);

                if (writer?.Wallet == null)
                {
                    logger.LogWarning("Writer not found - CorrelationId: {CorrelationId}, WriterId: {WriterId}", correlationId, request.WriterId);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Writer not found", 404);
                }

                if (script.WriterId != request.WriterId)
                {
                    logger.LogWarning("Writer does not own script - CorrelationId: {CorrelationId}, ScriptId: {ScriptId}, WriterId: {WriterId}",
                        correlationId, request.ScriptId, request.WriterId);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Writer does not own this script", 400);
                }

                var balanceInNaira = _exchangeRateService.ConvertToNaira(producer.Wallet.AvailableBalance, producer.Wallet.Currency);
                var scriptPriceInNaira = _exchangeRateService.ConvertToNaira(script.Price, script.Currency);

                if (balanceInNaira < scriptPriceInNaira)
                {
                    logger.LogWarning("Insufficient balance - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, Available: {Available} {Curr}, Required: {Required} {ReqCurr}",
                        correlationId, producerId, producer.Wallet.AvailableBalance, producer.Wallet.Currency, script.Price, script.Currency);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Insufficient wallet balance", 400);
                }        

                var existingTransaction = await dbContext.ScriptTransactions
                    .FirstOrDefaultAsync(st => st.ProducerId == producerId && st.ScriptId == request.ScriptId &&
                                             st.TransactionStatus == ScriptTransactionStatus.Initiated);

                if (existingTransaction != null)
                {
                    if (!string.IsNullOrEmpty(request.IdempotencyKey) && existingTransaction.IdempotencyKey == request.IdempotencyKey)
                    {
                        logger.LogInformation("Returning existing transaction for idempotency - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}",
                            correlationId, existingTransaction.Id);

                        return ResponseDetail<ScriptTransactionResponse>.Successful(MapToResponse(existingTransaction, script),
                            "Transaction already exists");
                    }
                    else
                    {
                        logger.LogWarning("Active transaction already exists - CorrelationId: {CorrelationId}, ExistingTransactionId: {ExistingTransactionId}",
                            correlationId, existingTransaction.Id);
                        return ResponseDetail<ScriptTransactionResponse>.Failed("An active transaction already exists for this script", 409);
                    }
                }

                var fee = CalculateFee(script.Price);
                var writerShare = script.Price - fee;

                var paymentTransaction = new PaymentTransaction
                {
                    Id = Guid.NewGuid(),
                    UserId = producerId,
                    UserFullName = $"{producer.FirstName} {producer.LastName}",
                    Amount = script.Price,
                    Fee = fee,
                    Currency = script.Currency,
                    TransactionType = TransactionType.ScriptEscrow,
                    Status = TransactionStatus.Escrowed,
                    ReferenceId = GenerateTransactionReference("SCR"),
                    Notes = $"Escrowed payment for script: {script.Title}",
                    PaymentMethod = "wallet",
                    WalletID = producer.Wallet.Id
                };

                await dbContext.Transactions.AddAsync(paymentTransaction);

                var scriptTransaction = new ScriptTransaction
                {
                    Id = Guid.NewGuid(),
                    ScriptId = request.ScriptId,
                    ScriptTitle = script.Title,
                    ProducerId = producerId,
                    ProducerName = $"{producer.FirstName} {producer.LastName}",
                    WriterId = request.WriterId,
                    WriterName = $"{writer.FirstName} {writer.LastName}",
                    Amount = script.Price,
                    Fee = fee,
                    WriterShare = writerShare,
                    Currency = script.Currency,
                    PaymentTransactionId = paymentTransaction.Id,
                    Status = ScriptDeliveryStatus.InProgress,
                    TransactionStatus = ScriptTransactionStatus.Initiated,
                    ExpiresAt = DateTimeOffset.UtcNow.AddDays(14),
                    IdempotencyKey = request.IdempotencyKey
                };

                await dbContext.ScriptTransactions.AddAsync(scriptTransaction);



                var fundsLocked = await walletService.LockFundsForScriptTransactionAsync(producerId, request.WriterId, script.Price, fee);
                if (!fundsLocked)
                {
                    logger.LogError("Failed to lock funds - CorrelationId: {CorrelationId}", correlationId);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Failed to lock funds", 500);
                }


                var chatRequest = new CreateChatRequest
                {
                    ScriptId = request.ScriptId,
                    ScriptTitle = script.Title,
                    ProducerId = producerId,
                    ProducerName = $"{producer.FirstName} {producer.LastName}",
                    WriterId = request.WriterId,
                    WriterName = $"{writer.FirstName} {writer.LastName}"
                };

                var chatResult = await chatService.CreateChatAsync(chatRequest);
                if (!chatResult.IsSuccess)
                {
                    logger.LogWarning("Failed to create chat - CorrelationId: {CorrelationId}, ScriptId: {ScriptId}, Error: {Error}",
                        correlationId, request.ScriptId, chatResult.Message);
                }

                script.Status = ScriptStatus.InNegotiation;
                dbContext.Scripts.Update(script);

                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                BackgroundJob.Schedule<ScriptRepository>(
                    repo => repo.AutoCompleteScriptTransactionAsync(scriptTransaction.Id),
                    TimeSpan.FromDays(14));

                logger.LogInformation("Script transaction initiated successfully - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}",
                    correlationId, scriptTransaction.Id);

                return ResponseDetail<ScriptTransactionResponse>.Successful(MapToResponse(scriptTransaction, script),
                    "Script transaction initiated successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error initiating script transaction - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}",
                    correlationId, producerId, request.ScriptId);
                return ResponseDetail<ScriptTransactionResponse>.Failed("Failed to initiate script transaction", 500, ex.Message);
            }
        }

        public async Task<ResponseDetail<ScriptTransactionResponse>> CompleteScriptTransactionAsync(Guid producerId, Guid scriptId)
        {
            var correlationId = Guid.NewGuid();
            logger.LogInformation("Starting script transaction completion - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}",
                correlationId, producerId, scriptId);

            try
            {
                using var transaction = await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead);

                var scriptTransaction = await dbContext.ScriptTransactions
                    .FirstOrDefaultAsync(st => st.ProducerId == producerId && st.ScriptId == scriptId &&
                                             st.TransactionStatus == ScriptTransactionStatus.Initiated);

                if (scriptTransaction == null)
                {
                    logger.LogWarning("Active script transaction not found - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}",
                        correlationId, producerId, scriptId);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("No active transaction found for this script", 404);
                }

                if (scriptTransaction.ExpiresAt.HasValue && DateTimeOffset.UtcNow > scriptTransaction.ExpiresAt.Value)
                {
                    logger.LogWarning("Transaction has expired - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}, ExpiresAt: {ExpiresAt}",
                        correlationId, scriptTransaction.Id, scriptTransaction.ExpiresAt);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Transaction has expired", 400);
                }

                var paymentTransaction = await dbContext.Transactions
                    .FirstOrDefaultAsync(pt => pt.Id == scriptTransaction.PaymentTransactionId);

                if (paymentTransaction == null || paymentTransaction.Status != TransactionStatus.Escrowed)
                {
                    logger.LogWarning("Payment transaction not found or not escrowed - CorrelationId: {CorrelationId}, PaymentTransactionId: {PaymentTransactionId}",
                        correlationId, scriptTransaction.PaymentTransactionId);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Payment transaction not found or not in escrowed state", 400);
                }

                var script = await dbContext.Scripts.FirstOrDefaultAsync(s => s.Id == scriptId);
                if (script == null || script.Status == ScriptStatus.Sold)
                {
                    logger.LogWarning("Script not available for completion - CorrelationId: {CorrelationId}, ScriptId: {ScriptId}, Status: {Status}",
                        correlationId, scriptId, script?.Status);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Script is no longer available", 400);
                }

                var fundsReleased = await walletService.ReleaseFundsForScriptTransactionAsync(
                    producerId, scriptTransaction.WriterId, scriptTransaction.Amount, scriptTransaction.WriterShare);

                if (!fundsReleased)
                {
                    logger.LogError("Failed to release funds - CorrelationId: {CorrelationId}", correlationId);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Failed to release funds", 500);
                }

                scriptTransaction.TransactionStatus = ScriptTransactionStatus.Completed;
                scriptTransaction.Status = ScriptDeliveryStatus.Completed;
                scriptTransaction.WriterPaidAt = DateTimeOffset.UtcNow;
                scriptTransaction.ModifiedAt = DateTimeOffset.UtcNow;

                paymentTransaction.Status = TransactionStatus.Completed;
                paymentTransaction.CompletedAt = DateTimeOffset.UtcNow;
                paymentTransaction.ModifiedAt = DateTimeOffset.UtcNow;

                script.Status = ScriptStatus.Sold;
                script.ModifiedAt = DateTimeOffset.UtcNow;

                dbContext.ScriptTransactions.Update(scriptTransaction);
                dbContext.Transactions.Update(paymentTransaction);
                dbContext.Scripts.Update(script);

                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                if (scriptTransaction.ScriptComments != null)
                {
                    var chatCloseResult = await chatService.CloseChatAsync(scriptTransaction.ScriptComments.Id);
                    if (!chatCloseResult.IsSuccess)
                    {
                        logger.LogWarning("Failed to close chat - CorrelationId: {CorrelationId}, ChatId: {ChatId}, Error: {Error}",
                            correlationId, scriptTransaction.ScriptComments.Id, chatCloseResult.Message);
                    }
                    else
                    {
                        logger.LogInformation("Chat closed for completed transaction - CorrelationId: {CorrelationId}, ChatId: {ChatId}",
                            correlationId, scriptTransaction.ScriptComments.Id);
                    }
                }

                await SendScriptToProducerAsync(producerId, scriptId, correlationId);

                logger.LogInformation("Script transaction completed successfully - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}",
                    correlationId, scriptTransaction.Id);

                return ResponseDetail<ScriptTransactionResponse>.Successful(MapToResponse(scriptTransaction, script),
                    "Script transaction completed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error completing script transaction - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}",
                    correlationId, producerId, scriptId);
                return ResponseDetail<ScriptTransactionResponse>.Failed("Failed to complete script transaction", 500, ex.Message);
            }
        }

        public async Task<ResponseDetail<ScriptTransactionResponse>> CancelScriptTransactionAsync(Guid producerId, Guid scriptId)
        {
            var correlationId = Guid.NewGuid();
            logger.LogInformation("Starting script transaction cancellation - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}",
                correlationId, producerId, scriptId);

            try
            {
                using var transaction = await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead);

                var scriptTransaction = await dbContext.ScriptTransactions
                    .FirstOrDefaultAsync(st => st.ProducerId == producerId && st.ScriptId == scriptId &&
                                             st.TransactionStatus == ScriptTransactionStatus.Initiated);

                if (scriptTransaction == null)
                {
                    logger.LogWarning("Active script transaction not found - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}",
                        correlationId, producerId, scriptId);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("No active transaction found for this script", 404);
                }

                if (scriptTransaction.ExpiresAt.HasValue && DateTimeOffset.UtcNow > scriptTransaction.ExpiresAt.Value)
                {
                    logger.LogWarning("Cannot cancel expired transaction - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}, ExpiresAt: {ExpiresAt}",
                        correlationId, scriptTransaction.Id, scriptTransaction.ExpiresAt);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Cannot cancel expired transaction", 400);
                }

                var paymentTransaction = await dbContext.Transactions
                    .FirstOrDefaultAsync(pt => pt.Id == scriptTransaction.PaymentTransactionId);

                if (paymentTransaction == null || paymentTransaction.Status != TransactionStatus.Escrowed)
                {
                    logger.LogWarning("Payment transaction not found or not escrowed - CorrelationId: {CorrelationId}, PaymentTransactionId: {PaymentTransactionId}",
                        correlationId, scriptTransaction.PaymentTransactionId);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Payment transaction not found or not in escrowed state", 400);
                }

                var fundsRefunded = await walletService.RefundFundsForScriptTransactionAsync(
                    producerId, scriptTransaction.WriterId, scriptTransaction.Amount, scriptTransaction.WriterShare);

                if (!fundsRefunded)
                {
                    logger.LogError("Failed to refund funds - CorrelationId: {CorrelationId}", correlationId);
                    return ResponseDetail<ScriptTransactionResponse>.Failed("Failed to refund funds", 500);
                }

                scriptTransaction.TransactionStatus = ScriptTransactionStatus.Cancelled;
                scriptTransaction.Status = ScriptDeliveryStatus.Cancelled;
                scriptTransaction.ModifiedAt = DateTimeOffset.UtcNow;

                paymentTransaction.Status = TransactionStatus.Refunded;
                paymentTransaction.ModifiedAt = DateTimeOffset.UtcNow;

                var script = await dbContext.Scripts.FirstOrDefaultAsync(s => s.Id == scriptId);
                if (script != null)
                {
                    script.Status = ScriptStatus.Available;
                    script.ModifiedAt = DateTimeOffset.UtcNow;
                    dbContext.Scripts.Update(script);
                }

                dbContext.ScriptTransactions.Update(scriptTransaction);
                dbContext.Transactions.Update(paymentTransaction);

                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                if (scriptTransaction.ScriptComments != null)
                {
                    var chatCloseResult = await chatService.CloseChatAsync(scriptTransaction.ScriptComments.Id);
                    if (!chatCloseResult.IsSuccess)
                    {
                        logger.LogWarning("Failed to close chat - CorrelationId: {CorrelationId}, ChatId: {ChatId}, Error: {Error}",
                            correlationId, scriptTransaction.ScriptComments.Id, chatCloseResult.Message);
                    }
                    else
                    {
                        logger.LogInformation("Chat closed for cancelled transaction - CorrelationId: {CorrelationId}, ChatId: {ChatId}",
                            correlationId, scriptTransaction.ScriptComments.Id);
                    }
                }

                logger.LogInformation("Script transaction cancelled successfully - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}",
                    correlationId, scriptTransaction.Id);

                return ResponseDetail<ScriptTransactionResponse>.Successful(MapToResponse(scriptTransaction, script),
                    "Script transaction cancelled successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error cancelling script transaction - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}",
                    correlationId, producerId, scriptId);
                return ResponseDetail<ScriptTransactionResponse>.Failed("Failed to cancel script transaction", 500, ex.Message);
            }
        }

        /// <summary>
        /// Auto-completes a script transaction after 14 days. Called by Hangfire background job.
        /// </summary>
        /// <param name="scriptTransactionId">The ID of the script transaction to auto-complete</param>
        public async Task AutoCompleteScriptTransactionAsync(Guid scriptTransactionId)
        {
            var correlationId = Guid.NewGuid();
            logger.LogInformation("Starting auto-complete for script transaction - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}",
                correlationId, scriptTransactionId);

            try
            {
                var scriptTransaction = await dbContext.ScriptTransactions
                    .FirstOrDefaultAsync(st => st.Id == scriptTransactionId);

                if (scriptTransaction == null)
                {
                    logger.LogWarning("Script transaction not found for auto-complete - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}",
                        correlationId, scriptTransactionId);
                    return;
                }
                if (scriptTransaction.TransactionStatus != ScriptTransactionStatus.Initiated)
                {
                    logger.LogInformation("Script transaction already processed - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}, Status: {Status}",
                        correlationId, scriptTransactionId, scriptTransaction.TransactionStatus);
                    return;
                }
                var result = await CompleteScriptTransactionAsync(scriptTransaction.ProducerId, scriptTransaction.ScriptId);

                if (result.IsSuccess)
                {
                    logger.LogInformation("Auto-complete successful - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}",
                        correlationId, scriptTransactionId);
                }
                else
                {
                    logger.LogError("Auto-complete failed - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}, Error: {Error}",
                        correlationId, scriptTransactionId, result.Message);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error during auto-complete - CorrelationId: {CorrelationId}, TransactionId: {TransactionId}",
                    correlationId, scriptTransactionId);
            }
        }

        /// <summary>
        /// Calculates the platform fee (10% of the amount).
        /// </summary>
        /// <param name="amount">The total amount</param>
        /// <returns>The calculated fee</returns>
        private static decimal CalculateFee(decimal amount)
        {
            return Math.Round(amount * 0.10m, 2);
        }

        /// <summary>
        /// Generates a unique transaction reference.
        /// </summary>
        /// <param name="prefix">The prefix for the reference</param>
        /// <returns>A unique reference string</returns>
        private static string GenerateTransactionReference(string prefix)
        {
            return $"{prefix}_{DateTimeOffset.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString()[..8].ToUpper()}";
        }

        /// <summary>
        /// Maps a ScriptTransaction to ScriptTransactionResponse.
        /// </summary>
        /// <param name="scriptTransaction">The script transaction</param>
        /// <param name="script">The associated script</param>
        /// <returns>The mapped response</returns>
        private static ScriptTransactionResponse MapToResponse(ScriptTransaction scriptTransaction, Script script)
        {
            return new ScriptTransactionResponse
            {
                ScriptTransactionId = scriptTransaction.Id,
                PaymentTransactionId = scriptTransaction.PaymentTransactionId,
                Status = scriptTransaction.Status,
                ExpiresAt = scriptTransaction.ExpiresAt ?? DateTimeOffset.MinValue,
                Amount = scriptTransaction.Amount,
                Fee = scriptTransaction.Fee,
                WriterShare = scriptTransaction.WriterShare,
                CurrencySymbol = script.CurrencySymbol,
                ScriptTitle = script.Title,
                WriterName = scriptTransaction.WriterName
            };
        }

        /// <summary>
        /// Sends the script to the producer via email after successful transaction completion.
        /// </summary>
        /// <param name="producerId">The ID of the producer</param>
        /// <param name="scriptId">The ID of the script</param>
        /// <param name="correlationId">The correlation ID for logging</param>
        private async Task SendScriptToProducerAsync(Guid producerId, Guid scriptId, Guid correlationId)
        {
            try
            {
                var producer = await dbContext.Producers
                    .FirstOrDefaultAsync(p => p.Id == producerId);

                var script = await dbContext.Scripts
                    .FirstOrDefaultAsync(s => s.Id == scriptId);

                if (producer == null || script == null)
                {
                    logger.LogWarning("Producer or script not found for script delivery - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}",
                        correlationId, producerId, scriptId);
                    return;
                }

                var scriptResult = await DownloadScript(scriptId);
                if (!scriptResult.IsSuccess || scriptResult.Data == null)
                {
                    logger.LogError("Failed to download script for email delivery - CorrelationId: {CorrelationId}, ScriptId: {ScriptId}",
                        correlationId, scriptId);
                    return;
                }

                List<IFormFile>? attachments = null;
                if (scriptResult.Data != null)
                {
                    var memoryStream = new MemoryStream(scriptResult.Data.File);
                    var formFile = new ScriptFormFile(memoryStream, scriptResult.Data.Name, scriptResult.Data.ContentType);
                    attachments = new List<IFormFile> { formFile };
                }

                var mailRequest = MailNotifications.ScriptDeliveryNotification(
                    receiver: producer.Email,
                    name: producer.FirstName,
                    scriptTitle: script.Title,
                    amount: script.Price,
                    currency: script.CurrencySymbol,
                    attachments: attachments
                );

                var emailResult = await mailService.SendMail(mailRequest);
                if (emailResult.IsSuccess)
                {
                    logger.LogInformation("Script delivered via email successfully - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}",
                        correlationId, producerId, scriptId);
                }
                else
                {
                    logger.LogError("Failed to send script via email - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}, Error: {Error}",
                        correlationId, producerId, scriptId, emailResult.Message);
                }

                if (attachments?.FirstOrDefault() is ScriptFormFile file)
                {
                    await file.OpenReadStream().DisposeAsync();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error sending script to producer - CorrelationId: {CorrelationId}, ProducerId: {ProducerId}, ScriptId: {ScriptId}",
                    correlationId, producerId, scriptId);
            }
        }

        public async Task<ResponseDetail<List<ScriptDTO>>> GetProducerScriptsByTransaction(Guid producerId, string status, int pageNumber, int pageSize)
        {
            try
            {
                var query = from st in dbContext.ScriptTransactions
                            join s in dbContext.Scripts.Include(x => x.Genres) on st.ScriptId equals s.Id
                            where st.ProducerId == producerId
                            orderby st.CreatedAt descending
                            select new { Transaction = st, Script = s };

                if (status.Equals("initiated", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(x => x.Transaction.TransactionStatus == ScriptTransactionStatus.Initiated);
                }
                else if (status.Equals("completed", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(x => x.Transaction.TransactionStatus == ScriptTransactionStatus.Completed);
                }

                var totalCount = await query.CountAsync();

                var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .AsNoTracking()
                    .ToListAsync();

                var scriptDtos = items.Select(x => new ScriptDTO
                {
                    Id = x.Script.Id,
                    Title = x.Script.Title,
                    Logline = x.Script.Logline,
                    Synopsis = x.Script.Synopsis,
                    Price = x.Script.Price,
                    CurrencySymbol = x.Script.CurrencySymbol,
                    Currency = x.Script.Currency,
                    IsScriptRegistered = x.Script.IsScriptRegistered,
                    RegistrationBody = x.Script.RegistrationBody,
                    ImageUrl = x.Script.ImageUrl,
                    ImagePublicId = x.Script.ImagePublicId,
                    CopyrightNumber = x.Script.CopyrightNumber,
                    OwnershipRights = x.Script.OwnershipRights,
                    ProofUrl = x.Script.ProofUrl,
                    WriterId = x.Script.WriterId,
                    WriterName = x.Script.WriterName,
                    Status = x.Script.Status,
                    IsPremiumScript = x.Script.IsPremiumScript,
                    CreatedAt = x.Script.CreatedAt,
                    // Transaction metadata
                    ActiveNegotiatorId = x.Transaction.ProducerId,
                    TransactionCreatedAt = x.Transaction.CreatedAt,
                    TransactionExpiresAt = x.Transaction.ExpiresAt,
                    HasActiveTransaction = x.Transaction.TransactionStatus == ScriptTransactionStatus.Initiated,
                    Genre = x.Script.Genres.Select(g => new GenreDTO
                    {
                        Id = g.Id,
                        Name = g.Name,
                        Description = g.Description
                    }).ToList()
                }).ToList();

                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                return ResponseDetail<List<ScriptDTO>>.SuccessfulPaginatedResponse(
                    scriptDtos,
                    totalCount,
                    totalPages,
                    pageNumber,
                    "Producer scripts retrieved successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error fetching producer scripts - ProducerId: {ProducerId}, Status: {Status}", producerId, status);
                return ResponseDetail<List<ScriptDTO>>.Failed("Failed to fetch producer scripts", 500, ex.Message);
            }
        }

        public async Task<ResponseDetail<List<ScriptDTO>>> GetScriptsByGenre(Guid genreId, int pageNumber, int pageSize)
        {
            try
            {
                var cacheKey = $"Scripts_Genre_{genreId}";

                if (!memoryCache.TryGetValue<(List<ScriptDTO> scripts, int totalCount)>(cacheKey, out var cachedData))
                {
                    var genreExists = await dbContext.Genres.AnyAsync(x => x.Id == genreId);
                    if (!genreExists)
                    {
                        return ResponseDetail<List<ScriptDTO>>.Failed("Genre not found", 404, "Invalid genre ID");
                    }

                    var scriptsQuery = dbContext.Scripts
                        .Include(x => x.Genres)
                        .OrderBy(w => w.IsPremiumScript)
                        .ThenByDescending(w => w.CreatedAt)
                        .Where(s => s.Status == ScriptStatus.Available)
                        .Where(s => s.Genres.Any(g => g.Id == genreId))
                        .AsNoTracking();

                    var totalCount = await scriptsQuery.CountAsync();

                    var scripts = await scriptsQuery
                        .Include(s => s.Genres)
                        .Select(s => new ScriptDTO
                        {
                            Id = s.Id,
                            Title = s.Title,
                            Logline = s.Logline,
                            Synopsis = s.Synopsis,
                            Price = s.Price,
                            CurrencySymbol = s.CurrencySymbol,
                            Currency = s.Currency,
                            IsScriptRegistered = s.IsScriptRegistered,
                            RegistrationBody = s.RegistrationBody,
                            ImageUrl = s.ImageUrl,
                            ImagePublicId = s.ImagePublicId,
                            CopyrightNumber = s.CopyrightNumber,
                            OwnershipRights = s.OwnershipRights,
                            ProofUrl = s.ProofUrl,
                            WriterId = s.WriterId,
                            WriterName = s.WriterName,
                            Status = s.Status,
                            IsPremiumScript = s.IsPremiumScript,
                            CreatedAt = s.CreatedAt,
                            Genre = s.Genres.Select(g => new GenreDTO
                            {
                                Id = g.Id,
                                Name = g.Name,
                            }).ToList() ?? new List<GenreDTO>()
                        })
                        .Skip((pageNumber - 1) * pageSize)
                        .Take(pageSize)

                        .ToListAsync();

                    cachedData = (scripts, totalCount);

                    var cacheOptions = new MemoryCacheEntryOptions()
                        .SetAbsoluteExpiration(TimeSpan.FromMinutes(10))
                        .SetSlidingExpiration(TimeSpan.FromMinutes(5));

                    memoryCache.Set(cacheKey, cachedData, cacheOptions);
                }

                var totalPages = (int)Math.Ceiling((double)cachedData.totalCount / pageSize);

                if (cachedData.totalCount < 1)
                {
                    return ResponseDetail<List<ScriptDTO>>.SuccessfulPaginatedResponse(
                        cachedData.scripts,
                        cachedData.totalCount,
                        totalPages,
                        pageNumber,
                        "No scripts found for this genre",
                        204);
                }

                return ResponseDetail<List<ScriptDTO>>.SuccessfulPaginatedResponse(
                    cachedData.scripts,
                    cachedData.totalCount,
                    totalPages,
                    pageNumber,
                    "Scripts retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"fetching scripts by genre {genreId}");
                return ResponseDetail<List<ScriptDTO>>.Failed("Your request failed", 500, "Unexpected error");
            }
        }
        public async Task<ResponseDetail<List<ScriptDTO>>> SearchScripts(string searchTerm, int pageNumber, int pageSize)
        {
            try
            {
                var cacheKey = $"Scripts_Search_{searchTerm}";
                memoryCache.TryGetValue<List<ScriptDTO>>(cacheKey, out var cachedScripts);
                if (cachedScripts == null)
                {
                    var scriptData = await dbContext.Scripts
                                    .Include(x => x.Genres)
                                    .OrderBy(x => x.IsPremiumScript)
                                    .ThenByDescending(x => x.CreatedAt)
                                    .Where(s => s.Status == ScriptStatus.Available &&
                                                                          (s.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                                                                           s.Synopsis.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)))
                                    .AsNoTracking()
                                    .ToListAsync();

                    cachedScripts = scriptData.Select(s => new ScriptDTO
                    {
                        Id = s.Id,
                        Title = s.Title,
                        Logline = s.Logline,
                        Synopsis = s.Synopsis,
                        Price = s.Price,
                        CurrencySymbol = s.CurrencySymbol,
                        Currency = s.Currency,
                        IsScriptRegistered = s.IsScriptRegistered,
                        RegistrationBody = s.RegistrationBody,
                        ImageUrl = s.ImageUrl,
                        ImagePublicId = s.ImagePublicId,
                        CopyrightNumber = s.CopyrightNumber,
                        OwnershipRights = s.OwnershipRights,
                        ProofUrl = s.ProofUrl,
                        WriterId = s.WriterId,
                        WriterName = s.WriterName,
                        Status = s.Status,
                        IsPremiumScript = s.IsPremiumScript,
                        CreatedAt = s.CreatedAt,
                        Genre = s.Genres.Select(g => new GenreDTO
                        {
                            Id = g.Id,
                            Name = g.Name,
                            Description = g.Description
                        }).ToList() ?? new List<GenreDTO>()
                    }).ToList();

                    var cacheOptions = new MemoryCacheEntryOptions()
                        .SetAbsoluteExpiration(TimeSpan.FromMinutes(5))
                        .SetSlidingExpiration(TimeSpan.FromMinutes(2));

                    memoryCache.Set(cacheKey, cachedScripts, cacheOptions);
                }

                var totalCount = cachedScripts.Count;
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
                var paginatedScripts = cachedScripts
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                if (totalCount < 1)
                {
                    return ResponseDetail<List<ScriptDTO>>.SuccessfulPaginatedResponse(paginatedScripts, totalCount, totalPages, pageNumber, $"No scripts found for '{searchTerm}'", 204);
                }

                return ResponseDetail<List<ScriptDTO>>.SuccessfulPaginatedResponse(paginatedScripts, totalCount, totalPages, pageNumber, "Scripts retrieved successfully");
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, $"searching scripts with term {searchTerm}");
                return ResponseDetail<List<ScriptDTO>>.Failed("Your request failed", 500, "Unexpected error");
            }
        }

        public async Task<ResponseDetail<List<Genre>>> GetGenres()
        {
            try
            {
                var genres = await dbContext.Genres.OrderBy(x => x.Name).AsNoTracking().ToListAsync();
                return ResponseDetail<List<Genre>>.Successful(genres);
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "fetching genres");
                return ResponseDetail<List<Genre>>.Failed("Your request failed", 500, "Unexpected error");
            }
        }
    }

    /// <summary>
    /// Simple IFormFile implementation for script attachments
    /// </summary>
    internal class ScriptFormFile : IFormFile
    {
        private readonly Stream _stream;

        public ScriptFormFile(Stream stream, string fileName, string contentType)
        {
            _stream = stream;
            Name = "script";
            FileName = fileName;
            ContentType = contentType;
            Length = stream.Length;
            Headers = new HeaderDictionary();
        }

        public string ContentType { get; }
        public string ContentDisposition => $"attachment; filename=\"{FileName}\"";
        public IHeaderDictionary Headers { get; }
        public long Length { get; }
        public string Name { get; }
        public string FileName { get; }

        public void CopyTo(Stream target) => _stream.CopyTo(target);
        public Task CopyToAsync(Stream target, CancellationToken cancellationToken = default) => _stream.CopyToAsync(target, cancellationToken);
        public Stream OpenReadStream() => _stream;
    }
}
