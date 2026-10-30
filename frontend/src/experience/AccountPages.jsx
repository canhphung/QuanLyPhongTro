import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  UserRound,
  CalendarDays,
  FileText,
  Receipt,
  CreditCard,
  Heart,
  LogOut,
  Eye,
  EyeOff,
  Check,
  Clock3,
  ArrowLeft,
  ShieldCheck,
  DoorOpen,
  Wrench,
  AlertCircle,
  Lock,
  Bell,
  Bookmark,
  Trash2,
  FolderPlus,
  Share2,
} from "lucide-react";
import { useAppData } from "./context";
import { EmptyState, Status, Modal, RoomCard } from "./ui";
import { InvoiceModal, ContractModal } from "./BusinessDetails";
import { money, TODAY_INPUT } from "./data";

export function AuthPage({ register = false }) {
  const { authenticate } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegister, setIsRegister] = useState(register);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [role, setRole] = useState("tenant");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    if (isRegister && form.get("password") !== form.get("confirm")) {
      setError("Mật khẩu nhập lại chưa trùng khớp.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const user = await authenticate(
        isRegister ? "register" : "login",
        Object.fromEntries(form),
      );
      const next = new URLSearchParams(location.search).get("next");
      navigate(
        next?.startsWith("/") && !next.startsWith("//")
          ? next
          : user.role === "admin"
            ? "/quan-tri/tin-dang"
            : user.role === "owner"
              ? "/chu-tro/tong-quan"
              : "/tai-khoan",
        { replace: true },
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        background: "linear-gradient(135deg, #F0F6FF 0%, #F8FAFC 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "#FFFFFF",
          borderRadius: "28px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.12)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1.15fr",
        }}
      >
        {/* Left Lifestyle Showcase */}
        <div
          style={{
            background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #4F46E5 100%)",
            color: "#FFFFFF",
            padding: "48px 36px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 2 }}>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#DBEAFE",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                marginBottom: "32px",
              }}
            >
              <ArrowLeft size={16} /> Về trang chủ
            </Link>

            <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", lineHeight: "1.25", marginBottom: "16px" }}>
              {isRegister
                ? "Bắt đầu hành trình tìm chốn riêng lý tưởng."
                : "Chào bạn trở lại với Phòng Mình."}
            </h2>

            <p style={{ fontSize: "15px", color: "#DBEAFE", lineHeight: "1.6" }}>
              Nền tảng tìm kiếm phòng trọ, hẹn xem trực tuyến và quản lý hợp đồng thuê nhà
              minh bạch hàng đầu.
            </p>
          </div>

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#E0E7FF" }}>
                <Check size={18} color="#93C5FD" /> Hơn 500+ căn phòng đã xác thực thông tin
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#E0E7FF" }}>
                <Check size={18} color="#93C5FD" /> Xem hóa đơn điện nước & hợp đồng trực tuyến
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#E0E7FF" }}>
                <Check size={18} color="#93C5FD" /> Không phí trung gian môi giới
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div style={{ padding: "48px 40px" }}>
          {/* Tabs for Login vs Register */}
          <div
            style={{
              display: "flex",
              background: "#F1F5F9",
              borderRadius: "14px",
              padding: "4px",
              marginBottom: "28px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError("");
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: 0,
                background: !isRegister ? "#FFFFFF" : "transparent",
                color: !isRegister ? "#2563EB" : "#64748B",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: !isRegister ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError("");
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: 0,
                background: isRegister ? "#FFFFFF" : "transparent",
                color: isRegister ? "#2563EB" : "#64748B",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: isRegister ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              Đăng ký tài khoản
            </button>
          </div>

          <form
            onSubmit={submit}
            key={isRegister ? "register" : "login"}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {isRegister && (
              <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Họ và tên của bạn</span>
                <input
                  name="name"
                  required
                  autoComplete="name"
                  maxLength={255}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                />
              </label>
            )}

            <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Email đăng nhập</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
                placeholder="ban@example.com"
                style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
              />
            </label>

            <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Mật khẩu</span>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  minLength={isRegister ? 8 : 1}
                  maxLength={72}
                  required
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  placeholder={isRegister ? "Ít nhất 8 ký tự" : "Mật khẩu"}
                  style={{
                    width: "100%",
                    padding: "11px 44px 11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    border: 0,
                    color: "#64748B",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {isRegister && (
              <>
                <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Xác nhận mật khẩu</span>
                  <input
                    name="confirm"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    required
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                  />
                </label>

                <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Vai trò tham gia</span>
                  <select
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid #E2E8F0",
                      background: "#F8FAFC",
                      fontWeight: 600,
                    }}
                  >
                    <option value="tenant">Khách tìm phòng / Người thuê phòng</option>
                    <option value="owner">Chủ nhà trọ (Đăng tin & Quản lý)</option>
                  </select>
                </label>
              </>
            )}

            {!isRegister && (
              <div style={{ textAlign: "right" }}>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  style={{
                    background: "none",
                    border: 0,
                    color: "#2563EB",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#EF4444",
                  padding: "12px",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-search-hero"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "13px",
                marginTop: "8px",
                fontSize: "15px",
              }}
            >
              {busy ? "Đang xử lý..." : isRegister ? "Hoàn tất đăng ký" : "Đăng nhập ngay"}
              <ArrowRight size={18} />
            </button>
          </form>

          {showForgot && (
            <Modal title="Quên mật khẩu?" onClose={() => setShowForgot(false)}>
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                  <Lock size={26} />
                </div>
                <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                  Khôi phục tài khoản
                </h4>
                <p style={{ fontSize: "14px", color: "#64748B", lineHeight: "1.5", marginBottom: "20px" }}>
                  Để đặt lại mật khẩu, vui lòng liên hệ trực tiếp quản trị viên hoặc hotline
                  <strong> 1900 8899</strong> để được hỗ trợ xác minh danh tính an toàn.
                </p>
                <button className="btn-header-register" onClick={() => setShowForgot(false)}>
                  Đã hiểu
                </button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}

export function RequireAccount({ owner = false, admin = false, children }) {
  const { user } = useAppData();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to={`/dang-nhap?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (admin && !user.roles?.includes("ADMIN") && !user.roles?.includes("CHU_TRO")) {
    return (
      <div className="client-container" style={{ padding: "80px 24px" }}>
        <EmptyState
          title="Khu vực quản trị"
          message="Tài khoản của bạn không có quyền duyệt tin đăng."
          action={<Link className="btn-header-register" to="/">Về trang chủ</Link>}
        />
      </div>
    );
  }

  if (owner && user.role !== "owner") {
    return (
      <div className="client-container" style={{ padding: "80px 24px" }}>
        <EmptyState
          title="Khu vực dành riêng cho chủ trọ"
          message="Bạn đang đăng nhập bằng tài khoản người thuê phòng."
          action={<Link className="btn-header-register" to="/tai-khoan">Về tài khoản của tôi</Link>}
        />
      </div>
    );
  }

  return children;
}

export function AccountLayout() {
  const { user, contracts, invoices, requests, collections, logout, notify } = useAppData();
  const location = useLocation();

  // Redirect owner from tenant-specific tabs if needed
  if (user?.role === "owner" && location.pathname.replace(/\/$/, "") !== "/tai-khoan") {
    return <Navigate to="/chu-tro/tong-quan" replace />;
  }

  const unpaidTotal = invoices
    .filter((x) => x.status !== "Đã thanh toán")
    .reduce((sum, x) => sum + Number(x.remaining || x.amount || 0), 0);

  const activeContract = contracts[0];

  const pendingNotifsCount =
    invoices.filter((x) => x.status !== "Đã thanh toán").length +
    requests.filter((x) => x.status === "Chờ xác nhận").length;

  return (
    <div className="tenant-portal-wrapper">
      {/* Welcome Top Banner */}
      <div className="tenant-welcome-banner">
        <div className="tenant-welcome-copy">
          <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#93C5FD", display: "inline-block", marginBottom: "6px" }}>
            Trung tâm tài khoản khách thuê
          </span>
          <h1>Xin chào, {user.name}!</h1>
          <p>
            Theo dõi hợp đồng thuê, thanh toán hóa đơn điện nước và gửi yêu cầu hỗ trợ thuận tiện.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", zIndex: 2 }}>
          <button
            className="btn-header-login"
            style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF", borderColor: "rgba(255,255,255,0.2)" }}
            onClick={async () => {
              try {
                await logout();
              } catch (e) {
                notify(e.message);
              }
            }}
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="tenant-stats-grid">
        <div className="tenant-stat-card">
          <span>Phòng đang thuê</span>
          <strong>{activeContract ? `Phòng ${activeContract.room}` : "Chưa thuê phòng"}</strong>
          <small style={{ color: "#64748B" }}>{activeContract ? activeContract.building : "Chưa liên kết"}</small>
        </div>

        <div className="tenant-stat-card">
          <span>Hợp đồng hiện tại</span>
          <strong>{contracts.length > 0 ? `${contracts.length} hợp đồng` : "Chưa có"}</strong>
          <small style={{ color: "#10B981" }}>{activeContract ? activeContract.status : "—"}</small>
        </div>

        <div className={`tenant-stat-card ${unpaidTotal > 0 ? "alert" : ""}`}>
          <span>Khoản cần thanh toán</span>
          <strong>{money(unpaidTotal)}</strong>
          <small style={{ color: unpaidTotal > 0 ? "#EF4444" : "#10B981" }}>
            {unpaidTotal > 0 ? "Có hóa đơn chờ đóng" : "Đã thanh toán đủ"}
          </small>
        </div>

        <div className="tenant-stat-card">
          <span>Yêu cầu đang xử lý</span>
          <strong>{requests.length} yêu cầu</strong>
          <small style={{ color: "#64748B" }}>Xem phòng & Báo hỏng</small>
        </div>
      </div>

      {/* Tenant Portal Navigation Tabs */}
      <nav className="tenant-portal-tabs" aria-label="Menu tài khoản khách thuê">
        <NavLink to="/tai-khoan" end className="tenant-tab-link">
          <UserRound size={17} />
          Thông tin cá nhân
        </NavLink>
        <NavLink to="/tai-khoan/hop-dong" className="tenant-tab-link">
          <DoorOpen size={17} />
          Phòng & Hợp đồng
        </NavLink>
        <NavLink to="/tai-khoan/hoa-don" className="tenant-tab-link">
          <Receipt size={17} />
          Hóa đơn & Tiền phòng
        </NavLink>
        <NavLink to="/tai-khoan/thanh-toan" className="tenant-tab-link">
          <CreditCard size={17} />
          Lịch sử thanh toán
        </NavLink>
        <NavLink to="/tai-khoan/yeu-cau" className="tenant-tab-link">
          <CalendarDays size={17} />
          Lịch hẹn & Báo hỏng
        </NavLink>
        <NavLink to="/tai-khoan/thong-bao" className="tenant-tab-link" style={{ position: "relative" }}>
          <Bell size={17} />
          Thông báo
          {pendingNotifsCount > 0 && (
            <span className="nav-count">{pendingNotifsCount}</span>
          )}
        </NavLink>
        <NavLink to="/tai-khoan/bo-suu-tap" className="tenant-tab-link">
          <Bookmark size={17} />
          Bộ sưu tập ({collections.length})
        </NavLink>
      </nav>

      {/* Nested Route Content */}
      <div style={{ background: "#FFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0", padding: "36px", boxShadow: "0 4px 16px rgba(15,23,42,0.04)" }}>
        <Outlet />
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user: profile, mutate, notify } = useAppData();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await mutate(
        "/profile",
        "PUT",
        Object.fromEntries(new FormData(event.currentTarget)),
      );
      setEditing(false);
      notify("Đã cập nhật thông tin cá nhân thành công.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function linkTenantCode(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      await mutate(
        "/tenant-link",
        "POST",
        Object.fromEntries(new FormData(form)),
      );
      form.reset();
      notify("Đã liên kết hồ sơ người thuê thành công! Hợp đồng và hóa đơn đã được kích hoạt.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A" }}>Hồ sơ cá nhân</h2>
          <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
            Thông tin liên hệ của bạn để chủ nhà trao đổi và lập hợp đồng thuê
          </p>
        </div>

        {!editing ? (
          <button className="btn-header-login" onClick={() => setEditing(true)}>
            Chỉnh sửa hồ sơ
          </button>
        ) : (
          <button className="text-button" onClick={() => setEditing(false)}>
            Hủy chỉnh sửa
          </button>
        )}
      </div>

      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "700px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Họ và tên</span>
            <input
              name="name"
              defaultValue={profile.name}
              required
              readOnly={!editing}
              style={{
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                background: editing ? "#FFFFFF" : "#F8FAFC",
              }}
            />
          </label>

          <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Ngày sinh</span>
            <input
              name="birthday"
              type="date"
              defaultValue={profile.birthday || ""}
              readOnly={!editing}
              max={TODAY_INPUT}
              style={{
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                background: editing ? "#FFFFFF" : "#F8FAFC",
              }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Email đăng nhập</span>
            <input
              type="email"
              defaultValue={profile.email}
              readOnly
              style={{
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                background: "#F1F5F9",
                color: "#64748B",
              }}
            />
          </label>

          <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Số điện thoại liên hệ</span>
            <input
              name="phone"
              type="tel"
              defaultValue={profile.phone || ""}
              readOnly={!editing}
              placeholder="09xx xxx xxx"
              style={{
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                background: editing ? "#FFFFFF" : "#F8FAFC",
              }}
            />
          </label>
        </div>

        <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Địa chỉ thường trú / Quê quán</span>
          <input
            name="address"
            defaultValue={profile.address || ""}
            readOnly={!editing}
            placeholder="Số nhà, đường, phường, quận, tỉnh..."
            style={{
              padding: "11px 14px",
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              background: editing ? "#FFFFFF" : "#F8FAFC",
            }}
          />
        </label>

        {editing && (
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button type="submit" className="btn-search-hero" disabled={busy}>
              {busy ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button type="button" className="btn-header-login" onClick={() => setEditing(false)}>
              Hủy
            </button>
          </div>
        )}
      </form>

      {/* Tenant Link Code Section */}
      {profile.role === "tenant" && (
        <div
          style={{
            marginTop: "48px",
            padding: "28px",
            borderRadius: "20px",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#EFF6FF", color: "#2563EB", display: "grid", placeItems: "center" }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A" }}>
                Liên kết mã người thuê với chủ trọ
              </h3>
              <span style={{ fontSize: "13px", color: "#64748B" }}>
                Đã liên kết {profile.linkedTenantIds?.length || 0} hồ sơ người thuê.
              </span>
            </div>
          </div>

          <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", marginBottom: "16px" }}>
            Khi thuê phòng, chủ trọ sẽ cấp cho bạn một <strong>Mã liên kết</strong>. Nhập mã tại đây để hệ thống tự động đồng bộ hợp đồng thuê, hóa đơn tiền phòng và lịch sử thanh toán vào tài khoản của bạn.
          </p>

          <form onSubmit={linkTenantCode} style={{ display: "flex", gap: "12px", maxWidth: "480px" }}>
            <input
              name="code"
              required
              autoComplete="off"
              placeholder="Nhập mã do chủ trọ cung cấp..."
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
              }}
            />
            <button type="submit" className="btn-header-register" disabled={busy}>
              Liên kết ngay
            </button>
          </form>
        </div>
      )}

      {error && (
        <p style={{ color: "#EF4444", fontSize: "13.5px", marginTop: "16px" }}>{error}</p>
      )}
    </div>
  );
}

export function MyContractsPage() {
  const { contracts } = useAppData();
  const [detail, setDetail] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A" }}>Phòng đang thuê & Hợp đồng</h2>
        <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
          Thông tin chi tiết về căn phòng bạn đang ở, thời hạn thuê và danh sách người ở cùng
        </p>
      </div>

      {contracts.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {contracts.map((contract) => (
            <div
              key={contract.id}
              style={{
                borderRadius: "20px",
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "24px",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <Status>{contract.status}</Status>
                  <span style={{ fontSize: "13px", color: "#64748B" }}>Mã HĐ: #{contract.id}</span>
                </div>

                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", marginBottom: "6px" }}>
                  Phòng {contract.room} — {contract.building}
                </h3>

                <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "16px" }}>
                  Đại diện người thuê: <strong>{contract.name}</strong> · {contract.members?.length || 1} thành viên cùng phòng
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", maxWidth: "560px" }}>
                  <div style={{ background: "#FFFFFF", padding: "10px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                    <span style={{ fontSize: "12px", color: "#64748B", display: "block" }}>Thời hạn hợp đồng</span>
                    <strong style={{ fontSize: "13.5px", color: "#0F172A" }}>{contract.start} → {contract.end}</strong>
                  </div>

                  <div style={{ background: "#FFFFFF", padding: "10px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                    <span style={{ fontSize: "12px", color: "#64748B", display: "block" }}>Giá thuê hàng tháng</span>
                    <strong style={{ fontSize: "13.5px", color: "#2563EB" }}>{money(contract.price)}</strong>
                  </div>

                  <div style={{ background: "#FFFFFF", padding: "10px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                    <span style={{ fontSize: "12px", color: "#64748B", display: "block" }}>Tiền đặt cọc</span>
                    <strong style={{ fontSize: "13.5px", color: "#0F172A" }}>{money(contract.deposit)}</strong>
                  </div>
                </div>
              </div>

              <div>
                <button
                  className="btn-header-register"
                  onClick={() => setDetail(contract)}
                >
                  <FileText size={16} /> Xem hợp đồng & thành viên
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có hợp đồng nào"
          message="Bạn chưa có hợp đồng thuê nào được kích hoạt. Hãy nhập mã liên kết từ chủ trọ tại mục 'Thông tin cá nhân'."
        />
      )}

      {detail && (
        <ContractModal contract={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}

export function MyInvoicesPage() {
  const { invoices } = useAppData();
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState("Tất cả");

  const filteredInvoices = invoices.filter(
    (x) => filter === "Tất cả" || x.status === filter,
  );

  const unpaidTotal = invoices
    .filter((x) => x.status !== "Đã thanh toán")
    .reduce((sum, x) => sum + Number(x.remaining || x.amount || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A" }}>Hóa đơn & Tiền phòng</h2>
          <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
            Chi tiết tiền thuê, chỉ số điện nước và các khoản phí dịch vụ hàng tháng
          </p>
        </div>

        {/* Unpaid box */}
        <div
          style={{
            background: unpaidTotal > 0 ? "#FEF2F2" : "#ECFDF5",
            border: `1px solid ${unpaidTotal > 0 ? "#FECACA" : "#A7F3D0"}`,
            padding: "12px 20px",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <Receipt size={24} color={unpaidTotal > 0 ? "#EF4444" : "#10B981"} />
          <div>
            <span style={{ fontSize: "12px", color: "#64748B", display: "block" }}>Số tiền cần thanh toán</span>
            <strong style={{ fontSize: "20px", color: unpaidTotal > 0 ? "#EF4444" : "#059669" }}>
              {money(unpaidTotal)}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["Tất cả", "Chưa thanh toán", "Đã thanh toán"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: 0,
              background: filter === f ? "#2563EB" : "#F1F5F9",
              color: filter === f ? "#FFFFFF" : "#475569",
              fontWeight: 600,
              fontSize: "13.5px",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredInvoices.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px" }}>Kỳ hóa đơn</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px" }}>Phòng</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px" }}>Tổng tiền</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px" }}>Đã trả</th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px" }}>Trạng thái</th>
                <th style={{ padding: "14px 16px", textAlign: "right", fontSize: "13px" }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "16px" }}>
                    <strong>Tháng {inv.month}</strong>
                    <span style={{ fontSize: "12px", color: "#64748B", display: "block" }}>HĐ #{inv.id}</span>
                  </td>
                  <td style={{ padding: "16px", fontWeight: 600 }}>Phòng {inv.room}</td>
                  <td style={{ padding: "16px", fontWeight: 700, color: "#0F172A" }}>{money(inv.amount)}</td>
                  <td style={{ padding: "16px", color: "#10B981", fontWeight: 600 }}>{money(inv.paid || 0)}</td>
                  <td style={{ padding: "16px" }}>
                    <Status>{inv.status}</Status>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button
                      className="text-button"
                      style={{ color: "#2563EB", fontWeight: 600, fontSize: "13.5px" }}
                      onClick={() => setDetail(inv)}
                    >
                      Xem chi tiết <ArrowUpRight size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Không có hóa đơn ở trạng thái này"
          message="Bạn đã thanh toán đầy đủ hoặc chưa có hóa đơn phát sinh."
        />
      )}

      {detail && (
        <InvoiceModal invoice={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}

export function MyPaymentsPage() {
  const { payments } = useAppData();
  const [detail, setDetail] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A" }}>Lịch sử giao dịch thanh toán</h2>
        <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
          Các khoản thanh toán tiền phòng, điện nước đã được chủ trọ xác nhận và lưu trữ
        </p>
      </div>

      {payments.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {payments.map((p) => (
            <div
              key={p.id}
              onClick={() => setDetail(p)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#ECFDF5", color: "#10B981", display: "grid", placeItems: "center" }}>
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <strong style={{ fontSize: "15px", color: "#0F172A", display: "block" }}>
                    Thanh toán phòng {p.room}
                  </strong>
                  <span style={{ fontSize: "13px", color: "#64748B" }}>
                    Ngày {p.date} · {p.method}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "24px" }}>
                <div>
                  <strong style={{ fontSize: "16px", color: "#2563EB", display: "block" }}>
                    {money(p.amount)}
                  </strong>
                  <Status>{p.status}</Status>
                </div>
                <ArrowUpRight size={18} color="#64748B" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có lịch sử thanh toán"
          message="Khi bạn đóng tiền phòng hoặc thanh toán cho chủ nhà, giao dịch được xác nhận sẽ lưu lại tại đây."
        />
      )}

      {detail && (
        <Modal title="Chi tiết giao dịch thanh toán" onClose={() => setDetail(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ color: "#64748B" }}>Mã thanh toán:</span>
              <strong>#{detail.id}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ color: "#64748B" }}>Mã hóa đơn liên quan:</span>
              <strong>#{detail.invoice}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ color: "#64748B" }}>Ngày giao dịch:</span>
              <strong>{detail.date}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ color: "#64748B" }}>Phương thức:</span>
              <strong>{detail.method}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ color: "#64748B" }}>Số tiền:</span>
              <strong style={{ fontSize: "18px", color: "#2563EB" }}>{money(detail.amount)}</strong>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function MyRequestsPage() {
  const { requests, publicRooms: rooms, respond, mutate, notify } = useAppData();
  const [cancelModal, setCancelModal] = useState(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSendSupport(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      // Find active room or first room
      const firstRoomId = rooms[0]?.id || 1;
      await mutate("/requests", "POST", {
        roomId: firstRoomId,
        type: form.get("type") || "Báo hỏng thiết bị",
        date: TODAY_INPUT,
        time: "10:00",
        name: form.get("name"),
        phone: form.get("phone"),
        note: form.get("note"),
      });
      setSupportModalOpen(false);
      notify("Đã gửi yêu cầu hỗ trợ sửa chữa thành công đến chủ nhà!");
    } catch (err) {
      notify(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A" }}>Lịch hẹn & Yêu cầu hỗ trợ</h2>
          <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
            Theo dõi lịch hẹn xem phòng và gửi báo hỏng thiết bị sửa chữa cho chủ nhà
          </p>
        </div>

        <button className="btn-header-register" onClick={() => setSupportModalOpen(true)}>
          <Wrench size={16} /> Báo hỏng thiết bị / Hỗ trợ
        </button>
      </div>

      {requests.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {requests.map((req) => (
            <div
              key={req.id}
              style={{
                borderRadius: "18px",
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <Status>{req.status}</Status>
                  <span style={{ fontSize: "12.5px", color: "#64748B" }}>
                    <CalendarDays size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {req.date} {req.time}
                  </span>
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
                  {req.title || `Yêu cầu tại ${req.building || "nhà trọ"}`}
                </h3>
                <p style={{ fontSize: "13.5px", color: "#64748B" }}>
                  Loại yêu cầu: <strong>{req.type}</strong> {req.note && ` · Ghi chú: ${req.note}`}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {req.roomId && (
                  <Link to={`/phong-tro/${req.roomId}`} className="btn-header-login">
                    Xem phòng <ArrowUpRight size={15} />
                  </Link>
                )}
                {!["Đã hủy", "Đã từ chối"].includes(req.status) && (
                  <button
                    className="text-button"
                    style={{ color: "#EF4444" }}
                    onClick={() => setCancelModal(req)}
                  >
                    Hủy yêu cầu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có yêu cầu nào"
          message="Bạn chưa có lịch hẹn xem phòng hay yêu cầu báo hỏng nào."
        />
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <Modal title="Xác nhận hủy yêu cầu" onClose={() => setCancelModal(null)}>
          <p style={{ fontSize: "14.5px", color: "#475569", marginBottom: "24px" }}>
            Bạn có chắc chắn muốn hủy yêu cầu này tại {cancelModal.building}?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button className="btn-header-login" onClick={() => setCancelModal(null)}>
              Quay lại
            </button>
            <button
              className="btn-header-register"
              style={{ background: "#EF4444" }}
              onClick={async () => {
                try {
                  await respond(cancelModal.id, "Đã hủy");
                  setCancelModal(null);
                  notify("Đã hủy yêu cầu.");
                } catch (e) {
                  notify(e.message);
                }
              }}
            >
              Xác nhận hủy
            </button>
          </div>
        </Modal>
      )}

      {/* Maintenance / Repair Support Modal */}
      {supportModalOpen && (
        <Modal title="Gửi yêu cầu sửa chữa / Báo hỏng thiết bị" onClose={() => setSupportModalOpen(false)}>
          <form onSubmit={handleSendSupport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Loại sự cố cần hỗ trợ</span>
              <select
                name="type"
                style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2E8F0", background: "#F8FAFC" }}
              >
                <option value="Hỏng thiết bị điện nước">Sự cố điện nước / Bóng đèn / Vòi nước</option>
                <option value="Hỏng máy lạnh">Máy lạnh không lạnh / Chảy nước</option>
                <option value="Sự cố Wifi Internet">Mất kết nối Internet / Wifi chậm</option>
                <option value="Phản ánh an ninh vệ sinh">An ninh trật tự / Vệ sinh chung</option>
                <option value="Yêu cầu khác">Vấn đề khác</option>
              </select>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Tên người liên hệ</span>
                <input
                  name="name"
                  required
                  placeholder="Họ tên của bạn"
                  style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                />
              </label>

              <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Số điện thoại</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="SĐT để thợ liên hệ"
                  style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                />
              </label>
            </div>

            <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Mô tả chi tiết tình trạng sự cố</span>
              <textarea
                name="note"
                rows={3}
                required
                placeholder="Ví dụ: Vòi sen trong nhà tắm bị rò rỉ nước từ tối hôm qua, nhờ chủ nhà cho thợ qua kiểm tra..."
                style={{ padding: "11px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
              />
            </label>

            <button type="submit" className="btn-search-hero" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
              {busy ? "Đang gửi..." : "Gửi yêu cầu tới chủ trọ"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}


export function MyNotificationsPage() {
  const {
    invoices,
    requests,
    contracts,
    readNotifIds,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppData();

  const notifications = [];

  // Unpaid invoices
  invoices
    .filter((inv) => inv.status !== "Đã thanh toán")
    .forEach((inv) => {
      notifications.push({
        id: `notif-inv-${inv.id}`,
        type: "invoice",
        title: `Hóa đơn cần thanh toán: ${inv.code || `HĐ #${inv.id}`}`,
        desc: `Số tiền: ${money(inv.remaining || inv.amount)} (Kỳ hạn: ${inv.period || "tháng này"}). Vui lòng thanh toán trước hạn.`,
        date: inv.dueDate || inv.createdAt || TODAY_INPUT,
        actionUrl: "/tai-khoan/hoa-don",
        actionLabel: "Thanh toán ngay",
        severity: "warning",
      });
    });

  // Viewing requests & support
  requests.forEach((req) => {
    notifications.push({
      id: `notif-req-${req.id}`,
      type: "request",
      title: `Lịch hẹn/Yêu cầu #${req.id} — ${req.status}`,
      desc:
        req.status === "Chờ xác nhận"
          ? `Yêu cầu "${req.type || "Xem phòng"}" đang chờ chủ nhà phản hồi.`
          : req.status === "Đã duyệt"
            ? `Chủ nhà đã xác nhận yêu cầu "${req.type || "Xem phòng"}" vào ngày ${req.date || ""}.`
            : `Yêu cầu "${req.type || "Xem phòng"}" đã được cập nhật: ${req.status}.`,
      date: req.date || TODAY_INPUT,
      actionUrl: "/tai-khoan/yeu-cau",
      actionLabel: "Xem chi tiết",
      severity: req.status === "Đã duyệt" ? "success" : req.status === "Chờ xác nhận" ? "info" : "muted",
    });
  });

  // Contracts
  contracts.forEach((c) => {
    notifications.push({
      id: `notif-ctr-${c.id}`,
      type: "contract",
      title: `Hợp đồng thuê: Phòng ${c.room} — ${c.building}`,
      desc: `Thời hạn: ${c.startDate} đến ${c.endDate}. Trạng thái: ${c.status}.`,
      date: c.startDate || TODAY_INPUT,
      actionUrl: "/tai-khoan/hop-dong",
      actionLabel: "Xem hợp đồng",
      severity: "info",
    });
  });

  const allIds = notifications.map((n) => n.id);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
            Trung tâm thông báo & Cảnh báo
          </h2>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "4px 0 0" }}>
            Cập nhật tức thời về lịch hẹn xem phòng, nhắc nhở hóa đơn và hợp đồng
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={() => markAllNotificationsRead(allIds)}
            style={{
              background: "#F1F5F9",
              border: "1px solid #E2E8F0",
              color: "#2563EB",
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Đánh dấu tất cả là đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="Không có thông báo mới"
          message="Bạn đã hoàn thành xử lý hết mọi thông báo, hóa đơn và lịch hẹn hiện tại."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map((n) => {
            const isRead = readNotifIds.includes(n.id);
            return (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "16px 20px",
                  borderRadius: "16px",
                  border: isRead ? "1px solid #E2E8F0" : "1.5px solid #93C5FD",
                  background: isRead ? "#FFFFFF" : "#F0F9FF",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: n.severity === "warning" ? "#FEF3C7" : n.severity === "success" ? "#DCFCE7" : "#DBEAFE",
                      color: n.severity === "warning" ? "#D97706" : n.severity === "success" ? "#16A34A" : "#2563EB",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Bell size={18} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "14.5px", color: "#0F172A" }}>{n.title}</strong>
                      {!isRead && (
                        <span style={{ fontSize: "10px", fontWeight: 700, background: "#2563EB", color: "#FFFFFF", padding: "2px 6px", borderRadius: "8px" }}>
                          MỚI
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "13.5px", color: "#475569", margin: "4px 0 8px", lineHeight: "1.5" }}>
                      {n.desc}
                    </p>
                    <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                      Thời gian: {n.date}
                    </span>
                  </div>
                </div>

                <Link
                  to={n.actionUrl}
                  style={{
                    background: "#2563EB",
                    color: "#FFFFFF",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {n.actionLabel}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MyCollectionsPage() {
  const {
    collections,
    createCollection,
    deleteCollection,
    removeFromCollection,
    publicRooms,
    notify,
  } = useAppData();

  const [newColName, setNewColName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleShare = async (col) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/tim-phong`);
      notify(`Đã sao chép liên kết chia sẻ bộ sưu tập "${col.name}"!`);
    } catch {
      notify("Có thể chia sẻ đường dẫn trực tiếp.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
            Bộ sưu tập phòng trọ riêng ({collections.length})
          </h2>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "4px 0 0" }}>
            Quản lý và phân loại các căn phòng bạn quan tâm theo nhu cầu
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#2563EB",
            color: "#FFFFFF",
            border: "none",
            padding: "9px 16px",
            borderRadius: "10px",
            fontSize: "13.5px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <FolderPlus size={16} />
          Tạo bộ sưu tập mới
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newColName.trim()) {
              createCollection(newColName.trim());
              setNewColName("");
              setIsCreating(false);
            }
          }}
          style={{
            display: "flex",
            gap: "10px",
            padding: "16px",
            background: "#F8FAFC",
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
            marginBottom: "24px",
          }}
        >
          <input
            type="text"
            autoFocus
            placeholder="Nhập tên bộ sưu tập (ví dụ: Phòng gần trường học, Phòng dự định thuê...)"
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!newColName.trim()}
            style={{
              background: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            style={{
              background: "#E2E8F0",
              border: "none",
              padding: "10px 14px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {collections.map((col) => {
          const rooms = col.roomIds
            .map((id) => publicRooms.find((r) => r.id === id))
            .filter(Boolean);

          return (
            <div
              key={col.id}
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "18px",
                padding: "20px",
                background: "#FFFFFF",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "#EFF6FF",
                      color: "#2563EB",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Bookmark size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>
                      {col.name}
                    </h3>
                    <span style={{ fontSize: "12.5px", color: "#64748B" }}>
                      {rooms.length} phòng trong danh sách
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => handleShare(col)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#F1F5F9",
                      border: "none",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      color: "#475569",
                      cursor: "pointer",
                    }}
                    title="Chia sẻ bộ sưu tập"
                  >
                    <Share2 size={14} /> Chia sẻ
                  </button>
                  <button
                    onClick={() => deleteCollection(col.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#FEF2F2",
                      border: "none",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      color: "#EF4444",
                      cursor: "pointer",
                    }}
                    title="Xóa bộ sưu tập"
                  >
                    <Trash2 size={14} /> Xóa
                  </button>
                </div>
              </div>

              {rooms.length === 0 ? (
                <div style={{ padding: "24px", background: "#F8FAFC", borderRadius: "12px", textAlign: "center", color: "#64748B", fontSize: "13.5px" }}>
                  Chưa có phòng nào trong bộ sưu tập này. Hãy bấm vào icon lưu trên thẻ phòng để thêm.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                  {rooms.map((room) => (
                    <div key={room.id} style={{ position: "relative" }}>
                      <RoomCard room={room} compact={true} />
                      <button
                        onClick={() => removeFromCollection(col.id, room.id)}
                        style={{
                          position: "absolute",
                          bottom: "12px",
                          right: "12px",
                          background: "#F1F5F9",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "11.5px",
                          color: "#EF4444",
                          padding: "4px 8px",
                          cursor: "pointer",
                          zIndex: 5,
                        }}
                      >
                        Bỏ khỏi bộ sưu tập
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
