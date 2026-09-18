using System.Globalization;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Identity;
using Serilog;
using Hangfire;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using RestoreAPI.Application;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Infrastructure;
using RestoreAPI.Infrastructure.Data;
using RestoreAPI.Infrastructure.Extention;
using RestoreAPI.Infrastructure.Jobs;
using RestoreAPI.Presentation.Hangfire;
using RestoreAPI.Infrastructure.Hubs;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()?
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .ToArray() ?? Array.Empty<string>();

if (allowedOrigins.Length == 0)
{
    throw new InvalidOperationException("At least one CORS origin must be configured in Cors:AllowedOrigins.");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddDataAnnotationsLocalization();

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[]
    {
        new CultureInfo("en"),
        new CultureInfo("vi")
    };
    options.DefaultRequestCulture = new RequestCulture("en");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.Configure<SecurityStampValidatorOptions>(options =>
{
    options.ValidationInterval = TimeSpan.Zero;
});
builder.Services.AddSignalR();

// The API is only reachable through the frontend reverse proxy in Docker.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found");

builder.Services.AddHttpClient();

builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString, "SELECT 1;", name: "sqlserver", tags: new[] { "db", "sql" })
    .AddHangfireHealthCheck()
    .AddSepayHealthCheck()
    .AddElasticsearchHealthCheck()
    .AddRedisHealthCheck();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Title = "Restore API",
        Version = "v1"
    });
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRequestLocalization();
app.UseMiddleware<RestoreAPI.Middleware.ExceptionMiddleware>();

using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<DbInitializer>();
    await initializer.InitializeAsync();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    DashboardTitle = "Restore Jobs",
    Authorization = app.Environment.IsDevelopment()
        ? Array.Empty<IDashboardAuthorizationFilter>()
        : new[] { new HangfireDashboardFilter() }
});

HangfireJobRegistration.Register();

app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("db") || check.Tags.Contains("jobs") || check.Tags.Contains("payment") || check.Tags.Contains("cache") || check.Tags.Contains("redis"),
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var json = System.Text.Json.JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                duration = e.Value.Duration.TotalMilliseconds,
                description = e.Value.Description
            })
        });
        await context.Response.WriteAsync(json);
    }
});

app.MapControllers();
app.MapHub<ProductHub>("/hubs/products");
app.MapGroup("api").MapIdentityApi<User>();

try
{
    Log.Information("Starting Restore API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
