using System.Globalization;
using Microsoft.Extensions.Localization;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Infrastructure.Resources;

namespace RestoreAPI.Infrastructure.Services
{
    public class LocalizationService : ILocalizationService
    {
        private readonly IStringLocalizer<SharedResource> _localizer;

        public LocalizationService(IStringLocalizer<SharedResource> localizer)
        {
            _localizer = localizer;
        }

        public string GetString(string key)
        {
            var localized = _localizer[key];
            return localized.ResourceNotFound ? key : localized.Value;
        }

        public string GetString(string key, params object[] args)
        {
            var localized = _localizer[key, args];
            return localized.ResourceNotFound ? string.Format(key, args) : localized.Value;
        }

        public CultureInfo GetCurrentCulture() => CultureInfo.CurrentUICulture;
    }
}
