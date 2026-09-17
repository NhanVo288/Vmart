using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;
using RestoreAPI.Domain.Entities.OrderAggregate;

namespace RestoreAPI.Application.Interfaces;

public interface IOrderRepository : IGenericRepository<Order, int>
{
    Task<Order?> GetOrderByIdAsync(int orderId);
    Task<Order?> GetOrderByPaymentReferenceAsync(string paymentReference);
    Task<PaginatedList<OrderDto>> GetOrdersByBuyerIdAsync(string buyerId, OrderFilterRequest filter);
    Task<PaginatedList<OrderDto>> GetAllOrdersAsync(OrderFilterRequest filter);
    Task<PaginatedList<VendorOrderDto>> GetOrdersByVendorIdAsync(string vendorId, OrderFilterRequest filter);
    Task<Order?> UpdateOrderStatusAsync(int id, Domain.Enums.OrderStatus status);
}
