# Restore API — Backend

Backend của VMart là ASP.NET Core 10 Web API xây dựng theo **Clean Architecture** và **CQRS**. Hệ thống cung cấp nghiệp vụ thương mại điện tử, Identity/JWT, thanh toán SePay/VietQR, cache Redis, Hangfire, SignalR, Serilog/Elasticsearch và bản địa hóa Anh/Việt.

## Kiến trúc

```text
API/
├── RestoreAPI.Domain/
│   ├── Entities/              # User, Product, Basket, Favorite, Order...
│   ├── Enums/                 # Trạng thái đơn hàng
│   └── Factories/             # Tạo Order từ Basket
├── RestoreAPI.Application/
│   ├── Behaviors/             # Logging, validation, transaction pipeline
│   ├── Common/                # Result pattern và mã lỗi
│   ├── DTOs/                  # Contract trả về/nhận vào
│   ├── Features/              # CQRS command/query theo nghiệp vụ
│   ├── Interfaces/            # Abstraction cho repository/dịch vụ
│   ├── Requests/              # Filter và pagination request
│   └── Settings/              # Cấu hình kiểu mạnh
├── RestoreAPI.Infrastructure/
│   ├── Data/                  # DbContext, migration, seed và interceptor
│   ├── Repositories/          # Truy cập dữ liệu
│   ├── Services/              # JWT, Redis, SePay, email, Cloudinary...
│   ├── Hubs/                  # SignalR ProductHub
│   ├── Jobs/                  # Hangfire recurring job
│   ├── HealthChecks/          # SQL, Redis, SePay, Elasticsearch, Hangfire
│   └── Resources/             # SharedResource.en/vi.resx
└── RestoreAPI.Presentation/
    ├── Controllers/           # HTTP API
    ├── Middleware/            # Xử lý exception toàn cục
    ├── Program.cs             # Composition root và middleware pipeline
    ├── appsettings*.json      # Cấu hình theo môi trường
    └── wwwroot/               # React SPA sau khi build
```

Quy tắc phụ thuộc:

- `Domain` không phụ thuộc layer nghiệp vụ bên ngoài.
- `Application` phụ thuộc `Domain`, chứa use case và interface.
- `Infrastructure` hiện thực interface của `Application`.
- `Presentation` là host, nhận HTTP request và gửi command/query qua MediatR.

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Runtime | .NET 10 / ASP.NET Core |
| Kiến trúc | Clean Architecture, CQRS, MediatR 12 |
| Validation / mapping | FluentValidation, AutoMapper |
| Database | EF Core 10, SQL Server |
| Xác thực | ASP.NET Core Identity, JWT Bearer, role Admin/User/Vendor |
| Cache | Redis 7 với fallback về database |
| Thanh toán | SePay/VietQR và webhook API key |
| Tác vụ nền | Hangfire 1.8, SQL Server storage |
| File / email | Cloudinary, SMTP |
| Log | Serilog, Elasticsearch 8, Kibana |
| Realtime | SignalR `/hubs/products` |
| Tài liệu API | Swagger / Swashbuckle |
| Ngôn ngữ | `en`, `vi` qua resource và `Accept-Language` |

## Endpoint chính

Mặc định các route controller có tiền tố `/api`.

### Sản phẩm — `/api/products`

| Method | Route | Quyền | Chức năng |
|---|---|---|---|
| GET | `/api/products` | Công khai | Danh sách phân trang, tìm kiếm, lọc giá/brand/type, sắp xếp |
| GET | `/api/products/filters` | Công khai | Danh sách brand/type theo bộ lọc hiện tại |
| GET | `/api/products/{id}` | Công khai | Chi tiết sản phẩm |
| POST | `/api/products` | Admin, Vendor | Tạo sản phẩm, nhận multipart và upload ảnh |
| PUT | `/api/products/{id}` | Admin, Vendor | Cập nhật sản phẩm |
| DELETE | `/api/products/{id}` | Admin, Vendor | Soft-delete sản phẩm |

### Tài khoản — `/api/account`

| Method | Route | Quyền | Chức năng |
|---|---|---|---|
| POST | `/api/account/register` | Công khai | Đăng ký và gộp dữ liệu ẩn danh |
| POST | `/api/account/login` | Công khai | Đăng nhập, trả thông tin xác thực/JWT |
| GET | `/api/account/user-info` | Có thể ẩn danh | Lấy user/role và thực hiện chuyển giỏ/yêu thích khi cần |
| POST | `/api/account/logout` | Đăng nhập | Thu hồi JWT |
| GET/POST | `/api/account/address` | Đăng nhập | Đọc hoặc lưu địa chỉ |
| POST | `/api/account/forgot-password` | Công khai | Gửi email đặt lại mật khẩu |
| POST | `/api/account/reset-password` | Công khai | Đặt mật khẩu mới bằng token |

ASP.NET Core Identity API cũng được map dưới `/api` để hỗ trợ các endpoint Identity tiêu chuẩn.

### Giỏ hàng — `/api/baskets`

| Method | Route | Chức năng |
|---|---|---|
| GET | `/api/baskets` | Lấy hoặc tạo giỏ trống |
| POST | `/api/baskets` | Tạo giỏ từ danh sách item |
| PUT | `/api/baskets` | Thay danh sách item |
| DELETE | `/api/baskets` | Xóa giỏ |
| DELETE | `/api/baskets/items/{productId}` | Xóa một sản phẩm |
| PUT | `/api/baskets/shipping-address` | Gắn địa chỉ giao hàng |

Giỏ ẩn danh được định danh bằng cookie HttpOnly `buyerId` và tự chuyển sang tài khoản khi login/register.

### Yêu thích — `/api/favorites`

| Method | Route | Chức năng |
|---|---|---|
| GET | `/api/favorites` | Lấy/tạo danh sách yêu thích |
| POST | `/api/favorites/{productId}` | Thêm sản phẩm |
| DELETE | `/api/favorites/{productId}` | Xóa một sản phẩm |
| DELETE | `/api/favorites` | Xóa toàn bộ danh sách |

### Đơn hàng — `/api/orders`

Tất cả endpoint yêu cầu đăng nhập và giới hạn theo user hiện tại.

| Method | Route | Chức năng |
|---|---|---|
| GET | `/api/orders` | Danh sách đơn phân trang, lọc và sắp xếp |
| GET | `/api/orders/{id}` | Chi tiết đơn sau khi kiểm tra ownership |
| POST | `/api/orders` | Trả `409 Conflict`; checkout hiện tạo đơn tự động từ webhook SePay |

### Thanh toán — `/api/payments`

| Method | Route | Quyền | Chức năng |
|---|---|---|---|
| POST | `/api/payments/sepay-request` | Đăng nhập | Tạo/tái sử dụng mã thanh toán và URL VietQR từ giỏ |
| GET | `/api/payments/sepay-status/{reference}` | Đăng nhập | Trả `pending`, `paid` kèm order, hoặc `not_found` |
| POST | `/api/payments/sepay-webhook` | API key | Nhận xác nhận giao dịch từ SePay và tạo đơn |

## Chi tiết luồng thanh toán

### Tạo yêu cầu

`SepayPaymentService.CreateOrUpdatePaymentAsync` kiểm tra giỏ, địa chỉ và cấu hình; tính tổng item, phí vận chuyển và giảm giá; sau đó sinh mã dạng `<PREFIX><16 ký tự hex>`. Mã và QR URL được lưu vào giỏ trước khi trả cho client.

### Xác thực webhook

Webhook phải gửi:

```http
Authorization: Apikey <WebhookApiKey>
```

Service so sánh header bằng `CryptographicOperations.FixedTimeEquals`, chỉ nhận giao dịch tiền vào và tìm mã thanh toán trong `code`, `content` hoặc `description`. Giao dịch bị bỏ qua nếu không tìm được giỏ, sai số tiền hoặc sai tài khoản thụ hưởng.

### Hoàn tất đơn

Khi đối soát thành công:

1. Mở database transaction.
2. Trừ tồn kho từng sản phẩm bằng thao tác có kiểm soát cạnh tranh.
3. Dựng `Order` từ `Basket`, đặt trạng thái `PaymentReceived`.
4. Lưu order và xóa basket.
5. Commit; nếu có lỗi thì rollback.

Webhook có tính idempotent: order được tra theo `PaymentReference` trước khi xử lý và database có unique index cho trường này. Webhook lặp không tạo thêm đơn.

## Admin — `/api/admin`

Tất cả endpoint yêu cầu role `Admin`:

- `GET /api/admin/orders`, `GET /api/admin/orders/{id}`.
- `PUT /api/admin/orders/{id}/status`.
- `GET /api/admin/users`, `GET /api/admin/users/{id}`.
- `PUT /api/admin/users/{id}/roles`.
- `GET /api/admin/notifications`, `GET /api/admin/notifications/unread-count`.
- `PATCH /api/admin/notifications/{id}/read`, `PATCH /api/admin/notifications/read-all`.
- `GET /api/admin/health-checks`.
- `GET /api/admin/logs`, `GET /api/admin/logs/stats`.

## Vendor — `/api/vendor`

Tất cả endpoint yêu cầu role `Vendor`:

- `GET /api/vendor/products`: sản phẩm của Vendor.
- `GET /api/vendor/orders`: các đơn chứa sản phẩm của Vendor.
- `GET /api/vendor/dashboard`: thống kê doanh thu, đơn và sản phẩm.

## Endpoint khác

- `POST /api/stocknotifications`: đăng ký email khi sản phẩm có hàng.
- `POST /api/contact`: gửi biểu mẫu liên hệ và email phản hồi.
- `GET /api/localization/culture|welcome|resources`: thông tin/bản dịch theo culture.
- `/api/buggy/*`: các tình huống lỗi cố ý dùng trong môi trường phát triển.

## SignalR

- Hub ở `/hubs/products` và yêu cầu JWT.
- Vendor tự vào group `vendor-{sellerId}`, Admin vào group `admins`.
- `ProductNotificationService` phát sự kiện tạo/cập nhật/xóa sản phẩm và lưu thông báo Admin.
- Với kết nối hub, JWT được phép truyền qua query `access_token` theo cấu hình JWT bearer event.

## Hangfire

Dashboard ở `/hangfire`; Development được truy cập trực tiếp, các môi trường khác yêu cầu Admin.

Các recurring job hiện có:

- `cleanup-revoked-tokens`: chạy hằng ngày lúc 03:00, xóa token thu hồi đã cũ.
- `cleanup-stale-baskets`: chạy hằng ngày lúc 04:00, xóa giỏ ẩn danh trống đã cũ.

Lịch chạy sử dụng múi giờ Việt Nam theo implementation hiện tại; số ngày giữ dữ liệu lấy từ nhóm `Cleanup`.

## Health check

| Endpoint | Nội dung |
|---|---|
| `GET /health` | Toàn bộ check đã đăng ký |
| `GET /health/ready` | Các check sẵn sàng như database, job, payment và cache |

Admin cũng có `GET /api/admin/health-checks` để frontend hiển thị báo cáo chi tiết.

## Xử lý lỗi

- Handler nghiệp vụ trả `Result<T>` thay vì dùng exception làm control flow.
- `ResultExtensions.ToActionResult()` ánh xạ loại lỗi thành status 400/401/403/404/409/502/500 và trả Problem Details.
- `ValidationBehavior` chạy FluentValidation trước handler.
- `ExceptionMiddleware` bắt exception chưa xử lý, ghi log và trả Problem Details 500.
- `Accept-Language: en|vi` quyết định nội dung lỗi bản địa hóa.

## Cấu hình

Các nhóm cấu hình chính trong `RestoreAPI.Presentation/appsettings*.json`:

| Nhóm | Mục đích |
|---|---|
| `ConnectionStrings` | SQL Server, Redis và storage liên quan |
| `cors` | Origin được phép gọi API |
| `JWT` | Issuer, audience, signing key và thời hạn token |
| `SepaySettings` | Tài khoản nhận, tiền tố mã, webhook key, QR base URL |
| `CloudinarySettings` | Upload ảnh sản phẩm |
| `EmailSettings` | SMTP và địa chỉ gửi |
| `Cleanup` | Thời gian giữ token/giỏ cũ |
| `Elasticsearch` | Endpoint/index log |
| `Serilog` | Sink và mức log |

Không đưa connection string, JWT key, mật khẩu SMTP, Cloudinary secret hoặc SePay webhook key thật vào source control. Dùng Secret Manager khi phát triển:

```bash
cd API/RestoreAPI.Presentation
dotnet user-secrets set "SepaySettings:WebhookApiKey" "<api-key>"
dotnet user-secrets set "JWT:Key" "<jwt-signing-key>"
```

Trong biến môi trường, key lồng nhau dùng dấu `__`, ví dụ `SepaySettings__WebhookApiKey`.

## Chạy backend

### Yêu cầu

- .NET 10 SDK.
- SQL Server hoặc LocalDB.
- Docker nếu muốn chạy Redis, Elasticsearch và Kibana.

### Dịch vụ hỗ trợ

Từ thư mục root:

```bash
docker compose up -d
```

Compose hiện chạy Redis, Elasticsearch và Kibana; service SQL Server đang được comment.

### Chạy API

```bash
cd API/RestoreAPI.Presentation
dotnet restore
dotnet run --launch-profile https
```

- HTTPS: `https://localhost:7255`.
- HTTP: `http://localhost:5240`.
- Swagger: `/swagger`.
- Hangfire: `/hangfire`.

`DbInitializer` tự chạy migration và seed ba role `Admin`, `User`, `Vendor`, user mẫu cùng 76 sản phẩm nếu dữ liệu chưa có.

### Migration EF Core

Chạy từ thư mục `API`:

```bash
dotnet ef migrations add <TenMigration> --project RestoreAPI.Infrastructure --startup-project RestoreAPI.Presentation
dotnet ef database update --project RestoreAPI.Infrastructure --startup-project RestoreAPI.Presentation
```

### Build

```bash
cd API
dotnet build Restore.slnx
```

## Quan hệ project

```text
RestoreAPI.Domain
       ▲
       │
RestoreAPI.Application
       ▲
       ├── RestoreAPI.Infrastructure
       └── RestoreAPI.Presentation ──► RestoreAPI.Infrastructure
```

## Lưu ý

- Danh sách/bộ lọc sản phẩm được cache; thao tác ghi sẽ vô hiệu hóa cache liên quan.
- Redis lỗi không làm API ngừng phục vụ dữ liệu sản phẩm vì có fallback database.
- Soft-delete và trường audit được xử lý tập trung bằng EF interceptor/query filter.
- Trạng thái đơn chỉ chuyển theo quy tắc trong domain; Admin không thể ép một bước chuyển không hợp lệ.
- Chỉ webhook SePay hợp lệ mới là nguồn xác nhận thanh toán và tạo đơn checkout.
