using Bara.API.Services.YouVerifyIntegration;
using BaraTests.Utils;

namespace BaraTests
{
    public class ExternalIntegrationTests : BaseTestFixture
    {
        #region You Verify

        [Fact]
        public async Task TestYouVerifyKYCUseCase()
        {
            await TestYouVerifyKYC("BVN", "11111111111");
            await TestYouVerifyKYC("NIN", "00000000000");
        }

        internal async Task TestYouVerifyKYC(string type, string id)
        {
            var kycDto = new YouVerifyKycDto
            {
                Id = id,
                Type = type,
                IsSubjectConsent = true,
            };

            var response = await youVerify.VerifyIdentificationNumberAsync(kycDto);
            Assert.NotNull(response);
            Assert.True(response.Success);
        }

        #endregion
    }
}
