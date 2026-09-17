using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Features.AdminNotifications.Commands.MarkAllNotificationsRead;
using RestoreAPI.Application.Features.AdminNotifications.Commands.MarkNotificationRead;
using RestoreAPI.Application.Features.AdminNotifications.Queries.GetAdminNotifications;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;
using RestoreAPI.Domain.Enums;
using RestoreAPI.Presentation.Common;

namespace RestoreAPI.Controllers
{
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : BaseApiController
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMediator _mediator;
        private readonly ILogger<AdminController> _logger;
        private readonly IServiceProvider _serviceProvider;

        public AdminController(
            IOrderRepository orderRepository,
            IAccountRepository accountRepository,
            IUnitOfWork unitOfWork,
            IMediator mediator,
            ILogger<AdminController> logger,
            IServiceProvider serviceProvider)
        {
            _orderRepository = orderRepository;
            _accountRepository = accountRepository;
            _unitOfWork = unitOfWork;
            _mediator = mediator;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        [HttpGet("orders")]
        public async Task<ActionResult<PaginatedList<OrderDto>>> GetOrders([FromQuery] OrderFilterRequest filter)
        {
            var orders = await _orderRepository.GetAllOrdersAsync(filter);
            return Ok(orders);
        }

        [HttpGet("orders/{id:int}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            var order = await _orderRepository.GetOrderByIdAsync(id);
            if (order == null) return NotFound();
            return Ok(order.ToDto());
        }

        [HttpPut("orders/{id:int}/status")]
        public async Task<ActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            if (!Enum.TryParse<OrderStatus>(request.Status, true, out var status))
                return BadRequest($"Invalid status: {request.Status}");

            var order = await _orderRepository.UpdateOrderStatusAsync(id, status);
            if (order == null) return NotFound();

            _logger.LogInformation("Order {OrderId} status updated to {NewStatus} by {Admin}", id, request.Status, User.Identity?.Name ?? "Unknown");
            return NoContent();
        }

        [HttpGet("users")]
        public async Task<ActionResult<List<UserListItemDto>>> GetUsers()
        {
            var users = await _accountRepository.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public async Task<ActionResult<UserListItemDto>> GetUser(string id)
        {
            var user = await _accountRepository.GetUserByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPut("users/{id}/roles")]
        public async Task<ActionResult> UpdateUserRoles(string id, [FromBody] UpdateUserRolesRequest request)
        {
            var success = await _accountRepository.UpdateUserRolesAsync(id, request.Roles);
            if (!success) return NotFound();
            _logger.LogWarning("User {UserId} roles updated to {Roles}", id, string.Join(", ", request.Roles));
            return NoContent();
        }

        [HttpGet("notifications")]
        public async Task<ActionResult<PaginatedList<AdminNotificationDto>>> GetNotifications(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool? isRead = null)
        {
            var result = await _mediator.Send(new GetAdminNotificationsQuery
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                IsRead = isRead
            });
            return Ok(result);
        }

        [HttpGet("notifications/unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var count = await _unitOfWork.AdminNotifications.GetUnreadCountAsync();
            return Ok(count);
        }

        [HttpPatch("notifications/{id:int}/read")]
        public async Task<ActionResult> MarkNotificationAsRead(int id)
        {
            var result = await _mediator.Send(new MarkNotificationReadCommand { Id = id });
            return result.ToActionResult(this);
        }

        [HttpPatch("notifications/read-all")]
        public async Task<ActionResult> MarkAllNotificationsAsRead()
        {
            var result = await _mediator.Send(new MarkAllNotificationsReadCommand());
            return result.ToActionResult(this);
        }

        [HttpGet("health-checks")]
        public async Task<ActionResult> GetHealthChecks()
        {
            try
            {
                var healthCheckService = _serviceProvider.GetRequiredService<HealthCheckService>();
                var report = await healthCheckService.CheckHealthAsync();
                var result = new
                {
                    status = report.Status.ToString(),
                    totalDuration = report.TotalDuration.TotalMilliseconds,
                    checks = report.Entries.Select(e => new
                    {
                        name = e.Key,
                        status = e.Value.Status.ToString(),
                        duration = e.Value.Duration.TotalMilliseconds,
                        description = e.Value.Description,
                        exception = e.Value.Exception?.Message
                    }).ToList()
                };
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve health checks");
                return Ok(new
                {
                    status = "Error",
                    totalDuration = 0,
                    checks = new object[] { }
                });
            }
        }
    }
}
