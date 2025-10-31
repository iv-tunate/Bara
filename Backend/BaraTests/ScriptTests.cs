using Bara.API.Scripts.DTOs;
using Bara.API.Scripts.Enums;
using BaraTests.Utils;
using Microsoft.AspNetCore.Http;

namespace BaraTests
{
    public class ScriptTests : BaseTestFixture
    {
        readonly Guid writerId = new Guid("b0d1006e-c564-4d74-f45c-08ddd9dbbcf1");
        [Fact]
        public async Task AddScript_ShouldHandleSuccessAndFailure()
        {
            var validScript = BuildValidScriptDTO();

            var addResponse = await scriptService.AddScript(validScript, writerId);
            Assert.True(addResponse.IsSuccess);
            Assert.NotNull(addResponse.Data);
            Assert.Equal(validScript.Title.ToLower(), addResponse.Data.Title.ToLower());

            var scriptId = addResponse.Data.Id;

            var deleteResponse = await scriptService.DeleteScript(scriptId, writerId);
            Assert.True(deleteResponse.IsSuccess);

            var getDeleted = await scriptService.GetScriptById(scriptId, writerId);
            Assert.NotNull(getDeleted.Data);
            Assert.Equal(ScriptStatus.Deleted, getDeleted.Data.Status);

            var invalidScript = BuildInvalidScriptDTO();
            var failResponse = await scriptService.AddScript(invalidScript, writerId);
            Assert.False(failResponse.IsSuccess);
        }

        [Fact]
        public async Task AddScript_ShouldFail_WhenFileIsTooLarge()
        {
            var dto = BuildOversizedScriptDTO();

            var response = await scriptService.AddScript(dto, writerId);

            Assert.False(response.IsSuccess);
            Assert.Equal(StatusCodes.Status413PayloadTooLarge, response.StatusCode);
        }

        [Fact]
        public async Task GetScriptById_ShouldHandleSuccessAndFailure()
        {
            var validScript = BuildValidScriptDTO();
            var addResponse = await scriptService.AddScript(validScript, writerId);
            Assert.NotNull(addResponse.Data);
            Assert.True(addResponse.IsSuccess);
            var scriptId = addResponse.Data.Id;

            var getResponse = await scriptService.GetScriptById(scriptId, writerId);
            Assert.True(getResponse.IsSuccess);
            Assert.NotNull(getResponse.Data);
            Assert.Equal(validScript.Title, getResponse.Data.Title);

            var downloadResponse = await scriptService.DownloadScript(scriptId);
            Assert.True(downloadResponse.IsSuccess);
            Assert.NotNull(downloadResponse.Data);
            Assert.NotNull(downloadResponse.Data.File);

            var wrongWriterId = Guid.NewGuid();
            var failResponse = await scriptService.GetScriptById(scriptId, wrongWriterId);
            Assert.False(failResponse.IsSuccess);

            await scriptService.DeleteScript(scriptId, writerId);
        }

        [Fact]
        public async Task GetScriptsByWriterId_ShouldHandlePaginationAndNoData()
        {
            var script1 = await scriptService.AddScript(BuildValidScriptDTO(), writerId);
            var script2 = await scriptService.AddScript(BuildValidScriptDTO(), writerId);

            Assert.True(script1.IsSuccess);
            Assert.True(script2.IsSuccess);
            Assert.NotNull(script1.Data);
            Assert.NotNull(script2.Data);

            var listResponse = await scriptService.GetScriptsByWriterId(writerId, 1, 10);

            Assert.True(listResponse.IsSuccess);
            Assert.NotNull(listResponse.Data);
            Assert.Contains(listResponse.Data, s => s.Id == script1.Data.Id);
            Assert.Contains(listResponse.Data, s => s.Id == script2.Data.Id);

            await scriptService.DeleteScript(script1.Data.Id, writerId);
            await scriptService.DeleteScript(script2.Data.Id, writerId);

            var checkScriptsList = await scriptService.GetScriptsByWriterId(writerId, 1, 10);

            Assert.True(checkScriptsList.IsSuccess);
            Assert.NotNull(checkScriptsList.Data);
            Assert.DoesNotContain(checkScriptsList.Data, s => s.WriterId == writerId);

            Assert.DoesNotContain(checkScriptsList.Data, s => s.Id == script1.Data.Id);
            Assert.DoesNotContain(checkScriptsList.Data, s => s.Id == script2.Data.Id);
        }

        [Fact]
        public async Task GetScripts_ShouldHandlePaginationAndEmpty()
        {
            var script1 = await scriptService.AddScript(BuildValidScriptDTO(), writerId);
            var script2 = await scriptService.AddScript(BuildValidScriptDTO(), writerId);


            Assert.True(script1.IsSuccess);
            Assert.True(script2.IsSuccess);
            Assert.NotNull(script1.Data);
            Assert.NotNull(script2.Data);

            var listResponse = await scriptService.GetScripts(1, 10);
            Assert.True(listResponse.IsSuccess);
            Assert.NotNull(listResponse.Data);
            Assert.True(listResponse.Data.Count >= 2);


            await scriptService.DeleteScript(script1.Data.Id, writerId);
            await scriptService.DeleteScript(script2.Data.Id, writerId);
        }

        [Fact]
        public async Task DownloadScript_ShouldHandleSuccessAndFailure()
        {
            var script = await scriptService.AddScript(BuildValidScriptDTO(), writerId);
            Assert.True(script.IsSuccess);
            Assert.NotNull(script.Data);
            var scriptId = script.Data.Id;

            var downloadResponse = await scriptService.DownloadScript(scriptId);
            Assert.True(downloadResponse.IsSuccess);
            Assert.NotNull(downloadResponse.Data);
            Assert.NotNull(downloadResponse.Data.File);

            var failResponse = await scriptService.DownloadScript(Guid.NewGuid());
            Assert.False(failResponse.IsSuccess);

            await scriptService.DeleteScript(scriptId, writerId);
        }

        //[Fact]
        //public async Task UpdateScript_ShouldHandleSuccessAndFailure()
        //{
        //    var script = await scriptService.AddScript(BuildValidScriptDTO(), writerId);
        //    Assert.True(script.IsSuccess);
        //    Assert.NotNull(script.Data);
        //    var scriptId = script.Data.Id;

        //    var updateDetails = BuildUpdatedScriptDTO();

        //    var updateResponse = await scriptService.UpdateScript(updateDetails, writerId, scriptId);
        //    Assert.True(updateResponse.IsSuccess);
        //    Assert.NotNull(updateResponse.Data);
        //    Assert.Equal(updateDetails.Title, updateResponse.Data.Title);

        //    var failWrongOwner = await scriptService.UpdateScript(updateDetails, Guid.NewGuid(), scriptId);
        //    Assert.False(failWrongOwner.IsSuccess);

        //    var failNotFound = await scriptService.UpdateScript(updateDetails, writerId, Guid.NewGuid());
        //    Assert.False(failNotFound.IsSuccess);

        //    await scriptService.DeleteScript(scriptId, writerId);
        //}

        [Fact]
        public async Task DeleteScript_ShouldHandleSuccessAndFailure()
        {
            var script = await scriptService.AddScript(BuildValidScriptDTO(), writerId);
            Assert.True(script.IsSuccess);
            Assert.NotNull(script.Data);
            var scriptId = script.Data.Id;

            var deleteResponse = await scriptService.DeleteScript(scriptId, writerId);
            Assert.True(deleteResponse.IsSuccess);

            var getDeleted = await scriptService.GetScriptById(scriptId, writerId);
            Assert.Null(getDeleted.Data);

            var script2 = await scriptService.AddScript(BuildValidScriptDTO(), writerId);
            Assert.True(script2.IsSuccess);
            Assert.NotNull(script2.Data);
            var failWrongOwner = await scriptService.DeleteScript(script2.Data.Id, Guid.NewGuid());
            Assert.False(failWrongOwner.IsSuccess);

            // Cleanup
            await scriptService.DeleteScript(script2.Data.Id, writerId);
        }

        // ---------- Test helpers ----------

        private PostScriptDetailDTO BuildValidScriptDTO()
        {
            var fileContent = "Test script content"u8.ToArray();
            var stream = new MemoryStream(fileContent);
            var formFile = new FormFile(stream, 0, fileContent.Length, "Script", "test-script.pdf")
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/pdf"
            };

            return new PostScriptDetailDTO
            {
                Title = "Test Script " + Guid.NewGuid(),
                GenreId = new List<Guid>
                {
                    Guid.NewGuid(),
                    Guid.NewGuid(),
                },
                Logline = "A compelling story about integration testing",
                Synopsis = "Detailed synopsis for integration test.",
                Price = 500.00m,
                IsScriptRegistered = true,
                RegistrationBody = "WGA",
                File = formFile,
                Image = "test-image.jpg",
                CopyrightNumber = "CR123456",
                OwnershipRights = IPDealType.WriterRetainsRights,
                ProofUrl = "https://example.com/proof.pdf"
            };
        }

        private PostScriptDetailDTO BuildInvalidScriptDTO()
        {
            var fileContent = "Invalid content"u8.ToArray();
            var stream = new MemoryStream(fileContent);
            var formFile = new FormFile(stream, 0, fileContent.Length, "Script", "invalid-file.txt")
            {
                Headers = new HeaderDictionary(),
                ContentType = "text/plain"
            };

            return new PostScriptDetailDTO
            {
                Title = "Invalid Script " + Guid.NewGuid(),
                GenreId = new List<Guid>
                {
                    Guid.NewGuid(),
                    Guid.NewGuid(),
                },
                Logline = "Invalid file format test",
                Synopsis = "Should fail because file extension is not allowed.",
                Price = 500.00m,
                IsScriptRegistered = true,
                RegistrationBody = "WGA",
                File = formFile,
                Image = "test-image.jpg",
                CopyrightNumber = "CR123456",
                OwnershipRights = IPDealType.WriterRetainsRights,
                ProofUrl = "https://example.com/proof.pdf"
            };
        }

        private PostScriptDetailDTO BuildOversizedScriptDTO()
        {
            // Create ~10.5 MB file content
            var oversizeContent = new byte[(int)(10.5 * 1024 * 1024)];
            new Random().NextBytes(oversizeContent);

            var stream = new MemoryStream(oversizeContent);
            var formFile = new FormFile(stream, 0, oversizeContent.Length, "Script", "oversized-script.pdf")
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/pdf"
            };

            return new PostScriptDetailDTO
            {
                Title = "Oversized Script " + Guid.NewGuid(),
                GenreId = new List<Guid>
                {
                    Guid.NewGuid(),
                    Guid.NewGuid(),
                },
                Logline = "This should fail due to file size limit.",
                Synopsis = "Oversized test script for integration test.",
                Price = 500.00m,
                IsScriptRegistered = true,
                RegistrationBody = "WGA",
                File = formFile,
                Image = "test-image.jpg",
                CopyrightNumber = "CR123456",
                OwnershipRights = IPDealType.WriterRetainsRights,
                ProofUrl = "https://example.com/proof.pdf"
            };
        }
        private PostScriptDetailDTO BuildUpdatedScriptDTO()
        {
            throw new NotImplementedException();
        }

    }

}

