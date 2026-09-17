namespace RestoreAPI.Domain.Entities
{
    public class Favorite
    {
        private readonly List<FavoriteItem> _items = new();

        private Favorite() { }

        public Favorite(string buyerId)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(buyerId);
            BuyerId = buyerId;
        }

        public int Id { get; private set; }
        public string BuyerId { get; private set; } = null!;
        public IReadOnlyCollection<FavoriteItem> Items => _items;

        public void AddItem(int productId)
        {
            if (!_items.Any(i => i.ProductId == productId))
            {
                _items.Add(new FavoriteItem(productId));
            }
        }

        public bool RemoveItem(int productId)
        {
            var item = _items.FirstOrDefault(i => i.ProductId == productId);
            if (item is null) return false;
            return _items.Remove(item);
        }

        public void Clear()
        {
            _items.Clear();
        }
    }
}
