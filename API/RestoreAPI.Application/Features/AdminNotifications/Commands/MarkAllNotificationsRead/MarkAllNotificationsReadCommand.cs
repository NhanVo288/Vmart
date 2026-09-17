using MediatR;
using RestoreAPI.Application.Common;

namespace RestoreAPI.Application.Features.AdminNotifications.Commands.MarkAllNotificationsRead;

public class MarkAllNotificationsReadCommand : IRequest<Result>
{
}
