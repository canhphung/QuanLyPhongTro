# DESIGN SYSTEM – QUẢN LÝ PHÒNG TRỌ (SMART RENTAL PLATFORM)
Phiên bản: 2.0  
Áp dụng: Phân hệ Quản trị Chủ trọ (Owner Portal), Phân hệ Khách thuê (Tenant Portal) & Phân hệ Tìm phòng (Public Client).

---

## 1. NGUYÊN TẮC THIẾT KẾ (DESIGN PRINCIPLES)

1. **Tin cậy & Minh bạch (Trust & Transparency):** Mọi số liệu tài chính, chỉ số điện nước, giá thuê và trạng thái hợp đồng đều hiển thị rõ ràng, chuẩn xác theo định dạng tiền tệ VND (`#numbers.formatDecimal` hoặc `Intl.NumberFormat('vi-VN')`).
2. **Hiện đại & Tinh gọn (Modern Minimalism & Card-Based):** Sử dụng bố cục dạng thẻ (card-based), bo góc mềm (`16px - 20px`), viền mỏng tinh tế (`1px solid #E2E8F0`), bóng đổ đa tầng nhẹ nhàng (`box-shadow`), tạo khoảng thở (whitespace) rộng rãi.
3. **Thao tác nhanh & Trực quan (Operational Speed):** Bảng dữ liệu có header cố định (sticky), tìm kiếm và lọc tức thì, xem trước & in hóa đơn trực tiếp, thao tác xóa luôn có hộp thoại xác nhận (Confirm Dialog).
4. **Nhất quán & Dễ tiếp cận (Consistency & Accessibility):**
   - 100% icon là vector SVG chuẩn hóa từ bộ thư viện `lucide-react` (tuyệt đối không sử dụng emoji làm icon chức năng).
   - Tỷ lệ tương phản màu sắc đạt tiêu chuẩn WCAG AA (Contrast $\ge 4.5:1$).
   - Hỗ trợ chế độ Sáng / Tối (Light & Dark Mode) lưu trạng thái qua `localStorage`.
   - Mọi nút bấm và phần tử tương tác đều có `cursor-pointer`, hiệu ứng hover nhẹ đổi màu/viền mà không làm xô lệch layout (tránh `transform: scale` gây layout shift).

---

## 2. BẢNG MÀU (COLOR PALETTE & TOKENS)

### 2.1. Màu chủ đạo & Điểm nhấn (Brand & Accent)
- **Primary (Indigo/Slate Blue):**
  - `primary-50`: `#EEF2FF`
  - `primary-100`: `#E0E7FF`
  - `primary-500`: `#6366F1`
  - `primary-600`: `#4F46E5` *(Màu thương hiệu chính – tượng trưng cho sự tin cậy, bảo mật và công nghệ)*
  - `primary-700`: `#4338CA`
  - `primary-900`: `#312E81`
- **Secondary (Teal / Cyan):**
  - `secondary-500`: `#0EA5E9`
  - `secondary-600`: `#0284C7`
- **Accent (Warm Amber / Orange):**
  - `accent-500`: `#F59E0B`
  - `accent-600`: `#D97706` *(Dành riêng cho các nút Call-to-Action chính: Thu tiền, Tạo tin đăng mới, Hẹn lịch)*

### 2.2. Màu trung tính (Neutrals / Slate)
- **Light Mode:**
  - Nền trang (Background): `#F8FAFC` (Slate-50)
  - Thẻ & Bề mặt (Surface / Card): `#FFFFFF`
  - Viền phân cách (Border / Line): `#E2E8F0` (Slate-200)
  - Chữ chính (Text Primary): `#0F172A` (Slate-900)
  - Chữ phụ (Text Secondary / Muted): `#475569` (Slate-600)
  - Chữ mờ / Placeholder: `#94A3B8` (Slate-400)
- **Dark Mode:**
  - Nền trang (Background): `#090D16`
  - Thẻ & Bề mặt (Surface / Card): `#111827`
  - Viền phân cách (Border / Line): `#1F2937`
  - Chữ chính (Text Primary): `#F8FAFC`
  - Chữ phụ (Text Secondary / Muted): `#94A3B8`

### 2.3. Màu ngữ nghĩa trạng thái (Semantic Colors)
- **Thành công (Success - Đã thanh toán / Đang thuê / Đã duyệt):**
  - Nền: `#ECFDF5` (Emerald-50) | Chữ & Viền: `#059669` (Emerald-600) | Dark: `bg-emerald-950/40 text-emerald-400`
- **Cảnh báo (Warning - Chờ xử lý / Sắp hết hạn / Nháp):**
  - Nền: `#FFFBEB` (Amber-50) | Chữ & Viền: `#D97706` (Amber-600) | Dark: `bg-amber-950/40 text-amber-400`
- **Nguy hiểm / Báo động (Danger - Quá hạn / Bảo trì / Từ chối / Nợ):**
  - Nền: `#FEF2F2` (Rose-50) | Chữ & Viền: `#DC2626` (Rose-600) | Dark: `bg-rose-950/40 text-rose-400`
- **Trống / Tạm ngưng (Neutral Status - Phòng trống / Ngừng hoạt động):**
  - Nền: `#F1F5F9` (Slate-100) | Chữ & Viền: `#475569` (Slate-600) | Dark: `bg-slate-800 text-slate-300`

---

## 3. TYPOGRAPHY (FONT CHỮ & QUY TẮC HIỂN THỊ)

- **Font chữ chính:** `Be Vietnam Pro` (Google Fonts) kết hợp font dự phòng `Inter, -apple-system, sans-serif`.
  - Tối ưu 100% hiển thị tiếng Việt, các dấu thanh không bị co méo hay lệch baseline.
- **Thứ bậc kích thước (Type Scale):**
  - `Display / Hero Title`: 32px – 36px | `font-extrabold (800)` | `leading-tight`
  - `Heading 1 (Page Title)`: 24px – 28px | `font-bold (700)` | `tracking-tight`
  - `Heading 2 (Section Title)`: 18px – 20px | `font-bold (700)`
  - `Heading 3 (Card Title / Subhead)`: 15px – 16px | `font-semibold (600)`
  - `Body Text (Nội dung chính)`: 14px | `font-normal (400) / font-medium (500)` | `leading-relaxed`
  - `Caption / Meta / Badge`: 11px – 12.5px | `font-semibold (600)` | `tracking-wide`
  - `Số liệu tiền tệ & KPI`: 22px – 30px | `font-extrabold (800)` | Monospace tabular numbers

---

## 4. SHAPE & ELEVATION (BO GÓC & ĐỔ BÓNG)

- **Bo góc (Border Radius):**
  - `Tag / Status Pill`: `rounded-full` (9999px)
  - `Nút bấm (Button) & Ô nhập liệu (Input)`: `rounded-xl` (12px)
  - `Thẻ (Card) & Khung nội dung`: `rounded-2xl` (16px – 20px)
  - `Modal Dialog`: `rounded-3xl` (24px)
- **Đổ bóng (Elevation Shadows):**
  - `Card mặc định`: `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)`
  - `Card Hover`: `0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04)`
  - `Dropdown / Popover`: `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.04)`
  - `Modal Backdrop`: `rgba(15, 23, 42, 0.7)` kèm `backdrop-blur-md`

---

## 5. THÀNH PHẦN GIAO DIỆN DÙNG CHUNG (UI COMPONENTS)

1. **Khung Sidebar điều hướng (Collapsible Navigation Sidebar):**
   - Rộng 250px trên desktop, có thể thu gọn mượt mà.
   - Nhóm menu phân cấp: Tổng quan, Nhà trọ, Phòng, Người thuê, Hợp đồng, Hóa đơn, Dịch vụ, Thanh toán, Tin đăng.
   - Badge hiển thị số lượng yêu cầu chờ xử lý thời gian thực.
   - Tích hợp nút chuyển đổi Light/Dark mode và thông tin tài khoản.
2. **Topbar Điều hành (Executive Topbar):**
   - Ô tìm kiếm nhanh phòng trọ, chuông thông báo có chấm đỏ báo việc cần làm.
   - Avatar người dùng và dropdown menu tài khoản / đăng xuất.
3. **Thẻ Thống kê KPI (Metric Stat Card):**
   - Biểu tượng nghiệp vụ nổi bật trong hộp màu mềm (`bg-primary-50 text-primary-600`).
   - Giá trị số lớn in đậm, phần trăm tăng giảm / ngữ cảnh so sánh.
4. **Huy hiệu trạng thái (Status Badge Fragment):**
   - Đồng nhất cho tất cả các bảng: chấm tròn chỉ thị màu (dot) + nhãn chữ rõ ràng (không chỉ dựa vào màu).
5. **Bảng dữ liệu chuyên nghiệp (Data Table Component):**
   - Header cố định, hover dòng với nền nhẹ (`hover:bg-slate-50`).
   - Phân trang chuẩn với số trang, nút Trước/Sau, hiển thị "Hiển thị X trên tổng Y kết quả".
   - Vùng cuộn ngang riêng biệt trên thiết bị di động, không làm gãy layout trang.
6. **Modal Hóa đơn in ấn (Printable Invoice Modal):**
   - Thiết kế chuẩn khổ A4/A5, bảng chi tiết điện nước có chỉ số cũ/mới, tính tổng tự động, nút In hóa đơn kích hoạt `window.print()`.
7. **Hộp thoại xác nhận (Confirm Delete Modal):**
   - Cảnh báo rõ ràng tên đối tượng sắp xóa, nút Hủy an toàn và nút Xác nhận xóa màu đỏ.

---

## 6. QUY TẮC PHÒNG TRÁNH LỖI (ANTI-PATTERNS & DOs/DONTs)

- **DONT:** Tuyệt đối không dùng emoji (ví dụ: 🏠, ⚡, 💧, 💰) thay cho icon giao diện.
- **DO:** Luôn dùng SVG Lucide đồng bộ kích thước (`size={18}` hoặc `size={20}`, stroke 1.75px).
- **DONT:** Không dùng `transform: scale(1.05)` trên cả thẻ cha gây rung lắc bố cục xung quanh.
- **DO:** Dùng chuyển đổi màu sắc, viền và bóng đổ nhẹ (`transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`).
- **DONT:** Không để khoảng cách chữ mờ nhạt gây khó đọc cho người mắt kém.
- **DO:** Chữ chính luôn là `#0F172A` (hoặc `#F8FAFC` ở Dark mode), đạt chuẩn tương phản $\ge 4.5:1$.
- **DONT:** Không để bảng tràn tự do làm trang bị thanh cuộn ngang toàn màn hình.
- **DO:** Bọc bảng bằng thẻ `overflow-x-auto rounded-xl border border-slate-200`.
