using Microsoft.EntityFrameworkCore;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Infrastructure.Extention
{
    public static class BasketExtensions
    {
        public static IQueryable<Basket> WithItems(this IQueryable<Basket> query)
        {
            return query
                .Include(b => b.Items)
                .ThenInclude(i => i.Product);
        }
    }
}
