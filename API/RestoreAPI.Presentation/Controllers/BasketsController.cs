using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Features.Baskets.Commands.CreateBasket;
using RestoreAPI.Application.Features.Baskets.Commands.DeleteBasket;
using RestoreAPI.Application.Features.Baskets.Commands.RemoveBasketItem;
using RestoreAPI.Application.Features.Baskets.Commands.SetShippingAddress;
using RestoreAPI.Application.Features.Baskets.Commands.UpdateBasket;
using RestoreAPI.Application.Features.Baskets.Queries.GetBasket;
using RestoreAPI.Application.Requests;
using RestoreAPI.Presentation.Common;

namespace RestoreAPI.Controllers
{
    public class BasketsController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger<BasketsController> _logger;

        public BasketsController(IMediator mediator, ILogger<BasketsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<BasketDto?>> GetBasket()
        {
            var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
            var basket = await _mediator.Send(new GetBasketQuery { BuyerId = buyerId });
            return basket is null
                ? Ok(new BasketDto { BuyerId = buyerId })
                : Ok(basket);
        }

        [HttpPost]
        public async Task<ActionResult<BasketDto>> CreateBasket(List<BasketItemRequest> items)
        {
            var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
            var result = await _mediator.Send(new CreateBasketCommand { BuyerId = buyerId, Items = items });
            if (result.IsFailure)
                return result.ToActionResult(this);

            _logger.LogInformation("Basket created: {BasketId}", result.Value!.BuyerId);
            return CreatedAtAction(nameof(GetBasket), result.Value);
        }

        [HttpPut]
        public async Task<ActionResult<BasketDto>> UpdateBasket(List<BasketItemRequest> items)
        {
            var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
            var result = await _mediator.Send(new UpdateBasketCommand { BuyerId = buyerId, Items = items });
            if (result.IsFailure)
                return result.ToActionResult(this);

            _logger.LogInformation("Basket {BasketId} updated, items: {ItemCount}", buyerId, items.Count);
            return Ok(result.Value);
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteBasket()
        {
            var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
            var result = await _mediator.Send(new DeleteBasketCommand { BuyerId = buyerId });
            if (result.IsSuccess)
                _logger.LogInformation("Basket {BasketId} deleted", buyerId);
            return result.ToActionResult(this);
        }

        [HttpDelete("items/{productId}")]
        public async Task<ActionResult> RemoveItem(int productId)
        {
            var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
            var result = await _mediator.Send(new RemoveBasketItemCommand { BuyerId = buyerId, ProductId = productId });
            return result.ToActionResult(this);
        }

        [HttpPut("shipping-address")]
        public async Task<ActionResult<BasketDto>> SetShippingAddress(AddressInput address)
        {
            var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
            var result = await _mediator.Send(new SetShippingAddressCommand { BuyerId = buyerId, Address = address });
            return result.ToActionResult(this);
        }
    }
}
