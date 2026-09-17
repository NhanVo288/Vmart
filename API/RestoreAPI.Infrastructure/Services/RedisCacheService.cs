using System.Text.Json;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.Interfaces;
using StackExchange.Redis;

namespace RestoreAPI.Infrastructure.Services;

public class RedisCacheService : ICacheService
{
    private readonly IConnectionMultiplexer? _redis;
    private readonly ILogger<RedisCacheService> _logger;
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public RedisCacheService(IConnectionMultiplexer? redis, ILogger<RedisCacheService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        if (_redis is null || !_redis.IsConnected)
        {
            _logger.LogInformation("Redis not connected, skipping cache get for '{Key}'", key);
            return default;
        }

        try
        {
            var db = _redis.GetDatabase();
            var value = await db.StringGetAsync(key);
            if (value.IsNullOrEmpty)
            {
                _logger.LogInformation("Cache MISS for '{Key}'", key);
                return default;
            }

            _logger.LogInformation("Cache HIT for '{Key}'", key);
            string jsonString = value.ToString();
            return JsonSerializer.Deserialize<T>(jsonString, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get key '{Key}' from Redis cache", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? timeToLive = null, CancellationToken ct = default)
    {
        if (_redis is null || !_redis.IsConnected || value is null) return;

        try
        {
            var db = _redis.GetDatabase();
            var json = JsonSerializer.Serialize(value, _jsonOptions);
            var ttl = timeToLive ?? TimeSpan.FromMinutes(10);
            await db.StringSetAsync(key, json, ttl);
            _logger.LogInformation("Cache SET '{Key}' with TTL {Ttl}", key, ttl);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to set key '{Key}' in Redis cache", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        if (_redis is null || !_redis.IsConnected) return;

        try
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(key);
            _logger.LogDebug("Cache REMOVED '{Key}'", key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to remove key '{Key}' from Redis cache", key);
        }
    }

    public async Task RemoveByPrefixAsync(string prefixKey, CancellationToken ct = default)
    {
        if (_redis is null || !_redis.IsConnected) return;

        try
        {
            var endpoints = _redis.GetEndPoints();
            foreach (var endpoint in endpoints)
            {
                ct.ThrowIfCancellationRequested();

                var server = _redis.GetServer(endpoint);
                if (server.IsReplica) continue;

                // Do not materialize the full keyspace: a product cache can grow large
                // enough for ToArray() to create a substantial, unnecessary allocation.
                foreach (var key in server.Keys(pattern: $"{prefixKey}*", pageSize: 500))
                {
                    ct.ThrowIfCancellationRequested();
                    await _redis.GetDatabase().KeyDeleteAsync(key);
                }
            }
            _logger.LogDebug("Cache CLEARED by prefix '{Prefix}'", prefixKey);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to remove keys by prefix '{Prefix}' from Redis cache", prefixKey);
        }
    }
}
