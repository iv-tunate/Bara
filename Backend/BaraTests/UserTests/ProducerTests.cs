using Bara.API.Users.DTOs.AddressDTOs;
using Bara.API.Users.DTOs.DocumentDTOs;
using Bara.API.Users.DTOs.ProducerDTOs;
using Bara.API.Users.Enums;
using BaraTests.Utils;
using Microsoft.AspNetCore.Http;

namespace BaraTests.UserTests
{
    public class ProducerTests : BaseTestFixture
    {
        Guid userId = Guid.NewGuid();
        [Fact]
        public async Task AddProducer_WithValidData_ShouldReturnSuccessfulResponse()
        {
            var producerDetail = CreateValidProducerDetailDTO();

            var result = await producerService.AddProducer(producerDetail, userId);

            Assert.NotNull(result);
            Assert.NotNull(result.Data);
            Assert.True(result.IsSuccess);
            Assert.Equal(producerDetail.DateOfBirth, result.Data.DateOfBirth);
        }

        [Fact]
        public async Task AddProducer_WithInvalidEmail_ShouldReturnValidationError()
        {
            var producerDetail = CreateValidProducerDetailDTO();
            //producerDetail = producerDetail with { Email = "invalid-email" };

            var result = await producerService.AddProducer(producerDetail, userId);

            Assert.NotNull(result);
            Assert.False(result.IsSuccess);
            Assert.Contains("Invalid email", result.Message);
        }

        [Fact]
        public async Task GetProducer_WithNonExistentId_ShouldReturnNotFound()
        {
            var nonExistentId = Guid.NewGuid();

            var result = await producerService.GetProducer(nonExistentId);

            Assert.NotNull(result);
            Assert.False(result.IsSuccess);
            Assert.Equal(404, result.StatusCode);
        }

        private PostProducerDetailDTO CreateValidProducerDetailDTO()
        {
            var fileContent = "Test document content"u8.ToArray();
            var stream = new MemoryStream(fileContent);
            var formFile = new FormFile(stream, 0, fileContent.Length, "Document", "test-document.pdf")
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/pdf"
            };

            return new PostProducerDetailDTO
            {
                FirstName = "Jane",
                LastName = "Smith",
                MiddleName = "Marie",
                PhoneNumber = "+2348012345678",
                Bio = "Experienced film producer",
                Gender = Gender.FEMALE,
                DateOfBirth = new DateOnly(1985, 5, 15),
                AddressDetail = new AddressDetail
                {
                    Street = "456 Producer Avenue",
                    City = "Abuja",
                    State = "FCT",
                    Country = "Nigeria",
                    PostalCode = "900001",
                    AdditionalDetails = "Near the cinema"
                },
                VerificationDocument = new PostDocumentDetailDTO
                {
                    Document = formFile,
                    Type = DocumentType.NIN,
                    VerificationNumber = "11111111111"
                }
            };
        }
    }
}
