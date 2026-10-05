# 🏠 Hệ thống Quản Lý Phòng Trọ

Đồ án xây dựng hệ thống **quản lý phòng trọ** sử dụng Java Spring Boot.

Hệ thống hướng đến việc hỗ trợ quản lý các nghiệp vụ cơ bản của nhà trọ như phòng, người thuê, hợp đồng thuê, dịch vụ, hóa đơn và thanh toán.

> Repository thuộc về **Nhóm 9**. <br>
> - Phùng Đức Cảnh
> - Trần Hoàng Lin
> - Nguyễn Thị Thu Hằng

---

## 📌 Chức năng chính

Hệ thống được thiết kế để hỗ trợ các nghiệp vụ:

- Quản lý phòng trọ
- Quản lý người thuê
- Quản lý hợp đồng thuê
- Quản lý thành viên trong hợp đồng
- Quản lý dịch vụ
- Quản lý hóa đơn
- Quản lý chi tiết hóa đơn
- Quản lý thanh toán
- Theo dõi trạng thái phòng, hợp đồng và hóa đơn

## 🛠 Công nghệ sử dụng

| Công nghệ | Mục đích |
|---|---|
| Java 21 | Ngôn ngữ lập trình |
| Spring Boot 4.1.1 | Framework backend |
| Spring Web MVC | Xây dựng REST API |
| Spring Data JPA | Truy cập và thao tác cơ sở dữ liệu |
| Hibernate | ORM |
| MySQL | Hệ quản trị cơ sở dữ liệu |
| Flyway | Quản lý migration database |
| Jakarta Validation | Kiểm tra dữ liệu request |
| Lombok | Giảm boilerplate code |
| Maven | Quản lý dependency và build project |

---

## 🏗 Kiến trúc project

Project được tổ chức theo mô hình phân tầng:

```text
src/main/java/com/project/QLPT
│
├── controller
│   └── Xử lý HTTP request và response
│
├── dto
│   ├── request
│   │   └── Dữ liệu client gửi lên
│   └── response
│       └── Dữ liệu trả về cho client
│
├── entity
│   ├── Các JPA Entity
│   └── id
│       └── Composite key
│
├── enums
│   └── Các trạng thái và kiểu dữ liệu cố định
│
├── exception
│   └── Xử lý exception tập trung
│
├── repository
│   └── Truy cập dữ liệu bằng Spring Data JPA
│
└── service
    └── Xử lý nghiệp vụ
```

Luồng xử lý chính:

```text
Client
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

DTO được sử dụng để tách dữ liệu trao đổi qua API khỏi Entity của hệ thống.

---

## 🗄 Mô hình dữ liệu

Hệ thống hiện gồm các bảng chính:

```text
PHONG
  │
  └── HOP_DONG
        │
        ├── THANH_VIEN_HOP_DONG ─── NGUOI_THUE
        │
        └── HOA_DON
              │
              ├── CHI_TIET_HOA_DON ─── DICH_VU
              │
              └── THANH_TOAN
```

### Các entity

| Entity | Chức năng |
|---|---|
| `Phong` | Lưu thông tin phòng trọ |
| `NguoiThue` | Lưu thông tin người thuê |
| `HopDong` | Quản lý hợp đồng thuê phòng |
| `ThanhVienHopDong` | Quản lý người tham gia hợp đồng |
| `DichVu` | Quản lý các dịch vụ |
| `HoaDon` | Quản lý hóa đơn theo kỳ |
| `ChiTietHoaDon` | Lưu chi tiết dịch vụ trong hóa đơn |
| `ThanhToan` | Lưu các lần thanh toán hóa đơn |

ERD chi tiết:

```text
docs/erd.md
```

---

## 🔗 Quan hệ dữ liệu

Một phòng có thể có nhiều hợp đồng theo thời gian.

Một hợp đồng thuộc về một phòng.

Một hợp đồng có một hoặc nhiều thành viên thuê.

Một người thuê có thể tham gia nhiều hợp đồng khác nhau.

Một hợp đồng có thể phát sinh nhiều hóa đơn.

Một hóa đơn gồm nhiều chi tiết dịch vụ.

Một dịch vụ có thể xuất hiện trong nhiều hóa đơn.

Một hóa đơn có thể có nhiều lần thanh toán.

---

## 🚀 Cài đặt và chạy project

### 1. Yêu cầu

Cần cài đặt:

```text
Java 21
MySQL
Git
```

Project có Maven Wrapper nên không bắt buộc phải cài Maven riêng.

Kiểm tra Java:

```bash
java -version
```

---

### 2. Clone repository

```bash
git clone https://github.com/canhphung/QuanLyPhongTro.git
```

Di chuyển vào project:

```bash
cd QuanLyPhongTro
```

Checkout branch phát triển:

```bash
git checkout dev
```

---

### 3. Tạo database

Đăng nhập MySQL:

```sql
CREATE DATABASE QLPT;
```

---

### 4. Cấu hình database

Mở:

```text
src/main/resources/application.properties
```

Cấu hình:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/QLPT?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh

spring.datasource.username=root
spring.datasource.password=
```

Thay `username` và `password` theo MySQL trên máy của bạn.

---

## 🗃 Database Migration

Project sử dụng **Flyway** để quản lý cấu trúc database.

Migration được đặt tại:

```text
src/main/resources/db/migration/
```

Migration ban đầu:

```text
V1__create_initial_schema.sql
```

Khi ứng dụng khởi động, Flyway sẽ tự động áp dụng các migration chưa được chạy.

---

## ▶️ Chạy ứng dụng

### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

### Linux / macOS

```bash
./mvnw spring-boot:run
```

Ứng dụng mặc định chạy tại:

```text
http://localhost:8080
```

---

## ⚠️ Xử lý lỗi

Project sử dụng `GlobalExceptionHandler` để xử lý exception tập trung.

Một số exception nghiệp vụ:

```text
ResourceNotFoundException
BusinessException
```

Ví dụ:

```text
Không tìm thấy người thuê id = 10
```

```text
CCCD đã tồn tại
```

```text
Không thể xóa người thuê đã tham gia hợp đồng
```

---

## 📄 Trạng thái

> 🚧 Project đang trong quá trình phát triển.

Branch phát triển chính hiện tại:

```text
dev
```