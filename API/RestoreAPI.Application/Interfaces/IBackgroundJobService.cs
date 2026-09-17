using System.Linq.Expressions;

namespace RestoreAPI.Application.Interfaces;

public interface IBackgroundJobService
{
    string Enqueue<T>(Expression<Func<T, Task>> job);
}
