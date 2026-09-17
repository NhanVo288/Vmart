namespace RestoreAPI.Application.Common;

public static class ErrorCode
{
    public const string ProductNotFound = "Product.NotFound";
    public const string InsufficientStock = "Product.InsufficientStock";
    public const string ProductAlreadyExists = "Product.AlreadyExists";
    public const string ProductForbidden = "Product.Forbidden";

    public const string BasketNotFound = "Basket.NotFound";
    public const string BasketEmpty = "Basket.Empty";

    public const string OrderNotFound = "Order.NotFound";
    public const string OrderAlreadyExists = "Order.AlreadyExists";
    public const string PaymentMismatch = "Order.PaymentMismatch";
    public const string InvalidShippingAddress = "Order.InvalidShippingAddress";
    public const string BasketNotReady = "Order.BasketNotReady";

    public const string UserNotFound = "Account.UserNotFound";
    public const string InvalidCredentials = "Account.InvalidCredentials";
    public const string RegistrationFailed = "Account.RegistrationFailed";
    public const string PasswordResetFailed = "Account.PasswordResetFailed";

    public const string ProductInStock = "StockNotification.ProductInStock";
    public const string AlreadySubscribed = "StockNotification.AlreadySubscribed";

    public const string FavoriteNotFound = "Favorite.NotFound";
    public const string FavoriteItemNotFound = "Favorite.ItemNotFound";

    public const string ExternalServiceFailure = "Infrastructure.ExternalServiceFailure";
}
