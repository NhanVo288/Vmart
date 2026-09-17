using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Features.AdminNotifications.Commands.MarkNotificationRead;

public class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;

    public MarkNotificationReadCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(MarkNotificationReadCommand request, CancellationToken ct)
    {
        var success = await _unitOfWork.AdminNotifications.MarkAsReadAsync(request.Id, ct);
        if (!success)
            return Result.Failure(new Error("Notification.NotFound", $"Notification {request.Id} not found", ErrorType.NotFound));

        return Result.Success();
    }
}
