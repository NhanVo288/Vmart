namespace RestoreAPI.Application.Common;

public static class Errors
{
    public static Error ProductNotFound(int id) =>
        new(ErrorCode.ProductNotFound, $"Product with ID {id} was not found.", ErrorType.NotFound);

    public static Error InsufficientStock(string name, int available, int requested) =>
        new(ErrorCode.InsufficientStock, $"Insufficient stock for {name}. Available: {available}, requested: {requested}.", ErrorType.Validation);

    public static Error BasketNotFound =>
        new(ErrorCode.BasketNotFound, "Basket not found.", ErrorType.NotFound);

    public static Error BasketEmpty =>
        new(ErrorCode.BasketEmpty, "Basket is empty.", ErrorType.Validation);

    public static Error OrderNotFound(int id) =>
        new(ErrorCode.OrderNotFound, $"Order with ID {id} was not found.", ErrorType.NotFound);

    public static Error OrderAlreadyExists =>
        new(ErrorCode.OrderAlreadyExists, "An order with this payment already exists.", ErrorType.Conflict);

    public static Error PaymentMismatch =>
        new(ErrorCode.PaymentMismatch, "Payment amount does not match expected total.", ErrorType.Validation);

    public static Error InvalidShippingAddress =>
        new(ErrorCode.InvalidShippingAddress, "Unable to create order because the shipping address is invalid.", ErrorType.Validation);

    public static Error BasketNotReady =>
        new(ErrorCode.BasketNotReady, "Basket not found or missing payment information.", ErrorType.Validation);

    public static Error UserNotFound =>
        new(ErrorCode.UserNotFound, "User not found.", ErrorType.NotFound);

    public static Error InvalidCredentials =>
        new(ErrorCode.InvalidCredentials, "Invalid email or password.", ErrorType.Unauthorized);

    public static Error RegistrationFailed(string reason) =>
        new(ErrorCode.RegistrationFailed, reason, ErrorType.Validation);

    public static Error PasswordResetFailed =>
        new(ErrorCode.PasswordResetFailed, "Invalid or expired reset token.", ErrorType.Validation);

    public static Error ProductInStock =>
        new(ErrorCode.ProductInStock, "Product is currently in stock.", ErrorType.Validation);

    public static Error AlreadySubscribed =>
        new(ErrorCode.AlreadySubscribed, "You are already subscribed to this product.", ErrorType.Conflict);

    public static Error FavoriteNotFound =>
        new(ErrorCode.FavoriteNotFound, "Favorite list not found.", ErrorType.NotFound);

    public static Error FavoriteItemNotFound =>
        new(ErrorCode.FavoriteItemNotFound, "Product not found in favorites.", ErrorType.NotFound);

    public static Error ExternalServiceFailure(string service) =>
        new(ErrorCode.ExternalServiceFailure, $"External service failure: {service}", ErrorType.ExternalService);
}
