using BaraTests.Utils;
using UserModule.DTOs.AuthDTOs;

namespace BaraTests.UserTests
{
    public class AuthTests : BaseTestFixture
    {
        [Fact]
        public async Task Login_WithValidCredentials_ShouldReturnSuccessfulResponse()
        {
            var loginRequest = new AuthRequestDTO
            {
                Email = "test@example.com",
                Password = "TestPassword123!",
                LoginDevice = "TestDevice"
            };

            var result = await authService.Login(loginRequest);

            Assert.NotNull(result);
            Assert.True(result.IsSuccess);
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ShouldReturnFailedResponse()
        {
            var loginRequest = new AuthRequestDTO
            {
                Email = "nonexistent@example.com",
                Password = "WrongPassword",
                LoginDevice = "TestDevice"
            };

            var result = await authService.Login(loginRequest);

            Assert.NotNull(result);
            Assert.False(result.IsSuccess);
            Assert.Contains("Email or password is invalid", result.Message);
        }

        [Fact]
        public async Task VerifyEmail_WithInvalidToken_ShouldReturnFailedResponse()
        {
            var result = await authService.VerifyEmail("invalid-token", "test@example.com");

            Assert.NotNull(result);
            Assert.False(result.IsSuccess);
        }

        [Fact]
        public async Task ResendVerificationToken_WithNonExistentEmail_ShouldReturnNotFoundResponse()
        {
            var result = await authService.ResendVerificationToken("nonexistent@example.com", "register", "unknown");

            Assert.NotNull(result);
            Assert.False(result.IsSuccess);
            Assert.Equal(404, result.StatusCode);
        }
    }
}
