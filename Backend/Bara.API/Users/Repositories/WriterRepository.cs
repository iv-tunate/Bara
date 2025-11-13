using Bara.API.DataContext;
using Bara.API.Services.BackgroudServices;
using Bara.API.Services.YouVerifyIntegration;
using Bara.API.Transactions.DTOs;
using Bara.API.Users.DTOs.AddressDTOs;
using Bara.API.Users.DTOs.ServiceDTOs;
using Bara.API.Users.DTOs.WriterDTOs;
using Bara.API.Users.Interfaces.UserInterfaces;
using Bara.API.Users.Models;
using Bara.API.Utilities.Settings;
using Bara.API.Utilities.ToolKit;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Services.FileStorageServices.Interfaces;

namespace Bara.API.Users.Repositories
{
    public class WriterRepository : IWriterService
    {
        private readonly BaraContext dbContext;
        private readonly ILogger<WriterRepository> logger;
        private readonly AppSettings settings;
        private readonly IFileService fileService;
        private readonly HangfireJobs hangfire;
        private readonly IMemoryCache cache;
        private readonly IYouVerifyService youVerify;

        public WriterRepository(BaraContext dbContext, ILogger<WriterRepository> logger, IOptions<AppSettings> appSettings,
            IFileService fileService, HangfireJobs hangfireJobs, IMemoryCache memoryCache, IYouVerifyService youVerifyService)
        {
            this.dbContext = dbContext;
            this.logger = logger;
            settings = appSettings.Value;
            this.fileService = fileService;
            hangfire = hangfireJobs;
            cache = memoryCache;
            youVerify = youVerifyService;
        }

        public async Task<ResponseDetail<GetWriterDetailDTO>> AddWriter(PostWriterDetailDTO writerDetailDTO, Guid userId)
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var phoneNumberValidation = RegexValidations.IsValidPhoneNumber(writerDetailDTO.PhoneNumber);
                var nameValidation = RegexValidations.IsValidName(writerDetailDTO.FirstName, writerDetailDTO.LastName, writerDetailDTO.MiddleName ?? "");

                var validationErrors = new List<string>();

                if (!phoneNumberValidation) validationErrors.Add("Invalid phone number");
                if (!nameValidation) validationErrors.Add("Names can only contain alphabets");

                if (validationErrors.Count > 0)
                {
                    return ResponseDetail<GetWriterDetailDTO>.Failed(string.Join(" | ", validationErrors));
                }

                // -------------------- UPDATE WRITER PROFILE --------------------
                var writerProfile = await dbContext.Writers.Include(x => x.AuthProfile).FirstOrDefaultAsync(x => x.Id == userId);
                if (writerProfile is null)
                {
                    logger.LogError($"Writer profile with ID {userId} does not exist.");
                    return ResponseDetail<GetWriterDetailDTO>.Failed($"Writer profile with ID {userId} does not exist.", 404, "Not Found");
                }
                if (writerProfile.AuthProfile.IsProfileSetupComplete)
                {
                    logger.LogInformation($"Writer named: {writerProfile.AuthProfile.FullName} with id {writerProfile.Id} tried to create their profile again... This is most likely an error on the frontend. They can update profile but not use this method if they already have completed their profile setup");
                    return ResponseDetail<GetWriterDetailDTO>.Failed($"Profile setup is already complete", 409, "Conflict");
                }

                writerProfile.FirstName = writerDetailDTO.FirstName.ToUpperInvariant();
                writerProfile.LastName = writerDetailDTO.LastName.ToUpperInvariant();
                writerProfile.MiddleName = writerDetailDTO.MiddleName?.ToUpperInvariant() ?? "";
                writerProfile.PhoneNumber = writerDetailDTO.PhoneNumber;
                writerProfile.Bio = writerDetailDTO.Bio ?? "";
                writerProfile.ProfileImagePublicId = writerDetailDTO.ProfileImagePublicId ?? "";
                writerProfile.ProfileImageUrl = writerDetailDTO.ProfileImageUrl ?? "";
                writerProfile.PortfolioUrl = writerDetailDTO.PortfolioUrl ?? "";
                writerProfile.Experiences = writerDetailDTO.Experiences?.Select(x => new BioExperience
                {
                    WriterId = userId,
                    IsCurrent = x.IsCurrent,
                    Organization = x.Organization?.ToUpperInvariant() ?? "",
                    Project = x.Project?.ToUpperInvariant() ?? "",
                    StartDate = x.StartDate,
                    EndDate = x.EndDate,
                    Description = x.Description?.ToUpperInvariant() ?? writerDetailDTO.Bio ?? ""
                }).ToList();
                writerProfile.Gender = writerDetailDTO.Gender;
                writerProfile.DateOfBirth = writerDetailDTO.DateOfBirth;
                writerProfile.IsPremiumMember = writerDetailDTO.IsPremiumMember;
                writerProfile.AuthProfile.FullName = $"{writerDetailDTO.FirstName} {writerDetailDTO.LastName}".ToUpperInvariant();
                writerProfile.AuthProfile.IsProfileSetupComplete = true;
                writerProfile.Services = writerDetailDTO.PostServiceDetail?
                .Select(dto => new Service
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    MinPrice = dto.MinPrice,
                    MaxPrice = dto.MaxPrice,
                    Currency = dto.Currency,
                    IPDealType = dto.IPDealType,
                    SharePercentage = dto.SharePercentage,
                    PaymentType = dto.PaymentType,
                    Genre = dto.Genre ?? [],
                    WriterId = userId
                })
                .ToList() ?? [];
                writerProfile.Address = new Address
                {
                    City = writerDetailDTO.AddressDetail.City.ToUpperInvariant(),
                    Country = writerDetailDTO.AddressDetail.Country.ToUpperInvariant(),
                    State = writerDetailDTO.AddressDetail.State.ToUpperInvariant(),
                    Street = writerDetailDTO.AddressDetail.Street.ToUpperInvariant(),
                    PostalCode = writerDetailDTO.AddressDetail.PostalCode,
                    AdditionalDetails = writerDetailDTO.AddressDetail.AdditionalDetails.ToUpperInvariant(),
                    UserId = userId
                };

                // --------------------  UPLOAD & ASSIGN DOCUMENT ID --------------------
                var userDirectoryName = $"Writer_{writerDetailDTO.FirstName.ToUpperInvariant()}_{writerDetailDTO.LastName.ToUpperInvariant()}-{userId}";
                var document = await fileService.ProcessDocumentForUpload(userId, userDirectoryName, writerDetailDTO.VerificationDocument);
                if (!document.IsSuccess || document.Data == null)
                {
                    await transaction.RollbackAsync();
                    logger.LogError($"An error occurred while uploading KYC document for {writerDetailDTO.FirstName} {writerDetailDTO.LastName}");
                    return ResponseDetail<GetWriterDetailDTO>.Failed($"An error occurred while uploading KYC document for {writerDetailDTO.FirstName} {writerDetailDTO.LastName}", 500, "Unexpected Error");
                }

                // --------------------  ASSIGN DOCUMENT TO WRITER PROFILE --------------------
                writerProfile.Document = new Document
                {
                    Id = document.Data.Id,
                    Name = document.Data.Name,
                    DocumentType = document.Data.DocumentType,
                    FileExtension = document.Data.FileExtension,
                    IdentificationNumber = writerDetailDTO.VerificationDocument.VerificationNumber,
                    Path = document.Data.Path,
                    DocumentUrl = document.Data.DocumentUrl,
                    UserId = userId
                };
                // --------------------  UPDATE WRITER PROFILE --------------------
                dbContext.Writers.Update(writerProfile);
                var writerRes = await dbContext.SaveChangesAsync();
                if (writerRes < 1)
                {
                    await transaction.RollbackAsync();
                    logger.LogError($"An error occurred while creating a writer profile for {writerDetailDTO.FirstName} {writerDetailDTO.LastName}");
                    return ResponseDetail<GetWriterDetailDTO>.Failed($"An error occurred while creating a writer profile for {writerDetailDTO.FirstName} {writerDetailDTO.LastName}", 500, "Unexpected Error");
                }

                // --------------------  PREPARE KYC REQUEST --------------------
                var kycDetail = new YouVerifyKycDto
                {
                    Id = writerDetailDTO.VerificationDocument.VerificationNumber,
                    Type = writerDetailDTO.VerificationDocument.Type.ToString(),
                    UserId = writerProfile.Id,
                    LastName = writerProfile.LastName,
                };

                BackgroundJob.Enqueue(() => hangfire.StartKycProcess(kycDetail));
                // --------------------  BUILD RESPONSE DTO --------------------
                var writer = new GetWriterDetailDTO
                {
                    Id = writerProfile.Id,
                    Email = writerProfile.Email,
                    FirstName = writerProfile.FirstName,
                    LastName = writerProfile.LastName,
                    MiddleName = writerProfile.MiddleName,
                    Name = $"{writerProfile.FirstName} {writerProfile.LastName}",
                    Bio = writerProfile.Bio,
                    ProfileImagePublicId = writerProfile.ProfileImagePublicId,
                    ProfileImageUrl = writerProfile.ProfileImageUrl,
                    PortfolioUrl = writerProfile.PortfolioUrl,
                    Experiences = writerProfile.Experiences?.Select(x => new BioExperience
                    {
                        Description = x.Description,
                        Organization = x.Organization,
                        Project = x.Project,
                        StartDate = x.StartDate,
                        EndDate = x.EndDate,
                        IsCurrent = x.IsCurrent,
                        Id = x.Id,
                        WriterId = x.WriterId
                    }).ToList(),
                    IsBlacklisted = writerProfile.IsBlacklisted,
                    Address = new AddressDetail
                    {
                        City = writerProfile.Address.City,
                        Country = writerProfile.Address.Country,
                        State = writerProfile.Address.State,
                        Street = writerProfile.Address.Street,
                        PostalCode = writerProfile.Address.PostalCode,
                        AdditionalDetails = writerProfile.Address.AdditionalDetails,
                    },
                    IsEmailVerified = writerProfile.AuthProfile.IsEmailVerified,
                    IsVerified = writerProfile.AuthProfile.IsVerified,
                    PhoneNumber = writerProfile.PhoneNumber,
                    VerificationStatus = writerProfile.VerificationStatus.ToString(),
                    Role = writerProfile.AuthProfile.Role,
                    IsPremium = writerProfile.IsPremiumMember,
                    Services = writerProfile.Services.Select(s => new GetServiceDetailDTO
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Description = s.Description,
                        MinPrice = s.MinPrice,
                        MaxPrice = s.MaxPrice,
                        Currency = s.Currency,
                        IPDealType = s.IPDealType,
                        SharePercentage = s.SharePercentage,
                        PaymentType = s.PaymentType,
                        Genre = s.Genre,
                    }).ToList(),
                    Wallet = new GetWalletDetailDTO
                    {
                        Id = writerProfile.Wallet.Id,
                        TotalBalance = writerProfile.Wallet.TotalBalance,
                        AvailableBalance = writerProfile.Wallet.AvailableBalance,
                        LockedBalance = writerProfile.Wallet.LockedBalance,
                        Currency = writerProfile.Wallet.Currency,
                        CurrencySymbol = writerProfile.Wallet.CurrencySymbol,
                        UserId = writerProfile.Id
                    },
                    CreatedAt = writerProfile.CreatedAt,
                    DateCreated = writerProfile.DateCreated,
                    TimeCreated = writerProfile.TimeCreated,
                    DateModified = writerProfile.DateModified,
                    ModifiedAt = writerProfile.ModifiedAt,
                    TimeModified = writerProfile.TimeModified
                };


                // --------------------  COMMIT TRANSACTION --------------------
                await transaction.CommitAsync();


                // -------------------- CACHE FINAL PROFILE --------------------
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10),
                    SlidingExpiration = TimeSpan.FromMinutes(5)
                };
                cache.Set($"Writer_Profile{writerProfile.Id}", writerProfile, cacheOptions);

                // -------------------- RETURN SUCCESS --------------------
                return ResponseDetail<GetWriterDetailDTO>.Successful(writer, $"Writer profile created successfully", 201);
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();
                logger.LogError($"A database update exception: {dbEx.GetType().Name} was thrown while creating an account for {writerDetailDTO.FirstName} {writerDetailDTO.LastName}... Base Exception: {dbEx.GetBaseException().GetType()}", $"Exception Code: {dbEx.HResult}");
                return ResponseDetail<GetWriterDetailDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError($"An exception: {ex.GetType().Name} was thrown while creating a writer profile... \nBase Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}", ex.Message);
                return ResponseDetail<GetWriterDetailDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public Task<ResponseDetail<bool>> DeleteWriter(Guid writerId)
        {
            //Set as deleted and delete login profile ... not an actual delete.. i put this here so i don't forget
            throw new NotImplementedException();
        }

        public async Task<ResponseDetail<GetWriterDetailDTO>> GetWriterDetail(Guid writerId)
        {
            try
            {
                var writerProfile = await dbContext.Writers.Where(x => x.IsDeleted == false).
                                    Select(x => new GetWriterDetailDTO
                                    {
                                        Id = x.Id,
                                        Email = x.Email,
                                        FirstName = x.FirstName,
                                        LastName = x.LastName,
                                        Name = $"{x.FirstName} {x.LastName}",
                                        Bio = x.Bio,
                                        Experiences = x.Experiences.Select(x => new BioExperience
                                        {
                                            Description = x.Description,
                                            Organization = x.Organization,
                                            Project = x.Project,
                                            StartDate = x.StartDate,
                                            EndDate = x.EndDate,
                                            IsCurrent = x.IsCurrent,
                                            Id = x.Id
                                        }).ToList(),
                                        IsPremium = x.IsPremiumMember,
                                        MiddleName = x.MiddleName ?? "-",
                                        Services = x.Services.Select(x => new GetServiceDetailDTO
                                        {
                                            Id = x.Id,
                                            Name = x.Name,
                                            Currency = x.Currency,
                                            CurrencySymbol = x.CurrencySymbol,
                                            Description = x.Description,
                                            Genre = x.Genre,
                                            IPDealType = x.IPDealType,
                                            MaxPrice = x.MaxPrice,
                                            MinPrice = x.MinPrice,
                                            PaymentType = x.PaymentType,
                                            SharePercentage = x.SharePercentage
                                        }).ToList(),
                                        Address = new AddressDetail
                                        {
                                            City = x.Address.City,
                                            Country = x.Address.Country,
                                            State = x.Address.State,
                                            Street = x.Address.Street,
                                            AdditionalDetails = x.Address.AdditionalDetails ?? "-",
                                            PostalCode = x.Address.PostalCode ?? "-",
                                        },
                                        Role = x.AuthProfile.Role,
                                        Wallet = new GetWalletDetailDTO
                                        {
                                            TotalBalance = x.Wallet.TotalBalance,
                                            AvailableBalance = x.Wallet.AvailableBalance,
                                            LockedBalance = x.Wallet.LockedBalance,
                                            Currency = x.Wallet.Currency,
                                            CurrencySymbol = x.Wallet.CurrencySymbol,
                                            Id = x.Wallet.Id,
                                            UserId = x.Id
                                        },
                                        IsBlacklisted = x.IsBlacklisted,
                                        CreatedAt = x.CreatedAt,
                                        DateCreated = x.DateCreated,
                                        TimeCreated = x.TimeCreated,
                                        DateModified = x.DateModified,
                                        IsEmailVerified = x.AuthProfile.IsEmailVerified,
                                        IsVerified = x.AuthProfile.IsVerified,
                                        ModifiedAt = x.ModifiedAt,
                                        PhoneNumber = x.PhoneNumber,
                                        ProfileImagePublicId = x.ProfileImagePublicId,
                                        ProfileImageUrl = x.ProfileImageUrl,
                                        PortfolioUrl = x.PortfolioUrl,
                                        TimeModified = x.TimeModified,
                                        VerificationStatus = x.VerificationStatus.ToString()
                                    }).FirstOrDefaultAsync(x => x.Id == writerId);
                if (writerProfile == null)
                {
                    return ResponseDetail<GetWriterDetailDTO>.Failed($"Writer with ID:{writerId} does not exist", 404, "Not Found");
                }
                return ResponseDetail<GetWriterDetailDTO>.Successful(writerProfile);
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception {ex.GetType().FullName} was thrown while fetching writer profile...\n Base Exception: {ex.GetBaseException().GetType().FullName}", ex.Message);
                return ResponseDetail<GetWriterDetailDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public Task<ResponseDetail<List<GetWriterDetailDTO>>> GetWriters(int pageNumber, int pageSize)
        {
            throw new NotImplementedException();
        }

        public Task<ResponseDetail<GetWriterDetailDTO>> UpdateWriterDetail(Guid writerId, PostWriterDetailDTO updateWriterDetail)
        {
            throw new NotImplementedException();
        }
    }
}