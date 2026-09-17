using Microsoft.EntityFrameworkCore;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Infrastructure.Data;
using RestoreAPI.Infrastructure.Extention;

namespace RestoreAPI.Infrastructure.Repositories
{
    public class BasketRepository : RepositoryBase<Basket, int>, IBasketRepository
    {
        public BasketRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Basket?> GetBasketAsync(string buyerId)
        {
            return await _dbSet
                .WithItems()
                .FirstOrDefaultAsync(b => b.BuyerId == buyerId);
        }

        public async Task<Basket?> GetBasketByPaymentReferenceAsync(string paymentReference)
        {
            return await _dbSet
                .WithItems()
                .FirstOrDefaultAsync(b => b.PaymentReference == paymentReference);
        }
    }
}
