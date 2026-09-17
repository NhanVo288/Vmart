using Microsoft.EntityFrameworkCore;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Infrastructure.Data;

namespace RestoreAPI.Infrastructure.Repositories;

public abstract class RepositoryBase<T, TKey> : IGenericRepository<T, TKey> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    protected RepositoryBase(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(TKey id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
    }

    public virtual void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public virtual void Delete(T entity)
    {
        _dbSet.Remove(entity);
    }
}
