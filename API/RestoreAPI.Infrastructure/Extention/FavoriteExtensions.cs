using Microsoft.EntityFrameworkCore;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Infrastructure.Extention
{
    public static class FavoriteExtensions
    {
        public static IQueryable<Favorite> WithItems(this IQueryable<Favorite> query)
        {
            return query
                .Include(f => f.Items)
                .ThenInclude(i => i.Product);
        }
    }
}
