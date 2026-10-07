# Quản Lý Phòng Trọ

Đồ án quản lý phòng, người thuê, hợp đồng, dịch vụ, hóa đơn và thanh toán.

**Nhóm 9:** Phùng Đức Cảnh · Trần Hoàng Lin · Nguyễn Thị Thu Hằng.

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Backend | Java 21, Spring Boot 4.1.1 |
| Truy cập dữ liệu | Spring Data JPA, Hibernate |
| Cơ sở dữ liệu | MySQL, Flyway |
| Frontend | React 19, Vite, Tailwind CSS |
| Điều hướng và gọi API | React Router, TanStack Query, Axios |

## Cấu trúc

- `backend/`: REST API Spring Boot và migration database.
- `frontend/`: giao diện React.
- `docs/`: tài liệu, [sơ đồ ERD](docs/erd.md).

## Chạy dự án

Yêu cầu: **JDK 21, MySQL, Node.js và npm**. Backend đã có Maven Wrapper.

### 1. Lấy mã nguồn

```bash
git clone --branch dev https://github.com/canhphung/QuanLyPhongTro.git
cd QuanLyPhongTro
```

### 2. Chạy backend

Tạo database mới, chưa có bảng:

```sql
CREATE DATABASE QLPT;
```

Sửa thông tin kết nối trong `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/QLPT?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

Chạy trong thư mục `backend/`:

```powershell
# Windows (PowerShell)
.\mvnw.cmd spring-boot:run
```

```bash
# Linux / macOS
sh mvnw spring-boot:run
```

Backend: **http://localhost:8080**. Flyway tự chạy migration trong `backend/src/main/resources/db/migration/`; Hibernate dùng `validate` để kiểm tra schema.

### 3. Chạy frontend

Mở terminal mới tại `frontend/`, tạo file `.env` từ `.env.example`:

```dotenv
VITE_API_URL=http://localhost:8080
```

```bash
npm install
npm run dev
```

Frontend: **http://localhost:5173**. CORS backend đã cho phép địa chỉ này.
