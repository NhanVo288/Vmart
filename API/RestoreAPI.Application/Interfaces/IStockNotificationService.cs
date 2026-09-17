using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Interfaces;

public interface IStockNotificationService
{
    Task<Result> SubscribeAsync(string email, int productId);
    Task NotifySubscribersAsync(int productId);
}
