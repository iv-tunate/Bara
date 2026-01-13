using Bara.API.Users.DTOs;
using Bara.API.Users.DTOs.UserDTO;
using Bara.API.Users.Models;
using Bara.API.Utilities.ToolKit;

namespace Bara.API.Users.Interfaces.UserInterfaces
{
    /// <summary>
    /// Defines the interface for user services, providing methods to manage blacklisted users.
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Begins the registration process for a new user by validating their details and generating an email verification token.
        /// </summary>
        /// <param name="detail"> Contains the Email, password and Type of User registering</param>
        /// <returns></returns>
        Task<ResponseDetail<RegisterResponseDTO>> BeginRegistration(RegisterDTO detail);

        /// <summary>
        /// Updates a users kyc verification status using the verification id number
        /// </summary>
        /// <param name="verificationIdNumber"></param>
        /// <param name="dateOfBirth"></param>
        /// <param name="firstName"></param>
        /// <param name="lastName"></param>
        /// <param name="verificationType"></param>
        /// <returns></returns>
        Task<ResponseDetail<bool>> UpdateUserVerificationStatus(string verificationIdNumber, string dateOfBirth, string firstName, string lastName, string verificationType);
        /// <summary>
        /// Adds a user to the blacklist with an optional reason.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="reason"></param>
        /// <returns>a true or false value</returns>
        Task<ResponseDetail<bool>> BlackListUser(Guid userId, string? reason);

        /// <summary>
        /// Removes a user from the blacklist.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns>a true or false value</returns>
        Task<ResponseDetail<bool>> RemoveUserFromBlackList(Guid userId);

        /// <summary>
        /// Retrieves details of all blacklisted users.
        /// </summary>
        /// <param name="pageNumber"></param>
        /// <param name="pageSize"></param>
        /// <returns>A list of blacklisted users</returns>
        Task<ResponseDetail<List<BlackListedUser>>> GetBlackListedUsers(int pageNumber, int pageSize);

        /// <summary>
        /// Retrieves details of a specific blacklisted user by their ID.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns> The detail of specific blacklisted user</returns>
        Task<ResponseDetail<BlackListedUser>> GetBlackListedUser(Guid userId);

        /// <summary>
        /// Adds a new bank detail for a user, such as account number and bank name.
        /// </summary>
        /// <param name="bankDetail"></param>
        /// <param name="userId"> </param>
        /// <returns></returns>
        Task<ResponseDetail<BankDetail>> AddBankDetail(PostBankDetailDTO bankDetail, Guid userId);

        /// <summary>
        /// Retrieves the bank details of a user, including account number, bank name, and bank code.
        /// </summary>
        /// <returns></returns>
        Task<ResponseDetail<List<BankDetail>>> GetAllBankDetails(Guid userId);

        /// <summary>
        /// Retrieves a specific bank detail by its ID for a given user.
        /// </summary>
        /// <param name="bankDetailId"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        Task<ResponseDetail<BankDetail>> GetBankDetail(Guid bankDetailId, Guid userId);

        /// <summary>
        /// Manually retries KYC verification for a user who has previously failed verification.
        /// This endpoint allows administrators to trigger a new KYC verification attempt.
        /// </summary>
        /// <param name="payload">The payload containing userId, verificationNumber and verificationType</param>
        /// <returns>A response indicating whether the KYC retry was successfully initiated</returns>
        Task<ResponseDetail<bool>> RetryKycVerification(RetryKycDTO payload);

        /// <summary>
        /// Retrieves all users for admin dashboard.
        /// </summary>
        Task<ResponseDetail<List<AdminUserListDTO>>> GetAllUsers(int pageNumber, int pageSize);

        /// <summary>
        /// Retrieves detailed information about a user for admin dashboard.
        /// </summary>
        Task<ResponseDetail<AdminUserDetailDTO>> GetAdminUserDetail(Guid userId);

        /// <summary>
        /// Searches for users by name or email with pagination.
        /// </summary>
        Task<ResponseDetail<List<AdminUserListDTO>>> SearchUsers(string query, int pageNumber, int pageSize);
        
        /// <summary>
        /// Calculates the total earnings for a user from completed script transactions.
        /// </summary>
        Task<ResponseDetail<decimal>> GetTotalEarnings(Guid userId);

        /// <summary>
        /// Retrieves platform-wide statistics for the admin dashboard.
        /// </summary>
        Task<ResponseDetail<PlatformStatsDTO>> GetPlatformStats();

        /// <summary>
        /// Updates only the profile image metadata for a user.
        /// </summary>
        Task<ResponseDetail<bool>> UpdateProfileImage(Guid userId, UpdateProfileImageDTO imageInfo);
    }
}
