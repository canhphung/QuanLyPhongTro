import { NavLink } from "react-router-dom";

function Sidebar() {
  const menu = [
    { name: "Tài khoản & Nhà trọ", path: "/tai-khoan" },
    { name: "Phòng", path: "/phong" },
    { name: "Người thuê", path: "/nguoi-thue" },
    { name: "Dịch vụ", path: "/dich-vu" },
    { name: "Hợp đồng", path: "/hop-dong" },
    { name: "Hóa đơn", path: "/hoa-don" },
    { name: "Thanh toán", path: "/thanh-toan" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  return (
      <aside className="w-64 min-h-screen bg-slate-900 text-white">
        <div className="p-6 text-xl font-bold">
          Quản Lý Phòng Trọ
        </div>

        <nav className="px-4">
          {menu.map((item) => (
              <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                      `block rounded-lg px-4 py-3 mb-2 ${
                          isActive
                              ? "bg-blue-600"
                              : "hover:bg-slate-800"
                      }`
                  }
              >
                {item.name}
              </NavLink>
          ))}
        </nav>
      </aside>
  );
}

export default Sidebar;
