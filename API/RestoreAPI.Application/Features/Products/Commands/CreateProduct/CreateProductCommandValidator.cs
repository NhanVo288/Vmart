using FluentValidation;

namespace RestoreAPI.Application.Features.Products.Commands.CreateProduct;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than 0.");

        RuleFor(x => x.QuantityInStock)
            .GreaterThanOrEqualTo(0).WithMessage("Quantity must not be negative.");

        RuleFor(x => x.Brand)
            .NotEmpty().WithMessage("Brand is required.");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Type is required.");
    }
}
