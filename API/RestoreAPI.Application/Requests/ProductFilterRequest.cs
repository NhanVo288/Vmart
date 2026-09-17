namespace RestoreAPI.Application.Requests;

public class ProductFilterRequest:PaginationParams
{
    public string OrderBy { get; init; } = "Id";
    public bool Ascending { get; init; } = true;
    public string? SearchTerm { get; init; }
    public string? Brands { get; init; }
    public string? Types { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
}