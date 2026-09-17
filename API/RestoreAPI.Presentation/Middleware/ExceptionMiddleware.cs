using System.Net;
using System.Security.Claims;
using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace RestoreAPI.Middleware
{
    public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (ValidationException vex)
            {
                logger.LogWarning(vex,
                    "Validation failed. Path: {Path}, CorrelationId: {CorrelationId}",
                    context.Request.Path,
                    context.TraceIdentifier);

                await HandleValidationExceptionAsync(context, vex);
            }
            catch (Exception ex)
            {
                logger.LogError(ex,
                    "Unhandled exception caught by middleware. " +
                    "Path: {Path}, Method: {Method}, UserId: {UserId}, TraceId: {TraceId}",
                    context.Request.Path,
                    context.Request.Method,
                    context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous",
                    context.TraceIdentifier);

                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleValidationExceptionAsync(HttpContext context, ValidationException vex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

            var errors = vex.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => char.ToLowerInvariant(g.Key[0]) + g.Key[1..],
                    g => g.Select(e => e.ErrorMessage).ToArray());

            var problem = new
            {
                title = "Validation Failed",
                status = 400,
                errors
            };

            var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            });

            await context.Response.WriteAsync(json);
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var problem = new ProblemDetails
            {
                Title = "An unexpected error occurred",
                Status = context.Response.StatusCode,
                Detail = "An unexpected error occurred. Please try again later.",
                Instance = context.Request.Path,
            };

            var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            });

            await context.Response.WriteAsync(json);
        }
    }
}
