using Bara.API.Users.DTOs;
using Bara.API.Users.DTOs.AddressDTOs;
using Bara.API.Users.DTOs.DocumentDTOs;
using Bara.API.Users.DTOs.WriterDTOs;
using Bara.API.Users.Enums;
using BaraTests.Utils;
using Microsoft.AspNetCore.Http;

namespace BaraTests.UserTests
{
    public class WriterTests : BaseTestFixture
    {
        readonly Guid userId = Guid.NewGuid();
        [Fact]
        public async Task AddWriter_WithValidData_ShouldReturnSuccessfulResponse()
        {
            var writerDetail = CreateValidWriterDetailDTO();

            var result = await writerService.AddWriter(writerDetail, userId);

            Assert.NotNull(result);
        }

        [Fact]
        public async Task AddWriter_WithInvalidEmail_ShouldReturnValidationError()
        {
            var writerDetail = CreateValidWriterDetailDTO();
            //writerDetail = writerDetail with { Email = "invalid-email" };

            var result = await writerService.AddWriter(writerDetail, userId);

            Assert.NotNull(result);
            Assert.False(result.IsSuccess);
            Assert.Contains("Invalid email", result.Message);
        }

        [Fact]
        public async Task GetWriterDetail_WithNonExistentId_ShouldReturnNotFound()
        {
            var nonExistentId = Guid.NewGuid();

            var result = await writerService.GetWriterDetail(nonExistentId);

            Assert.NotNull(result);
            Assert.False(result.IsSuccess);
            Assert.Equal(404, result.StatusCode);
        }

        private PostWriterDetailDTO CreateValidWriterDetailDTO()
        {
            var fileContent = "Test document content"u8.ToArray();
            var stream = new MemoryStream(fileContent);
            var formFile = new FormFile(stream, 0, fileContent.Length, "Document", "test-document.pdf")
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/pdf"
            };

            return new PostWriterDetailDTO
            {
                FirstName = "John",
                LastName = "Doe",
                MiddleName = "Michael",
                PhoneNumber = "+2348012345678",
                Experiences = new List<BioExperienceDTO>
                {
                    new BioExperienceDTO
                    {
                        Description = "Aspiring writer with a keen interest in technology and innovation.",
                        IsCurrent = true,
                        Organization = "Tech Innovations",
                        Project = "Future Tech"
                    },
                    new BioExperienceDTO
                    {
                        Description = "Freelance writer specializing in travel and lifestyle.",
                        IsCurrent = false,
                        Organization = "Wanderlust Magazine",
                        Project = "Travel Diaries"
                    }
                },


                Gender = Gender.MALE,
                DateOfBirth = new DateOnly(1990, 1, 1),
                IsPremiumMember = false,
                AddressDetail = new AddressDetail
                {
                    Street = "123 Main Street",
                    City = "Lagos",
                    State = "Lagos",
                    Country = "Nigeria",
                    PostalCode = "100001",
                    AdditionalDetails = "Near the market"
                },
                VerificationDocument = new PostDocumentDetailDTO
                {
                    Document = formFile,
                    Type = DocumentType.BVN,
                    VerificationNumber = "12345678901"
                }
            };
        }
    }
}
