using Microsoft.EntityFrameworkCore;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Infrastructure.Data;

namespace RestoreAPI.Infrastructure.Repositories
{
    public class StockNotificationRepository : RepositoryBase<StockNotification, int>, IStockNotificationRepository
    {
        public StockNotificationRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<StockNotification?> GetByEmailAndProductAsync(string email, int productId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(n => n.Email == email && n.ProductId == productId);
        }

        public async Task<List<StockNotification>> GetPendingByProductAsync(int productId)
        {
            return await _dbSet
                .Where(n => n.ProductId == productId && !n.IsNotified)
                .ToListAsync();
        }
    }
}
