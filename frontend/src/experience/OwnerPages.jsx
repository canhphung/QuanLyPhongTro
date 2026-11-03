import { useState } from "react";
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
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const { requests, user, logout, notify } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const section =
    ownerMenus.find(([path]) => location.pathname.includes(path))?.[1] ||
    "Tổng quan";
  const pending = requests.filter((x) => x.status === "Chờ xác nhận");
  return (
    <div className="owner-app" data-ui>
      <a href="#owner-main" className="skip-link">
        Đến nội dung chính
      </a>
      <aside className={`owner-sidebar ${menu ? "mobile-open" : ""}`}>
        <div className="owner-sidebar-brand">
          <Brand />
          <button
            className="icon-button owner-menu-close"
            onClick={() => setMenu(false)}
            aria-label="Đóng menu"
          >
            <X size={19} />
          </button>
        </div>
        <div className="workspace-picker">
          <span className="workspace-mark">PM</span>
          <div>
            <strong>Không gian chủ trọ</strong>
            <small>Dữ liệu của bạn</small>
          </div>
        </div>
        <nav aria-label="Quản lý chủ trọ">
          {ownerMenus.map(([path, label, icon]) => {
            const Icon = icons[icon];
            return (
              <NavLink
                key={path}
                to={`/chu-tro/${path}`}
                onClick={() => setMenu(false)}
              >
                <Icon size={19} strokeWidth={1.6} />
                {label}
                {path === "tin-dang" && pending.length > 0 && (
                  <span className="sidebar-count">{pending.length}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="owner-sidebar-bottom">
          <Link to="/" className="sidebar-public-link">
            <ExternalLink size={17} />
            Xem trang tìm phòng
          </Link>
          <button
            onClick={async () => {
              try {
                await logout();
              } catch (e) {
                notify(e.message);
              }
            }}
          >
            <LogOut size={17} />
            Rời khu quản lý
          </button>
          <div className="owner-profile">
            <span className="avatar">
              {user.name.split(" ").at(-1)?.slice(0, 2)}
            </span>
            <div>
              <strong>{user.name}</strong>
              <small>Chủ trọ</small>
            </div>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="owner-menu-shade"
          aria-label="Đóng điều hướng"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="owner-app-body">
        <header className="owner-topbar">
          <div>
            <button
              className="icon-button owner-menu-open"
              onClick={() => setMenu(true)}
              aria-label="Mở menu quản lý"
              aria-expanded={menu}
            >
              <Menu size={21} />
            </button>
            <span className="owner-breadcrumb">
              Không gian chủ trọ
              <ChevronRight size={14} />
              <strong>{section}</strong>
            </span>
          </div>
          <div className="owner-topbar-actions">
            <form
              className="owner-quick-search"
              onSubmit={(event) => {
                event.preventDefault();
                navigate(`/chu-tro/phong?q=${encodeURIComponent(search)}`);
              }}
            >
              <Search size={17} />
              <input
                aria-label="Tìm nhanh phòng"
                placeholder="Tìm phòng…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <button
              className="icon-button notification-button"
              aria-label={`Thông báo, ${pending.length} yêu cầu đang chờ`}
              onClick={() => setNotifications(true)}
            >
              <Bell size={20} />
              {pending.length > 0 && <span>{pending.length}</span>}
            </button>
            <Link
              className="topbar-avatar avatar"
              to="/tai-khoan"
              aria-label="Xem hồ sơ"
            >
              {user.name.split(" ").at(-1)?.slice(0, 2)}
            </Link>
          </div>
        </header>
        <main id="owner-main" className="owner-main">
          <div className="owner-data-banner">
            <Info size={15} />
            <span>
              Dữ liệu được lưu trên máy chủ và quản lý theo tài khoản của bạn.
            </span>
            <Link to="/">
              Về trang công khai
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <Outlet />
        </main>
        <footer className="owner-footer">
          Phòng mình · Giữ chuyện quản lý nhà gọn hơn.
          <span>Quản lý phòng trọ</span>
        </footer>
      </div>
      {notifications && (
        <Modal
          title="Yêu cầu xem và thuê phòng"
          onClose={() => setNotifications(false)}
        >
          {pending.length ? (
            <div className="notification-list">
              {pending.map((request) => (
                <div key={request.id}>
                  <CalendarDays size={20} />
                  <div>
                    <strong>{request.name}</strong>
                    <p>
                      {request.type} tại {request.building}, {request.room}
                    </p>
                    <small>
                      {request.date} · {request.time}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa có yêu cầu đang chờ"
              message="Yêu cầu bạn tạo ở trang chi tiết phòng sẽ xuất hiện tại đây."
            />
          )}
          <Link
            className="button"
            to="/chu-tro/tong-quan"
            onClick={() => setNotifications(false)}
          >
            Về tổng quan
          </Link>
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
    [
      "Tổng số phòng",
      rooms.length,
      `${buildings.length} nhà trọ trong danh sách`,
      DoorOpen,
      "phong",
    ],
    [
      "Phòng còn trống",
      rooms.filter((x) => x.available).length,
      "Sẵn sàng cho người thuê mới",
      Building2,
      "phong",
    ],
    [
      "Tổng tiền đã thu",
      money(paid),
      `${payments.length} khoản thanh toán được ghi nhận`,
      Wallet,
      "thanh-toan",
    ],
    [
      "Tiền chưa thanh toán",
      money(debt),
      `${invoices.filter((x) => x.status !== "Đã thanh toán").length} hóa đơn cần đối chiếu`,
      Receipt,
      "hoa-don",
    ],
  ];
  return (
    <div>
      <PageTitle
        title="Một ngày quản lý nhẹ hơn"
        subtitle={`Chào ${user.name.split(" ").at(-1)}. Đây là tình hình nhà trọ của bạn, ${TODAY_TEXT}.`}
        action={
          <Link className="button" to="/chu-tro/tin-dang?new=1">
            <Plus size={18} />
            Tạo tin đăng
          </Link>
        }
      />
      <div className="dashboard-stats">
        {stats.map(([title, value, note, Icon, to]) => (
          <Link className="stat-panel" key={title} to={`/chu-tro/${to}`}>
            <div>
              <span>{title}</span>
              <Icon size={20} strokeWidth={1.5} />
            </div>
            <strong>{value}</strong>
            <p>{note}</p>
          </Link>
        ))}
      </div>
      <div className="dashboard-overview">
        <section className="admin-panel revenue-panel">
          <div className="panel-heading">
            <div>
              <h2>Thu và cần thu</h2>
              <p>Đối chiếu từ các hóa đơn đang có</p>
            </div>
            <Link className="text-button" to="/chu-tro/hoa-don">
              Xem hóa đơn
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="revenue-bars">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="revenue-bar-group">
                <div className="bar-value">
                  {(invoice.amount / 1000000).toFixed(2).replace(".", ",")} tr
                </div>
                <div className="bar-space">
                  <div
                    className={
                      invoice.status === "Đã thanh toán"
                        ? "revenue-bar paid"
                        : "revenue-bar"
                    }
                    style={{
                      height: `${(invoice.amount / Math.max(...invoices.map((x) => x.amount), 1)) * 100}%`,
                    }}
                  />
                </div>
                <span>{invoice.room}</span>
                <small>{invoice.month}</small>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span>
              <i />
              Chưa thanh toán
            </span>
            <span>
              <i />
              Đã thanh toán
            </span>
          </div>
        </section>
        <section className="admin-panel occupancy-panel">
          <div className="panel-heading">
            <div>
              <h2>Tình trạng phòng</h2>
              <p>Trong danh sách quản lý</p>
            </div>
            <DoorOpen size={21} />
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
              r="77"
              fill="none"
              stroke="var(--surface)"
              strokeWidth="19"
            />
            <circle
              cx="100"
              cy="100"
              r="77"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="19"
              strokeDasharray={`${rooms.length ? (occupied / rooms.length) * 484 : 0} 484`}
              transform="rotate(-90 100 100)"
            />
            <text
              x="100"
              y="99"
              textAnchor="middle"
              className="occupancy-value"
            >
              {rooms.length ? Math.round((occupied / rooms.length) * 100) : 0}%
            </text>
            <text
              x="100"
              y="121"
              textAnchor="middle"
              className="occupancy-caption"
            >
              đang được thuê
            </text>
          </svg>
          <div className="occupancy-legend">
            <p>
              <span>
                <i />
                Đang thuê
              </span>
              <strong>{occupied} phòng</strong>
            </p>
            <p>
              <span>
                <i />
                Còn trống
              </span>
              <strong>{rooms.filter((x) => x.available).length} phòng</strong>
            </p>
          </div>
          <Link className="plain-link" to="/chu-tro/phong">
            Quản lý từng phòng
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <h2>Lịch hẹn & giữ chỗ</h2>
            <p>
              {upcoming.length
                ? `${awaiting} yêu cầu chờ phản hồi · ${upcoming.length} đang theo dõi`
                : "Lịch hẹn xem và yêu cầu thuê phòng mới"}
            </p>
          </div>
          <CalendarDays size={21} />
        </div>
        {upcoming.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Người liên hệ</th>
                  <th>Căn phòng</th>
                  <th>Lịch mong muốn</th>
                  <th>Loại yêu cầu</th>
                  <th>Trạng thái</th>
                  <th>Phản hồi</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.name}</strong>
                      <small>{request.phone}</small>
                    </td>
                    <td>
                      {request.building}
                      <small>{request.room}</small>
                    </td>
                    <td>
                      {request.date}
                      <small>{request.time}</small>
                    </td>
                    <td>{request.type}</td>
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
                              className="text-button"
                              onClick={() => respond(request, "Đã xác nhận")}
                            >
                              <Check size={15} />
                              Xác nhận
                            </button>
                            <button
                              className="icon-button"
                              aria-label="Từ chối yêu cầu"
                              onClick={() => respond(request, "Đã từ chối")}
                            >
                              <X size={17} />
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
          <div className="inline-empty">
            <CalendarDays size={28} strokeWidth={1.3} />
            <div>
              <h3>Chưa có lịch hẹn mới</h3>
              <p>Yêu cầu mới từ người tìm phòng sẽ xuất hiện tại đây.</p>
            </div>
            <Link className="button button-soft" to="/tim-phong">
              Xem tin đăng
              <ArrowUpRight size={16} />
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
      <section className="admin-panel dashboard-bills">
        <div className="panel-heading">
          <div>
            <h2>Hóa đơn cần chú ý</h2>
            <p>Những khoản chưa được ghi nhận thanh toán</p>
          </div>
          <Link to="/chu-tro/hoa-don" className="text-button">
            Xem tất cả
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Người thuê</th>
                <th>Phòng</th>
                <th>Kỳ hóa đơn</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {invoices
                .filter((x) => x.status !== "Đã thanh toán")
                .slice(0, 5)
                .map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <strong>{invoice.name}</strong>
                      <small>{invoice.id}</small>
                    </td>
                    <td>{invoice.room}</td>
                    <td>{invoice.month}</td>
                    <td>
                      <strong>{money(invoice.amount)}</strong>
                    </td>
                    <td>
                      <Status>{invoice.status}</Status>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="fine-print owner-count-note">
        Danh sách hiện có {tenants.length} hồ sơ người thuê. Các thống kê được
        tính từ dữ liệu trên máy chủ.
      </p>
    </div>
  );
}
