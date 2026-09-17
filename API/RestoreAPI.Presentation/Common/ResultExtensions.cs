using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Presentation.Common;

public static class ResultExtensions
{
    private static readonly Dictionary<ErrorType, (int Status, string Title)> ErrorTypeMap = new()
    {
        [ErrorType.NotFound]        = (404, "Resource Not Found"),
        [ErrorType.Validation]      = (400, "Validation Failed"),
        [ErrorType.Conflict]        = (409, "Conflict"),
        [ErrorType.Unauthorized]    = (401, "Unauthorized"),
        [ErrorType.Forbidden]       = (403, "Forbidden"),
        [ErrorType.ExternalService] = (502, "External Service Failure"),
        [ErrorType.Failure]         = (500, "An unexpected error occurred"),
    };

    public static ActionResult ToActionResult<T>(this Result<T> result, ControllerBase controller)
    {
        if (result.IsSuccess)
            return controller.Ok(result.Value);

        return MapErrorToActionResult(result.Error, controller);
    }

    public static ActionResult ToActionResult(this Result result, ControllerBase controller)
    {
        if (result.IsSuccess)
            return controller.NoContent();

        return MapErrorToActionResult(result.Error, controller);
    }

    private static ActionResult MapErrorToActionResult(Error error, ControllerBase controller)
    {
        var (status, rawTitle) = ErrorTypeMap.GetValueOrDefault(error.Type, (500, "An unexpected error occurred"));

        var localizer = controller.HttpContext.RequestServices.GetService<ILocalizationService>();

        string title = localizer != null ? localizer.GetString(rawTitle) : rawTitle;
        string detail = error.Message;

        if (localizer != null)
        {
            var localizedByCode = localizer.GetString(error.Code);
            if (!string.IsNullOrEmpty(localizedByCode) && localizedByCode != error.Code)
            {
                detail = localizedByCode;
            }
            else
            {
                var localizedByMsg = localizer.GetString(error.Message);
                if (!string.IsNullOrEmpty(localizedByMsg))
                {
                    detail = localizedByMsg;
                }
            }
        }

        var problemDetails = new ProblemDetails
        {
            Title = title,
            Status = status,
            Detail = detail,
            Type = $"https://restoreapi.com/errors/{error.Code}",
            Extensions = { ["errorCode"] = error.Code }
        };

        return error.Type switch
        {
            ErrorType.NotFound        => controller.NotFound(problemDetails),
            ErrorType.Validation      => controller.BadRequest(problemDetails),
            ErrorType.Conflict        => controller.Conflict(problemDetails),
            ErrorType.Unauthorized    => controller.StatusCode(401, problemDetails),
            ErrorType.Forbidden       => controller.StatusCode(403, problemDetails),
            ErrorType.ExternalService => controller.StatusCode(502, problemDetails),
            _                         => controller.StatusCode(500, problemDetails),
        };
    }
}

