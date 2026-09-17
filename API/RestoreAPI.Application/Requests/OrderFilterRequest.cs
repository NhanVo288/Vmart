namespace RestoreAPI.Application.Requests;

public class OrderFilterRequest : PaginationParams
{
    public string? Status { get; init; }
    public string? SearchTerm { get; init; }
    public string OrderBy { get; init; } = "OrderDate";
    public bool Ascending { get; init; } = false;
}
