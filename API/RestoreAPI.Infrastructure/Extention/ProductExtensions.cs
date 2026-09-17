using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Infrastructure.Extention
{
    public static class ProductExtensions
    {

        public static IQueryable<Product> ApplySearch(this IQueryable<Product> query, string? searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm)) return query;

            var term = searchTerm.ToLower();
            return query.Where(p => p.Name.ToLower().Contains(term)
                                 || p.Brand.ToLower().Contains(term)
                                 || p.Type.ToLower().Contains(term));
        }

        public static IQueryable<Product> ApplyBrandFilter(this IQueryable<Product> query, string? brands)
        {
            if (string.IsNullOrWhiteSpace(brands)) return query;

            var brandList = brands.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            return query.Where(p => brandList.Contains(p.Brand));
        }

        public static IQueryable<Product> ApplyTypeFilter(this IQueryable<Product> query, string? types)
        {
            if (string.IsNullOrWhiteSpace(types)) return query;

            var typeList = types.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            return query.Where(p => typeList.Contains(p.Type));
        }

        public static IQueryable<Product> ApplyPriceFilter(this IQueryable<Product> query, decimal? minPrice, decimal? maxPrice)
        {
            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            return query;
        }

        public static IQueryable<Product> ApplySorting(this IQueryable<Product> query, string orderBy, bool ascending)
        {
            return (orderBy.ToLower(), ascending) switch
            {
                ("price", true) => query.OrderBy(p => p.Price),
                ("price", false) => query.OrderByDescending(p => p.Price),
                ("name", true) => query.OrderBy(p => p.Name),
                ("name", false) => query.OrderByDescending(p => p.Name),
                ("brand", true) => query.OrderBy(p => p.Brand),
                ("brand", false) => query.OrderByDescending(p => p.Brand),
                ("type", true) => query.OrderBy(p => p.Type),
                ("type", false) => query.OrderByDescending(p => p.Type),
                _ => ascending ? query.OrderBy(p => p.Id) : query.OrderByDescending(p => p.Id),
            };
        }

    }
}
