using Bara.API.Users.DTOs.DocumentDTOs;
using Bara.API.Users.Enums;
using BaraTests.Utils;
using Microsoft.AspNetCore.Http;

namespace BaraTests
{
    public class FileTests : BaseTestFixture
    {
        readonly static Guid userId = new("b0d1006e-c564-4d74-f45c-08ddd9dbbcf1");
        readonly static string userName = "John_Doe";
        readonly string userDirectoryName = $"{userName}-{userId}";
        readonly string IdNumber = "11111111111";
        [Fact]
        public async Task ProcessDocumentForUpload_WithValidPdfDocument_ShouldReturnSuccessfulResponse()
        {
            var documentDetail = CreateValidDocumentDetailDTO();

            var result = await fileService.ProcessDocumentForUpload(userId, userDirectoryName, documentDetail);

            Assert.NotNull(result.Data);
            Assert.True(result.IsSuccess);
            Assert.Contains("uploaded successfully", result.Message);
        }

        [Fact]
        public async Task ProcessDocumentForUpload_WithInvalidFileExtension_ShouldReturnInvalidFileTypeError()
        {
            var documentDetail = CreateInvalidDocumentDetailDTO();

            var result = await fileService.ProcessDocumentForUpload(userId, userDirectoryName, documentDetail);

            Assert.False(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(415, result.StatusCode);
        }

        [Fact]
        public async Task ProcessDocumentForUpload_WithBVNDocument_ShouldCreateDocumentWithCorrectType()
        {
            var documentDetail = CreateDocumentDetailDTO(DocumentType.BVN, IdNumber);

            var result = await fileService.ProcessDocumentForUpload(userId, userDirectoryName, documentDetail);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
        }

        [Fact]
        public async Task ProcessDocumentForUpload_WithNINDocument_ShouldCreateDocumentWithCorrectType()
        {
            var documentDetail = CreateDocumentDetailDTO(DocumentType.NIN, IdNumber);

            var result = await fileService.ProcessDocumentForUpload(userId, userDirectoryName, documentDetail);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
        }

        //[Fact]
        //public async Task ProcessDocumentForUpload_WithInternationalPassportDocument_ShouldCreateDocumentWithCorrectType()
        //{
        //    var documentDetail = CreateDocumentDetailDTO(DocumentType.International_Passport, IdNumber);

        //    var result = await fileService.ProcessDocumentForUpload(userId, userDirectoryName, documentDetail);

        //    Assert.True(result.IsSuccess);
        //    Assert.NotNull(result.Data);
        //}

        //[Fact]
        //public async Task ProcessDocumentForUpload_WithDriversLicenseDocument_ShouldCreateDocumentWithCorrectType()
        //{
        //    var documentDetail = CreateDocumentDetailDTO(DocumentType.Drivers_License, "DL123456789");

        //    var result = await fileService.ProcessDocumentForUpload(userId, userDirectoryName, documentDetail);

        //    Assert.True(result.IsSuccess);
        //    Assert.NotNull(result.Data);
        //}

        private PostDocumentDetailDTO CreateValidDocumentDetailDTO()
        {
            return CreateDocumentDetailDTO(DocumentType.BVN, IdNumber);
        }

        private PostDocumentDetailDTO CreateDocumentDetailDTO(DocumentType type, string verificationNumber)
        {
            var fileContent = "Test document content"u8.ToArray();
            var stream = new MemoryStream(fileContent);
            var formFile = new FormFile(stream, 0, fileContent.Length, "Document", "test-document.pdf")
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/pdf"
            };

            return new PostDocumentDetailDTO
            {
                Document = formFile,
                Type = type,
                VerificationNumber = verificationNumber
            };
        }

        private PostDocumentDetailDTO CreateInvalidDocumentDetailDTO()
        {
            var fileContent = "Test document content"u8.ToArray();
            var stream = new MemoryStream(fileContent);
            var formFile = new FormFile(stream, 0, fileContent.Length, "Document", "document.txt")
            {
                Headers = new HeaderDictionary(),
                ContentType = "text/plain"
            };

            return new PostDocumentDetailDTO
            {
                Document = formFile,
                Type = DocumentType.BVN,
                VerificationNumber = IdNumber
            };
        }
    }
}
