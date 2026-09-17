namespace RestoreAPI.Application.Interfaces;

public interface IUnitOfWork
{
    IProductRepository Products { get; }
    IOrderRepository Orders { get; }
    IBasketRepository Baskets { get; }
    IFavoriteRepository Favorites { get; }
    IStockNotificationRepository StockNotifications { get; }
    IAdminNotificationRepository AdminNotifications { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitAsync(CancellationToken cancellationToken = default);
    Task RollbackAsync(CancellationToken cancellationToken = default);
}
