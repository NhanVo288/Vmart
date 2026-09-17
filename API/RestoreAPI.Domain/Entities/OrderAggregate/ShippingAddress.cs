using Microsoft.EntityFrameworkCore;
using RestoreAPI.Domain.Entities.Common;
using System.Text.Json.Serialization;

namespace RestoreAPI.Domain.Entities.OrderAggregate
{
    [Owned]
    public class ShippingAddress
    {
        public Address Address { get; set; } = default!;
    }
}
