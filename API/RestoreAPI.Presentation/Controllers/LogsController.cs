using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;

namespace RestoreAPI.Controllers
{
    [Route("api/admin/logs")]
    [Authorize(Roles = "Admin")]
    public class LogsController : BaseApiController
    {
        private readonly ILogService _logService;

        public LogsController(ILogService logService)
        {
            _logService = logService;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedList<LogEntry>>> GetLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? level = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] string? search = null)
        {
            var logs = await _logService.GetLogsAsync(page, pageSize, level, from, to, search);
            return Ok(logs);
        }

        [HttpGet("stats")]
        public async Task<ActionResult<LogStats>> GetStats()
        {
            var stats = await _logService.GetStatsAsync();
            return Ok(stats);
        }
    }
}
