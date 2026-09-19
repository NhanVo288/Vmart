# VMart — Restore

VMart là hệ thống thương mại điện tử full-stack gồm REST API viết bằng **ASP.NET Core 10** và SPA viết bằng **React 19 + TypeScript**. Dự án hỗ trợ cửa hàng cho khách mua, khu vực quản trị, cổng dành cho nhà bán hàng, thanh toán chuyển khoản **SePay/VietQR**, thông báo thời gian thực bằng SignalR, tác vụ nền bằng Hangfire và giao diện song ngữ Anh/Việt.

Ở môi trường phát triển, frontend và API có thể chạy riêng. Với bộ Docker
production trong repository, React được build thành static files và phục vụ bởi
Nginx; Nginx đồng thời reverse proxy `/api`, `/hubs`, `/hangfire` và `/health`
tới ASP.NET Core API. Xem [README triển khai production](DEPLOYMENT.md) để biết
toàn bộ luồng và lý do của từng bước.

## Tính năng chính

- Duyệt, tìm kiếm, lọc, sắp xếp và phân trang sản phẩm.
- Giỏ hàng và danh sách yêu thích cho cả khách chưa đăng nhập; dữ liệu được gộp vào tài khoản sau khi đăng nhập/đăng ký.
- Đăng ký, đăng nhập, đăng xuất, access token trong cookie HttpOnly, refresh-token rotation bằng Redis, quên/đặt lại mật khẩu và lưu địa chỉ giao hàng.
- Checkout theo ba bước: thông tin liên hệ, địa chỉ giao hàng, thanh toán SePay/VietQR.
- Lịch sử đơn hàng và chi tiết đơn hàng của người mua.
- Quản trị sản phẩm, đơn hàng, người dùng, vai trò, thông báo, log và health check.
- Nhà bán hàng quản lý sản phẩm của mình, xem đơn hàng và số liệu tổng quan.
- Người dùng có thể đăng ký nhận email khi sản phẩm hết hàng được nhập lại.
- Upload ảnh lên Cloudinary; cache Redis có cơ chế quay về database khi Redis không khả dụng.
- SignalR cập nhật sản phẩm và thông báo quản trị cho Admin/Vendor theo thời gian thực.
- Hangfire chạy tác vụ dọn token đã thu hồi lúc 03:00 và giỏ hàng ẩn danh cũ lúc 04:00 theo múi giờ Việt Nam.
- Serilog ghi structured log ra console; trang quản trị truy vấn log từ Elasticsearch và Kibana có thể được bật để quan sát dữ liệu index.

## Kiến trúc tổng thể

```text
Trình duyệt
   │
   ▼
React SPA (Redux Toolkit, RTK Query, MUI)
   │ HTTP + HttpOnly auth cookies + buyerId cookie + SignalR
   ▼
ASP.NET Core Presentation
   │
   ├── Application: CQRS, MediatR, validation, Result pattern
   ├── Domain: entity, aggregate, enum, factory
   └── Infrastructure
           ├── SQL Server / EF Core / Identity / Hangfire
           ├── Redis
           ├── SePay / VietQR
           ├── Cloudinary / SMTP
           └── Elasticsearch
```

Khi phát triển, Vite và API chạy thành hai process. Khi deploy bằng
`docker-compose.prod.yml`, trình duyệt chỉ kết nối tới Nginx: Nginx phục vụ
bundle React và proxy các đường dẫn backend tới container API. SQL Server,
Redis và Elasticsearch chỉ giao tiếp qua mạng nội bộ Docker.

Backend áp dụng Clean Architecture theo chiều phụ thuộc:

```text
Presentation ──► Application ◄── Infrastructure
                       │                 │
                       └────► Domain ◄───┘
```

- `Domain`: mô hình nghiệp vụ độc lập như Product, Basket, Order, Favorite và quy tắc chuyển trạng thái đơn.
- `Application`: use case theo CQRS, DTO, validation, interface và pipeline của MediatR.
- `Infrastructure`: EF Core, repository, Identity/JWT và các tích hợp bên ngoài.
- `Presentation`: API host, controller, middleware, Swagger, SignalR, health check và Hangfire dashboard.

## Cấu trúc thư mục

```text
Restore_System/
├── API/
│   ├── RestoreAPI.Domain/          # Entity, aggregate và quy tắc nghiệp vụ
│   ├── RestoreAPI.Application/     # CQRS, DTO, validation và interface
│   ├── RestoreAPI.Infrastructure/  # Database, repository và dịch vụ tích hợp
│   ├── RestoreAPI.Presentation/    # API host, controller, middleware, health check
│   ├── Dockerfile                  # Multi-stage build cho API
│   └── README.md                   # Tài liệu backend
├── Client/
│   ├── src/                        # React SPA theo feature
│   ├── Dockerfile                  # Build Vite rồi phục vụ bằng Nginx
│   ├── nginx.conf                  # SPA fallback và reverse proxy
│   └── README.md                   # Tài liệu frontend
├── docs/                           # Postman collection
├── docker-compose.yml              # Dịch vụ hỗ trợ cho môi trường phát triển
├── docker-compose.prod.yml         # Toàn bộ stack production
├── DEPLOYMENT.md                   # README triển khai production chi tiết
└── .env.example                    # Biến môi trường mẫu cho Docker
```

## Luồng hoạt động chính

### Khởi tạo và xác thực

1. React khởi tạo Redux store, theme, i18n và bộ xử lý lỗi chung.
2. `AuthInitializer` gọi `GET /api/account/user-info`; trình duyệt tự gửi access-token cookie HttpOnly.
3. Khi access token hết hạn, RTK Query gọi `POST /api/account/refresh`, Redis rotate refresh token rồi request ban đầu được thử lại.
4. Khách chưa đăng nhập được nhận cookie HttpOnly `buyerId` để định danh giỏ hàng/danh sách yêu thích.
5. Khi đăng nhập hoặc đăng ký, dữ liệu ẩn danh được chuyển sang user hiện tại. Đăng xuất thu hồi access token, xóa refresh session trong Redis và xóa cookie.

### Duyệt sản phẩm và giỏ hàng

1. Client gọi API sản phẩm với từ khóa, thương hiệu, loại, khoảng giá, thứ tự và phân trang.
2. Danh sách/bộ lọc sản phẩm được cache trong Redis. Khi Redis lỗi, API đọc trực tiếp từ SQL Server.
3. Thêm, sửa số lượng hoặc xóa sản phẩm làm thay đổi aggregate `Basket` tương ứng với `buyerId`.
4. Trước khi thanh toán, người dùng phải đăng nhập; route `/checkout` được bảo vệ bởi `PrivateRoute`.

### Route giao diện

| Nhóm | Route chính |
|---|---|
| Public | `/`, `/products`, `/items/:id`, `/cart`, `/favorites`, `/about`, `/technologies`, `/contact` |
| Xác thực public | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| Người dùng đã đăng nhập | `/profile`, `/checkout`, `/orders`, `/orders/:id` |
| Admin | `/admin`, `/admin/products`, `/admin/orders`, `/admin/users`, `/admin/logs`, `/admin/health-checks` |
| Vendor | `/vendor`, `/vendor/products`, `/vendor/orders` |

`PrivateRoute`, `AdminRoute` và `VendorRoute` bảo vệ các nhóm route tương ứng.
Nginx dùng SPA fallback nên truy cập trực tiếp một deep link vẫn trả về
`index.html` để React Router xử lý.

## Luồng thanh toán SePay/VietQR

### 1. Chuẩn bị checkout

1. Người mua nhập email và địa chỉ giao hàng tại `/checkout`.
2. Client đồng thời lưu địa chỉ vào hồ sơ (`POST /api/account/address`) và giỏ hàng (`PUT /api/baskets/shipping-address`).
3. Client gọi `POST /api/payments/sepay-request`.
4. API kiểm tra người dùng, giỏ hàng, sản phẩm và địa chỉ; sau đó tính:

   ```text
   tổng thanh toán = tổng giá sản phẩm + phí giao hàng - giảm giá
   ```

   Theo logic hiện tại, phí giao hàng là `0` khi tạm tính lớn hơn `10.000`, ngược lại là `500`; giảm giá đang là `0`.

5. API tạo hoặc tái sử dụng `PaymentReference` duy nhất, lưu tham chiếu vào giỏ hàng và trả về URL VietQR, ngân hàng, số tài khoản, chủ tài khoản và số tiền.

### 2. Người mua chuyển khoản

1. Frontend hiển thị QR cùng đầy đủ nội dung chuyển khoản.
2. Người mua quét QR bằng ứng dụng ngân hàng và phải giữ nguyên **số tiền** cùng **nội dung chuyển khoản**.
3. Trong lúc chờ, frontend gọi `GET /api/payments/sepay-status/{reference}` mỗi 3 giây.
4. Trạng thái là `pending` khi tham chiếu vẫn thuộc giỏ hàng, `paid` khi đơn tương ứng đã tồn tại, và `not_found` nếu tham chiếu không thuộc người dùng hiện tại.

### 3. SePay xác nhận giao dịch

SePay gửi `POST /api/payments/sepay-webhook`. Endpoint này không yêu cầu JWT của người mua nhưng bắt buộc header:

```http
Authorization: Apikey <SepaySettings:WebhookApiKey>
```

Backend chỉ xử lý khi tất cả điều kiện sau hợp lệ:

- API key webhook khớp theo phép so sánh constant-time.
- Đây là giao dịch tiền vào (`transferType = in`).
- Mã `PaymentReference` được tìm thấy trong `code`, `content` hoặc `description`.
- Có giỏ hàng tương ứng với mã tham chiếu.
- Số tiền nhận đúng bằng tổng tiền đã tính từ giỏ.
- Tài khoản thụ hưởng khớp cấu hình (nếu đã cấu hình).
- Đơn cho mã tham chiếu đó chưa được hoàn tất trước đó.

### 4. Tạo đơn an toàn

Khi webhook hợp lệ, API mở database transaction, trừ tồn kho theo cách chống cập nhật đồng thời, tạo đơn với trạng thái `PaymentReceived`, xóa giỏ hàng rồi commit. `PaymentReference` có unique index nên webhook gửi lặp không tạo đơn trùng; lỗi giữa chừng sẽ rollback.

Sau khi client nhận trạng thái `paid`, màn hình chuyển sang xác nhận đơn. Người dùng có thể xem lại đơn tại `/orders`, còn Admin/Vendor theo dõi trong khu vực quản lý tương ứng.

```text
Checkout ──► tạo SePay request ──► hiển thị VietQR
   │                                      │
   │                                      ├── client poll trạng thái mỗi 3 giây
   │                                      │
   └──────────────── người mua chuyển khoản
                                          │
SePay ──► webhook ──► xác thực & đối soát ──► transaction tạo đơn
                                                   │
                                                   └── trạng thái paid ──► xác nhận đơn
```

> Webhook là nguồn xác nhận thanh toán đáng tin cậy. Client không tự đánh dấu đã thanh toán và không tạo đơn chỉ dựa vào việc người dùng đã quét QR.

## Vai trò và phân quyền

| Vai trò | Quyền chính |
|---|---|
| Khách | Xem sản phẩm, dùng giỏ hàng và yêu thích bằng cookie ẩn danh |
| User | Checkout, thanh toán, quản lý hồ sơ và xem đơn của chính mình |
| Vendor | Quản lý sản phẩm của mình, xem đơn liên quan và dashboard |
| Admin | Quản lý toàn bộ sản phẩm, đơn, user/role, log, thông báo và health check |

## Công nghệ

| Khu vực | Công nghệ |
|---|---|
| Backend | .NET 10, ASP.NET Core, EF Core, SQL Server, MediatR, FluentValidation, AutoMapper |
| Xác thực | ASP.NET Core Identity, JWT Bearer, role-based authorization |
| Frontend | React 19, TypeScript 6, Vite 8, MUI 9, Redux Toolkit/RTK Query |
| Thanh toán | SePay, VietQR, webhook xác thực bằng API key |
| Realtime | SignalR tại `/hubs/products` |
| Cache / job | Redis 7, Hangfire 1.8 |
| Log | Serilog, Elasticsearch 8, Kibana |
| Tệp / email | Cloudinary, SMTP |
| Ngôn ngữ | Tiếng Anh và tiếng Việt |

## Yêu cầu môi trường

- .NET 10 SDK.
- Node.js 24 và npm (cùng major version với image build frontend).
- SQL Server (LocalDB hoặc một SQL Server khác).
- Docker Desktop nếu muốn chạy Redis, Elasticsearch và Kibana bằng Compose.
- Tài khoản/cấu hình SePay để kiểm thử webhook thanh toán thực tế.

## Cài đặt và chạy

### 1. Dịch vụ hỗ trợ

```bash
docker compose up -d
```

Lệnh trên chạy Redis tại `6379`, Elasticsearch tại `9200` và Kibana tại `5601`. SQL Server trong `docker-compose.yml` đang được comment; có thể bật và đặt `MSSQL_SA_PASSWORD` trong `.env` nếu muốn dùng database container.

### 2. Cấu hình backend

Thiết lập các nhóm cấu hình trong `API/RestoreAPI.Presentation/appsettings*.json` hoặc Secret Manager/biến môi trường:

- `ConnectionStrings:DefaultConnection`, `ConnectionStrings:Redis`.
- `JWT`.
- `SepaySettings`: ngân hàng, số tài khoản, chủ tài khoản, tiền tố mã thanh toán, QR base URL và webhook API key.
- `CloudinarySettings`, `EmailSettings`, `Elasticsearch`, `Cleanup`, `Cors`.

`appsettings*.json` đang được Git bỏ qua vì có thể chứa secret. Máy phát triển
phải tự cung cấp file cấu hình hoặc dùng User Secrets/biến môi trường. Với key
lồng nhau trong biến môi trường, dùng hai dấu gạch dưới, ví dụ
`ConnectionStrings__DefaultConnection` và `Cors__AllowedOrigins__0`.

Không commit secret thật vào repository. Với môi trường local, có thể dùng:

```bash
cd API/RestoreAPI.Presentation
dotnet user-secrets set "SepaySettings:WebhookApiKey" "<api-key>"
```

### 3. Chạy API

```bash
dotnet restore API/RestoreAPI.Presentation/RestoreAPI.csproj
dotnet run --project API/RestoreAPI.Presentation/RestoreAPI.csproj --launch-profile https
```

- API: `http://localhost:7255` (đồng thời bind `http://localhost:5240` theo launch profile hiện tại).
- Swagger: `http://localhost:7255/swagger`.
- Hangfire: `http://localhost:7255/hangfire`.
- Health check: `http://localhost:7255/health` và `/health/ready`.

API không phục vụ React SPA. Khi phát triển, mở frontend ở cổng 3000; khi chạy
Docker production, Nginx là entry point duy nhất của cả frontend và API.

Khi khởi động, `DbInitializer` tự áp dụng migration và seed role/user/sản phẩm mẫu theo cấu hình hiện tại.

### 4. Chạy frontend

```bash
npm ci --prefix Client
npm --prefix Client run dev
```

Vite chạy tại `http://localhost:3000`. `VITE_API_BASE_URL` mặc định trỏ tới API local; có thể ghi đè trong `Client/.env`.

### 5. Build frontend thủ công

```bash
npm ci --prefix Client
npm --prefix Client run build
```

`npm run build` tạo static bundle trong `Client/dist`. Đây là bước kiểm tra build
cục bộ; luồng production dùng multi-stage Docker build và Nginx, được mô tả tại
[DEPLOYMENT.md](DEPLOYMENT.md).

### 6. Chạy toàn bộ stack production bằng Docker

```bash
cp .env.example .env
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml up -d --build
```

Trên PowerShell, dùng `Copy-Item .env.example .env` thay cho lệnh `cp`. Trước khi
chạy, phải thay ít nhất `MSSQL_SA_PASSWORD`, `JWT_KEY` và `PUBLIC_ORIGIN` trong
`.env`. Quy trình chuẩn bị máy chủ, giải thích kiến trúc, HTTPS/domain, kiểm tra
sau deploy, backup và rollback nằm trong
[README triển khai production](DEPLOYMENT.md).

## Cấu hình webhook SePay khi phát triển

SePay phải gọi được URL công khai của backend, ví dụ:

```text
https://<public-host>/api/payments/sepay-webhook
```

Khi chạy local, cần dùng tunnel HTTPS hoặc môi trường staging. Cấu hình API key ở SePay phải trùng `SepaySettings:WebhookApiKey`. Có thể theo dõi request webhook qua log ứng dụng và kiểm tra đơn được tạo bằng Swagger hoặc trang `/orders`.

## Kiểm tra chất lượng

```bash
# Frontend
npm --prefix Client run lint
npm --prefix Client run build

# Backend
dotnet build API/Restore.slnx
```

## Tài liệu chi tiết

- [`DEPLOYMENT.md`](DEPLOYMENT.md): luồng deploy production, lý do từng bước, vận hành và rollback.
- [`API/README.md`](API/README.md): kiến trúc, endpoint và cấu hình backend.
- [`Client/README.md`](Client/README.md): cấu trúc frontend, route, state và build.
- `docs/*.postman_collection.json`: các Postman collection có sẵn.

## Lưu ý vận hành

- Không coi kết quả phía client là bằng chứng thanh toán; chỉ webhook hợp lệ mới hoàn tất đơn.
- Cần dùng HTTPS và bảo vệ webhook API key ở production.
- Redis là thành phần tăng tốc; API vẫn truy vấn database nếu Redis tạm thời lỗi.
- Hangfire dashboard chỉ mở tự do ở Development; ngoài Development yêu cầu quyền Admin.
- Các endpoint `/api/buggy/*` và trang `/errors` chỉ phục vụ kiểm thử xử lý lỗi.
