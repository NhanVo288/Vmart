using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using RestoreAPI.Application.Settings;

namespace RestoreAPI.Infrastructure.HealthChecks;

public class ElasticsearchHealthCheck : IHealthCheck
{
    private readonly ElasticsearchSettings _settings;
    private readonly IHttpClientFactory _httpClientFactory;

    public ElasticsearchHealthCheck(
        IOptions<ElasticsearchSettings> settings,
        IHttpClientFactory httpClientFactory)
    {
        _settings = settings.Value;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(_settings.NodeUri))
            {
                return HealthCheckResult.Unhealthy("Elasticsearch NodeUri is not configured");
            }

            var client = _httpClientFactory.CreateClient("ElasticsearchHealthCheck");
            client.Timeout = TimeSpan.FromSeconds(5);

            var response = await client.GetAsync(_settings.NodeUri, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var data = new Dictionary<string, object>
                {
                    { "nodeUri", _settings.NodeUri },
                    { "indexPrefix", _settings.IndexPrefix },
                    { "statusCode", (int)response.StatusCode }
                };

                return HealthCheckResult.Healthy("Elasticsearch is reachable", data);
            }

            return HealthCheckResult.Unhealthy(
                $"Elasticsearch returned status code: {(int)response.StatusCode}");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Elasticsearch is not reachable", ex);
        }
    }
}
