using Microsoft.EntityFrameworkCore;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Infrastructure.Data;
using RestoreAPI.Infrastructure.Extention;

namespace RestoreAPI.Infrastructure.Repositories
{
    public class FavoriteRepository : RepositoryBase<Favorite, int>, IFavoriteRepository
    {
        public FavoriteRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Favorite?> GetFavoriteAsync(string buyerId)
        {
            return await _dbSet
                .WithItems()
                .FirstOrDefaultAsync(f => f.BuyerId == buyerId);
        }
    }
}
