namespace RestoreAPI.Application.Settings
{
    public class ElasticsearchSettings
    {
        public string NodeUri { get; set; } = "http://localhost:9200";
        public string IndexPrefix { get; set; } = "restore-logs";
    }
}
