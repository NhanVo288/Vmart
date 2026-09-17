using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Interfaces
{
    public interface IStockNotificationRepository : IGenericRepository<StockNotification, int>
    {
        Task<StockNotification?> GetByEmailAndProductAsync(string email, int productId);
        Task<List<StockNotification>> GetPendingByProductAsync(int productId);
    }
}
