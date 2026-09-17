using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Interfaces
{
    public interface IProductRepository : IGenericRepository<Product, int>
    {
        Task<PaginatedList<Product>> GetAllAsync(ProductFilterRequest filter);
        Task<PaginatedList<Product>> GetAllBySellerIdAsync(string sellerId, ProductFilterRequest filter);
        Task<ProductFiltersDto> GetFiltersAsync(ProductFilterRequest? filter = null);
        Task<bool> TryDecrementStockAsync(int productId, int quantity);
    }
}
