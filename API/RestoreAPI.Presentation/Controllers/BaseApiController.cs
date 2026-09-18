using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Features.Baskets.Commands.TransferBasket;
using RestoreAPI.Application.Features.Favorites.Commands.TransferFavorite;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseApiController : ControllerBase
    {
        private ILocalizationService? _localizationService;

        protected ILocalizationService LocalizationService =>
            _localizationService ??= HttpContext.RequestServices.GetRequiredService<ILocalizationService>();

        private SameSiteMode BuyerCookieSameSite
        {
            get
            {
                var configuredValue = HttpContext.RequestServices
                    .GetRequiredService<IConfiguration>()["Cookies:BuyerIdSameSite"];

                return Enum.TryParse<SameSiteMode>(configuredValue, true, out var sameSite)
                    ? sameSite
                    : SameSiteMode.Lax;
            }
        }

        protected CookieOptions BuildCookieOptions()
        {
            var sameSite = BuyerCookieSameSite;
            return new CookieOptions
            {
                HttpOnly = true,
                IsEssential = true,
                SameSite = sameSite,
                Secure = sameSite == SameSiteMode.None || Request.IsHttps,
                Expires = DateTime.UtcNow.AddDays(30),
                Path = "/"
            };
        }

        protected void DeleteBuyerIdCookie()
        {
            var options = BuildCookieOptions();
            options.Expires = null;
            Response.Cookies.Delete("buyerId", options);
        }

        protected async Task TransferAnonymousBuyerAsync(
            string? targetBuyerId,
            IMediator? mediator = null)
        {
            var cookieBuyerId = Request.Cookies["buyerId"];

            if (string.IsNullOrEmpty(cookieBuyerId) || string.IsNullOrEmpty(targetBuyerId) || cookieBuyerId == targetBuyerId)
            {
                return;
            }

            if (mediator != null)
            {
                await mediator.Send(new TransferBasketCommand { AnonymousBuyerId = cookieBuyerId, UserBuyerId = targetBuyerId });
                await mediator.Send(new TransferFavoriteCommand { AnonymousBuyerId = cookieBuyerId, UserBuyerId = targetBuyerId });
            }

            DeleteBuyerIdCookie();
        }

        protected async Task<string> GetOrCreateBuyerIdAsync(IMediator? mediator = null)
        {
            var cookieBuyerId = Request.Cookies["buyerId"];
            var userIdentifier = User.Identity?.IsAuthenticated == true ? User.FindFirstValue(ClaimTypes.NameIdentifier) : null;

            if (!string.IsNullOrEmpty(userIdentifier))
            {
                await TransferAnonymousBuyerAsync(userIdentifier, mediator);
                return userIdentifier;
            }

            if (!string.IsNullOrEmpty(cookieBuyerId)) return cookieBuyerId;

            var newBuyerId = Guid.NewGuid().ToString();
            Response.Cookies.Append("buyerId", newBuyerId, BuildCookieOptions());
            return newBuyerId;
        }
    }
}
