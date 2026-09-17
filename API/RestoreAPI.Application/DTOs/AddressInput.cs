using System.Text.Json.Serialization;

namespace RestoreAPI.Application.DTOs;

public record AddressInput(
    string Name,
    string Line1,
    string? Line2,
    string City,
    string State,
    [property: JsonPropertyName("postal_code")]
    string PostalCode,
    string Country
);
