using System.Text.Json.Serialization;

namespace RestoreAPI.Application.Models;

public class PaginatedList<T>
{
    public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    [JsonConstructor]
    public PaginatedList() { }

    public PaginatedList(List<T> items, int totalCount, int pageNumber, int pageSize)
    {
        Items = items.AsReadOnly();
        TotalCount = totalCount;
        PageNumber = pageNumber;
        PageSize = pageSize;
    }
}
