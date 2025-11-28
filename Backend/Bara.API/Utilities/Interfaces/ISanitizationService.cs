namespace Bara.API.Utilities.Interfaces
{
    public interface ISanitizationService
    {
        string SanitizeHtml(string input);
        string SanitizeUrl(string input);
    }
}
