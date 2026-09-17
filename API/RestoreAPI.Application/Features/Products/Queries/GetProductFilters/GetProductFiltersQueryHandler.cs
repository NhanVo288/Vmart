using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Products.Queries.GetProductFilters;

public class GetProductFiltersQueryHandler
    : IRequestHandler<GetProductFiltersQuery, ProductFiltersDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cacheService;

    public GetProductFiltersQueryHandler(IUnitOfWork unitOfWork, ICacheService cacheService)
    {
        _unitOfWork = unitOfWork;
        _cacheService = cacheService;
    }

    public async Task<ProductFiltersDto> Handle(
        GetProductFiltersQuery request, CancellationToken ct)
    {
        var f = request.Filter;
        var cacheKey = $"products:filters_search_{f.SearchTerm}_brands_{f.Brands}_types_{f.Types}_min_{f.MinPrice}_max_{f.MaxPrice}";

        var cachedFilters = await _cacheService.GetAsync<ProductFiltersDto>(cacheKey, ct);
        if (cachedFilters is not null)
        {
            return cachedFilters;
        }

        var filters = await _unitOfWork.Products.GetFiltersAsync(request.Filter);
        await _cacheService.SetAsync(cacheKey, filters, TimeSpan.FromMinutes(10), ct);

        return filters;
    }
}
