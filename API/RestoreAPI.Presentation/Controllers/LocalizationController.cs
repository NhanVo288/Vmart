using Microsoft.AspNetCore.Mvc;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Controllers;

namespace RestoreAPI.Presentation.Controllers
{
    public class LocalizationController : BaseApiController
    {
        private readonly ILocalizationService _localizationService;

        public LocalizationController(ILocalizationService localizationService)
        {
            _localizationService = localizationService;
        }

        [HttpGet("culture")]
        public IActionResult GetCulture()
        {
            var culture = _localizationService.GetCurrentCulture();
            return Ok(new
            {
                Name = culture.Name,
                DisplayName = culture.DisplayName,
                NativeName = culture.NativeName,
                IsRightToLeft = culture.TextInfo.IsRightToLeft
            });
        }

        [HttpGet("welcome")]
        public IActionResult GetWelcomeMessage()
        {
            var message = _localizationService.GetString("Welcome");
            return Ok(new { Message = message });
        }

        [HttpGet("resources")]
        public IActionResult GetResources()
        {
            var keys = new[]
            {
                "Welcome",
                "ProductNotFound",
                "BasketNotFound",
                "InternalServerError",
                "Unauthorized",
                "BadRequest"
            };

            var dictionary = keys.ToDictionary(k => k, k => _localizationService.GetString(k));
            return Ok(dictionary);
        }
    }
}
