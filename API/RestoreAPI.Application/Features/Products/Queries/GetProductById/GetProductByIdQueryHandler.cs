using AutoMapper;
using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Products.Queries.GetProductById;

public class GetProductByIdQueryHandler
    : IRequestHandler<GetProductByIdQuery, Result<ProductDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetProductByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<ProductDto>> Handle(
        GetProductByIdQuery request, CancellationToken ct)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(request.Id);
        if (product is null)
            return Result.Failure<ProductDto>(Errors.ProductNotFound(request.Id));

        return Result.Success(_mapper.Map<ProductDto>(product));
    }
}
