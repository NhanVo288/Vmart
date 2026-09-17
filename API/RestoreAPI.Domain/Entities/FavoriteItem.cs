namespace RestoreAPI.Domain.Entities
{
    public class FavoriteItem
    {
        public int Id { get; private set; }
        public int ProductId { get; private set; }
        public Product? Product { get; internal set; }
        public int FavoriteId { get; internal set; }
        public Favorite? Favorite { get; internal set; }

        private FavoriteItem() { }

        internal FavoriteItem(int productId)
        {
            ProductId = productId;
        }
    }
}
