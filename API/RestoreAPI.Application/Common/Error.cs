namespace RestoreAPI.Application.Common;

public sealed record Error(string Code, string Message, ErrorType Type)
{
    public static readonly Error None = new(string.Empty, string.Empty, ErrorType.Failure);

    public bool IsNullOrEmpty() => string.IsNullOrEmpty(Code);
}
