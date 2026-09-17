namespace RestoreAPI.Domain.Entities;

public class Basket
{
    private readonly List<BasketItem> _items = new();

    private Basket() { } // Required by EF Core

    public Basket(string buyerId) : this()
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(buyerId);

        BuyerId = buyerId;
        IsAnonymous = buyerId.StartsWith("anon_", StringComparison.Ordinal);
    }

    public int Id { get; private set; }

    public string BuyerId { get; private set; } = null!;

    public bool IsAnonymous { get; private set; }

    public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;

    // Keep the legacy column names in AppDbContext so existing databases can be
    // upgraded from Stripe without a destructive migration.
    public string? PaymentQrUrl { get; private set; }
    public string? PaymentReference { get; private set; }
    public long DeliveryFee { get; private set; }
    public long Discount { get; private set; }

    public string? ShipName { get; private set; }
    public string? ShipLine1 { get; private set; }
    public string? ShipLine2 { get; private set; }
    public string? ShipCity { get; private set; }
    public string? ShipState { get; private set; }
    public string? ShipPostalCode { get; private set; }
    public string? ShipCountry { get; private set; }

    public IReadOnlyCollection<BasketItem> Items => _items;

    public void AddItem(int productId, int quantity = 1)
    {
        var item = _items.FirstOrDefault(i => i.ProductId == productId);

        if (item is null)
        {
            _items.Add(new BasketItem(productId, quantity));
            LastModifiedAt = DateTime.UtcNow;
            return;
        }

        item.AddQuantity(quantity);
        LastModifiedAt = DateTime.UtcNow;
    }

    public void UpdateItemQuantity(int productId, int quantity)
    {
        var item = FindItem(productId);

        item.UpdateQuantity(quantity);
        LastModifiedAt = DateTime.UtcNow;
    }

    public bool RemoveItem(int productId)
    {
        var item = _items.FirstOrDefault(i => i.ProductId == productId);

        if (item is null) return false;

        var removed = _items.Remove(item);
        if (removed) LastModifiedAt = DateTime.UtcNow;
        return removed;
    }

    public void SetPaymentRequest(string paymentReference, string paymentQrUrl)
    {
        PaymentReference = paymentReference;
        PaymentQrUrl = paymentQrUrl;
    }

    public void SetDeliveryFee(long deliveryFee)
    {
        DeliveryFee = deliveryFee;
    }

    public void SetDiscount(long discount)
    {
        Discount = discount;
    }

    public void SetShippingAddress(string name, string line1, string? line2, string city, string state, string postalCode, string country)
    {
        ShipName = name;
        ShipLine1 = line1;
        ShipLine2 = line2;
        ShipCity = city;
        ShipState = state;
        ShipPostalCode = postalCode;
        ShipCountry = country;
    }

    public bool HasShippingAddress() =>
        !string.IsNullOrEmpty(ShipName) && !string.IsNullOrEmpty(ShipLine1);

    public void Clear()
    {
        _items.Clear();
        LastModifiedAt = DateTime.UtcNow;
    }

    private BasketItem FindItem(int productId)
    {
        return _items.FirstOrDefault(i => i.ProductId == productId)
            ?? throw new InvalidOperationException($"Product {productId} was not found in the basket.");
    }
}
