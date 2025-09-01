using Hangfire;
using Infrastructure.DataContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Services.BackgroudServices;
using Services.FileStorageServices.Interfaces;
using Services.YouVerifyIntegration;
using SharedModule.Models;
using SharedModule.Utils;
using TransactionModule.DTOs;
using TransactionModule.Models;
using UserModule.DTOs.AddressDTOs;
using UserModule.DTOs.ProducerDTOs;
using UserModule.Enums;
using UserModule.Interfaces.UserInterfaces;
using UserModule.Models;
using UserModule.Utilities;

namespace Infrastructure.Repositories.UserRepositories
{
    public class ProducerRepository : IProducerService
    {
        private readonly BaraContext dbContext;
        private readonly ILogger<WriterRepository> logger;
        private readonly IFileService fileService;
        private readonly HangfireJobs hangfire;
        private readonly IMemoryCache cache;
        private readonly IYouVerifyService youVerify;
        public ProducerRepository(BaraContext baraContext, ILogger<WriterRepository> logger, IFileService fileService,
            HangfireJobs hangfireJobs, IMemoryCache memoryCache, IYouVerifyService youVerify)
        {
            dbContext = baraContext;
            this.logger = logger;
            this.fileService = fileService;
            hangfire = hangfireJobs;
            cache = memoryCache;
            this.youVerify = youVerify;
        }
        public async Task<ResponseDetail<GetProducerDetailDTO>> AddProducer(PostProducerDetailDTO producerDetailDTO, Guid userId)
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync();
            try
            {
                // -------------------- INPUT VALIDATION --------------------

                var phoneNumberValidation = RegexValidations.IsValidPhoneNumber(producerDetailDTO.PhoneNumber);
                var nameValidation = RegexValidations.IsValidName(producerDetailDTO.FirstName, producerDetailDTO.LastName, producerDetailDTO.MiddleName ?? "");

                var validationErrors = new List<string>();

                if (!phoneNumberValidation) validationErrors.Add("Invalid phone number");
                if (!nameValidation) validationErrors.Add("Names can only contain alphabets");

                if (validationErrors.Count > 0)
                {
                    return ResponseDetail<GetProducerDetailDTO>.Failed(string.Join(" | ", validationErrors));
                }

                // -------------------- CREATE PRODUCER PROFILE --------------------
                var producer = await dbContext.Producers.FindAsync(userId);
                if (producer is null)
                {
                    logger.LogError($"Producer profile with ID {userId} does not exist.");
                    return ResponseDetail<GetProducerDetailDTO>.Failed($"Producer profile with ID {userId} does not exist.", 404, "Not Found");
                }
                producer.FirstName = producerDetailDTO.FirstName.ToUpperInvariant();
                producer.LastName = producerDetailDTO.LastName.ToUpperInvariant();
                producer.MiddleName = producerDetailDTO.MiddleName?.ToUpperInvariant() ?? "";
                producer.PhoneNumber = producerDetailDTO.PhoneNumber;
                producer.Bio = producerDetailDTO.Bio;
                producer.Gender = producerDetailDTO.Gender;
                producer.DateOfBirth = producerDetailDTO.DateOfBirth;
                producer.Type = Role.Producer;
                producer.AuthProfile.FullName = $"{producerDetailDTO.FirstName} {producerDetailDTO.LastName}".ToUpperInvariant();
                producer.Wallet = new Wallet
                {
                    TotalBalance = 0,
                    AvailableBalance = 0,
                    LockedBalance = 0,
                    Currency = Currency.NAIRA,
                    UserId = userId
                };
                producer.Address = new Address
                {
                    City = producerDetailDTO.AddressDetail.City.ToUpperInvariant(),
                    Country = producerDetailDTO.AddressDetail.Country.ToUpperInvariant(),
                    State = producerDetailDTO.AddressDetail.State.ToUpperInvariant(),
                    Street = producerDetailDTO.AddressDetail.Street.ToUpperInvariant(),
                    PostalCode = producerDetailDTO.AddressDetail.PostalCode,
                    AdditionalDetails = producerDetailDTO.AddressDetail.AdditionalDetails.ToUpperInvariant(),
                    UserId = userId
                };
                producer.Address = new Address
                {
                    City = producerDetailDTO.AddressDetail.City.ToUpperInvariant(),
                    Country = producerDetailDTO.AddressDetail.Country.ToUpperInvariant(),
                    State = producerDetailDTO.AddressDetail.State.ToUpperInvariant(),
                    Street = producerDetailDTO.AddressDetail.Street.ToUpperInvariant(),
                    PostalCode = producerDetailDTO.AddressDetail.PostalCode,
                    AdditionalDetails = producerDetailDTO.AddressDetail.AdditionalDetails.ToUpperInvariant(),
                    UserId = userId
                };

                // --------------------  UPLOAD & ASSIGN DOCUMENT ID --------------------
                var userDirectoryName = $"Producer_{producerDetailDTO.FirstName.ToUpperInvariant()}_{producerDetailDTO.LastName.ToUpperInvariant()}-{userId}";
                var document = await fileService.ProcessDocumentForUpload(userId, userDirectoryName, producerDetailDTO.VerificationDocument);
                if (!document.IsSuccess || document.Data == null)
                {
                    logger.LogError($"An error occurred while uploading KYC document for {producerDetailDTO.FirstName} {producerDetailDTO.LastName}");
                    return ResponseDetail<GetProducerDetailDTO>.Failed($"An error occurred while uploading KYC document for {producerDetailDTO.FirstName} {producerDetailDTO.LastName}", 500, "Unexpected Error");
                }

                producer.Document = new Document
                {
                    Id = document.Data.Id,
                    Name = document.Data.Name,
                    Path = document.Data.Path,
                    DocumentUrl = document.Data.DocumentUrl,
                    FileExtension = document.Data.FileExtension,
                    Size = document.Data.Size,
                    IdentificationNumber = producerDetailDTO.VerificationDocument.VerificationNumber,
                    DocumentType = producerDetailDTO.VerificationDocument.Type,
                    UserId = userId
                };

                dbContext.Users.Update(producer);
                await dbContext.SaveChangesAsync();

                // --------------------  PREPARE KYC REQUEST --------------------
                var kycDetail = new YouVerifyKycDto
                {
                    Id = producerDetailDTO.VerificationDocument.VerificationNumber,
                    Type = producerDetailDTO.VerificationDocument.Type.ToString(),
                    UserId = producer.Id,
                    LastName = producer.LastName,
                };

                BackgroundJob.Enqueue(() => hangfire.StartKycProcess(kycDetail));
                // --------------------  BUILD RESPONSE DTO --------------------
                var producerProfile = new GetProducerDetailDTO
                {
                    Id = producer.Id,
                    Email = producer.Email,
                    FirstName = producer.FirstName,
                    LastName = producer.LastName,
                    MiddleName = producer.MiddleName,
                    Name = $"{producer.FirstName} {producer.LastName}",
                    Bio = producer.Bio,
                    IsBlacklisted = producer.IsBlacklisted,
                    Address = new AddressDetail
                    {
                        City = producer.Address.City,
                        Country = producer.Address.Country,
                        State = producer.Address.State,
                        Street = producer.Address.Street,
                        PostalCode = producer.Address.PostalCode,
                        AdditionalDetails = producer.Address.AdditionalDetails,
                    },
                    IsEmailVerified = producer.AuthProfile.IsEmailVerified,
                    IsVerified = producer.AuthProfile.IsVerified,
                    PhoneNumber = producer.PhoneNumber,
                    VerificationStatus = producer.VerificationStatus,
                    DateOfBirth = producer.DateOfBirth
                };

                // --------------------  COMMIT TRANSACTION --------------------
                await transaction.CommitAsync();

                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10),
                    SlidingExpiration = TimeSpan.FromMinutes(5)
                };
                cache.Set($"Producer_Profile{producer.Id}", producerProfile, cacheOptions);

                // -------------------- RETURN SUCCESS --------------------
                return ResponseDetail<GetProducerDetailDTO>.Successful(producerProfile, "Producer profile successfully created", 201);
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();
                logger.LogError($"A database update exception: {dbEx.GetType().Name} was thrown while creating an account for {producerDetailDTO.FirstName} {producerDetailDTO.LastName}... Base Exception: {dbEx.GetBaseException().GetType()}", $"Exception Code: {dbEx.HResult}");
                return ResponseDetail<GetProducerDetailDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError($"An exception: {ex.GetType().Name} was thrown while creating a producer profile... \nBase Exception: {ex.GetBaseException().GetType().Name}", $"Exception Code: {ex.HResult}", ex.Message);
                return ResponseDetail<GetProducerDetailDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public Task<bool> DeleteProducer(Guid producerId)
        {
            throw new NotImplementedException();
        }

        public async Task<ResponseDetail<GetProducerDetailDTO>> GetProducer(Guid producerId)
        {
            try
            {
                var producer = await dbContext.Producers.Where(x => x.IsDeleted == false).
                                    Select(x => new GetProducerDetailDTO
                                    {
                                        Id = x.Id,
                                        Email = x.Email,
                                        FirstName = x.FirstName,
                                        LastName = x.LastName,
                                        Name = $"{x.FirstName} {x.LastName}",
                                        Bio = x.Bio,
                                        MiddleName = x.MiddleName ?? "-",
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
                                        IsEmailVerified = x.AuthProfile.IsEmailVerified,
                                        IsVerified = x.AuthProfile.IsVerified,
                                        Wallet = new GetWalletDetailDTO
                                        {
                                            Balance = x.Wallet.TotalBalance,
                                            Currency = x.Wallet.Currency,
                                            CurrencySymbol = x.Wallet.CurrencySymbol,
                                            LockedBalance = x.Wallet.LockedBalance,
                                            Id = x.Wallet.Id,
                                            UserId = x.Id
                                        },
                                        IsBlacklisted = x.IsBlacklisted,
                                        CreatedAt = x.CreatedAt,
                                        DateCreated = x.DateCreated,
                                        TimeCreated = x.TimeCreated,
                                        DateModified = x.DateModified,
                                        ModifiedAt = x.ModifiedAt,
                                        PhoneNumber = x.PhoneNumber,
                                        TimeModified = x.TimeModified,
                                        VerificationStatus = x.VerificationStatus,
                                    }).FirstOrDefaultAsync(x => x.Id == producerId);
                if (producer is null)
                {
                    return ResponseDetail<GetProducerDetailDTO>.Failed($"Producer with ID:{producerId} does not exist", 404, "Not Found");
                }
                return ResponseDetail<GetProducerDetailDTO>.Successful(producer);
            }
            catch (Exception ex)
            {
                logger.LogError($"An exception {ex.GetType().FullName} was thrown while fetching producer's profile...\n Base Exception: {ex.GetBaseException().GetType().FullName}", ex.Message);
                return ResponseDetail<GetProducerDetailDTO>.Failed("Your request cannot be completed at this time... Please try again later", 500, "Unexpected error");
            }
        }

        public Task<ResponseDetail<GetProducerDetailDTO>> UpdateProducer(PostProducerDetailDTO producerDetailDTO, Guid producerId)
        {
            throw new NotImplementedException();
        }
    }
}
