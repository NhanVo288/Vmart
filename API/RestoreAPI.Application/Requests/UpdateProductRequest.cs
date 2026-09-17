using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace RestoreAPI.Application.Requests
{
    public class UpdateProductRequest
    {
        [Required]
        [MaxLength(200)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(2000)]
        public required string Description { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [MaxLength(500)]
        public string? PictureUrl { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Brand { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Type { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int QuantityInStock { get; set; }

        public IFormFile? Image { get; set; }
    }
}