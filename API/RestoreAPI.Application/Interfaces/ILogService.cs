using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Models;

namespace RestoreAPI.Application.Interfaces
{
    public interface ILogService
    {
        Task<PaginatedList<LogEntry>> GetLogsAsync(int page, int pageSize, string? level, DateTime? from, DateTime? to, string? search);
        Task<LogStats> GetStatsAsync();
    }
}
