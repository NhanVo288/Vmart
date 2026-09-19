# CI/CD lên EC2

Pipeline triển khai Restore System theo luồng GitHub Actions → GHCR → SSH → Docker
Compose trên EC2 Ubuntu x86_64. File workflow chính là `.github/workflows/ec2.yml`.

## 1. CI/CD hiện tại làm được gì?

### 1.1. Hành vi theo trigger

| Trigger | Validate | Build image | Push GHCR | Deploy EC2 |
|---|---:|---:|---:|---:|
| Pull request vào `main` | Có | Có | Không | Không |
| Push vào `main` | Có | Có | Có | Có |
| Run workflow trên `main` | Có | Có | Có | Có |
| Push vào branch khác | Không chạy | Không chạy | Không | Không |
| Run workflow trên branch khác | Có | Có | Không | Không |

`validate` phải thành công trước khi hai Docker image được build song song. `deploy` chỉ
chạy sau khi cả hai image build thành công và chỉ khi ref là `main`.

### 1.2. Luồng thực thi

```text
Validate
  ├─ npm ci + lint frontend
  ├─ kiểm tra Bash/ShellCheck cho deploy script
  └─ kiểm tra Docker Compose
       ↓
Build API + Frontend
  ├─ compile .NET trong Docker build
  ├─ compile TypeScript/Vite trong Docker build
  └─ push image gắn commit SHA lên GHCR (chỉ main)
       ↓
Deploy production
  ├─ nhận AWS credential ngắn hạn qua OIDC
  ├─ mở tạm SSH cho IP /32 của runner
  ├─ xác minh host key, upload release và chạy deploy script
  ├─ pull image, khởi động dependency, recreate API/frontend
  ├─ chờ `/` và `/health/ready` thành công
  └─ thu hồi rule SSH tạm
```

Mỗi release dùng image gắn đúng commit SHA và được lưu tại
`~/Vmart/releases/<sha>-<run-id>-<attempt>`. `flock` trên EC2 và GitHub concurrency ngăn
hai lần deploy cùng ref chạy chồng lên nhau.

### 1.3. Các giới hạn hiện tại

- Không tự tạo/cập nhật file `~/Vmart/.env`.
- Không tự backup hay rollback database; API tự chạy EF migration khi khởi động.
- Không tự rollback image khi deploy lỗi; rollback hiện là thao tác thủ công.
- Recreate API/frontend có thể gây gián đoạn ngắn, không phải zero-downtime deployment.

## 2. Chuẩn bị EC2 một lần

Làm theo [DEPLOYMENT.md](DEPLOYMENT.md) để cài Docker Engine, Compose plugin,
cấu hình `vm.max_map_count`, domain và HTTPS bằng Caddy. User SSH cần chạy được
`docker` không cần sudo. Script dùng Bash và `flock` (gói `util-linux`). Không cần
clone source hoặc cài Node/.NET trên EC2.

```bash
mkdir -p ~/Vmart/releases
chmod 700 ~/Vmart
nano ~/Vmart/.env
chmod 600 ~/Vmart/.env
```

### 2.1. Lấy các biến cho `.env` production

File này là cấu hình **runtime của ứng dụng**, chỉ lưu tại `~/Vmart/.env` trên EC2;
không thêm các giá trị này vào GitHub Secrets và không commit vào repository.

| Biến | Bắt buộc | Lấy hoặc tạo giá trị |
|---|---:|---|
| `MSSQL_SA_PASSWORD` | Có | Tự tạo trong password manager, nên dài từ 16 ký tự và có chữ hoa, chữ thường, số, ký tự đặc biệt. Đây là mật khẩu mới cho SQL Server trong container, không lấy từ AWS RDS. Không đổi tùy tiện sau khi volume SQL đã được khởi tạo. |
| `JWT_KEY` | Có | Tự sinh trên EC2 bằng `openssl rand -hex 48`; giữ ổn định vì đổi key sẽ làm các access token hiện tại hết hiệu lực. |
| `JWT_ISSUER` | Có | Định danh do dự án tự đặt, dùng `RestoreAPI`; không phải secret và không cần lấy từ nhà cung cấp nào. |
| `JWT_AUDIENCE` | Có | Định danh do dự án tự đặt, dùng `RestoreClient`; không phải secret. |
| `PUBLIC_ORIGIN` | Có | URL public đã cấu hình DNS/HTTPS, ví dụ `https://shop.example.com`; không có dấu `/` cuối. |
| `HTTP_BIND_ADDRESS` | Có | Đặt cố định `127.0.0.1` để chỉ Caddy trên EC2 truy cập được frontend. |
| `HTTP_PORT` | Có | Đặt `8080`; Caddy chiếm port 80/443 và reverse proxy tới port này. |
| `SEPAY_BANK_ACCOUNT_NUMBER` | Có với pipeline hiện tại | Số tài khoản nhận tiền đã liên kết trong SePay, lấy tại dashboard SePay → **Tài khoản ngân hàng**. Chỉ nhập số tài khoản, không có khoảng trắng. |
| `SEPAY_BANK_NAME` | Có với pipeline hiện tại | Mã/tên ngân hàng tương ứng với tài khoản dùng để tạo VietQR, ví dụ `MBBank`; dùng đúng giá trị ngân hàng đã liên kết trong SePay. |
| `SEPAY_ACCOUNT_HOLDER` | Nên có | Tên chủ tài khoản hiển thị cho người thanh toán, nhập đúng tên trên tài khoản ngân hàng. |
| `SEPAY_WEBHOOK_API_KEY` | Có với pipeline hiện tại | Tự sinh bằng `openssl rand -hex 32`, sau đó dùng **chính giá trị này** khi tạo webhook kiểu API Key trên SePay. Đây không phải API Token dùng để gọi SePay API. |
| `CLOUDINARY_CLOUD_NAME` | Khi dùng upload ảnh | Cloudinary Console → **Settings → API Keys** → Cloud name. |
| `CLOUDINARY_API_KEY` | Khi dùng upload ảnh | Cùng trang Cloudinary API Keys → API key. |
| `CLOUDINARY_API_SECRET` | Khi dùng upload ảnh | Cùng trang Cloudinary API Keys → API secret; không dùng Account Management Key và không để lộ ở frontend. |
| `SMTP_SERVER`, `SMTP_PORT` | Khi gửi email | Theo nhà cung cấp email. Với Gmail dùng `smtp.gmail.com` và `587`. |
| `SMTP_SENDER_EMAIL` | Khi gửi email | Địa chỉ xuất hiện ở trường From; với Gmail nên dùng chính mailbox đăng nhập hoặc địa chỉ Send mail as đã xác minh. |
| `SMTP_SENDER_NAME` | Không | Tên người gửi hiển thị, ví dụ `Restore System`. |
| `SMTP_USERNAME` | Khi gửi email | Tên đăng nhập SMTP; với Gmail là toàn bộ địa chỉ email. |
| `SMTP_PASSWORD` | Khi gửi email | Với Gmail: bật 2-Step Verification, tạo **App password** và dùng 16 ký tự đó, không dùng mật khẩu tài khoản Google. |
| `SMTP_ENABLE_SSL` | Khi gửi email | Đặt `true` cho Gmail/STARTTLS port 587. |
| `KIBANA_PORT` | Không | Giữ `5601`; chỉ được dùng khi khởi động Compose với profile `observability` và chỉ bind localhost. |

SePay nằm trong readiness check của phiên bản hiện tại, vì vậy thiếu
`SEPAY_BANK_ACCOUNT_NUMBER`, `SEPAY_BANK_NAME` hoặc `SEPAY_WEBHOOK_API_KEY` sẽ làm
`/health/ready` thất bại và pipeline không hoàn tất, dù phần thanh toán chưa được sử dụng.

Tạo hai secret độc lập trên EC2:

```bash
openssl rand -hex 48  # dùng cho JWT_KEY
openssl rand -hex 32  # dùng cho SEPAY_WEBHOOK_API_KEY
```

Ví dụ khung file production:

```dotenv
MSSQL_SA_PASSWORD='<mat-khau-SQL-manh>'
JWT_KEY=<ket-qua-openssl-rand-hex-48>
JWT_ISSUER=RestoreAPI
JWT_AUDIENCE=RestoreClient

PUBLIC_ORIGIN=https://shop.example.com
HTTP_BIND_ADDRESS=127.0.0.1
HTTP_PORT=8080

SEPAY_BANK_ACCOUNT_NUMBER=<so-tai-khoan>
SEPAY_BANK_NAME=<ma-ngan-hang>
SEPAY_ACCOUNT_HOLDER=<ten-chu-tai-khoan>
SEPAY_WEBHOOK_API_KEY=<ket-qua-openssl-rand-hex-32>

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_SENDER_EMAIL=<email-gui>
SMTP_SENDER_NAME=Restore System
SMTP_USERNAME=<email-dang-nhap>
SMTP_PASSWORD='<app-password>'
SMTP_ENABLE_SSL=true

KIBANA_PORT=5601
```

Nếu giá trị có `#`, khoảng trắng hoặc `$`, đặt toàn bộ giá trị trong dấu nháy đơn như
ví dụ trên để Compose không cắt comment hoặc nội suy biến. Không thêm khoảng trắng quanh
dấu `=`.

### 2.2. Cấu hình webhook SePay

Trong SePay, vào **Tích hợp → Webhooks → Thêm webhook** và cấu hình:

- URL: `https://<domain>/api/payments/sepay-webhook`.
- Sự kiện: **Có tiền vào** và chọn đúng tài khoản ngân hàng ở `.env`.
- Bảo mật: **API Key**; nhập đúng giá trị `SEPAY_WEBHOOK_API_KEY`.
- Content type: JSON; bật webhook sau khi domain đã có HTTPS.

Ứng dụng kiểm tra header `Authorization: Apikey <key>`. API key của webhook chỉ hiển thị
đầy đủ lúc tạo; nếu mất key, tạo key mới trên SePay rồi cập nhật `.env` và deploy lại.

Với GHCR private, đăng nhập **bằng cùng user SSH** bằng PAT classic có
`read:packages` và quyền đọc hai package (authorize SSO nếu tổ chức yêu cầu):

```bash
read -rsp 'GHCR read token: ' GHCR_TOKEN; echo
printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
unset GHCR_TOKEN
```

GitHub Actions dùng `GITHUB_TOKEN` để publish; không cần PAT ghi package.
EC2 cần outbound HTTPS để pull GHCR và các image hạ tầng.

## 3. Cấu hình GitHub Environment

Các biến phần này chỉ giúp GitHub Actions kết nối SSH tới EC2; chúng khác với file
`~/Vmart/.env` ở trên. Trong repository, vào **Settings → Environments → New
environment**, nhập chính xác `production`, chọn **Configure environment**, rồi tại
**Environment secrets** chọn **Add secret** cho từng secret dưới đây. Workflow dùng
`environment: production`, vì vậy thêm ở environment này thay vì tạo Environment tên khác.

| Secret | Giá trị |
|---|---|
| `EC2_HOST` | Elastic IP hoặc hostname của EC2, không có `https://` |
| `EC2_USER` | Thường là `ubuntu` |
| `EC2_SSH_KEY` | Toàn bộ private key OpenSSH/PEM, public key tương ứng có trong `~/.ssh/authorized_keys` trên EC2 |
| `EC2_KNOWN_HOSTS` | Dòng known_hosts cho hostname/IP ở trên, đã xác minh fingerprint qua kênh tin cậy |

Tại **Environment variables**, chọn **Add variable** và thêm:

| Variable | Giá trị |
|---|---|
| `AWS_REGION` | Region chứa EC2, ví dụ `ap-southeast-1` |
| `AWS_ROLE_ARN` | ARN của IAM role dành cho workflow, ví dụ `arn:aws:iam::123456789012:role/VmartGitHubDeploy` |
| `EC2_SECURITY_GROUP_ID` | ID của Security Group đang gắn với EC2, dạng `sg-...`; không dùng Security Group rule ID dạng `sgr-...` |

Role ARN, Region và Security Group ID không phải secret; workflow đọc chúng qua context
`vars`. Không tạo `AWS_ACCESS_KEY_ID` hoặc `AWS_SECRET_ACCESS_KEY` vì workflow dùng OIDC
để nhận AWS credential ngắn hạn.

### 3.1. `EC2_HOST`

Vào AWS Console → **EC2 → Instances**, chọn instance production rồi lấy **Elastic IP
address** hoặc **Public IPv4 DNS**. Nếu DNS của ứng dụng đã trỏ ổn định tới đúng EC2 thì
cũng có thể dùng hostname đó. Chỉ lưu hostname/IP, ví dụ `203.0.113.10` hoặc
`ec2-...compute.amazonaws.com`; không thêm `https://`, username, port hay dấu `/`.

Ưu tiên Elastic IP hoặc domain ổn định vì public IPv4 tự cấp có thể đổi sau stop/start.
Giá trị dùng ở đây phải trùng với host dùng để tạo `EC2_KNOWN_HOSTS`.

### 3.2. `EC2_USER`

Với Ubuntu 24.04 AMI trong tài liệu này, đặt `ubuntu`. Có thể xác nhận trong AWS Console:
chọn instance → **Connect → SSH client** và xem username trong lệnh SSH mẫu. Không đặt
`root` và không thêm phần `@host`.

### 3.3. `EC2_SSH_KEY`

Nên tạo một key deploy riêng thay vì tái sử dụng key quản trị. Trên máy quản trị chạy:

```bash
ssh-keygen -t ed25519 -C github-actions-production -f restore-system-deploy
```

Không đặt passphrase vì workflow chạy không tương tác. Qua phiên SSH/SSM đang tin cậy,
thêm **một dòng** trong `restore-system-deploy.pub` vào
`/home/ubuntu/.ssh/authorized_keys`, rồi kiểm tra key mới đăng nhập được:

```bash
ssh -i restore-system-deploy ubuntu@<EC2_HOST>
```

Giá trị secret `EC2_SSH_KEY` là **toàn bộ nội dung file private**
`restore-system-deploy`, gồm cả dòng `BEGIN OPENSSH PRIVATE KEY` và `END OPENSSH PRIVATE
KEY`; giữ nguyên các dòng xuống hàng. Không dùng file `.pub`. Nếu dùng key pair `.pem`
đã chọn lúc tạo EC2 thì dán toàn bộ file `.pem`; AWS không cho tải lại private key đã mất.

### 3.4. `EC2_KNOWN_HOSTS`

Không lấy host key chỉ bằng `ssh-keyscan` rồi tin ngay. Trước tiên lấy fingerprint trực
tiếp qua EC2 console/SSM hoặc một phiên SSH đã được xác minh:

```bash
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Sau đó trên máy quản trị chạy:

```bash
ssh-keyscan -t ed25519 <EC2_HOST> > ec2_known_hosts
ssh-keygen -lf ec2_known_hosts
```

So sánh chuỗi fingerprint `SHA256:...` của lệnh thứ hai với fingerprint lấy trực tiếp
trên EC2. Chỉ khi khớp, dán toàn bộ dòng không bắt đầu bằng `#` trong
`ec2_known_hosts` vào secret `EC2_KNOWN_HOSTS`. Workflow bật strict host-key checking,
nên thay EC2/host key hoặc đổi `EC2_HOST` thì phải tạo lại secret này.

`GITHUB_TOKEN` trong workflow do GitHub tự cấp cho mỗi run; không tự tạo secret cùng tên.
Các biến `API_IMAGE`, `FRONTEND_IMAGE`, `REPOSITORY` và commit SHA cũng do workflow/script
tự sinh, không cần khai báo thủ công.

## 4. AWS OIDC và SSH tạm thời

### 4.1. Vì sao dùng luồng này?

EC2 hiện chỉ cho phép SSH từ IP quản trị cố định `/32`, trong khi mỗi job
`ubuntu-latest` có thể chạy từ một IP public khác. Vì vậy mở SSH cho IP máy cá nhân vẫn
an toàn cho thao tác thủ công nhưng GitHub Actions sẽ bị `Connection timed out`.

Các cách đơn giản hơn đều có nhược điểm đáng kể:

| Cách | Vấn đề |
|---|---|
| Mở `22/TCP` cho `0.0.0.0/0` | EC2 bị dò quét và thử đăng nhập SSH liên tục từ Internet |
| Allowlist toàn bộ IP GitHub Actions | Dải IP lớn, thay đổi định kỳ và rộng hơn nhiều so với một runner cần deploy |
| Larger runner có static IP | Dễ allowlist nhưng phát sinh chi phí GitHub |
| Self-hosted runner | Cần thêm máy, cập nhật, giám sát và bảo vệ runner; không nên đặt runner có quyền cao trực tiếp trên EC2 production |

Luồng OIDC và rule `/32` tạm thời được chọn vì không cần thêm máy, không mở SSH thường
trực cho Internet và không lưu AWS access key dài hạn trong GitHub. Luồng thực tế:

```text
GitHub job trên main, Environment production
  → nhận AWS credential ngắn hạn qua OIDC
  → lấy public IPv4 của đúng runner hiện tại
  → thêm rule 22/TCP chỉ cho <runner-ip>/32
  → xác thực host key + SSH key, upload và deploy
  → thu hồi đúng rule vừa tạo, kể cả khi deploy thất bại
```

OIDC chỉ cấp hai quyền AWS tối thiểu để thêm/xóa ingress trên **một Security Group**;
nó không cấp quyền quản trị EC2 và không thay thế xác thực SSH. `EC2_SSH_KEY` vẫn chứng
minh danh tính client, còn `EC2_KNOWN_HOSTS` bảo đảm runner đang kết nối đúng server.
Ba lớp này giải quyết ba việc độc lập: mở đường mạng tạm thời, xác thực client và xác
thực server.

### 4.2. Lấy thông tin AWS

- Account ID: AWS Console → menu tài khoản góc phải → **Account ID**.
- Region: xem Region đang chọn khi mở EC2, ví dụ Singapore là `ap-southeast-1`.
- Security Group ID: EC2 → **Instances** → chọn instance → tab **Security** → mở
  Security Group và sao chép **Security group ID** dạng `sg-...`. Các giá trị
  `sgr-08...`, `sgr-0b...`, `sgr-04...` là ID từng rule và không dùng ở đây.

### 4.3. Tạo GitHub OIDC provider một lần

Trong AWS Console vào **IAM → Identity providers → Add provider**:

- Provider type: **OpenID Connect**.
- Provider URL: `https://token.actions.githubusercontent.com`.
- Audience: `sts.amazonaws.com`.

Nếu provider này đã tồn tại trong cùng AWS account thì dùng lại, không tạo trùng.

### 4.4. Tạo permission policy giới hạn đúng Security Group

IAM → **Policies → Create policy → JSON**, thay ba placeholder rồi tạo policy tên
`VmartGitHubDeploySecurityGroup`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:RevokeSecurityGroupIngress"
      ],
      "Resource": "arn:aws:ec2:<AWS_REGION>:<AWS_ACCOUNT_ID>:security-group/<EC2_SECURITY_GROUP_ID>"
    }
  ]
}
```

Ví dụ phần `Resource`:
`arn:aws:ec2:ap-southeast-1:123456789012:security-group/sg-0123456789abcdef0`.
Policy không cho workflow sửa instance hoặc Security Group khác.

### 4.5. Tạo role chỉ tin repository và Environment production

IAM → **Roles → Create role → Web identity**, chọn provider
`token.actions.githubusercontent.com`, audience `sts.amazonaws.com`, gắn policy vừa tạo
và đặt tên role `VmartGitHubDeploy`. Sau khi tạo, mở **Trust relationships → Edit trust
policy** và dùng policy sau khi thay các placeholder:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:NhanVo288@<OWNER_ID>/Vmart@<REPO_ID>:environment:production",
          "token.actions.githubusercontent.com:ref": "refs/heads/main"
        }
      }
    }
  ]
}
```

Workflow in các giá trị cần thiết ở bước **Show GitHub OIDC identity**, kể cả khi bước
assume role sau đó thất bại:

```text
owner_id=<OWNER_ID>
repository_id=<REPO_ID>
ref=refs/heads/main
```

Cũng có thể lấy hai ID bằng GitHub CLI đã đăng nhập:

```bash
gh api repos/NhanVo288/Vmart --jq '{owner_id: .owner.id, repo_id: .id}'
```

Repository tạo sau ngày 15/07/2026, đã bật immutable OIDC subject hoặc được rename/transfer
sau ngày đó phải dùng `sub` có numeric ID như mẫu policy phía trên. Không dùng wildcard
cho ID. Repository cũ chưa bật định dạng immutable dùng giá trị sau:

```text
repo:NhanVo288/Vmart:environment:production
```

Điều kiện `sub` chỉ cho repository và Environment `production` assume role. Vì `sub` dạng
environment không chứa branch, điều kiện `ref` giới hạn thêm `refs/heads/main`. Sao chép
ARN của role vào `AWS_ROLE_ARN`; thêm Region và Security Group ID vào hai variable còn lại.

Trong GitHub Environment `production`, đặt **Deployment branches and tags** thành
**Selected branches and tags**, chỉ thêm branch `main`. Nên bật **Required reviewers**
và **Prevent self-review** nếu gói GitHub đang dùng hỗ trợ, vì mọi job được phép dùng
Environment này sẽ có cùng OIDC `sub`.

### 4.6. Giữ rule SSH tĩnh ở phạm vi hẹp

Security Group không cần rule SSH cho GitHub tồn tại thường trực. Chỉ giữ rule
`22/TCP` từ IP quản trị, ví dụ `27.78.72.30/32`. Khi deploy, rule tạm có Description dạng
`GitHub-Actions-<run-id>-<attempt>` và được xóa khi job thành công hoặc thất bại.

Nếu runner bị dừng cưỡng bức trước bước cleanup, vào Security Group → **Inbound rules**,
tìm rule có Description `GitHub-Actions-...`, đối chiếu run ID trong URL/log GitHub
Actions rồi xóa rule cũ. Workflow mặc định dùng SSH port 22.

Bật Actions và quyền publish packages theo chính sách repository/organization.
Nếu package đã tồn tại, cấp Actions access của repository cho cả hai package.

## 5. Chạy, kiểm tra và xử lý lỗi

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

### 5.1. Lỗi thường gặp

| Lỗi | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| `Not authorized to perform sts:AssumeRoleWithWebIdentity` | Trust policy không khớp `sub`, `ref`, audience hoặc đang sửa nhầm role | Đối chiếu `owner_id`, `repository_id`, `ref` trong bước **Show GitHub OIDC identity** và kiểm tra `AWS_ROLE_ARN` |
| `EC2_SECURITY_GROUP_ID` không hợp lệ | Dùng rule ID `sgr-...` thay vì Security Group ID | Dùng ID dạng `sg-...` trong Environment variable và IAM policy ARN |
| `ssh: connect ... port 22: Connection timed out` | Rule `/32` chưa được tạo, sai `EC2_HOST`, sai Security Group hoặc instance không public | Kiểm tra bước **Allow this runner to use SSH**, Elastic IP/Public DNS, route và Security Group gắn với instance |
| `Host key verification failed` | `EC2_KNOWN_HOSTS` không khớp chính xác `EC2_HOST` hoặc EC2 đã đổi host key | Xác minh lại fingerprint rồi cập nhật secret |
| `Permission denied (publickey)` | Sai `EC2_USER`, private key hoặc public key chưa có trong `authorized_keys` | Kiểm tra bằng cùng key từ máy quản trị |
| `/health/ready` thất bại | Dependency chưa healthy hoặc thiếu cấu hình SePay/runtime | Xem `docker compose ps`, log API và kiểm tra `~/Vmart/.env` |

## 6. Quay lại bản trước

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

## 7. Tài liệu tham khảo

- [GitHub Environments và environment secrets](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- [GitHub OIDC với AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
- [GitHub publish Docker images](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images)
- [GHCR authentication](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [AWS EC2 key pairs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)
- [Cloudinary credentials](https://cloudinary.com/documentation/developer_onboarding_faq_find_credentials)
- [Google App passwords](https://support.google.com/accounts/answer/185833)
- [SePay tạo và xác thực webhook](https://developer.sepay.vn/vi/sepay-webhooks/tao-webhook)
- [Compose up và `--wait`](https://docs.docker.com/reference/cli/docker/compose/up/)
