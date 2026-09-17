using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace RestoreAPI.Domain.Entities.OrderAggregate
{
    [Owned]
    public class PaymentSummary
    {
        public required int Last4 { get; set; }

        [JsonPropertyName("exp_month")]
        public required int ExpMonth { get; set; }

        [JsonPropertyName("exp_year")]
        public required int ExpYear { get; set; }

        public required string Brand { get; set; }
    }
}
