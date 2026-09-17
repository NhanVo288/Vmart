using RestoreAPI.Application.Models;

namespace RestoreAPI.Application.Interfaces;

public interface IPaymentService
{
    Task<SepayPaymentRequest> CreateOrUpdatePaymentAsync(string buyerId);
    Task<SepayPaymentStatus> GetPaymentStatusAsync(string buyerId, string paymentReference);
    bool IsWebhookAuthorized(string? authorizationHeader);
    Task ProcessWebhookAsync(SepayWebhookPayload payload);
}
