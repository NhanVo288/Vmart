using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendWelcomeEmailAsync(string userEmail, string userName);
        Task<string?> SendOrderConfirmationEmailAsync(string userEmail, OrderDto order);
        Task SendContactAutoReplyAsync(string contactEmail, string name, string subject, string message);
        Task<string?> SendStockAvailableEmailAsync(string userEmail, string productName, string pictureUrl, decimal price, int productId);
        Task SendPasswordResetLinkAsync(string userEmail, string userName, string resetLink);
    }
}
