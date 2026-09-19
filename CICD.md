# CI/CD lên EC2

Pipeline: GitHub Actions → GHCR → SSH → Docker Compose trên EC2 Ubuntu x86_64.
Pull request vào `main` chạy lint và build cả hai Docker image (bao gồm compile
.NET và TypeScript). Push vào `main` hoặc Run workflow trên `main` sẽ build,
publish image theo commit SHA rồi deploy. Pipeline chưa có bộ unit/integration test.

## 1. Chuẩn bị EC2 một lần

Làm theo [DEPLOYMENT.md](DEPLOYMENT.md) để cài Docker Engine, Compose plugin,
cấu hình `vm.max_map_count`, domain và HTTPS bằng Caddy. User SSH cần chạy được
`docker` không cần sudo. Script dùng Bash và `flock` (gói `util-linux`). Không cần
clone source hoặc cài Node/.NET trên EC2.

```bash
mkdir -p ~/Vmart/releases
chmod 700 ~/Vmart
# File này có thể là .env production bạn đang dùng; bảo đảm nó nằm đúng đường dẫn sau.
nano ~/Vmart/.env
chmod 600 ~/Vmart/.env
```

Đặt `HTTP_BIND_ADDRESS=127.0.0.1`, `HTTP_PORT=8080`,
`PUBLIC_ORIGIN=https://<domain>` khi dùng Caddy. Thay mật khẩu SQL, JWT và
cấu hình các tích hợp cần dùng. `.env` chỉ nằm trên EC2, không đưa vào GitHub.
Nếu secret có ký tự `$`, dùng giá trị single-quoted trong `.env` để tránh nội suy.

Với GHCR private, đăng nhập **bằng cùng user SSH** bằng PAT classic có
`read:packages` và quyền đọc hai package (authorize SSO nếu tổ chức yêu cầu):

```bash
read -rsp 'GHCR read token: ' GHCR_TOKEN; echo
printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
unset GHCR_TOKEN
```

GitHub Actions dùng `GITHUB_TOKEN` để publish; không cần PAT ghi package.
EC2 cần outbound HTTPS để pull GHCR và các image hạ tầng.

## 2. Cấu hình GitHub

Tạo Environment **production** trong Settings → Environments. Thêm secrets:

| Secret | Giá trị |
|---|---|
| `EC2_HOST` | Elastic IP hoặc hostname của EC2, không có `https://` |
| `EC2_USER` | Thường là `ubuntu` |
| `EC2_SSH_KEY` | Toàn bộ private key OpenSSH/PEM, public key tương ứng có trong `~/.ssh/authorized_keys` trên EC2 |
| `EC2_KNOWN_HOSTS` | Dòng known_hosts cho hostname/IP ở trên, đã xác minh fingerprint qua kênh tin cậy |

Lấy fingerprint trực tiếp qua EC2 console/SSM hoặc phiên SSH đã tin cậy:

```bash
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Trên máy quản trị, lấy `ssh-keyscan -t ed25519 <EC2_HOST>`, kiểm tra fingerprint
bằng `ssh-keygen -lf <file>` rồi lưu dòng host key vào `EC2_KNOWN_HOSTS`.
Workflow bật kiểm tra host key nghiêm ngặt.

Runner phải kết nối được port 22. Runner `ubuntu-latest` có IP thay đổi, nên
rule chỉ cho IP máy cá nhân sẽ chặn deploy. Dùng GitHub runner có static egress
và giới hạn Security Group tới IP đó (sửa `deploy.runs-on` theo runner của bạn),
hoặc runner riêng trong mạng có đường tới EC2. Không mở SSH cho toàn Internet.
Workflow mặc định dùng SSH port 22.

Bật Actions và quyền publish packages theo chính sách repository/organization.
Nếu package đã tồn tại, cấp Actions access của repository cho cả hai package.
Có thể cấu hình required reviewers cho Environment production nếu cần duyệt deploy.

## 3. Chạy và kiểm tra

Push các file cấu hình này lên `main`, xem Actions → **CI/CD EC2**.
Hai image là `ghcr.io/<owner>/<repo>-api:<sha>` và
`ghcr.io/<owner>/<repo>-frontend:<sha>` (owner/repo chuyển thành chữ thường).

Mỗi lần deploy tạo `~/Vmart/releases/<sha>-<run-id>-<attempt>`.
Script pull image trước, chờ database/cache/log service, tạo lại API và Nginx,
rồi chờ `/` và `/health/ready` trả thành công. Chỉ sau đó mới cập nhật symlink
`~/Vmart/current`. Compose luôn dùng project `restore-system` để giữ
nguyên named volumes của cấu hình production hiện tại. Có gián đoạn ngắn khi
tạo lại container; đây không phải triển khai zero-downtime.

```bash
curl -f https://<domain>/health/ready
curl -I https://<domain>/
```

CI chỉ kiểm tra sức khỏe bên trong Nginx; kiểm tra HTTPS bên trên xác nhận thêm
DNS, Caddy và đường mạng công khai. Nếu deploy thất bại, workflow báo lỗi,
`current` vẫn trỏ tới bản thành công trước nhưng container có thể đã được thay.
Xem `docker ps` và `docker logs <container>` trên EC2 để chẩn đoán.

## 4. Quay lại bản trước

API tự chạy EF migration khi khởi động. Backup database trước thay đổi schema;
chỉ quay lại image nếu schema hiện tại tương thích với phiên bản cũ. Pipeline
không tự rollback database hoặc image khi deploy thất bại.

Chọn thư mục release thành công cần quay lại; `previous-release` ghi bản trước
deploy thành công gần nhất. Nếu deploy mới thất bại, `current` là bản thành công
gần nhất. Chạy bằng user SSH:

```bash
cd ~/Vmart/releases/<release-can-khoi-phuc>
set -a
source images.env
set +a
docker compose --project-name restore-system --env-file "$HOME/Vmart/.env" \
  -f docker-compose.prod.yml -f docker-compose.ec2.yml \
  up -d --no-build --force-recreate --wait --wait-timeout 360 api frontend
ln -sfn "$PWD" "$HOME/Vmart/current"
```

Không chạy rollback đồng thời với pipeline. Giữ image SHA cần rollback trong
GHCR; không xóa volume (`down -v`). Release thất bại chưa có `images.env`.

Tham khảo: [GitHub publish Docker images](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images),
[GHCR authentication](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry),
[Compose up và --wait](https://docs.docker.com/reference/cli/docker/compose/up/).
