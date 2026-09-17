using System.Text;
using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;

using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Requests;
using RestoreAPI.Application.Settings;
using RestoreAPI.Domain.Entities;
using RestoreAPI.Infrastructure.Data;
using RestoreAPI.Infrastructure.Repositories;
using RestoreAPI.Infrastructure.Services;

using RestoreAPI.Infrastructure.Data.Interceptors;

namespace RestoreAPI.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found");

            var redisConnectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";
            try
            {
                var redisConfig = ConfigurationOptions.Parse(redisConnectionString);
                redisConfig.AbortOnConnectFail = false;
                var multiplexer = ConnectionMultiplexer.Connect(redisConfig);
                services.AddSingleton<IConnectionMultiplexer>(multiplexer);
            }
            catch
            {
                // If connecting to Redis fails on startup, RedisCacheService will safely fallback to database queries
            }

            services.AddSingleton<ICacheService>(serviceProvider => new RedisCacheService(
                serviceProvider.GetService<IConnectionMultiplexer>(),
                serviceProvider.GetRequiredService<ILogger<RedisCacheService>>()));

            services.AddHttpContextAccessor();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<AuditableEntityInterceptor>();

            services.AddDbContext<AppDbContext>((sp, options) =>
                options.UseSqlServer(connectionString)
                       .AddInterceptors(sp.GetRequiredService<AuditableEntityInterceptor>()));

            services.AddIdentityCore<User>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
                options.Password.RequireLowercase = true;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager<SignInManager<User>>()
            .AddDefaultTokenProviders();

            var jwtSettings = configuration.GetSection("JWT").Get<JwtSettings>()
                ?? throw new InvalidOperationException("JWT settings not configured");


            var sepaySettings = configuration.GetSection("SepaySettings").Get<SepaySettings>()
                ?? throw new InvalidOperationException("SePay settings not configured");

            var cloudinarySettings = configuration.GetSection("CloudinarySettings").Get<CloudinarySettings>()
            ?? throw new InvalidOperationException("Cloudinary settings not configured");

            services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));

            var elasticsearchSettings = configuration.GetSection("Elasticsearch").Get<ElasticsearchSettings>()
                ?? new ElasticsearchSettings();

            services.Configure<ElasticsearchSettings>(configuration.GetSection("Elasticsearch"));

            services.AddSingleton(jwtSettings);
            services.AddSingleton(sepaySettings);
            services.AddSingleton(cloudinarySettings);
            services.AddSingleton<ILogService, ElasticsearchLogService>();

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options => ConfigureJwt(options, jwtSettings));

            services.AddLocalization();
            services.AddScoped<ILocalizationService, LocalizationService>();

            services.AddScoped<DbInitializer>();
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<IBasketRepository, BasketRepository>();
            services.AddScoped<IFavoriteRepository, FavoriteRepository>();
            services.AddScoped<IAccountRepository, AccountRepository>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddTransient<IEmailService, SmtpEmailService>();
            services.AddTransient<IEmailSender<User>, SmtpEmailService>();
            services.AddScoped<IPaymentService, SepayPaymentService>();
            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<IStockNotificationRepository, StockNotificationRepository>();
            services.AddScoped<IAdminNotificationRepository, AdminNotificationRepository>();
            services.AddScoped<ICloudinaryService, CloudinaryService>();
            services.AddScoped<IFileStorageService, CloudinaryFileStorageService>();
            services.AddScoped<IProductNotificationService, ProductNotificationService>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Health Checks
            services.AddHealthChecks();

            // Hangfire
            services.Configure<CleanupSettings>(configuration.GetSection("Cleanup"));

            services.AddHangfire(config => config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UseSqlServerStorage(connectionString));

            services.AddHangfireServer();
            services.AddScoped<IBackgroundJobService, HangfireBackgroundJobService>();

            return services;
        }

        private static void ConfigureJwt(JwtBearerOptions options, JwtSettings jwtSettings)
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
                ValidateLifetime = true,
            };
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/products"))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                },
                OnTokenValidated = async context =>
                {
                    var tokenService = context.HttpContext.RequestServices.GetRequiredService<ITokenService>();
                    var token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                    var isValid = await tokenService.IsTokenValidAsync(token);
                    if (!isValid)
                    {
                        context.Fail("Token has been revoked");
                    }
                }
            };
        }
    }
}
