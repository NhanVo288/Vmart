using System.Linq.Expressions;
using Hangfire;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Infrastructure.Services;

public class HangfireBackgroundJobService : IBackgroundJobService
{
    public string Enqueue<T>(Expression<Func<T, Task>> job)
    {
        return BackgroundJob.Enqueue(job);
    }
}
