export const managementNavigation = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Tài khoản & Nhà trọ", path: "/tai-khoan" },
  { name: "Phòng", path: "/phong" },
  { name: "Người thuê", path: "/nguoi-thue" },
  { name: "Dịch vụ", path: "/dich-vu" },
  { name: "Hợp đồng", path: "/hop-dong" },
  { name: "Hóa đơn", path: "/hoa-don" },
  { name: "Thanh toán", path: "/thanh-toan" },
  { name: "Tin đăng", path: "/tin-dang" },
];
export const isOwner = (account) => Boolean(account?.vaiTros?.includes("CHU_TRO"));
export const isAdmin = (account) => Boolean(account?.vaiTros?.includes("ADMIN"));
export function signedInDestination(account, from) {
  const allowed = [
    ...(isOwner(account) ? managementNavigation.map((item) => item.path) : []),
    ...(isAdmin(account) ? ["/admin/tin-dang", "/tai-khoan"] : []),
  ];
  if (allowed.length === 0) return "/tai-khoan";
  if (typeof from === "string" && from.startsWith("/") && !from.startsWith("//")) {
    try {
      const url = new URL(from, "https://qlpt.invalid");
      if (url.origin === "https://qlpt.invalid" && allowed.includes(url.pathname))
        return url.pathname + url.search;
    } catch { /* Đường dẫn không hợp lệ: dùng Dashboard. */ }
  }
  return isAdmin(account) ? "/admin/tin-dang" : "/dashboard";
}
export function positiveIdParam(value) {
  return typeof value === "string" && /^[1-9][0-9]{0,9}$/.test(value) && Number(value) <= 2147483647 ? value : "";
}
