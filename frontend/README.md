# Frontend QuanLyPhongTro

React/Vite/Tailwind, React Query, Router và Axios. Giao diện quản lý cho chủ trọ;
API dùng cookie session + CSRF. Cần backend và database chạy riêng.

Trong thư mục frontend:
npm ci
copy .env.example .env
Đặt VITE_API_URL=http://localhost:8080; cùng hostname với frontend.
npm run dev

Kiểm tra:
npm run build
npm run lint
npm test

Luồng: Nhà trọ → Phòng/Người thuê → Hợp đồng/Thành viên →
Hóa đơn/Dòng dịch vụ → Thanh toán → Dashboard.
Các màn quản lý chỉ mở cho CHU_TRO; /tai-khoan dùng để đăng nhập/đăng ký/quản lý nhà.
Header có logout; cache quản lý được xóa khi đổi phiên/tài khoản.

Hợp đồng → /hoa-don?hopDongId=...
Hóa đơn → /thanh-toan?hoaDonId=...
Chi tiết hóa đơn: /hoa-don?hopDongId=...&hoaDonId=...
Tháng trên Dashboard chỉ lọc thực thu; công nợ là công nợ hiện tại mọi kỳ.

Tiền API trả chuỗi decimal, hiển thị bằng utils/decimalValues (BigInt);
không Number tiền, không tự tính tổng hóa đơn ở frontend.
Thu tiền là ghi sổ thủ công, chưa kết nối ngân hàng/ví; kiểm tra lịch sử trước
gửi lại yêu cầu thất bại vì chưa có idempotency.

scripts/check-integration-helpers.mjs chạy helper với React Query thật.
scripts/check-browser.cjs kiểm tra UI bằng Playwright/API mock; cần cài Playwright
tạm và chạy Vite. Chi tiết ở README_AP_DUNG_FRONTEND.md của gói bước 5.
Build/helper/UI mock không thay kiểm thử backend/DB thật.
