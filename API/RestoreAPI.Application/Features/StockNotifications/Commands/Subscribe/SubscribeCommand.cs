using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.StockNotifications.Commands.Subscribe;

public class SubscribeCommand : IRequest<Result>
{
    public string Email { get; init; } = string.Empty;
    public int ProductId { get; init; }
}
