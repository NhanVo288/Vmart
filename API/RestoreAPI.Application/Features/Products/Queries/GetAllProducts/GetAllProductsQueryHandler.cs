using AutoMapper;
using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;

namespace RestoreAPI.Application.Features.Products.Queries.GetAllProducts;

public class GetAllProductsQueryHandler
    : IRequestHandler<GetAllProductsQuery, PaginatedList<ProductDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICacheService _cacheService;

    public GetAllProductsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper, ICacheService cacheService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _cacheService = cacheService;
    }

    public async Task<PaginatedList<ProductDto>> Handle(
        GetAllProductsQuery request, CancellationToken ct)
    {
        var f = request.Filter;
        var cacheKey = $"products:page_{f.PageNumber}_size_{f.PageSize}_order_{f.OrderBy}_asc_{f.Ascending}_search_{f.SearchTerm}_brands_{f.Brands}_types_{f.Types}_min_{f.MinPrice}_max_{f.MaxPrice}";

        var cachedResult = await _cacheService.GetAsync<PaginatedList<ProductDto>>(cacheKey, ct);
        if (cachedResult is not null)
        {
            return cachedResult;
        }

        var paginatedProducts = await _unitOfWork.Products.GetAllAsync(request.Filter);
        var items = _mapper.Map<List<ProductDto>>(paginatedProducts.Items);

        var result = new PaginatedList<ProductDto>(items, paginatedProducts.TotalCount,
            paginatedProducts.PageNumber, paginatedProducts.PageSize);

        await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5), ct);

        return result;
    }
}
