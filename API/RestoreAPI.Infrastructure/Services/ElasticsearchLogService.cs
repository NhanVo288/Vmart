using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Settings;

namespace RestoreAPI.Infrastructure.Services
{
    public class ElasticsearchLogService : ILogService
    {
        private readonly HttpClient _httpClient;
        private readonly string _indexPrefix;
        private readonly ILogger<ElasticsearchLogService> _logger;

        public ElasticsearchLogService(
            IOptions<ElasticsearchSettings> settings,
            ILogger<ElasticsearchLogService> logger)
        {
            _logger = logger;
            _indexPrefix = settings.Value.IndexPrefix;
            _httpClient = new HttpClient { BaseAddress = new Uri(settings.Value.NodeUri) };
        }

        public async Task<PaginatedList<LogEntry>> GetLogsAsync(
            int page, int pageSize, string? level, DateTime? from, DateTime? to, string? search)
        {
            try
            {
                var fromIdx = (page - 1) * pageSize;
                var mustClauses = new List<string>();

                if (!string.IsNullOrEmpty(level))
                    mustClauses.Add("{\"term\":{\"level\":{\"value\":\"" + level.ToLowerInvariant() + "\",\"case_insensitive\":true}}}");

                if (from.HasValue || to.HasValue)
                {
                    var bounds = new List<string>();
                    if (from.HasValue)
                        bounds.Add("\"gte\":\"" + from.Value.ToString("O") + "\"");
                    if (to.HasValue)
                        bounds.Add("\"lte\":\"" + to.Value.AddDays(1).AddTicks(-1).ToString("O") + "\"");

                    mustClauses.Add("{\"range\":{\"@timestamp\":{" + string.Join(",", bounds) + "}}}");
                }

                if (!string.IsNullOrEmpty(search))
                {
                    var escaped = search.Replace("\\", "\\\\").Replace("\"", "\\\"");
                    mustClauses.Add("{\"multi_match\":{\"query\":\"" + escaped + "\",\"fields\":[\"message\",\"exception\",\"renderedMessage\"]}}");
                }

                var mustArray = string.Join(",", mustClauses);
                var boolClause = mustClauses.Count > 0
                    ? "{\"must\":[" + mustArray + "]}"
                    : "{\"must\":[{\"match_all\":{}}]}";

                var query = "{" +
                    "\"query\":" + "{\"bool\":" + boolClause + "}," +
                    "\"sort\":[{\"@timestamp\":{\"order\":\"desc\"}}]," +
                    "\"from\":" + fromIdx + "," +
                    "\"size\":" + pageSize + "," +
                    "\"track_total_hits\":true" +
                "}";

                var index = _indexPrefix + "-*";
                var response = await _httpClient.PostAsync(index + "/_search",
                    new StringContent(query, Encoding.UTF8, "application/json"));

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                var root = doc.RootElement;
                var hits = root.GetProperty("hits");
                var total = hits.GetProperty("total").GetProperty("value").GetInt64();

                var logEntries = new List<LogEntry>();
                if (hits.TryGetProperty("hits", out var hitsArray))
                {
                    foreach (var hit in hitsArray.EnumerateArray())
                    {
                        var source = hit.GetProperty("_source");
                        logEntries.Add(new LogEntry
                        {
                            Id = hit.GetProperty("_id").GetString() ?? "",
                            Timestamp = source.TryGetProperty("@timestamp", out var ts)
                                ? DateTime.Parse(ts.GetString() ?? "")
                                : DateTime.MinValue,
                            Level = source.TryGetProperty("level", out var lvl) ? lvl.GetString() ?? "" : "",
                            Message = source.TryGetProperty("message", out var msg) ? msg.GetString() ?? "" : "",
                            Exception = TryGetString(source, "exception", "Exception"),
                            MachineName = TryGetString(source, "machinename", "MachineName"),
                            UserName = TryGetString(source, "username", "UserName"),
                            RequestPath = TryGetString(source, "requestpath", "RequestPath", "requestPath"),
                            Application = TryGetString(source, "application", "Application"),
                        });
                    }
                }

                return new PaginatedList<LogEntry>(logEntries, (int)total, page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch logs from Elasticsearch");
                return new PaginatedList<LogEntry>(new List<LogEntry>(), 0, page, pageSize);
            }
        }

        public async Task<LogStats> GetStatsAsync()
        {
            try
            {
                var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");

                var totalTask = CountAsync("{\"query\":{\"match_all\":{}}}");
                var errorsTask = CountTodayByLevelAsync("error", today);
                var warningsTask = CountTodayByLevelAsync("warning", today);
                var infoTask = CountTodayByLevelAsync("information", today);

                await Task.WhenAll(totalTask, errorsTask, warningsTask, infoTask);

                return new LogStats
                {
                    Total = await totalTask,
                    ErrorsToday = await errorsTask,
                    WarningsToday = await warningsTask,
                    InfoToday = await infoTask
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch log stats from Elasticsearch");
                return new LogStats();
            }
        }

        private static string? TryGetString(JsonElement element, params string[] propertyNames)
        {
            foreach (var name in propertyNames)
            {
                if (element.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.String)
                    return prop.GetString();
            }
            return null;
        }

        private async Task<long> CountAsync(string queryBody)
        {
            try
            {
                var index = _indexPrefix + "-*";
                var response = await _httpClient.PostAsync(index + "/_count",
                    new StringContent(queryBody, Encoding.UTF8, "application/json"));

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                return doc.RootElement.GetProperty("count").GetInt64();
            }
            catch
            {
                return 0;
            }
        }

        private Task<long> CountTodayByLevelAsync(string level, string today)
        {
            var query = "{\"query\":{\"bool\":{\"must\":[" +
                "{\"term\":{\"level\":{\"value\":\"" + level + "\",\"case_insensitive\":true}}}," +
                "{\"range\":{\"@timestamp\":{\"gte\":\"" + today + "\"}}}" +
                "]}}}";

            return CountAsync(query);
        }
    }
}
