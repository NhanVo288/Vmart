using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Features.Products.Commands.CreateProduct;
using RestoreAPI.Application.Features.Products.Commands.DeleteProduct;
using RestoreAPI.Application.Features.Products.Commands.UpdateProduct;
using RestoreAPI.Application.Features.Products.Queries.GetAllProducts;
using RestoreAPI.Application.Features.Products.Queries.GetProductById;
using RestoreAPI.Application.Features.Products.Queries.GetProductFilters;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Presentation.Common;

namespace RestoreAPI.Controllers
{
    public class ProductsController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly ICacheService _cacheService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(
            IMediator mediator,
            ICacheService cacheService,
            ILogger<ProductsController> logger)
        {
            _mediator = mediator;
            _cacheService = cacheService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedList<ProductDto>>> GetProducts([FromQuery] ProductFilterRequest filter)
        {
            var f = filter;
            var cacheKey = $"products:page_{f.PageNumber}_size_{f.PageSize}_order_{f.OrderBy}_asc_{f.Ascending}_search_{f.SearchTerm}_brands_{f.Brands}_types_{f.Types}_min_{f.MinPrice}_max_{f.MaxPrice}";
            var isCached = (await _cacheService.GetAsync<PaginatedList<ProductDto>>(cacheKey)) is not null;
            Response.Headers["X-Cache"] = isCached ? "HIT" : "MISS";

            var products = await _mediator.Send(new GetAllProductsQuery { Filter = filter });
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var result = await _mediator.Send(new GetProductByIdQuery { Id = id });
            return result.ToActionResult(this);
        }

        [HttpGet("filters")]
        public async Task<ActionResult<ProductFiltersDto>> GetFilters([FromQuery] ProductFilterRequest filter)
        {
            var f = filter;
            var cacheKey = $"products:filters_search_{f.SearchTerm}_brands_{f.Brands}_types_{f.Types}_min_{f.MinPrice}_max_{f.MaxPrice}";
            var isCached = (await _cacheService.GetAsync<ProductFiltersDto>(cacheKey)) is not null;
            Response.Headers["X-Cache"] = isCached ? "HIT" : "MISS";

            var filters = await _mediator.Send(new GetProductFiltersQuery { Filter = filter });
            return Ok(filters);
        }

        [Authorize(Roles = "Admin,Vendor")]
        [HttpPost]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromForm] CreateProductRequest request)
        {
            string? sellerId = null;
            string? vendorName = null;
            if (User.IsInRole("Vendor"))
            {
                sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                vendorName = User.Identity?.Name ?? User.FindFirstValue(ClaimTypes.Email);
            }

            await using var imageStream = request.Image?.OpenReadStream();

            var command = new CreateProductCommand
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                QuantityInStock = request.QuantityInStock,
                Type = request.Type,
                Brand = request.Brand,
                ImageStream = imageStream,
                ImageFileName = request.Image?.FileName,
                SellerId = sellerId,
                VendorName = vendorName
            };

            var result = await _mediator.Send(command);
            if (result.IsFailure)
                return result.ToActionResult(this);

            var product = result.Value!;
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [Authorize(Roles = "Admin,Vendor")]
        [HttpPut("{id}")]
        public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromForm] UpdateProductRequest request)
        {
            await using var imageStream = request.Image?.OpenReadStream();

            var command = new UpdateProductCommand
            {
                Id = id,
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                QuantityInStock = request.QuantityInStock,
                Type = request.Type,
                Brand = request.Brand,
                ImageStream = imageStream,
                ImageFileName = request.Image?.FileName,
                ActorId = User.FindFirstValue(ClaimTypes.NameIdentifier),
                ActorRole = User.IsInRole("Admin") ? "Admin" : "Vendor"
            };

            var result = await _mediator.Send(command);
            if (result.IsFailure)
                return result.ToActionResult(this);

            return Ok(result.Value!);
        }

        [Authorize(Roles = "Admin,Vendor")]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var command = new DeleteProductCommand
            {
                Id = id,
                ActorId = User.FindFirstValue(ClaimTypes.NameIdentifier),
                ActorRole = User.IsInRole("Admin") ? "Admin" : "Vendor",
                ActorName = User.Identity?.Name ?? User.FindFirstValue(ClaimTypes.Email)
            };

            var result = await _mediator.Send(command);
            if (result.IsFailure)
                return result.ToActionResult(this);

            return NoContent();
        }
    }
}
