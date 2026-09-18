# README triển khai production — Restore System

Tài liệu này là runbook triển khai Restore System lên **một AWS EC2 chạy Ubuntu
24.04 LTS x86_64** bằng Docker Compose. Luồng mặc định dùng Elastic IP, DNS và
Caddy trên host để cấp HTTPS; bên trong EC2, Nginx container phục vụ React và
proxy tới API. Nội dung được đối chiếu với `docker-compose.prod.yml`, hai
Dockerfile, cấu hình Nginx và mã khởi động API.

## 1. Kết quả sau khi deploy

Stack production mặc định có 5 container:

| Container | Vai trò | Public ra Internet? | Dữ liệu bền vững |
|---|---|---:|---|
| `frontend` | Nginx phục vụ React SPA và reverse proxy | Chỉ bind loopback trên EC2 | Không |
| `api` | ASP.NET Core API, SignalR và Hangfire server | Không | Không |
| `sql` | SQL Server lưu dữ liệu nghiệp vụ, Identity và Hangfire | Không | `sql_data` |
| `redis` | Cache | Không | `redis_data` |
| `elasticsearch` | Lưu và truy vấn application log | Không | `elasticsearch_data` |

Kibana là container thứ sáu, chỉ chạy khi bật profile `observability` và chỉ
bind vào loopback của host.

```text
Route 53 / DNS
   │ A record → Elastic IP
   ▼
AWS Security Group (22 giới hạn, 80/443 public)
   │
   ▼
EC2: Caddy :80/:443 (TLS tự động)
   │ reverse_proxy 127.0.0.1:8080
   ▼
frontend:80 (Nginx container) ─► React SPA / assets
   │
   ├── /api/* ────────────► api:8080
   ├── /hubs/* ───────────► api:8080 (WebSocket/SignalR)
   ├── /hangfire ─────────► api:8080
   └── /health* ──────────► api:8080
                                │
                                ├── sql:1433
                                ├── redis:6379
                                └── elasticsearch:9200
```

### Vì sao dùng hai lớp proxy?

- Caddy trên EC2 chịu trách nhiệm certificate, gia hạn HTTPS và redirect HTTP;
  không phải đưa private key TLS vào container/repository.
- Nginx container giữ nguyên trách nhiệm đặc thù của app: SPA fallback, cache
  static asset, giới hạn upload và proxy `/api`, `/hubs`, `/hangfire`, `/health`.
- Frontend chỉ bind `127.0.0.1:8080`, vì vậy không thể truy cập trực tiếp từ
  Internet ngay cả khi Security Group vô tình được mở rộng.
- Trình duyệt vẫn dùng một origin cho giao diện, API, cookie và SignalR nên giảm
  lỗi CORS và mixed content.
- API, SQL Server, Redis và Elasticsearch không có `ports` trong Compose nên
  không bị mở trực tiếp trên host.

Nếu đã có Application Load Balancer và ACM, có thể kết thúc TLS tại ALB thay cho
Caddy. Khi đó EC2 chỉ cho phép port ứng dụng từ Security Group của ALB; phần còn
lại của Compose không thay đổi.

## 2. Nguồn cấu hình và trách nhiệm của từng file

| File | Trách nhiệm |
|---|---|
| `docker-compose.prod.yml` | Ghép service, network nội bộ, volume, health check, biến môi trường và thứ tự khởi động |
| `API/Dockerfile` | Restore/publish API bằng .NET SDK 10 rồi chạy trên ASP.NET Runtime 10 |
| `Client/Dockerfile` | Build React bằng Node 24 rồi chỉ chép artifact sang Nginx 1.28 |
| `Client/nginx.conf` | Phục vụ SPA và proxy các route backend |
| `.env.example` | Danh sách biến production mẫu, không chứa secret thật |
| `.env` | Giá trị thực được Compose đọc ở lúc deploy; Git và Docker build context đều bỏ qua |

Hai Dockerfile đều là multi-stage build. Image cuối không chứa toàn bộ SDK,
source code hay `node_modules`, nhờ vậy nhỏ hơn và giảm bề mặt tấn công. Các file
project được copy trước source ở image API để Docker có thể cache bước
`dotnet restore`; frontend copy `package-lock.json` và chạy `npm ci` để cài đúng
dependency đã khóa.

`VITE_API_BASE_URL=/api` là build argument, tức giá trị được đóng vào bundle
frontend khi build. Đường dẫn tương đối `/api` làm frontend gọi đúng origin đang
phục vụ nó thay vì hard-code domain của API.

## 3. Tạo hạ tầng AWS

### 3.1. Tạo EC2

Cấu hình khuyến nghị cho stack một máy:

| Mục | Giá trị khuyến nghị | Lý do |
|---|---|---|
| Region | Gần người dùng, ví dụ Singapore `ap-southeast-1` | Giảm độ trễ; tất cả tài nguyên liên quan nên cùng Region |
| AMI | Ubuntu Server 24.04 LTS, `x86_64` | Docker hỗ trợ chính thức; SQL Server container cần AMD64 |
| Instance | `t3.large` hoặc tương đương, 2 vCPU/8 GiB | SQL Server, Elasticsearch và bước build cần nhiều RAM |
| EBS | `gp3`, tối thiểu 40–60 GiB, bật encryption | Chứa Docker image và ba named volume |
| Key pair | ED25519 hoặc RSA | Dùng SSH khi chưa cấu hình Session Manager |

`t3.medium` 4 GiB có thể thiếu bộ nhớ lúc vừa build frontend vừa chạy SQL Server
và Elasticsearch. Nếu dùng instance nhỏ để tiết kiệm, phải theo dõi memory/OOM
và cân nhắc build image trong CI thay vì trên EC2.

Không lưu dữ liệu production trên instance store. Named volume Docker của stack
nằm dưới `/var/lib/docker`, do đó chúng tồn tại trên EBS của EC2. Nếu dùng root
EBS cho dữ liệu, kiểm tra tùy chọn **Delete on termination** trước khi terminate
instance; stop/start không xóa EBS nhưng terminate có thể xóa volume theo cấu
hình này.

### 3.2. Security Group

Inbound rules tối thiểu:

| Port | Source | Mục đích |
|---:|---|---|
| `22/TCP` | IP quản trị dạng `<your-ip>/32` | SSH; không mở `0.0.0.0/0` |
| `80/TCP` | `0.0.0.0/0` và `::/0` nếu dùng IPv6 | HTTP challenge và redirect sang HTTPS |
| `443/TCP` | `0.0.0.0/0` và `::/0` nếu dùng IPv6 | HTTPS public |

Không tạo inbound rule cho `8080`, `1433`, `5601`, `6379`, `9200` hoặc `9300`.
Security Group là lớp mạng AWS chính; Docker cũng chỉ bind frontend vào loopback
theo cấu hình ở phần dưới. Nếu dùng AWS Systems Manager Session Manager, có thể
không mở port 22 sau khi đã cấu hình IAM role/SSM Agent và kiểm tra kết nối.

### 3.3. Elastic IP và DNS

1. Allocate một Elastic IP trong cùng Region rồi associate với EC2.
2. Trong Route 53 hoặc DNS provider, tạo bản ghi `A` của domain/subdomain trỏ tới
   Elastic IP, ví dụ `shop.example.com`.
3. Chờ DNS resolve đúng trước khi bật Caddy, vì CA phải gọi được port 80/443 để
   cấp certificate.

Elastic IP giữ địa chỉ ổn định qua stop/start và có thể remap sang instance khác.
AWS tính phí public IPv4, kể cả Elastic IP đang dùng, nên giải phóng địa chỉ khi
không còn sử dụng.

## 4. Chuẩn bị EC2

### 4.1. Kết nối SSH

```bash
chmod 400 restore-system.pem
ssh -i restore-system.pem ubuntu@<elastic-ip-or-domain>
```

User mặc định của Ubuntu AMI là `ubuntu`. Chỉ dùng key pair, không đưa file
`.pem` vào repository hoặc chép nó lên EC2.

### 4.2. Cập nhật hệ điều hành và cài công cụ

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y ca-certificates curl git gnupg
```

Reboot nếu hệ thống báo cần khởi động lại, sau đó SSH vào lại.

### 4.3. Cài Docker Engine và Compose plugin

Dùng repository chính thức của Docker thay vì convenience script:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME:-$VERSION_CODENAME} stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Đăng xuất rồi SSH lại để group mới có hiệu lực, sau đó kiểm tra:

```bash
docker version
docker compose version
```

Thành viên group `docker` có quyền gần tương đương root; chỉ cấp cho tài khoản
quản trị tin cậy.

### 4.4. Cấu hình kernel cho Elasticsearch

```bash
echo 'vm.max_map_count=262144' | sudo tee /etc/sysctl.d/99-elasticsearch.conf
sudo sysctl --system
sysctl vm.max_map_count
```

Elasticsearch dùng nhiều vùng memory map cho index; giới hạn mặc định thấp có
thể làm container thoát lúc khởi động.

### 4.5. Lấy source code

```bash
sudo mkdir -p /opt/restore-system
sudo chown "$USER":"$USER" /opt/restore-system
git clone <repository-url> /opt/restore-system
cd /opt/restore-system
```

Với repository private, dùng deploy key chỉ có quyền đọc hoặc credential helper;
không ghi personal access token trực tiếp vào URL Git hay shell history.

## 5. Chuẩn bị biến môi trường trên EC2

Tại `/opt/restore-system`:

```bash
cp .env.example .env
chmod 600 .env
nano .env
```

Tối thiểu phải thay:

```env
MSSQL_SA_PASSWORD=<mật-khẩu-SQL-mạnh>
JWT_KEY=<chuỗi-ngẫu-nhiên-dài-tối-thiểu-32-ký-tự>
PUBLIC_ORIGIN=https://shop.example.com
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=8080
```

- `HTTP_BIND_ADDRESS=127.0.0.1` ngăn truy cập trực tiếp Nginx container từ mạng.
- `HTTP_PORT=8080` dành port 80/443 của host cho Caddy.
- `PUBLIC_ORIGIN` phải là URL HTTPS bên ngoài, không phải `localhost`, Elastic IP
  hoặc `http://frontend`.
- Có thể sinh JWT key bằng `openssl rand -base64 48`. Không dùng secret mẫu.

### Ý nghĩa các nhóm biến

| Nhóm | Bắt buộc | Lý do |
|---|---:|---|
| `MSSQL_SA_PASSWORD` | Có | Khởi tạo SQL Server và connection string cho API |
| `JWT_KEY`, `JWT_ISSUER`, `JWT_AUDIENCE` | Có | Ký và kiểm tra access token |
| `PUBLIC_ORIGIN` | Có | CORS và URL trong email; không có dấu `/` cuối |
| `HTTP_BIND_ADDRESS`, `HTTP_PORT` | Có | Chỉ đưa Nginx container ra loopback port 8080 |
| `SEPAY_*` | Khi dùng thanh toán | Tạo VietQR và xác thực webhook |
| `CLOUDINARY_*` | Khi upload ảnh | Lưu ảnh bên ngoài container |
| `SMTP_*` | Khi gửi email | Quên mật khẩu, liên hệ và thông báo |
| `KIBANA_PORT` | Khi bật Kibana | Port loopback dùng cho SSH tunnel |

Compose dùng `${VAR:?message}` cho SQL password và JWT key nên dừng sớm nếu
thiếu. `.env` không được commit. Người có quyền Docker vẫn có thể xem environment
của container, vì vậy phải giới hạn quyền SSH/Docker; nếu cần mức bảo vệ cao hơn,
dùng AWS Systems Manager Parameter Store hoặc Secrets Manager qua bước render
`.env` trong pipeline triển khai.

## 6. Kiểm tra cấu hình trước khi chạy

```bash
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml config --services
ss -lnt | grep -E ':80|:443|:8080' || true
```

Hai lệnh Compose parse YAML, nội suy `.env` và phát hiện biến bắt buộc bị thiếu.
Không đăng output đầy đủ của `docker compose config` vì nội dung đã render có thể
chứa secret. Lệnh `ss` giúp phát hiện port bị chiếm trước khi start.

Xác nhận thêm:

- `dig +short shop.example.com` trả về Elastic IP.
- Security Group không public các port dữ liệu và port 8080.
- `PUBLIC_ORIGIN` khớp chính xác domain HTTPS.
- EBS còn đủ dung lượng bằng `df -h`.

## 7. Build và khởi động lần đầu

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Lệnh trên thực hiện các pha sau.

### Pha 1 — Build API

1. Image SDK .NET 10 copy các `.csproj` và `Directory.Build.props`.
2. `dotnet restore` tải NuGet dependency.
3. Source API được copy và `dotnet publish -c Release` tạo artifact tại
   `/app/publish`.
4. Artifact được copy sang image ASP.NET Runtime 10; container chạy
   `dotnet RestoreAPI.dll` trên port 8080.

Tách restore khỏi copy source giúp thay đổi code thông thường tái sử dụng cache
dependency. Dùng runtime image ở pha cuối tránh mang compiler/SDK vào production.

### Pha 2 — Build frontend

1. Image Node 24 chạy `npm ci` từ lockfile.
2. `npm run build` chạy TypeScript build và Vite, với API base URL là `/api`.
3. Chỉ thư mục `dist` được copy sang image Nginx.
4. Ảnh sản phẩm seed từ API `wwwroot/images` cũng được copy vào Nginx để các URL
   `/images/products/...` vẫn hoạt động cùng origin.

Vì frontend là static bundle, thay `VITE_API_BASE_URL` bắt buộc phải build lại
frontend; restart container đơn thuần không thay đổi bundle.

### Pha 3 — Khởi động hạ tầng có health check

Compose tạo network và ba named volume, rồi khởi động SQL Server, Redis và
Elasticsearch. Các health check lần lượt kiểm tra `SELECT 1`, `redis-cli ping`
và Elasticsearch cluster health.

API có `depends_on: condition: service_healthy`, nên chỉ được start sau khi cả ba
dependency vượt qua health check. Điều này tránh API migrate database khi SQL
Server mới mở process nhưng chưa sẵn sàng nhận kết nối.

### Pha 4 — API khởi tạo ứng dụng

Khi API start:

1. Đọc connection string/secret do Compose truyền vào.
2. Kết nối Redis, đăng ký SQL Server, Identity/JWT, Hangfire, Elasticsearch,
   SePay, Cloudinary và SMTP.
3. Chạy `DbInitializer.InitializeAsync()`; phương thức này gọi
   `Database.MigrateAsync()` rồi seed role, user và sản phẩm mẫu nếu cần.
4. Khởi động Hangfire server và đăng ký recurring jobs.
5. Map controller, `/health`, `/health/ready`, `/hangfire` và
   `/hubs/products`.

Migration tự động thuận tiện cho một instance. Nếu sau này scale nhiều API
replica, nên tách migration thành một release job duy nhất để tránh nhiều
instance cùng migrate.

### Pha 5 — Nginx nhận traffic

Frontend được start sau API theo thứ tự Compose. `depends_on` ở frontend chỉ đảm
bảo API container đã được start, không khẳng định API đã healthy; vì vậy kiểm tra
sau deploy vẫn là bước bắt buộc.

## 8. Luồng request khi hệ thống đang chạy

1. Trình duyệt tải `/` từ Nginx. Với route SPA như `/items/1`, `try_files`
   fallback về `index.html` để React Router xử lý.
2. File dưới `/assets/` được cache một năm với `immutable` vì Vite tạo tên file
   có hash.
3. RTK Query gọi `/api/...`; Nginx chuyển request tới `http://api:8080` và giữ
   `Host`, IP client, protocol gốc.
4. API đọc `X-Forwarded-Proto` trước `UseHttpsRedirection`, nên biết request public
   ban đầu là HTTPS dù hop nội bộ từ Nginx sang API dùng HTTP.
5. SignalR dùng `/hubs/products`; Nginx chuyển `Upgrade`/`Connection` để nâng cấp
   WebSocket và tăng read timeout lên 60 phút.
6. `/hangfire` và `/health*` cũng được proxy tới API. Ở Production, Hangfire
   dashboard yêu cầu quyền Admin.

`PUBLIC_ORIGIN` vẫn phải đúng dù ứng dụng dùng same-origin, vì API cấu hình CORS
với credentials và email service dùng URL public. Reverse proxy TLS bên ngoài
cũng phải truyền `X-Forwarded-Proto` để chuỗi proxy giữ đúng scheme.

## 9. Kiểm tra nội bộ sau khi start Compose

Theo dõi trạng thái và log:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=200 api
docker compose -f docker-compose.prod.yml logs --tail=100 frontend
docker compose -f docker-compose.prod.yml port frontend 80
```

Kiểm tra từ chính máy chủ:

```bash
curl -i http://127.0.0.1:8080/health
curl -i http://127.0.0.1:8080/health/ready
curl -I http://127.0.0.1:8080/
```

`docker compose port frontend 80` phải hiển thị `127.0.0.1:8080`. Nếu là
`0.0.0.0:8080`, sửa `HTTP_BIND_ADDRESS` rồi recreate frontend trước khi tiếp tục.

Checklist chức năng tối thiểu:

- Trang chủ và một deep link React đều trả về được giao diện.
- Đăng nhập và một API request thành công.
- Ảnh sản phẩm seed tải được từ `/images/products/...`.
- SignalR kết nối được, không lỗi WebSocket ở reverse proxy.
- `/health/ready` trả JSON để biết chính xác check nào lỗi.
- Nếu dùng thật: thử upload Cloudinary, email, tạo QR và webhook SePay ở môi
  trường staging trước production.

`/health` chạy tất cả health check nhưng response mặc định chỉ thể hiện trạng
thái tổng. `/health/ready` trả chi tiết JSON cho SQL Server, Hangfire, SePay,
Redis; Elasticsearch hiện được kiểm tra ở `/health` nhưng không nằm trong
predicate của `/health/ready`. Khi SePay chưa cấu hình, health tổng có thể báo
`Unhealthy` dù web và các chức năng không liên quan vẫn chạy.

## 10. Cấu hình domain và HTTPS bằng Caddy

### 10.1. Cài Caddy trên EC2

Dùng package repository chính thức để Caddy chạy dưới dạng systemd service:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

### 10.2. Tạo Caddyfile

Mở file:

```bash
sudoedit /etc/caddy/Caddyfile
```

Thay nội dung bằng domain thật:

```caddyfile
shop.example.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:8080
}
```

Caddy tự xin/gia hạn certificate và redirect HTTP sang HTTPS khi DNS đúng và
Security Group cho phép port 80/443. `reverse_proxy` hỗ trợ WebSocket, đồng thời
truyền thông tin forwarded để Nginx/API nhận biết request public dùng HTTPS.

Kiểm tra rồi reload:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo systemctl status caddy --no-pager
sudo journalctl -u caddy --since '10 minutes ago' --no-pager
```

### 10.3. Kiểm tra từ Internet

```bash
curl -I https://shop.example.com/
curl -i https://shop.example.com/health
curl -i https://shop.example.com/health/ready
```

Kiểm tra thêm trên trình duyệt: deep link React, đăng nhập, ảnh sản phẩm và kết
nối SignalR/WebSocket. Webhook SePay production phải trỏ tới:

```text
https://shop.example.com/api/payments/sepay-webhook
```

Không cần domain API riêng. Toàn bộ route backend đi qua Caddy rồi Nginx và vẫn
cùng origin với frontend.

## 11. Kibana tùy chọn

```bash
docker compose -f docker-compose.prod.yml --profile observability up -d
```

Kibana bind vào `127.0.0.1:${KIBANA_PORT:-5601}`, do đó máy ngoài không truy cập
trực tiếp được. Dùng SSH tunnel hoặc reverse proxy có xác thực nếu cần xem từ
xa; không mở thẳng Kibana không bảo vệ ra Internet. Elasticsearch trong cấu hình
hiện tại đã tắt security và tuyệt đối không nên publish port 9200.

Ví dụ mở SSH tunnel từ máy cá nhân:

```bash
ssh -i restore-system.pem -L 5601:127.0.0.1:5601 ubuntu@shop.example.com
```

Sau đó mở `http://localhost:5601` trên máy cá nhân.

## 12. Cập nhật phiên bản trên EC2

Trước khi cập nhật có migration hoặc thay đổi lớn, sao lưu database và ghi lại
commit/image đang chạy. Sau đó:

```bash
cd /opt/restore-system
git pull --ff-only
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=200 api
curl -i https://shop.example.com/health/ready
```

`up -d --build` chỉ thay container/image cần thiết và giữ named volume. Không cần
`down` trước vì việc đó tạo downtime không cần thiết. Chỉ chạy `docker image
prune` sau khi đã xác minh bản mới ổn định; giữ image cũ giúp rollback ứng dụng
nhanh hơn.

Sau khi kernel, Docker hoặc package hệ thống được cập nhật, lên lịch reboot có
kiểm soát và xác nhận stack tự trở lại nhờ `restart: unless-stopped`:

```bash
sudo reboot
```

## 13. Backup và rollback trên AWS

Ba named volume giữ dữ liệu khi container bị recreate hoặc khi chạy
`docker compose down`. Tuy nhiên volume không thay thế backup.

- SQL Server là nguồn dữ liệu nghiệp vụ chính; ưu tiên backup database theo cơ
  chế SQL Server và kiểm thử restore định kỳ.
- Redis chỉ là cache nhưng đang bật AOF; mất volume chủ yếu làm mất cache/trạng
  thái tạm, API có cơ chế fallback về database.
- Elasticsearch giữ log; đặt retention/snapshot theo yêu cầu vận hành.
- Ảnh upload nằm ở Cloudinary, không nằm trong container frontend/API.

Trên AWS, cấu hình thêm:

- AWS Backup hoặc Data Lifecycle Manager để tạo EBS snapshot tự động, có retention
  và cảnh báo khi backup lỗi.
- Snapshot/backup trước mỗi release có migration lớn.
- Cảnh báo EC2 status check, CPU và dung lượng đĩa; memory/disk cần CloudWatch
  Agent nếu muốn metric chi tiết.

EBS snapshot bảo vệ toàn bộ Docker data trên volume, nhưng snapshot khi database
đang ghi chỉ nên xem là lớp khôi phục hạ tầng. Vẫn cần SQL Server native backup
và phải thử quy trình restore. Snapshot EBS mặc định là incremental; dữ liệu
không được AWS tự động backup nếu chưa tạo policy.

Rollback code: checkout/tag lại phiên bản trước và chạy lại `up -d --build`.
Rollback database phải được thiết kế theo từng migration. Vì API tự migrate khi
start, chỉ rollback code có thể thất bại nếu schema mới không tương thích; không
tự động chạy migration `Down` trên production khi chưa có backup và kế hoạch
khôi phục đã kiểm thử.

Tuyệt đối không chạy lệnh sau trên production nếu muốn giữ dữ liệu:

```bash
docker compose -f docker-compose.prod.yml down -v
```

Tùy chọn `-v` xóa cả `sql_data`, `redis_data` và `elasticsearch_data`.

## 14. Lệnh vận hành thường dùng

```bash
# Xem container và health/status
docker compose -f docker-compose.prod.yml ps

# Theo dõi toàn bộ log
docker compose -f docker-compose.prod.yml logs -f

# Theo dõi riêng API
docker compose -f docker-compose.prod.yml logs -f api

# Recreate API sau khi đổi biến môi trường
docker compose -f docker-compose.prod.yml up -d --force-recreate api

# Restart mà không build lại
docker compose -f docker-compose.prod.yml restart

# Dừng stack nhưng giữ volume
docker compose -f docker-compose.prod.yml down

# Xem dung lượng image/volume
docker system df -v
```

## 15. Chẩn đoán lỗi thường gặp

### `sql is unhealthy`

Kiểm tra `MSSQL_SA_PASSWORD` đáp ứng chính sách mật khẩu và xem:

```bash
docker compose -f docker-compose.prod.yml logs sql
```

API không start khi SQL chưa healthy vì còn phải migrate và Hangfire cũng dùng
chính database này.

### Elasticsearch thoát hoặc health check thất bại

Xem log Elasticsearch, kiểm tra RAM và `vm.max_map_count`. Heap hiện được cố
định `512m`; host thiếu RAM có thể bị OOM khi chạy cùng SQL Server.

### Trình duyệt báo CORS hoặc redirect sai HTTP/HTTPS

Kiểm tra `PUBLIC_ORIGIN` có đúng scheme, hostname và port, không có dấu `/` cuối.
Kiểm tra mọi lớp reverse proxy có truyền `X-Forwarded-Proto`. Recreate API sau
khi sửa `.env`.

### API chạy nhưng frontend gọi sai địa chỉ

Kiểm tra bundle được build với `VITE_API_BASE_URL=/api`. Đây là biến build-time,
vì vậy phải build lại frontend, không chỉ restart.

### SignalR không kết nối

Reverse proxy ngoài Docker phải hỗ trợ WebSocket và forward header Upgrade.
Kiểm tra path `/hubs/products`, JWT và log Nginx/API.

### Upload, email hoặc thanh toán không hoạt động

Điền đúng nhóm Cloudinary, SMTP hoặc SePay trong `.env`, recreate API và kiểm tra
health/log. Các trường này để trống không đồng nghĩa tính năng đã sẵn sàng.

### Port 80 đã được dùng

Trên EC2, Caddy phải giữ port 80/443; container frontend phải dùng
`HTTP_BIND_ADDRESS=127.0.0.1` và `HTTP_PORT=8080`. Dùng `sudo ss -lntp` để tìm
process đang giữ port. Không đổi `PUBLIC_ORIGIN` sang port 8080 vì URL public vẫn
là domain HTTPS ở port 443.

### Caddy không cấp được certificate

Kiểm tra bản ghi DNS đã trả đúng Elastic IP, Security Group mở cả 80 và 443,
không có AAAA record trỏ sai IPv6, rồi xem `journalctl -u caddy`. Không thử reload
liên tục vì CA có rate limit.

### EC2 hết dung lượng

Kiểm tra `df -h`, `docker system df -v` và log/container image cũ. Có thể tăng
kích thước EBS rồi mở rộng filesystem. Chỉ prune image sau khi bản deploy mới đã
được xác minh; không xóa volume để giải phóng dung lượng.

## 16. Giới hạn của kiến trúc một EC2

- Image được build trên máy deploy, chưa có CI/CD hoặc immutable image registry.
- Secret đi qua `.env`, chưa tích hợp secret manager.
- API tự chạy migration lúc start, phù hợp một replica hơn là rolling deployment
  nhiều replica.
- Chưa có health check riêng cho container `api` và `frontend` trong Compose;
  việc xác minh sau deploy hiện dựa vào endpoint và lệnh kiểm tra thủ công.
- Caddy, app và database cùng nằm trên một EC2; instance/AZ là single point of
  failure và lúc reboot sẽ có downtime.
- Named volume nằm trên một EBS/host, chưa phải kiến trúc high availability.

Các giới hạn này không ngăn triển khai một máy chủ, nhưng cần được xử lý trước
khi yêu cầu zero-downtime, nhiều replica hoặc khả năng khôi phục đa AZ. Hướng
nâng cấp tự nhiên là ALB + ACM, image registry/CI, API chạy nhiều replica, RDS
cho database và dịch vụ managed tương ứng cho cache/log.

## 17. Tài liệu tham khảo chính thức

- [AWS: Security Group rules cho web server và SSH](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-group-rules-reference.html)
- [AWS: Elastic IP](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html)
- [AWS: Route 53 trỏ domain tới EC2](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-ec2-instance.html)
- [AWS: Backup cho Amazon EBS](https://docs.aws.amazon.com/ebs/latest/userguide/snapshot-lifecycle-backup.html)
- [Docker: cài Docker Engine trên Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Caddy: cài package chính thức trên Ubuntu](https://caddyserver.com/docs/install#debian-ubuntu-raspbian)
