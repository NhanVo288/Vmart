using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.AdminNotifications.Commands.MarkNotificationRead;

public class MarkNotificationReadCommand : IRequest<Result>
{
    public int Id { get; init; }
}
