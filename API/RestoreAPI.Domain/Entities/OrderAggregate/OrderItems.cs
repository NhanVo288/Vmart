using System;
using System.Collections.Generic;
using System.Text;

namespace RestoreAPI.Domain.Entities.OrderAggregate
{
    public class OrderItems
    {
        public int Id { get; set; }
        public ProductItemOrdered ItemOrdered { get; set; } = default!;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}