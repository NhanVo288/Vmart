using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Features.Favorites.Commands.AddFavoriteItem;
using RestoreAPI.Application.Features.Favorites.Commands.DeleteFavorite;
using RestoreAPI.Application.Features.Favorites.Commands.RemoveFavoriteItem;
using RestoreAPI.Application.Features.Favorites.Queries.GetFavorite;
using RestoreAPI.Presentation.Common;

namespace RestoreAPI.Controllers
{
    public class FavoritesController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger<FavoritesController> _logger;

        public FavoritesController(IMediator mediator, ILogger<FavoritesController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<FavoriteDto?>> GetFavorite()
        {
            var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
            var favorite = await _mediator.Send(new GetFavoriteQuery { BuyerId = buyerId });
            return favorite is null
                ? Ok(new FavoriteDto { BuyerId = buyerId })
                : Ok(favorite);
        }

        [HttpPost("{productId}")]
        public async Task<ActionResult<FavoriteDto>> AddItem(int productId)
        {
            var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
            var result = await _mediator.Send(new AddFavoriteItemCommand { BuyerId = buyerId, ProductId = productId });
            if (result.IsFailure)
                return result.ToActionResult(this);

            _logger.LogInformation("Favorite added: product {ProductId} for buyer {BuyerId}", productId, buyerId);
            return CreatedAtAction(nameof(GetFavorite), result.Value);
        }

        [HttpDelete("{productId}")]
        public async Task<ActionResult> RemoveItem(int productId)
        {
            var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
            var result = await _mediator.Send(new RemoveFavoriteItemCommand { BuyerId = buyerId, ProductId = productId });
            if (result.IsSuccess)
                _logger.LogInformation("Favorite removed: product {ProductId} for buyer {BuyerId}", productId, buyerId);
            return result.ToActionResult(this);
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteFavorite()
        {
            var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
            var result = await _mediator.Send(new DeleteFavoriteCommand { BuyerId = buyerId });
            if (result.IsSuccess)
                _logger.LogInformation("All favorites deleted for buyer {BuyerId}", buyerId);
            return result.ToActionResult(this);
        }
    }
}
