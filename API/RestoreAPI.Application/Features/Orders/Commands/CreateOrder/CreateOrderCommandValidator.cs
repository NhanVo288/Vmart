using FluentValidation;

namespace RestoreAPI.Application.Features.Orders.Commands.CreateOrder;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.BuyerId)
            .NotEmpty().WithMessage("Buyer ID is required.");
    }
}
