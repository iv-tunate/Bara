using System.Text.RegularExpressions;

namespace Bara.API.Utilities.ToolKit
{
    /// <summary>
    /// Contains static methods for validating user input using regular expressions.
    /// </summary>
    public partial class RegexValidations
    {
        /// <summary>
        /// Regular expression for validating names (alphabetic only).
        /// </summary>
        [GeneratedRegex("^[a-zA-Z]+$")]
        private static partial Regex NameRegex();

        /// <summary>
        /// Regular expression for validating email addresses.
        /// </summary>
        [GeneratedRegex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")]
        private static partial Regex EmailRegex();

        /// <summary>
        /// Regular expression for validating phone numbers (E.164 format).
        /// </summary>
        [GeneratedRegex(@"^\+?[1-9]\d{1,14}$")]
        private static partial Regex PhoneRegex();

        /// <summary>
        /// Regular expression for validating password format.
        /// Must include at least one lowercase letter, one uppercase letter,
        /// one number, one special character, and be at least 8 characters long.
        /// </summary>
        [GeneratedRegex("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\da-zA-Z]).{8,}$")]
        private static partial Regex PasswordRegex();

        /// <summary>
        /// Validates that a given email address is in a proper format.
        /// </summary>
        /// <param name="email">The email address to validate.</param>
        /// <returns><c>true</c> if the email is valid; otherwise, <c>false</c>.</returns>
        public static bool IsValidMail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;
            return EmailRegex().IsMatch(email);
        }

        /// <summary>
        /// Validates that the provided names contain only alphabetic characters.
        /// </summary>
        /// <param name="firstName">The user's first name.</param>
        /// <param name="lastName">The user's last name.</param>
        /// <param name="middleName">The user's middle name (optional).</param>
        /// <returns><c>true</c> if all provided names are valid; otherwise, <c>false</c>.</returns>
        public static bool IsValidName(string firstName, string lastName, string middleName = "")
        {
            if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
                return false;

            if (!string.IsNullOrWhiteSpace(middleName) && !NameRegex().IsMatch(middleName))
                return false;

            if (!NameRegex().IsMatch(firstName) || !NameRegex().IsMatch(lastName))
                return false;

            return true;
        }

        /// <summary>
        /// Validates that the provided phone number is exactly 11 digits.
        /// </summary>
        /// <param name="phoneNumber">The phone number to validate.</param>
        /// <returns><c>true</c> if the phone number is valid; otherwise, <c>false</c>.</returns>
        public static bool IsValidPhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
                return false;
            return PhoneRegex().IsMatch(phoneNumber);
        }

        /// <summary>
        /// Validates whether the provided password meets complexity requirements.
        /// </summary>
        /// <param name="password">The password to validate.</param>
        /// <returns><c>true</c> if the password format is acceptable; otherwise, <c>false</c>.</returns>
        public static bool IsAcceptablePasswordFormat(string password)
        {
            return PasswordRegex().IsMatch(password);
        }
    }
}
