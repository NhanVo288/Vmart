namespace RestoreAPI.Application.DTOs
{
    public class LogEntry
    {
        public string Id { get; set; } = "";
        public DateTime Timestamp { get; set; }
        public string Level { get; set; } = "";
        public string Message { get; set; } = "";
        public string? Exception { get; set; }
        public string? MachineName { get; set; }
        public string? UserName { get; set; }
        public string? RequestPath { get; set; }
        public string? Application { get; set; }
        public Dictionary<string, object>? Properties { get; set; }
    }

    public class LogStats
    {
        public long Total { get; set; }
        public long ErrorsToday { get; set; }
        public long WarningsToday { get; set; }
        public long InfoToday { get; set; }
    }
}
