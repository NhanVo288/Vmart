using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Features.Orders.Queries.GetVendorDashboard;
using RestoreAPI.Application.Features.Orders.Queries.GetVendorOrders;
using RestoreAPI.Application.Features.Products.Queries.GetProductsBySellerId;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;

namespace RestoreAPI.Controllers
{
    [Route("api/vendor")]
    [Authorize(Roles = "Vendor")]
    public class VendorController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ILogger<VendorController> _logger;

        public VendorController(IMediator mediator, ILogger<VendorController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpGet("products")]
        public async Task<ActionResult<PaginatedList<ProductDto>>> GetProducts([FromQuery] ProductFilterRequest filter)
        {
            var vendorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(vendorId)) return Unauthorized();

            var products = await _mediator.Send(new GetProductsBySellerIdQuery { SellerId = vendorId, Filter = filter });
            return Ok(products);
        }

        [HttpGet("orders")]
        public async Task<ActionResult<PaginatedList<VendorOrderDto>>> GetOrders([FromQuery] OrderFilterRequest filter)
        {
            var vendorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(vendorId)) return Unauthorized();

            var orders = await _mediator.Send(new GetVendorOrdersQuery { VendorId = vendorId, Filter = filter });
            return Ok(orders);
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<VendorDashboardDto>> GetDashboard()
        {
            var vendorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(vendorId)) return Unauthorized();

            var dashboard = await _mediator.Send(new GetVendorDashboardQuery { VendorId = vendorId });
            return Ok(dashboard);
        }
    }
}
