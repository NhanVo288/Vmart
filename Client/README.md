# Restore Client — Frontend

Frontend của VMart là SPA thương mại điện tử viết bằng **React 19**, **TypeScript 6** và **Vite 8**. Giao diện dùng MUI, state/API cache dùng Redux Toolkit và RTK Query, hỗ trợ tiếng Anh/tiếng Việt, thanh toán SePay/VietQR và khu vực riêng cho Admin/Vendor.

Bản build production được ghi thẳng vào `../API/RestoreAPI.Presentation/wwwroot/` để ASP.NET Core phục vụ cùng origin.

## Công nghệ chính

| Thành phần | Công nghệ |
|---|---|
| UI | React 19, MUI 9, styled-components 6 |
| Ngôn ngữ / build | TypeScript 6, Vite 8, React Compiler |
| State và API | Redux Toolkit 2, RTK Query, React Redux |
| Route | React Router DOM 7 |
| Form | react-hook-form, Zod |
| Thanh toán | SePay/VietQR qua backend API |
| Realtime | Microsoft SignalR |
| Hiệu ứng / thông báo | Framer Motion, React Toastify |
| Kiểm tra mã | Oxlint |

## Cấu trúc mã nguồn

```text
Client/
├── public/                       # Tài nguyên tĩnh và ảnh sản phẩm
├── src/
│   ├── app/                      # App shell và khởi tạo xác thực
│   ├── assets/                   # Asset được bundler xử lý
│   ├── components/               # Component dùng chung, layout và UI
│   ├── config/                   # Hằng số, API base URL, format giá
│   ├── features/
│   │   ├── account/              # Đăng nhập, đăng ký, hồ sơ, mật khẩu
│   │   ├── admin/                # Dashboard quản trị
│   │   ├── basket/               # Giỏ hàng
│   │   ├── checkout/             # Địa chỉ, SePay/VietQR, xác nhận đơn
│   │   ├── favorites/            # Danh sách yêu thích
│   │   ├── home/                 # Trang chủ
│   │   ├── orders/               # Lịch sử và chi tiết đơn
│   │   ├── products/             # Danh sách, bộ lọc, chi tiết sản phẩm
│   │   └── vendor/               # Dashboard nhà bán hàng
│   ├── hooks/                    # Hook sản phẩm, giỏ và SignalR
│   ├── lib/                      # i18n, navigation, SignalR client
│   ├── pages/                    # Trang nội dung và trang lỗi
│   ├── providers/                # Light/dark theme
│   ├── routes/                   # Route và route guard
│   ├── stores/                   # Redux store và RTK Query API slice
│   ├── styles/                   # CSS toàn cục
│   ├── types/                    # Kiểu dữ liệu theo domain
│   └── main.tsx                  # Điểm vào ứng dụng
├── package.json
├── vite.config.ts
└── README.md
```

## Route

### Công khai

| Đường dẫn | Chức năng |
|---|---|
| `/` | Trang chủ, danh mục và sản phẩm nổi bật |
| `/products` | Danh sách sản phẩm, tìm kiếm, lọc và phân trang |
| `/items/:id` | Chi tiết sản phẩm và thêm vào giỏ |
| `/cart` | Giỏ hàng và tóm tắt chi phí |
| `/favorites` | Danh sách yêu thích |
| `/login`, `/register` | Đăng nhập và đăng ký |
| `/forgot-password`, `/reset-password` | Khôi phục mật khẩu |
| `/about`, `/technologies`, `/contact` | Trang nội dung/liên hệ |
| `/errors` | Kiểm thử các tình huống lỗi API |
| `/not-found`, `/server-error` | Trang lỗi |

### Yêu cầu đăng nhập

| Đường dẫn | Chức năng |
|---|---|
| `/checkout` | Checkout ba bước: liên hệ → giao hàng → thanh toán |
| `/profile` | Hồ sơ và địa chỉ đã lưu |
| `/orders` | Lịch sử đơn hàng |
| `/orders/:id` | Chi tiết đơn hàng |

`PrivateRoute` chuyển người chưa đăng nhập đến `/login?returnUrl=<path>` và đưa họ trở lại trang ban đầu sau khi xác thực thành công.

### Admin

Các route `/admin`, `/admin/products`, `/admin/orders`, `/admin/users`, `/admin/logs` và `/admin/health-checks` được bảo vệ bởi `AdminRoute`.

### Vendor

Các route `/vendor`, `/vendor/products` và `/vendor/orders` được bảo vệ bởi `VendorRoute`. Vendor chỉ thao tác trên dữ liệu thuộc phạm vi của mình do backend kiểm soát.

## Quản lý state và gọi API

`src/stores/baseApi.ts` là cấu hình RTK Query dùng chung:

- Base URL lấy từ `VITE_API_BASE_URL`.
- `credentials: 'include'` gửi cookie định danh giỏ hàng ẩn danh.
- JWT trong `localStorage['token']` được gắn vào header `Authorization`.
- Ngôn ngữ trong `localStorage['language']` được gửi bằng `Accept-Language`.
- Cache tự refetch khi kết nối mạng trở lại và dùng tag để vô hiệu hóa dữ liệu liên quan.
- Lỗi HTTP được xử lý tập trung: toast cho lỗi nghiệp vụ/quyền, chuyển trang cho 404/500.

Các API slice chính:

| Slice | Nhiệm vụ |
|---|---|
| `authApi` | Đăng nhập, đăng ký, logout, user info, địa chỉ và mật khẩu |
| `productApi` | Danh sách, chi tiết và bộ lọc sản phẩm |
| `basketApi` | Đọc/sửa/xóa giỏ và lưu địa chỉ giao hàng |
| `favoriteApi` | Thêm/xóa sản phẩm yêu thích |
| `paymentApi` | Tạo yêu cầu SePay và thăm dò trạng thái thanh toán |
| `orderApi` | Lịch sử và chi tiết đơn; endpoint tạo đơn cũ vẫn được khai báo |
| `adminApi` | Sản phẩm, đơn, user/role, thông báo, log và health check |
| `vendorApi` | Sản phẩm, đơn và dashboard của Vendor |
| `stockNotificationApi` | Đăng ký nhận email khi có hàng |
| `contactApi` | Gửi biểu mẫu liên hệ |

## Luồng xác thực

1. `authSlice` giữ user, token và trạng thái khởi tạo.
2. Khi ứng dụng chạy, `AuthInitializer` đọc JWT, kiểm tra thời hạn và tải lại thông tin người dùng.
3. Token hết hạn hoặc request xác thực thất bại sẽ xóa phiên cục bộ.
4. Guard xác định quyền truy cập route dựa trên trạng thái đăng nhập và role.
5. Giỏ/yêu thích tạo khi chưa đăng nhập được backend gộp vào tài khoản sau login/register.

## Luồng checkout và thanh toán

Luồng nằm trong `src/features/checkout`:

1. `CheckoutContent` kiểm tra giỏ có sản phẩm và thu thập email.
2. Địa chỉ đã lưu được tự điền; khi tiếp tục, client cập nhật cả hồ sơ và giỏ hàng.
3. `paymentApi.createSepayPayment` gọi `POST /api/payments/sepay-request` để nhận mã tham chiếu, QR, tài khoản và số tiền.
4. `PaymentForm` hiển thị VietQR và cho phép sao chép nội dung chuyển khoản.
5. Client gọi `GET /api/payments/sepay-status/{reference}` ngay lập tức rồi lặp mỗi 3 giây.
6. Khi backend trả `paid` kèm đơn hàng, giao diện chuyển sang `OrderConfirmation`.

Client không tự tạo đơn và không tự xác nhận đã thanh toán. Backend chỉ tạo đơn sau khi webhook SePay được xác thực và đối soát thành công.

## Realtime

- SignalR kết nối tới `${API origin}/hubs/products` và truyền JWT qua `accessTokenFactory`.
- Chỉ tài khoản Admin/Vendor mở kết nối này.
- Khi có sự kiện sản phẩm/thông báo, hook SignalR làm mới tag RTK Query liên quan và hiển thị toast.
- Kết nối bật tự động reconnect.

## Đa ngôn ngữ và giao diện

- Hỗ trợ **English** (`en`) và **Tiếng Việt** (`vi`).
- Lựa chọn được lưu tại `localStorage['language']`, cập nhật thuộc tính `lang/dir` trên HTML và gửi đến API.
- Key thiếu bản dịch sẽ quay về tiếng Anh.
- Theme sáng/tối được lưu trong `localStorage['theme-mode']`.
- Khu vực Admin/Vendor dùng shell riêng và ẩn navbar của storefront.

## Cấu hình

Tạo `Client/.env` nếu cần ghi đè API URL:

```env
VITE_API_BASE_URL=https://localhost:7255/api
```

Đây là biến frontend công khai, không đặt secret hoặc API key riêng tư trong biến có tiền tố `VITE_`.

Thiết lập đáng chú ý trong `vite.config.ts`:

- Dev server chạy cổng `3000` và dùng chứng chỉ do `vite-plugin-mkcert` tạo.
- Build output là `../API/RestoreAPI.Presentation/wwwroot/` và thư mục cũ được xóa trước khi build.
- Alias MUI styled engine sang styled-components.
- React Compiler được bật qua Babel plugin.

## Chạy dự án

Yêu cầu Node.js LTS và backend đang chạy.

```bash
cd Client
npm install
npm run dev
```

Truy cập `https://localhost:3000`.

### Build production

```bash
npm run build
```

Sau khi build, chạy API và truy cập `https://localhost:7255`; ASP.NET Core sẽ phục vụ SPA từ `wwwroot`.

### Script

| Lệnh | Chức năng |
|---|---|
| `npm run dev` | Chạy Vite dev server |
| `npm run build` | Kiểm tra TypeScript và build production |
| `npm run preview` | Xem thử bản build |
| `npm run lint` | Chạy Oxlint |

## Lưu ý phát triển

- Form sản phẩm gửi `multipart/form-data`; ảnh được backend upload lên Cloudinary.
- `DatabaseDiagram` là sơ đồ ERD tương tác có pan/zoom và tìm kiếm bảng/cột.
- `errorApi` cố ý không dùng bộ xử lý lỗi chung để trang `/errors` hiển thị từng tình huống kiểm thử.
- Giá trị tiền hiện được `formatPrice()` hiển thị dưới dạng số; đơn vị và ngưỡng phí vận chuyển phải thống nhất với backend khi thay đổi nghiệp vụ.
