const text = (key, label, optional = false) => ({
  key,
  label,
  type: "text",
  optional,
});
const number = (key, label, min = 0) => ({ key, label, type: "number", min });
const date = (key, label, optional = false) => ({
  key,
  label,
  type: "date",
  optional,
});
const select = (key, label, options) => ({
  key,
  label,
  type: "select",
  options,
});
export const dateToInput = (value) => String(value || "").slice(0, 10);
export const inputToDate = (value) => value;
export const schemas = {
  "nha-tro": {
    key: "buildings",
    title: "Nhà trọ",
    subtitle: "Địa chỉ và thông tin quản lý từng nhà trọ.",
    singular: "nhà trọ",
    columns: [
      ["name", "Nhà trọ"],
      ["address", "Địa chỉ"],
      ["city", "Thành phố"],
      ["manager", "Quản lý"],
      ["status", "Trạng thái"],
    ],
    fields: [
      text("name", "Tên nhà trọ"),
      text("address", "Địa chỉ"),
      text("city", "Tỉnh / thành phố"),
      text("district", "Quận / huyện"),
      text("manager", "Người quản lý"),
      select("status", "Trạng thái", ["Đang hoạt động", "Tạm ngưng"]),
    ],
  },
  phong: {
    key: "rooms",
    title: "Phòng",
    subtitle: "Trạng thái đang thuê được cập nhật qua hợp đồng.",
    singular: "phòng",
    columns: [
      ["number", "Phòng"],
      ["building", "Nhà trọ"],
      ["area", "Diện tích"],
      ["price", "Giá thuê / tháng"],
      ["roomStatus", "Trạng thái"],
    ],
    fields: [
      text("number", "Số phòng (duy nhất trong nhà trọ)"),
      select("buildingId", "Nhà trọ", "buildings"),
      number("area", "Diện tích (m²)", 0.01),
      number("price", "Giá thuê (₫)", 1),
      select("type", "Loại phòng", ["Phòng trọ", "Studio", "Căn hộ mini"]),
      select("roomState", "Trạng thái", [
        ["TRONG", "Còn trống"],
        ["BAO_TRI", "Bảo trì"],
        ["NGUNG_HOAT_DONG", "Ngừng hoạt động"],
        ["DANG_THUE", "Đang thuê (qua hợp đồng)"],
      ]),
    ],
  },
  "nguoi-thue": {
    key: "tenants",
    title: "Người thuê",
    subtitle: "Quản lý hồ sơ và cấp mã liên kết tài khoản người thuê.",
    singular: "người thuê",
    columns: [
      ["name", "Họ và tên"],
      ["cccd", "CCCD"],
      ["phone", "Điện thoại"],
      ["linked", "Tài khoản liên kết"],
    ],
    fields: [
      text("name", "Họ và tên"),
      text("cccd", "CCCD"),
      { ...text("phone", "Điện thoại", true), type: "tel" },
      date("birthday", "Ngày sinh", true),
      text("address", "Địa chỉ thường trú", true),
    ],
  },
  "dich-vu": {
    key: "services",
    title: "Dịch vụ",
    subtitle: "Đơn giá đang áp dụng sẽ được công bố cùng tin đăng của bạn.",
    singular: "dịch vụ",
    columns: [
      ["name", "Dịch vụ"],
      ["unit", "Đơn vị"],
      ["price", "Đơn giá"],
      ["mode", "Cách tính"],
      ["status", "Trạng thái"],
    ],
    fields: [
      text("name", "Tên dịch vụ"),
      text("unit", "Đơn vị tính"),
      number("price", "Đơn giá (₫)"),
      select("mode", "Cách tính", ["Theo chỉ số", "Cố định"]),
      select("status", "Trạng thái", ["Đang áp dụng", "Tạm ngưng"]),
    ],
  },
  "hop-dong": {
    key: "contracts",
    title: "Hợp đồng",
    subtitle: "Thời hạn thuê, tiền cọc và thành viên ở cùng.",
    singular: "hợp đồng",
    columns: [
      ["id", "Mã"],
      ["name", "Đại diện"],
      ["room", "Phòng"],
      ["end", "Kết thúc"],
      ["price", "Giá thuê"],
      ["status", "Trạng thái"],
    ],
    fields: [
      select("roomId", "Phòng", "rooms"),
      {
        ...select("tenantId", "Đại diện ban đầu", "tenants"),
        createOnly: true,
      },
      date("start", "Ngày bắt đầu"),
      date("end", "Ngày kết thúc"),
      number("price", "Giá thuê thỏa thuận (₫)", 1),
      number("deposit", "Tiền cọc (₫)"),
    ],
  },
  "hoa-don": {
    key: "invoices",
    title: "Hóa đơn",
    subtitle: "Lập hóa đơn, sau đó thêm các dòng dịch vụ trong phần chi tiết.",
    singular: "hóa đơn",
    columns: [
      ["id", "Mã"],
      ["room", "Phòng"],
      ["month", "Kỳ thu"],
      ["amount", "Tổng tiền"],
      ["remaining", "Còn phải thu"],
      ["status", "Trạng thái"],
    ],
    fields: [
      select("contractId", "Hợp đồng", "contracts"),
      date("period", "Kỳ thanh toán (chọn ngày trong tháng)"),
      date("issued", "Ngày lập"),
      date("due", "Hạn thanh toán"),
      number("rent", "Tiền phòng thực tế (₫)"),
    ],
  },
  "thanh-toan": {
    key: "payments",
    title: "Thanh toán",
    subtitle: "Ghi nhận khoản tiền đã nhận; hỗ trợ thanh toán từng phần.",
    singular: "thanh toán",
    columns: [
      ["id", "Mã"],
      ["invoice", "Hóa đơn"],
      ["room", "Phòng"],
      ["date", "Ngày nhận"],
      ["amount", "Số tiền"],
      ["method", "Phương thức"],
    ],
    fields: [
      select("invoice", "Hóa đơn", "invoices"),
      { key: "date", label: "Ngày giờ nhận tiền", type: "datetime-local" },
      number("amount", "Số tiền đã nhận (₫)", 1),
      select("methodCode", "Phương thức", [
        ["CHUYEN_KHOAN", "Chuyển khoản"],
        ["TIEN_MAT", "Tiền mặt"],
        ["VI_DIEN_TU", "Ví điện tử"],
      ]),
      text("reference", "Mã giao dịch / ghi chú", true),
    ],
  },
  "tin-dang": {
    key: "listings",
    title: "Tin đăng",
    subtitle:
      "Tải ảnh từ thư viện máy lên hoặc nhập link ảnh. Gửi quản trị viên duyệt để công khai hiển thị trên trang chủ.",
    singular: "tin đăng",
    columns: [
      ["title", "Tiêu đề"],
      ["number", "Phòng"],
      ["building", "Nhà trọ"],
      ["price", "Giá thuê"],
      ["publishedStatus", "Hiển thị"],
    ],
    fields: [
      { ...select("roomId", "Phòng", "rooms"), createOnly: true },
      text("title", "Tiêu đề"),
      number("price", "Giá đăng (₫/tháng)", 1),
      { ...text("phone", "Số điện thoại liên hệ"), type: "tel" },
      { key: "description", label: "Mô tả phòng", type: "textarea" },
      {
        ...text("amenities", "Tiện nghi (ngăn cách bằng dấu phẩy)", true),
        type: "textarea",
      },
      {
        key: "images",
        label: "Hình ảnh phòng (tải từ máy hoặc link ảnh, tối đa 10)",
        type: "textarea",
        optional: true,
      },
      select("published", "Sau khi lưu", [
        ["false", "Bản nháp"],
        ["true", "Gửi quản trị viên duyệt"],
      ]),
    ],
  },
};
export function optionsFor(field, data) {
  if (Array.isArray(field.options))
    return field.options.map((x) => (Array.isArray(x) ? x : [x, x]));
  return (data[field.options] || []).map((x) => [
    x.id,
    field.options === "rooms"
      ? `${x.number} · ${x.building}`
      : field.options === "contracts"
        ? `#${x.id} · Phòng ${x.room} · ${x.status}`
        : field.options === "invoices"
          ? `#${x.id} · ${x.room} · ${x.month}`
          : x.name,
  ]);
}
