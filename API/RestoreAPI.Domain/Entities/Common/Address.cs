using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace RestoreAPI.Domain.Entities.Common
{
    [Owned]
    public class Address
    {
        [JsonIgnore]
        public required string Name { get; set; }
        public required string Line1 { get; set; }
        public string? Line2 { get; set; }
        public required string City { get; set; }
        public required string State { get; set; }

        [JsonPropertyName("postal_code")]
        public required string PostalCode { get; set; }
        public required string Country { get; set; }
    }
}
