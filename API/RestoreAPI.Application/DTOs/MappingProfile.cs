using AutoMapper;
using RestoreAPI.Application.Requests;
using RestoreAPI.Domain.Entities;

namespace RestoreAPI.Application.DTOs
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDto>();
            CreateMap<CreateProductRequest, Product>()
                .ForMember(d => d.PictureUrl, o => o.Ignore());
            CreateMap<UpdateProductRequest, Product>()
                .ForMember(d => d.PictureUrl, o => o.Condition(s => !string.IsNullOrEmpty(s.PictureUrl)));
            CreateMap<Basket, BasketDto>();
            CreateMap<BasketItem, BasketItemDto>()
                .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product!.Name))
                .ForMember(d => d.Price, o => o.MapFrom(s => s.Product!.Price))
                .ForMember(d => d.PictureUrl, o => o.MapFrom(s => s.Product!.PictureUrl))
                .ForMember(d => d.Brand, o => o.MapFrom(s => s.Product!.Brand))
                .ForMember(d => d.Type, o => o.MapFrom(s => s.Product!.Type));
        }
    }
}
