using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.Interfaces;

public interface IBasketRepository : IGenericRepository<Basket, int>
{
    Task<Basket?> GetBasketAsync(string buyerId);
    Task<Basket?> GetBasketByPaymentReferenceAsync(string paymentReference);
}
