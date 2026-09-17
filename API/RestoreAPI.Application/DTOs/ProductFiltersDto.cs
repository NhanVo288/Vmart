namespace RestoreAPI.Application.DTOs;

public class ProductFiltersDto
{
    public List<string> Brands { get; init; } = [];
    public List<string> Types { get; init; } = [];
    public decimal MinPrice { get; init; }
    public decimal MaxPrice { get; init; }
}
