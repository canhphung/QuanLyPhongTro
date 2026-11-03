import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  Zap,
  FileText,
  Receipt,
  Wallet,
  Newspaper,
  Search,
  Bell,
  ArrowUpRight,
  Plus,
  Menu,
  X,
  ChevronRight,
  CalendarDays,
  Check,
  LogOut,
  ExternalLink,
  Info,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useAppData } from "./context";
import { Brand, PageTitle, Modal, Status, EmptyState } from "./ui";
import { ownerMenus, money, TODAY_TEXT, TODAY_INPUT } from "./data";

const addDays = (days) => {
  const date = new Date(`${TODAY_INPUT}T00:00:00`);
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const CURRENT_YEAR = new Date().getFullYear();

const icons = {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  Zap,
  FileText,
  Receipt,
  Wallet,
  Newspaper,
};

export function OwnerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("phongminh_owner_collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [notifications, setNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const { requests, user, logout, notify, theme, toggleTheme, buildings, rooms } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("phongminh_owner_collapsed", String(next));
    } catch {}
  };

  const section =
    ownerMenus.find(([path]) => location.pathname.includes(path))?.[1] ||
    "Tổng quan";
  const pending = requests.filter((x) => x.status === "Chờ xác nhận");

  // Giao diện tối chỉ áp dụng khi đang ở khu vực chủ trọ (kể cả hộp thoại mở từ đây);
  // rời khu vực thì trả về giao diện sáng cho các trang công khai.
  useEffect(() => {
    const root = document.documentElement;
    const dark = theme === "dark";
    root.setAttribute("data-theme", dark ? "dark" : "light");
    root.classList.toggle("dark", dark);
    document.body.classList.toggle("dark-theme", dark);
    return () => {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
      document.body.classList.remove("dark-theme");
    };
  }, [theme]);

  return (
    <div className={`owner-app ${theme === "dark" ? "dark-theme" : ""}`} data-ui>
      <a href="#owner-main" className="skip-link">
        Đến nội dung chính
      </a>

      {/* Main Navigation Sidebar */}
      <aside
        className={`owner-sidebar ${collapsed ? "collapsed" : ""} ${
          mobileMenuOpen ? "mobile-open" : ""
        }`}
        aria-label="Thanh điều hướng chủ trọ"
      >
        <div className="owner-sidebar-brand">
          <Brand />
          <button
            className="icon-button owner-menu-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Đóng menu trên di động"
          >
            <X size={19} />
          </button>
        </div>

        {/* Workspace Quick Badge */}
        <div className="workspace-picker" title={`${buildings.length} nhà trọ · ${rooms.length} phòng`}>
          <span className="workspace-mark">QL</span>
          <div>
            <strong>Khu Quản Lý Chủ Trọ</strong>
            <small>{buildings.length} nhà · {rooms.length} phòng trọ</small>
          </div>
        </div>

        {/* Navigation items */}
        <nav aria-label="Menu chức năng chủ trọ">
          {ownerMenus.map(([path, label, icon]) => {
            const Icon = icons[icon] || LayoutDashboard;
            const isTinDang = path === "tin-dang";
            return (
              <NavLink
                key={path}
                to={`/chu-tro/${path}`}
                onClick={() => setMobileMenuOpen(false)}
                title={collapsed ? label : undefined}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <Icon size={19} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                <span className="nav-text">{label}</span>
                {isTinDang && pending.length > 0 && (
                  <span className="sidebar-count" title={`${pending.length} yêu cầu cần phản hồi`}>
                    {pending.length}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Bottom Actions */}
        <div className="owner-sidebar-bottom">
          <button
            type="button"
            className="sidebar-action-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Chuyển sang Chế độ sáng" : "Chuyển sang Chế độ tối"}
          >
            {theme === "dark" ? <Sun size={17} color="#F59E0B" /> : <Moon size={17} color="#4F46E5" />}
            <span className="nav-text">
              {theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
            </span>
          </button>

          <Link to="/" className="sidebar-action-btn" title="Mở trang tìm phòng công khai">
            <ExternalLink size={17} />
            <span className="nav-text">Trang tìm phòng</span>
          </Link>

          <button
            type="button"
            className="sidebar-action-btn sidebar-logout-btn"
            onClick={async () => {
              try {
                await logout();
              } catch (e) {
                notify(e.message);
              }
            }}
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut size={17} />
            <span className="nav-text">Rời khu quản lý</span>
          </button>

          {/* User Profile Mini Snippet */}
          <div className="owner-profile">
            <span className="avatar">
              {user.name.split(" ").at(-1)?.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <strong>{user.name}</strong>
              <small>Chủ nhà trọ</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <button
          className="owner-menu-shade"
          aria-label="Đóng điều hướng di động"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Workspace Body */}
      <div className={`owner-app-body ${collapsed ? "collapsed" : ""}`}>
        {/* Executive Sticky Topbar */}
        <header className="owner-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Desktop Collapsible Toggle */}
            <button
              className="topbar-icon-btn hidden-mobile"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
              title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {collapsed ? <PanelLeft size={19} /> : <PanelLeftClose size={19} />}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              className="topbar-icon-btn owner-menu-open"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu quản lý"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb Navigation */}
            <span className="owner-breadcrumb">
              <span>Không gian chủ trọ</span>
              <ChevronRight size={14} />
              <strong>{section}</strong>
            </span>
          </div>

          {/* Quick Actions & Profile on Topbar */}
          <div className="owner-topbar-actions">
            {/* Quick search input */}
            <form
              className="owner-quick-search"
              onSubmit={(event) => {
                event.preventDefault();
                if (search.trim()) {
                  navigate(`/chu-tro/phong?q=${encodeURIComponent(search.trim())}`);
                }
              }}
            >
              <Search size={16} color="#4F46E5" />
              <input
                aria-label="Tìm nhanh phòng trọ"
                placeholder="Tìm nhanh số phòng…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            {/* Dark/Light mode quick toggle button */}
            <button
              className="topbar-icon-btn"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Chuyển chế độ sáng" : "Chuyển chế độ tối"}
              title={theme === "dark" ? "Chuyển chế độ sáng" : "Chuyển chế độ tối"}
            >
              {theme === "dark" ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} />}
            </button>

            {/* Notifications with Pending Requests Badge */}
            <button
              className="topbar-icon-btn"
              aria-label={`Thông báo, ${pending.length} yêu cầu xem phòng đang chờ`}
              title="Yêu cầu xem phòng & liên hệ mới"
              onClick={() => setNotifications(true)}
            >
              <Bell size={18} />
              {pending.length > 0 && <span className="badge-dot" />}
            </button>

            {/* Avatar Profile Link */}
            <Link
              className="owner-profile-avatar"
              to="/tai-khoan"
              title="Quản lý hồ sơ tài khoản"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4F46E5, #3730A3)",
                color: "#FFFFFF",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: "13px",
                textDecoration: "none",
                border: "2px solid rgba(79, 70, 229, 0.2)",
              }}
            >
              {user.name.split(" ").at(-1)?.slice(0, 2).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main id="owner-main" className="owner-main">
          <div className="owner-data-banner">
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>
              Hệ thống quản lý dữ liệu an toàn theo tài khoản của bạn. Mọi thay đổi đều được đồng bộ thời gian thực với máy chủ.
            </span>
            <Link to="/">
              Xem cổng tìm phòng
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <Outlet />
        </main>

        {/* Professional Footer */}
        <footer className="owner-footer" style={{ padding: "20px 32px", fontSize: "13px", color: "var(--muted)", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>© {CURRENT_YEAR} Phòng Mình · Nền tảng quản lý phòng trọ và cho thuê nhà thông minh.</span>
          <span style={{ fontSize: "12px", background: "rgba(79,70,229,0.08)", color: "var(--accent-text, #4F46E5)", padding: "4px 10px", borderRadius: "20px", fontWeight: 600 }}>
            Phiên bản Chủ trọ 2.0
          </span>
        </footer>
      </div>

      {/* Notifications Drawer Modal */}
      {notifications && (
        <Modal
          title={`Yêu cầu xem phòng & liên hệ (${pending.length})`}
          wide
          onClose={() => setNotifications(false)}
        >
          {pending.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pending.map((request) => (
                <div
                  key={request.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    borderRadius: "14px",
                    border: "1px solid var(--line)",
                    background: "var(--surface)",
                    gap: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "#EEF2FF",
                        color: "var(--accent-text, #4F46E5)",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {request.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ fontSize: "15px", color: "var(--ink)", display: "block" }}>
                        {request.name} · {request.phone}
                      </strong>
                      <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                        {request.type} tại <strong>{request.building}</strong> (Phòng {request.room})
                      </span>
                      <div style={{ fontSize: "12px", color: "var(--accent-text, #4F46E5)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} />
                        Hẹn lúc: {request.date} lúc {request.time}
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/chu-tro/tong-quan"
                    className="button"
                    style={{ fontSize: "13px", padding: "8px 16px" }}
                    onClick={() => setNotifications(false)}
                  >
                    Xem & Xử lý
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa có yêu cầu mới nào"
              message="Yêu cầu hẹn lịch xem phòng từ khách tìm phòng sẽ hiển thị tại đây để bạn phản hồi."
            />
          )}
        </Modal>
      )}
    </div>
  );
}

export function OwnerDashboard() {
  const {
    rooms,
    buildings,
    tenants,
    invoices,
    payments,
    requests,
    respond: sendResponse,
    user,
    notify,
  } = useAppData();

  const paid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );
  const debt = invoices
    .filter((x) => x.status !== "Đã thanh toán")
    .reduce((sum, invoice) => sum + Number(invoice.remaining), 0);
  const occupied = rooms.filter((x) => x.roomState === "DANG_THUE").length;
  const availableRooms = rooms.filter((x) => x.available).length;
  const maintenanceRooms = rooms.filter((x) =>
    ["BAO_TRI", "NGUNG_HOAT_DONG"].includes(x.roomState),
  ).length;
  const reservedRooms = rooms.filter((x) => x.roomState === "DA_DAT").length;
  const upcoming = requests.filter((x) =>
    ["Chờ xác nhận", "Đã xác nhận", "Đã xem", "Đã giữ chỗ"].includes(x.status),
  );
  const awaiting = upcoming.filter((x) => x.status === "Chờ xác nhận").length;
  const [holding, setHolding] = useState(null);
  async function respond(request, status, extra = {}) {
    try {
      await sendResponse(request.id, status, extra);
      notify("Đã cập nhật yêu cầu.");
      return true;
    } catch (e) {
      notify(e.message);
      return false;
    }
  }

  const stats = [
    {
      title: "Tổng số phòng quản lý",
      value: rooms.length,
      note: `${buildings.length} tòa nhà / dãy trọ`,
      icon: DoorOpen,
      iconBg: "#EEF2FF",
      iconColor: "#4F46E5",
      to: "phong",
    },
    {
      title: "Phòng còn trống",
      value: availableRooms,
      note: "Sẵn sàng đón khách thuê mới",
      icon: Building2,
      iconBg: "#ECFDF5",
      iconColor: "#059669",
      to: "phong?status=TRONG",
    },
    {
      title: "Doanh thu đã thu",
      value: money(paid),
      note: `${payments.length} lượt thanh toán ghi nhận`,
      icon: Wallet,
      iconBg: "#F0FDF4",
      iconColor: "#16A34A",
      to: "thanh-toan",
    },
    {
      title: "Tiền chưa thanh toán",
      value: money(debt),
      note: `${invoices.filter((x) => x.status !== "Đã thanh toán").length} hóa đơn cần đối chiếu`,
      icon: Receipt,
      iconBg: "#FEF2F2",
      iconColor: "#DC2626",
      to: "hoa-don",
    },
  ];

  return (
    <div>
      {/* Top Greeting Header */}
      <PageTitle
        title="Bảng điều hành nhà trọ"
        subtitle={`Xin chào ${user.name}! Tình hình hoạt động ngày ${TODAY_TEXT}.`}
        action={
          <div style={{ display: "flex", gap: "10px" }}>
            <Link className="button button-soft" to="/chu-tro/phong?new=1">
              <Plus size={16} />
              Thêm phòng mới
            </Link>
            <Link className="button" to="/chu-tro/tin-dang?new=1">
              <Plus size={16} />
              Đăng tin cho thuê
            </Link>
          </div>
        }
      />

      {/* 4 KPI Metric Stat Cards */}
      <div className="dashboard-stats">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link className="stat-panel-modern" key={s.title} to={`/chu-tro/${s.to}`}>
              <div className="stat-header">
                <span className="stat-title">{s.title}</span>
                <div
                  className="stat-icon-wrap"
                  style={{ background: s.iconBg, color: s.iconColor }}
                >
                  <Icon size={22} strokeWidth={2} />
                </div>
              </div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-note">
                <TrendingUp size={14} color="#059669" />
                <span>{s.note}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visual Analytics Overview: Revenue Bars & Occupancy Meter */}
      <div className="dashboard-overview">
        {/* Left: Revenue Analysis Chart */}
        <section className="admin-panel revenue-panel">
          <div className="panel-heading">
            <div>
              <h2>Đối chiếu thu và còn nợ</h2>
              <p>Phân bổ số tiền theo từng kỳ và phòng thuê</p>
            </div>
            <Link className="text-button" to="/chu-tro/hoa-don" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13.5px", fontWeight: 600 }}>
              Xem tất cả hóa đơn
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {invoices.length > 0 ? (
            <div className="revenue-bars">
              {invoices.slice(0, 10).map((invoice) => {
                const maxAmount = Math.max(...invoices.map((x) => x.amount), 1);
                const isPaid = invoice.status === "Đã thanh toán";
                return (
                  <div key={invoice.id} className="revenue-bar-group" title={`Phòng ${invoice.room}: ${money(invoice.amount)} (${invoice.status})`}>
                    <div className="bar-value">
                      {(invoice.amount / 1000000).toFixed(1).replace(".", ",")} tr
                    </div>
                    <div className="bar-space">
                      <div
                        className={isPaid ? "revenue-bar paid" : "revenue-bar"}
                        style={{
                          height: `${Math.max(12, (invoice.amount / maxAmount) * 100)}%`,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--ink)", marginTop: "4px" }}>
                      P.{invoice.room}
                    </span>
                    <small style={{ fontSize: "11px", color: "var(--muted)" }}>{invoice.month?.slice(5)}</small>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>
              Chưa có dữ liệu hóa đơn nào được lập.
            </div>
          )}

          <div className="chart-legend">
            <span>
              <i style={{ background: "#4F46E5" }} />
              Đã thanh toán đủ
            </span>
            <span>
              <i style={{ background: "#F59E0B" }} />
              Chưa thanh toán / Nợ đọng
            </span>
          </div>
        </section>

        {/* Right: Occupancy Donut Meter */}
        <section className="admin-panel occupancy-panel">
          <div className="panel-heading">
            <div>
              <h2>Tỷ lệ lấp đầy phòng</h2>
              <p>Công suất khai thác thực tế</p>
            </div>
            <DoorOpen size={20} color="#4F46E5" />
          </div>

          <svg
            className="occupancy-chart"
            viewBox="0 0 200 200"
            role="img"
            aria-label={`${occupied} phòng đang thuê trên ${rooms.length} phòng`}
          >
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke="var(--line)"
              strokeWidth="20"
            />
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${rooms.length ? (occupied / rooms.length) * 477 : 0} 477`}
              transform="rotate(-90 100 100)"
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
            <text
              x="100"
              y="97"
              textAnchor="middle"
              className="occupancy-value"
            >
              {rooms.length ? Math.round((occupied / rooms.length) * 100) : 0}%
            </text>
            <text
              x="100"
              y="119"
              textAnchor="middle"
              className="occupancy-caption"
            >
              đang được thuê
            </text>
          </svg>

          <div className="occupancy-legend">
            <p>
              <span>
                <i style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4F46E5", display: "inline-block" }} />
                Đang thuê
              </span>
              <strong>{occupied} phòng</strong>
            </p>
            <p>
              <span>
                <i style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                Còn trống
              </span>
              <strong>{availableRooms} phòng</strong>
            </p>
            {reservedRooms > 0 && (
              <p style={{ gridColumn: "span 2" }}>
                <span>
                  <i style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
                  Đã giữ chỗ / chờ vào ở
                </span>
                <strong>{reservedRooms} phòng</strong>
              </p>
            )}
            {maintenanceRooms > 0 && (
              <p style={{ gridColumn: "span 2" }}>
                <span>
                  <i style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
                  Bảo trì / Tạm ngưng
                </span>
                <strong>{maintenanceRooms} phòng</strong>
              </p>
            )}
          </div>

          <Link className="text-button" to="/chu-tro/phong" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px", fontSize: "13px", fontWeight: 600 }}>
            Quản lý chi tiết từng phòng
            <ArrowUpRight size={15} />
          </Link>
        </section>
      </div>

      {/* Actionable Pending Requests Table */}
      <section className="admin-panel" style={{ marginBottom: "28px" }}>
        <div className="panel-heading">
          <div>
            <h2>Lịch hẹn & giữ chỗ</h2>
            <p>
              {upcoming.length
                ? `${awaiting} yêu cầu chờ phản hồi · ${upcoming.length} đang theo dõi`
                : "Lịch hẹn xem và yêu cầu thuê phòng mới"}
            </p>
          </div>
          <CalendarDays size={20} color="#4F46E5" />
        </div>

        {upcoming.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khách liên hệ</th>
                  <th>Căn phòng quan tâm</th>
                  <th>Ngày & Giờ mong muốn</th>
                  <th>Loại yêu cầu</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Phản hồi</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong style={{ fontSize: "14px", color: "var(--ink)" }}>{request.name}</strong>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: "12px" }}>
                        SĐT: {request.phone}
                      </small>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{request.building}</span>
                      <small className="room-ref" style={{ display: "block", color: "var(--accent-text, #4F46E5)", fontSize: "12px", fontWeight: 600 }}>
                        Phòng {request.room}
                      </small>
                    </td>
                    <td>
                      <strong style={{ fontSize: "13.5px" }}>{request.date}</strong>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: "12px" }}>
                        Khung giờ: {request.time}
                      </small>
                    </td>
                    <td>
                      <span
                        style={{
                          background: request.type === "Xem phòng" ? "#EFF6FF" : "#ECFDF5",
                          color: request.type === "Xem phòng" ? "#1D4ED8" : "#059669",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {request.type}
                      </span>
                    </td>
                    <td>
                      <Status>{request.status}</Status>
                      {request.status === "Đã giữ chỗ" && (
                        <small>
                          Cọc {money(request.holdDeposit)} · đến{" "}
                          {request.holdUntil}
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        {request.status === "Chờ xác nhận" && (
                          <>
                            <button
                              className="button"
                              style={{
                                background: "#059669",
                                color: "#FFFFFF",
                                padding: "6px 12px",
                                fontSize: "12.5px",
                                gap: "4px",
                              }}
                              onClick={() => respond(request, "Đã xác nhận")}
                              title="Chấp nhận lịch hẹn xem phòng"
                            >
                              <Check size={14} />
                              Đồng ý
                            </button>
                            <button
                              className="button button-soft"
                              style={{
                                color: "#DC2626",
                                padding: "6px 10px",
                                fontSize: "12.5px",
                              }}
                              onClick={() => respond(request, "Đã từ chối")}
                              title="Từ chối yêu cầu này"
                            >
                              <X size={14} />
                              Từ chối
                            </button>
                          </>
                        )}
                        {request.status === "Đã xác nhận" && !!request.past && (
                          <>
                            <button
                              className="text-button"
                              onClick={() => respond(request, "Đã xem")}
                            >
                              Đã xem
                            </button>
                            <button
                              className="text-button"
                              onClick={() => respond(request, "Khách không đến")}
                            >
                              Không đến
                            </button>
                          </>
                        )}
                        {(["Đã xác nhận", "Đã xem"].includes(request.status) ||
                          (request.status === "Chờ xác nhận" &&
                            request.type === "Đăng ký thuê")) && (
                          <button
                            className="text-button"
                            onClick={() => setHolding(request)}
                          >
                            Giữ chỗ
                          </button>
                        )}
                        {request.status === "Đã giữ chỗ" && (
                          <>
                            <Link className="text-button" to="/chu-tro/hop-dong">
                              Lập hợp đồng
                            </Link>
                            <button
                              className="text-button danger-text"
                              onClick={() => respond(request, "Đã hủy giữ chỗ")}
                            >
                              Hủy giữ chỗ
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="inline-empty" style={{ padding: "32px 20px", display: "flex", alignItems: "center", gap: "16px", background: "rgba(79,70,229,0.03)", borderRadius: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#EEF2FF", color: "var(--accent-text, #4F46E5)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <CalendarDays size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--ink)" }}>
                Chưa có lịch hẹn mới nào cần phản hồi
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--muted)" }}>
                Khi người tìm phòng gửi yêu cầu xem phòng từ trang công khai, thông tin sẽ lập tức xuất hiện tại đây.
              </p>
            </div>
            <Link className="button button-soft" to="/tim-phong">
              Xem tin đăng công khai
              <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </section>
      {holding && (
        <Modal title="Giữ chỗ phòng" onClose={() => setHolding(null)}>
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const body = Object.fromEntries(new FormData(e.currentTarget));
              if (await respond(holding, "Đã giữ chỗ", body)) setHolding(null);
            }}
          >
            <p>
              Phòng {holding.room} · {holding.name}. Khi giữ chỗ, tin đăng được ẩn
              và các lịch hẹn khác của phòng được đóng. Lập hợp đồng từ yêu cầu
              giữ chỗ trước hạn, quá hạn hệ thống tự trả phòng về trống.
            </p>
            <label className="field">
              <span>Tiền cọc giữ chỗ (₫)</span>
              <input type="number" name="holdDeposit" min={0} step={1} required defaultValue={0} />
            </label>
            <label className="field">
              <span>Giữ chỗ đến ngày (tối đa 30 ngày)</span>
              <input
                type="date"
                name="holdUntil"
                required
                min={TODAY_INPUT}
                max={addDays(30)}
                defaultValue={addDays(7)}
              />
            </label>
            <button className="button">Xác nhận giữ chỗ</button>
          </form>
        </Modal>
      )}

      {/* Overdue / Unpaid Invoices Needing Attention Table */}
      <section className="admin-panel dashboard-bills">
        <div className="panel-heading">
          <div>
            <h2>Hóa đơn cần lưu ý thanh toán</h2>
            <p>Danh sách các hóa đơn chưa hoàn tất hoặc nợ đọng</p>
          </div>
          <Link to="/chu-tro/hoa-don" className="text-button" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13.5px", fontWeight: 600 }}>
            Quản lý tất cả hóa đơn
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Người thuê đại diện</th>
                <th>Căn phòng</th>
                <th>Kỳ hóa đơn</th>
                <th>Tổng số tiền</th>
                <th>Còn phải thu</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {invoices
                .filter((x) => x.status !== "Đã thanh toán")
                .slice(0, 6)
                .map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <strong style={{ color: "var(--ink)" }}>{invoice.name || "Khách thuê"}</strong>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: "11.5px" }}>
                        Mã HĐ: #{invoice.id}
                      </small>
                    </td>
                    <td>
                      <strong>Phòng {invoice.room}</strong>
                    </td>
                    <td>{invoice.month}</td>
                    <td>
                      <strong>{money(invoice.amount)}</strong>
                    </td>
                    <td>
                      <strong style={{ color: "#DC2626" }}>{money(invoice.remaining)}</strong>
                    </td>
                    <td>
                      <Status>{invoice.status}</Status>
                    </td>
                  </tr>
                ))}
              {invoices.filter((x) => x.status !== "Đã thanh toán").length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "28px", color: "var(--muted)" }}>
                    Tuyệt vời! Tất cả các hóa đơn tiền phòng đã được thanh toán đầy đủ.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="fine-print owner-count-note" style={{ marginTop: "24px", color: "var(--muted)", fontSize: "13px" }}>
        💡 Hệ thống hiện đang lưu trữ hồ sơ của <strong>{tenants.length}</strong> khách thuê và <strong>{rooms.length}</strong> phòng trọ. Tất cả các tính toán tài chính đều được đồng bộ chính xác với cơ sở dữ liệu Spring Boot.
      </p>
    </div>
  );
}
