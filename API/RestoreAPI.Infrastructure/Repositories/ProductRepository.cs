using Microsoft.EntityFrameworkCore;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Infrastructure.Data;
using RestoreAPI.Application.Requests;
using RestoreAPI.Infrastructure.Extention;

namespace RestoreAPI.Infrastructure.Repositories
{
    public class ProductRepository : RepositoryBase<Product, int>, IProductRepository
    {
        public ProductRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<PaginatedList<Product>> GetAllAsync(ProductFilterRequest filter)
        {
            var query = _dbSet.AsQueryable();

            query = query
                .ApplySearch(filter.SearchTerm)
                .ApplyBrandFilter(filter.Brands)
                .ApplyTypeFilter(filter.Types)
                .ApplyPriceFilter(filter.MinPrice, filter.MaxPrice)
                .ApplySorting(filter.OrderBy, filter.Ascending);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PaginatedList<Product>(items, totalCount, filter.PageNumber, filter.PageSize);
        }

        public async Task<PaginatedList<Product>> GetAllBySellerIdAsync(string sellerId, ProductFilterRequest filter)
        {
            var query = _dbSet
                .Where(p => p.SellerId == sellerId)
                .AsQueryable();

            query = query
                .ApplySearch(filter.SearchTerm)
                .ApplyBrandFilter(filter.Brands)
                .ApplyTypeFilter(filter.Types)
                .ApplyPriceFilter(filter.MinPrice, filter.MaxPrice)
                .ApplySorting(filter.OrderBy, filter.Ascending);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PaginatedList<Product>(items, totalCount, filter.PageNumber, filter.PageSize);
        }

        public async Task<ProductFiltersDto> GetFiltersAsync(ProductFilterRequest? filter = null)
        {
            var query = _dbSet.AsQueryable();

            if (filter is not null)
            {
                query = query
                    .ApplySearch(filter.SearchTerm)
                    .ApplyBrandFilter(filter.Brands)
                    .ApplyTypeFilter(filter.Types)
                    .ApplyPriceFilter(filter.MinPrice, filter.MaxPrice);
            }

            var brands = await query
                .Select(p => p.Brand)
                .Distinct()
                .OrderBy(b => b)
                .ToListAsync();

            var types = await query
                .Select(p => p.Type)
                .Distinct()
                .OrderBy(t => t)
                .ToListAsync();

            var minPrice = await query.MinAsync(p => (decimal?)p.Price) ?? 0;
            var maxPrice = await query.MaxAsync(p => (decimal?)p.Price) ?? 0;

            return new ProductFiltersDto
            {
                Brands = brands,
                Types = types,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
            };
        }

        public async Task<bool> TryDecrementStockAsync(int productId, int quantity)
        {
            var affected = await _dbSet
                .Where(p => p.Id == productId && p.QuantityInStock >= quantity)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(p => p.QuantityInStock, p => p.QuantityInStock - quantity));
            return affected > 0;
        }
    }
}
