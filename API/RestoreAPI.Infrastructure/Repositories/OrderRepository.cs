using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RestoreAPI.Application.DTOs;
using RestoreAPI.Application.Interfaces;
using RestoreAPI.Application.Models;
using RestoreAPI.Application.Requests;
using RestoreAPI.Domain.Entities.OrderAggregate;
using RestoreAPI.Domain.Enums;
using RestoreAPI.Infrastructure.Data;

namespace RestoreAPI.Infrastructure.Repositories;

public class OrderRepository : RepositoryBase<Order, int>, IOrderRepository
{
    private readonly ILogger<OrderRepository> _logger;

    public OrderRepository(AppDbContext context, ILogger<OrderRepository> logger) : base(context)
    {
        _logger = logger;
    }

    public async Task<Order?> GetOrderByIdAsync(int orderId)
    {
        return await _dbSet
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }

    public async Task<Order?> GetOrderByPaymentReferenceAsync(string paymentReference)
    {
        return await _dbSet
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.PaymentReference == paymentReference);
    }

    public async Task<PaginatedList<OrderDto>> GetAllOrdersAsync(OrderFilterRequest filter)
    {
        IQueryable<Order> query = _dbSet
            .Include(o => o.OrderItems);

        if (!string.IsNullOrWhiteSpace(filter.Status)
            && Enum.TryParse<OrderStatus>(filter.Status, true, out var status))
        {
            query = query.Where(o => o.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.ToLower();
            query = query.Where(o => o.Id.ToString().Contains(term)
                || o.BuyerId.ToLower().Contains(term)
                || (o.BuyerEmail != null && o.BuyerEmail.ToLower().Contains(term)));
        }

        query = (filter.OrderBy.ToLower(), filter.Ascending) switch
        {
            ("total", true) => query.OrderBy(o => o.GetTotal()),
            ("total", false) => query.OrderByDescending(o => o.GetTotal()),
            ("status", true) => query.OrderBy(o => o.Status),
            ("status", false) => query.OrderByDescending(o => o.Status),
            ("orderdate", true) => query.OrderBy(o => o.OrderDate),
            _ => query.OrderByDescending(o => o.OrderDate),
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var dtos = items.Select(o => o.ToDto()).ToList();

        return new PaginatedList<OrderDto>(dtos, totalCount, filter.PageNumber, filter.PageSize);
    }

    public async Task<Order?> UpdateOrderStatusAsync(int id, OrderStatus status)
    {
        var order = await GetByIdAsync(id);
        if (order == null) return null;

        order.UpdateStatus(status);
        return order;
    }

    public async Task<PaginatedList<OrderDto>> GetOrdersByBuyerIdAsync(string buyerId, OrderFilterRequest filter)
    {
        var query = _dbSet
            .Include(o => o.OrderItems)
            .Where(o => o.BuyerId == buyerId);

        if (!string.IsNullOrWhiteSpace(filter.Status)
            && Enum.TryParse<Domain.Enums.OrderStatus>(filter.Status, true, out var status))
        {
            query = query.Where(o => o.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.ToLower();
            query = query.Where(o => o.Id.ToString().Contains(term));
        }

        query = (filter.OrderBy.ToLower(), filter.Ascending) switch
        {
            ("total", true) => query.OrderBy(o => o.GetTotal()),
            ("total", false) => query.OrderByDescending(o => o.GetTotal()),
            ("status", true) => query.OrderBy(o => o.Status),
            ("status", false) => query.OrderByDescending(o => o.Status),
            ("orderdate", true) => query.OrderBy(o => o.OrderDate),
            _ => query.OrderByDescending(o => o.OrderDate),
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var dtos = items.Select(o => o.ToDto()).ToList();

        return new PaginatedList<OrderDto>(dtos, totalCount, filter.PageNumber, filter.PageSize);
    }

    public async Task<PaginatedList<VendorOrderDto>> GetOrdersByVendorIdAsync(string vendorId, OrderFilterRequest filter)
    {
        var vendorProductIds = await _context.Products
            .Where(p => p.SellerId == vendorId)
            .Select(p => p.Id)
            .ToListAsync();

        IQueryable<Order> query = _dbSet
            .Include(o => o.OrderItems)
            .Where(o => o.OrderItems.Any(oi => vendorProductIds.Contains(oi.ItemOrdered.ProductId)));

        if (!string.IsNullOrWhiteSpace(filter.Status)
            && Enum.TryParse<OrderStatus>(filter.Status, true, out var status))
        {
            query = query.Where(o => o.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.ToLower();
            query = query.Where(o => o.Id.ToString().Contains(term)
                || (o.BuyerEmail != null && o.BuyerEmail.ToLower().Contains(term)));
        }

        query = (filter.OrderBy.ToLower(), filter.Ascending) switch
        {
            ("status", true) => query.OrderBy(o => o.Status),
            ("status", false) => query.OrderByDescending(o => o.Status),
            ("orderdate", true) => query.OrderBy(o => o.OrderDate),
            _ => query.OrderByDescending(o => o.OrderDate),
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var dtos = items.Select(o => o.ToVendorDto(vendorProductIds)).ToList();

        return new PaginatedList<VendorOrderDto>(dtos, totalCount, filter.PageNumber, filter.PageSize);
    }
}
