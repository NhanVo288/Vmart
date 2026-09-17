using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.Orders.Queries.GetOrderById;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetOrderByIdQueryHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<OrderDto>> Handle(GetOrderByIdQuery request, CancellationToken ct)
    {
        var order = await _unitOfWork.Orders.GetOrderByIdAsync(request.Id);
        if (order is null || order.BuyerId != request.BuyerId)
            return Result.Failure<OrderDto>(Errors.OrderNotFound(request.Id));

        return Result.Success(order.ToDto());
    }
}
