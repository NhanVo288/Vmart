namespace RestoreAPI.Domain.Entities
{
    public class BasketItem
    {
        public int Id { get; private set; }
        public int ProductId { get; private set; }
        public int Quantity { get; private set; }
        public Product? Product { get; internal set; }
        public int BasketId { get; internal set; }
        public Basket? Basket { get; internal set; }

        private BasketItem() { }

        internal BasketItem(int productId, int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

            ProductId = productId;
            Quantity = quantity;
        }

        internal void UpdateQuantity(int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be greater than zero", nameof(quantity));

            Quantity = quantity;
        }

        internal void AddQuantity(int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity to add must be greater than zero", nameof(quantity));

            Quantity += quantity;
        }

    }
}
