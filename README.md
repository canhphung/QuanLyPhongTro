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

Frontend: **http://localhost:5174**. CORS backend đã cho phép địa chỉ này.

### 4. Dữ liệu mẫu (chỉ môi trường phát triển)

Migration Flyway V3 [V3__seed_demo_data.sql](backend/src/main/resources/db/migration/V3__seed_demo_data.sql) tự nạp **20 bản ghi cho mỗi bảng hiện có** khi backend khởi động lần đầu sau khi cập nhật mã nguồn. Migration V4 [V4__normalize_demo_ids_and_owner_data.sql](backend/src/main/resources/db/migration/V4__normalize_demo_ids_and_owner_data.sql) đưa ID mẫu về dải `AUTO_INCREMENT` kế tiếp và gom toàn bộ nhà/phòng mẫu vào tài khoản `owner01@qlpt-demo.test` để dễ dùng khu quản lý. Dữ liệu đi vào database backend kết nối theo `SPRING_DATASOURCE_URL`; với cấu hình mặc định đó là `QLPT` trên MariaDB tại `localhost:3306`. Trong phpMyAdmin, hãy chọn đúng server và database `QLPT`.

Seed gồm 20 tin đăng đã duyệt và ảnh nội thất minh họa JPEG lưu cục bộ trong `frontend/public/images/demo/`, được Vite đóng gói cùng frontend. Ảnh minh họa không phải cam kết hình ảnh thực của từng phòng. Đăng nhập chủ trọ mẫu bằng `owner01@qlpt-demo.test` / `Demo@123`; tài khoản mẫu này quản lý toàn bộ nhà, phòng và hồ sơ liên quan. Các tài khoản mẫu còn lại dùng cùng mật khẩu. Mã mời người thuê mẫu đã hết hạn. **Chỉ áp dụng các migration mẫu này cho database phát triển**, không triển khai lên production.

Sau khi cập nhật mã nguồn, khởi động lại backend để Flyway tự chạy các migration V3/V4; frontend tại **http://localhost:5174** có thể tải lại sau khi migration thành công.
