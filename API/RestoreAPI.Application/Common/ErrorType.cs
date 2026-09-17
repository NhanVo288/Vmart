namespace RestoreAPI.Application.Common;

public enum ErrorType
{
    Failure,
    Validation,
    NotFound,
    Conflict,
    Unauthorized,
    Forbidden,
    ExternalService
}
