using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Interfaces
{
    public interface IFavoriteRepository : IGenericRepository<Favorite, int>
    {
        Task<Favorite?> GetFavoriteAsync(string buyerId);
    }
}
