using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.DTOs;

namespace RestoreAPI.Application.Features.Orders.Commands.CreateOrder;

public class CreateOrderCommand : IRequest<Result<OrderDto>>, ITransactionalCommand
{
    public string BuyerId { get; init; } = string.Empty;
    public string? UserEmail { get; init; }
    public string? PaymentReference { get; init; }
}
