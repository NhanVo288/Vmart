using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;

namespace RestoreAPI.Controllers;

public sealed class PaymentsController : BaseApiController
{
    private readonly IMediator _mediator;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IMediator mediator, IPaymentService paymentService,
        ILogger<PaymentsController> logger)
    {
        _mediator = mediator;
        _paymentService = paymentService;
        _logger = logger;
    }

    [Authorize]
    [HttpPost("sepay-request")]
    public async Task<ActionResult<SepayPaymentRequest>> CreateOrUpdatePayment()
    {
        var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
        return Ok(await _paymentService.CreateOrUpdatePaymentAsync(buyerId));
    }

    [Authorize]
    [HttpGet("sepay-status/{paymentReference}")]
    public async Task<ActionResult<SepayPaymentStatus>> GetPaymentStatus(string paymentReference)
    {
        var buyerId = await GetOrCreateBuyerIdAsync(_mediator);
        var status = await _paymentService.GetPaymentStatusAsync(buyerId, paymentReference);
        return status.Status == "not_found" ? NotFound(status) : Ok(status);
    }

    [AllowAnonymous]
    [HttpPost("sepay-webhook")]
    public async Task<IActionResult> SepayWebhook([FromBody] SepayWebhookPayload payload)
    {
        if (!_paymentService.IsWebhookAuthorized(Request.Headers.Authorization.ToString()))
            return Unauthorized(new { success = false });

        try
        {
            await _paymentService.ProcessWebhookAsync(payload);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SePay webhook processing failed for transaction {TransactionId}", payload.Id);
            return StatusCode(500, new { success = false });
        }
    }
}
