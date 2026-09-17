using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Features.Orders.Commands.CreateOrder;
using RestoreAPI.Application.Features.Orders.Queries.GetOrderById;
using RestoreAPI.Application.Features.Orders.Queries.GetOrders;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;
using RestoreAPI.Presentation.Common;

namespace RestoreAPI.Controllers
{
    [Authorize]
    public class OrdersController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(IMediator mediator, ILogger<OrdersController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedList<OrderDto>>> GetOrders([FromQuery] OrderFilterRequest filter)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Orders retrieved for user {UserId}", userId ?? "Unknown");
            var orders = await _mediator.Send(new GetOrdersQuery { BuyerId = userId ?? string.Empty, Filter = filter });
            return Ok(orders);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDto>> GetOrderDetails(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _mediator.Send(new GetOrderByIdQuery { Id = id, BuyerId = userId ?? string.Empty });
            return result.ToActionResult(this);
        }

        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto orderDto)
        {
            await Task.CompletedTask;
            return Conflict(new
            {
                error = "Orders are created automatically after SePay confirms the bank transfer."
            });
        }
    }
}
