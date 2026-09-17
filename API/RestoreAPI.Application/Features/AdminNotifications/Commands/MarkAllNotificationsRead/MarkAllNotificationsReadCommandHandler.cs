using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.AdminNotifications.Commands.MarkAllNotificationsRead;

public class MarkAllNotificationsReadCommandHandler : IRequestHandler<MarkAllNotificationsReadCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;

    public MarkAllNotificationsReadCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(MarkAllNotificationsReadCommand request, CancellationToken ct)
    {
        await _unitOfWork.AdminNotifications.MarkAllAsReadAsync(ct);
        return Result.Success();
    }
}
