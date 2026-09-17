using RestoreAPI.Application.Interfaces;
using RestoreAPI.Infrastructure.Data;

namespace RestoreAPI.Infrastructure.Data;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IProductRepository Products { get; }
    public IOrderRepository Orders { get; }
    public IBasketRepository Baskets { get; }
    public IFavoriteRepository Favorites { get; }
    public IStockNotificationRepository StockNotifications { get; }
    public IAdminNotificationRepository AdminNotifications { get; }

    public UnitOfWork(
        AppDbContext context,
        IProductRepository products,
        IOrderRepository orders,
        IBasketRepository baskets,
        IFavoriteRepository favorites,
        IStockNotificationRepository stockNotifications,
        IAdminNotificationRepository adminNotifications)
    {
        _context = context;
        Products = products;
        Orders = orders;
        Baskets = baskets;
        Favorites = favorites;
        StockNotifications = stockNotifications;
        AdminNotifications = adminNotifications;
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
        => _context.SaveChangesAsync(ct);

    public Task BeginTransactionAsync(CancellationToken ct = default)
        => _context.Database.BeginTransactionAsync(ct);

    public Task CommitAsync(CancellationToken ct = default)
        => _context.Database.CommitTransactionAsync(ct);

    public Task RollbackAsync(CancellationToken ct = default)
        => _context.Database.RollbackTransactionAsync(ct);
}
