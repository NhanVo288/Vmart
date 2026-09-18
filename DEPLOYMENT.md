# Deploy Restore System bằng Docker

Bộ Docker production chạy 5 thành phần: React/Nginx, ASP.NET Core API, SQL Server,
Redis và Elasticsearch. Kibana là tùy chọn. Chỉ cổng HTTP của Nginx được public;
các dịch vụ dữ liệu chỉ giao tiếp trong mạng Docker.

## 1. Yêu cầu máy chủ

- Docker Engine có Docker Compose v2, máy chủ Linux `x86_64/amd64` (SQL Server
  container không hỗ trợ Linux ARM64).
- Tối thiểu khoảng 4 GB RAM; nên dùng 6 GB RAM trở lên do SQL Server và
  Elasticsearch cùng chạy.
- Mở cổng `80` (và `443` khi cấu hình HTTPS).
- Trên Linux, nếu Elasticsearch không khởi động, chạy một lần:

```bash
sudo sysctl -w vm.max_map_count=262144
```

Để giữ cấu hình sau khi reboot, thêm `vm.max_map_count=262144` vào
`/etc/sysctl.conf` rồi chạy `sudo sysctl -p`.

## 2. Tạo cấu hình môi trường

Tại thư mục gốc của repository:

```bash
cp .env.example .env
```

Trên PowerShell:

```powershell
Copy-Item .env.example .env
```

Sửa `.env`, tối thiểu phải thay:

```env
MSSQL_SA_PASSWORD=MatKhau_RatManh123!
JWT_KEY=mot-chuoi-ngau-nhien-dai-it-nhat-32-ky-tu
PUBLIC_ORIGIN=http://localhost
HTTP_PORT=80
```

Khi có domain, đặt `PUBLIC_ORIGIN=https://shop.example.com` (không có dấu `/`
ở cuối). Điền thêm SePay, Cloudinary và SMTP nếu dùng các tính năng tương ứng.
File `.env` chứa bí mật và đã được Git bỏ qua, không commit file này.

## 3. Build và chạy

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

API tự chạy EF Core migrations và seed dữ liệu ở lần khởi động. Theo dõi quá
trình bằng:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
```

Mở ứng dụng tại `http://localhost` hoặc domain đã cấu hình. Kiểm tra API:

```bash
curl http://localhost/health
```

Nếu chưa cấu hình SePay, endpoint health có thể trả trạng thái `Unhealthy` cho
riêng kiểm tra thanh toán dù web và các chức năng khác vẫn chạy.

Nếu đặt `HTTP_PORT=8080`, địa chỉ sẽ là `http://localhost:8080` và
`PUBLIC_ORIGIN` cũng phải là `http://localhost:8080`.

## 4. HTTPS và domain

Production phải dùng HTTPS. Cách đơn giản là đặt Caddy, Traefik hoặc Nginx của
host ở phía trước cổng `HTTP_PORT`, cấp chứng chỉ TLS và chuyển tiếp toàn bộ
request (bao gồm WebSocket) vào frontend. Sau đó cập nhật `.env`:

```env
PUBLIC_ORIGIN=https://shop.example.com
```

Rồi tạo lại container API để nhận cấu hình mới:

```bash
docker compose -f docker-compose.prod.yml up -d --build api frontend
```

Không cần public API bằng một domain riêng: Nginx trong container đã chuyển tiếp
`/api`, `/hubs`, `/hangfire` và `/health` tới API. Cách này cũng giữ cookie giỏ
hàng và SignalR trên cùng origin.

## 5. Kibana (tùy chọn)

Kibana không chạy mặc định. Khởi động profile quan sát hệ thống bằng:

```bash
docker compose -f docker-compose.prod.yml --profile observability up -d
```

Kibana chỉ bind vào `127.0.0.1:5601`. Hãy dùng SSH tunnel hoặc reverse proxy có
xác thực nếu cần truy cập từ xa; không nên mở thẳng cổng này ra Internet.

## 6. Cập nhật và vận hành

Sau khi pull code mới:

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f
```

Các lệnh thường dùng:

```bash
# Xem log tất cả dịch vụ
docker compose -f docker-compose.prod.yml logs -f

# Khởi động lại
docker compose -f docker-compose.prod.yml restart

# Dừng app nhưng giữ dữ liệu
docker compose -f docker-compose.prod.yml down

# Xem dung lượng volume
docker system df -v
```

Không chạy `down -v` trên production vì tùy chọn `-v` xóa dữ liệu SQL Server,
Redis và Elasticsearch. Cần sao lưu volume/database trước mỗi thay đổi lớn.

## 7. Lỗi thường gặp

- `sql is unhealthy`: kiểm tra độ mạnh của `MSSQL_SA_PASSWORD` và log bằng
  `docker compose -f docker-compose.prod.yml logs sql`.
- Elasticsearch thoát với lỗi mmap: cấu hình `vm.max_map_count` như mục 1.
- Trình duyệt báo CORS: kiểm tra `PUBLIC_ORIGIN` khớp chính xác URL public,
  gồm cả giao thức và cổng, không có `/` ở cuối.
- Ảnh upload/email/thanh toán không hoạt động: điền Cloudinary, SMTP hoặc SePay
  trong `.env`, sau đó chạy lại `docker compose ... up -d api`.
- Port 80 đã được dùng: đổi `HTTP_PORT`, hoặc để reverse proxy hiện tại chuyển
  tiếp tới một cổng khác như `8080`.
