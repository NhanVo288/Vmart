using AutoMapper;
using MediatR;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;

namespace RestoreAPI.Application.Features.Products.Queries.GetProductsBySellerId;

public class GetProductsBySellerIdQueryHandler
    : IRequestHandler<GetProductsBySellerIdQuery, PaginatedList<ProductDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetProductsBySellerIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PaginatedList<ProductDto>> Handle(
        GetProductsBySellerIdQuery request, CancellationToken ct)
    {
        var paginatedProducts = await _unitOfWork.Products.GetAllBySellerIdAsync(request.SellerId, request.Filter);
        var items = _mapper.Map<List<ProductDto>>(paginatedProducts.Items);

        return new PaginatedList<ProductDto>(items, paginatedProducts.TotalCount,
            paginatedProducts.PageNumber, paginatedProducts.PageSize);
    }
}
