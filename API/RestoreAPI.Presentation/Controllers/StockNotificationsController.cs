using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Features.StockNotifications.Commands.Subscribe;

namespace RestoreAPI.Controllers
{
    public class StockNotificationsController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger<StockNotificationsController> _logger;

        public StockNotificationsController(IMediator mediator, ILogger<StockNotificationsController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult> Subscribe([FromBody] SubscribeRequest request)
        {
            var result = await _mediator.Send(new SubscribeCommand
            {
                Email = request.Email,
                ProductId = request.ProductId
            });

            if (result.IsFailure)
            {
                _logger.LogWarning("Stock notification subscription failed for {Email} on product {ProductId}: {Error}",
                    request.Email, request.ProductId, result.Error.Message);
                return Problem(
                    detail: result.Error.Message,
                    title: "Subscription Failed",
                    type: $"https://restoreapi.com/errors/{result.Error.Code}",
                    statusCode: 400,
                    extensions: new Dictionary<string, object?> { ["errorCode"] = result.Error.Code });
            }

            _logger.LogInformation("Stock notification subscribed for product {ProductId} by {Email}", request.ProductId, request.Email);
            return Ok(new { message = "You will be notified when this product is back in stock." });
        }
    }

    public class SubscribeRequest
    {
        public required string Email { get; set; }
        public int ProductId { get; set; }
    }
}
