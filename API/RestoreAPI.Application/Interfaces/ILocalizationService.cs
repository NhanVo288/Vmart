using System.Globalization;

namespace RestoreAPI.Application.Interfaces
{
    public interface ILocalizationService
    {
        string GetString(string key);
        string GetString(string key, params object[] args);
        CultureInfo GetCurrentCulture();
    }
}
