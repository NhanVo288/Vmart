namespace RestoreAPI.Domain.Entities.Common
{
    public abstract class BaseEntity<T> : IAuditableEntity
    {
        public T Id { get; set; } = default!;

        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string? DeletedBy { get; set; }
    }

}
