namespace RestoreAPI.Application.Interfaces;

public interface IGenericRepository<T, TKey> where T : class
{
    Task<T?> GetByIdAsync(TKey id);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}
