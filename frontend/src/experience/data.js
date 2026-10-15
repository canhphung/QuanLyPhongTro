export const CURRENT_YEAR = new Date().getFullYear();
export const TODAY_INPUT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
}).format(new Date());
export const TODAY_TEXT = new Date().toLocaleDateString("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
});
export const TODAY_MONTH = TODAY_INPUT.slice(0, 7);
export const money = (value = 0) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));
export const shortPrice = (value = 0) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(
    Number(value) / 1000000,
  );
export const displayDate = (value) =>
  value
    ? new Date(String(value).slice(0, 10) + "T12:00:00").toLocaleDateString(
        "vi-VN",
      )
    : "—";
export const ownerMenus = [
  ["tong-quan", "Tổng quan", "LayoutDashboard"],
  ["nha-tro", "Nhà trọ", "Building2"],
  ["phong", "Phòng", "DoorOpen"],
  ["nguoi-thue", "Người thuê", "Users"],
  ["dich-vu", "Dịch vụ", "Zap"],
  ["hop-dong", "Hợp đồng", "FileText"],
  ["hoa-don", "Hóa đơn", "Receipt"],
  ["thanh-toan", "Thanh toán", "Wallet"],
  ["tin-dang", "Tin đăng", "Newspaper"],
];
