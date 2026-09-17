using MediatR;
using RestoreAPI.Application.Common;
using RestoreAPI.Application.Interfaces;

namespace RestoreAPI.Application.Behaviors;

public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IUnitOfWork _unitOfWork;

    public TransactionBehavior(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (request is not ITransactionalCommand)
            return await next();

        await _unitOfWork.BeginTransactionAsync(ct);
        try
        {
            var response = await next();
            await _unitOfWork.CommitAsync(ct);
            return response;
        }
        catch
        {
            await _unitOfWork.RollbackAsync(ct);
            throw;
        }
    }
}
