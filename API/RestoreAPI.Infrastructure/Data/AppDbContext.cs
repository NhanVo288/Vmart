using System.Linq.Expressions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Domain.Entities.Common;
using RestoreAPI.Domain.Entities.OrderAggregate;

namespace RestoreAPI.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<Basket> Baskets => Set<Basket>();
        public DbSet<Favorite> Favorites => Set<Favorite>();
        public DbSet<FavoriteItem> FavoriteItems => Set<FavoriteItem>();
        public DbSet<RevokedToken> RevokedTokens => Set<RevokedToken>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<StockNotification> StockNotifications => Set<StockNotification>();
        public DbSet<AdminNotification> AdminNotifications => Set<AdminNotification>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(IAuditableEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(GetIsDeletedFilter(entityType.ClrType));
                }
            }

            modelBuilder.Entity<Product>(entity =>
            {
                entity.Property(p => p.Price)
                      .HasColumnType("decimal(18,2)");

                entity.HasIndex(p => p.SellerId);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(o => o.Subtotal)
                      .HasColumnType("decimal(18,2)");

                entity.Property(o => o.PaymentReference)
                      .HasColumnName("PaymentIntentId");

                entity.HasIndex(o => o.PaymentReference)
                      .HasDatabaseName("IX_Orders_PaymentIntentId")
                      .IsUnique()
                      .HasFilter("[PaymentIntentId] IS NOT NULL");
            });

            modelBuilder.Entity<Basket>(entity =>
            {
                entity.Property(b => b.PaymentReference)
                      .HasColumnName("PaymentIntentId");
                entity.Property(b => b.PaymentQrUrl)
                      .HasColumnName("ClientSecret");
            });

            modelBuilder.Entity<OrderItems>(entity =>
            {
                entity.Property(i => i.Price)
                      .HasColumnType("decimal(18,2)");
            });

            modelBuilder.Entity<StockNotification>(entity =>
            {
                entity.HasIndex(n => new { n.Email, n.ProductId }).IsUnique();
            });

            modelBuilder.Entity<IdentityRole>(entity =>
            {
                entity.HasData(
                    new IdentityRole { Id = "e487e1fb-4f51-4a6c-a88e-a73e01f6f03f", ConcurrencyStamp = "Admin", Name = "Admin", NormalizedName = "ADMIN" },
                    new IdentityRole { Id = "f27dc116-201c-4b0b-9284-8ad535eec0f3", ConcurrencyStamp = "User", Name = "User", NormalizedName = "USER" },
                    new IdentityRole { Id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890", ConcurrencyStamp = "Vendor", Name = "Vendor", NormalizedName = "VENDOR" }
                );
            });
        }

        private static LambdaExpression GetIsDeletedFilter(Type type)
        {
            var param = Expression.Parameter(type, "e");
            var prop = Expression.Property(param, nameof(IAuditableEntity.IsDeleted));
            var falseVal = Expression.Constant(false);
            var body = Expression.Equal(prop, falseVal);
            return Expression.Lambda(body, param);
        }
    }
}
