import { useEffect, useState, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ArrowUpRight,
  Heart,
  UserRound,
  Bell,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Building,
  Sparkles,
  HelpCircle,
  FileText,
  Search,
} from "lucide-react";
import { Brand, DataNote, NotificationDropdown, HeaderUserDropdown } from "./ui";
import { ComparisonDock } from "./ComparisonDock";
import { ComparisonModal } from "./ComparisonModal";
import { useAppData } from "./context";
import { CURRENT_YEAR } from "./data";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(hash.slice(1))
          ?.scrollIntoView({ behavior: "smooth" }),
      );
    } else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const { saved, user, invoices, requests, logout } = useAppData();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Scroll detection for sticky header tint & elevation
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasUnpaid = invoices.some((x) => x.status !== "Đã thanh toán");
  const hasPendingRequests = requests.some((x) => x.status === "Chờ xác nhận");
  const hasNotif = hasUnpaid || hasPendingRequests;

  return (
    <div className="public-site" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <a className="skip-link" href="#main-content">
        Đến nội dung chính
      </a>

      {/* Modern Sticky Client Header */}
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-inner">
          <Brand />

          {/* Desktop Navigation */}
          <nav aria-label="Điều hướng chính" className="desktop-nav">
            <NavLink to="/" end>
              Trang chủ
            </NavLink>
            <NavLink to="/tim-phong">
              Tìm phòng
            </NavLink>
            <a href="/#khu-vuc-pho-bien">
              Khu vực
            </a>
            <a href="/#huong-dan-thue">
              Hướng dẫn thuê
            </a>
            <a href="/#lien-he">
              Liên hệ
            </a>

            {user?.roles?.includes("ADMIN") && (
              <NavLink to="/quan-tri/tin-dang" style={{ color: "#7C3AED" }}>
                <ShieldCheck size={16} />
                Duyệt tin
              </NavLink>
            )}

            <NavLink to="/yeu-thich" style={{ position: "relative" }}>
              <Heart size={16} />
              Phòng đã lưu
              {saved.length > 0 && (
                <span className="nav-count">{saved.length}</span>
              )}
            </NavLink>

            {user?.role === "owner" ? (
              <Link to="/chu-tro/tong-quan" style={{ color: "#2563EB", fontWeight: 700 }}>
                Quản lý chủ trọ <ArrowUpRight size={14} />
              </Link>
            ) : (
              <Link to="/dang-ky?role=owner" style={{ color: "#475569" }}>
                Đăng tin cho thuê
              </Link>
            )}
          </nav>

          {/* Header Actions (Guest or Logged In) */}
          <div className="header-actions">
            {user ? (
              <>
                {/* Notification Dropdown */}
                <div className="header-user-menu" ref={notifRef}>
                  <button
                    className="header-notif-btn"
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    aria-label="Thông báo"
                  >
                    <Bell size={18} />
                    {hasNotif && <span className="header-notif-badge" />}
                  </button>
                  {notifDropdownOpen && (
                    <NotificationDropdown onClose={() => setNotifDropdownOpen(false)} />
                  )}
                </div>

                {/* User Dropdown */}
                <div className="header-user-menu" ref={dropdownRef}>
                  <button
                    className="header-user-btn"
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    aria-label="Tài khoản cá nhân"
                  >
                    <span className="header-avatar">
                      {user.name.split(" ").at(-1)?.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="header-user-name">
                      {user.name.split(" ").at(-1)}
                    </span>
                    <ChevronDown size={15} color="#64748B" />
                  </button>

                  {userDropdownOpen && (
                    <HeaderUserDropdown
                      user={user}
                      onLogout={logout}
                      onClose={() => setUserDropdownOpen(false)}
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/dang-nhap" className="btn-header-login">
                  <UserRound size={16} />
                  Đăng nhập
                </Link>
                <Link to="/dang-ky" className="btn-header-register">
                  <Sparkles size={16} />
                  Đăng ký
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="menu-toggle icon-button"
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                display: "grid",
                placeItems: "center",
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="mobile-nav-drawer" onClick={() => setMenuOpen(false)}>
            <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Trang chủ
              </Link>
              <Link to="/tim-phong" onClick={() => setMenuOpen(false)}>
                Tìm kiếm phòng trọ
              </Link>
              <a href="/#khu-vuc-pho-bien" onClick={() => setMenuOpen(false)}>
                Khu vực phổ biến
              </a>
              <a href="/#huong-dan-thue" onClick={() => setMenuOpen(false)}>
                Hướng dẫn thuê phòng
              </a>
              <Link to="/yeu-thich" onClick={() => setMenuOpen(false)}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Heart size={16} color="#EF4444" /> Phòng đã lưu
                </span>
                <span className="nav-count">{saved.length}</span>
              </Link>

              {user ? (
                <>
                  <Link to="/tai-khoan" onClick={() => setMenuOpen(false)}>
                    Không gian tài khoản ({user.name})
                  </Link>
                  {user.role === "owner" && (
                    <Link to="/chu-tro/tong-quan" onClick={() => setMenuOpen(false)}>
                      Quản lý nhà trọ (Chủ trọ)
                    </Link>
                  )}
                  <button
                    className="button button-soft"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    style={{ marginTop: "12px", width: "100%" }}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                  <Link
                    to="/dang-nhap"
                    className="button button-soft"
                    onClick={() => setMenuOpen(false)}
                    style={{ textAlign: "center" }}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/dang-ky"
                    className="button"
                    onClick={() => setMenuOpen(false)}
                    style={{ textAlign: "center" }}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main id="main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Modern High-End Client Footer */}
      <footer className="site-footer-modern" id="lien-he">
        <div className="client-container">
          <div className="footer-top-grid">
            {/* Brand column */}
            <div className="footer-brand-col">
              <Brand light />
              <p>
                Phòng Mình là nền tảng tìm kiếm, xem phòng và quản lý thuê phòng trọ
                trực tuyến minh bạch, tiện nghi và văn minh nhất.
              </p>
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <span style={{ fontSize: "12.5px", color: "#10B981", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={16} /> Thông tin phòng đã xác minh
                </span>
              </div>
            </div>

            {/* Quick search column */}
            <div className="footer-links-col">
              <h4>Tìm phòng nhanh</h4>
              <ul>
                <li><Link to="/tim-phong?city=TP.+Hồ+Chí+Minh">Phòng trọ TP.HCM</Link></li>
                <li><Link to="/tim-phong?city=Hà+Nội">Phòng trọ Hà Nội</Link></li>
                <li><Link to="/tim-phong?type=Căn+hộ+mini">Căn hộ mini / Studio</Link></li>
                <li><Link to="/tim-phong?budget=0-3000000">Phòng trọ giá rẻ dưới 3tr</Link></li>
                <li><Link to="/yeu-thich">Danh sách phòng đã lưu</Link></li>
              </ul>
            </div>

            {/* Guide & Policies column */}
            <div className="footer-links-col">
              <h4>Hỗ trợ khách thuê</h4>
              <ul>
                <li><a href="/#huong-dan-thue">Quy trình thuê phòng 4 bước</a></li>
                <li><a href="/#chi-phi">Công cụ ước tính chi phí</a></li>
                <li><a href="/#cau-hoi">Câu hỏi thường gặp</a></li>
                <li><Link to="/tai-khoan">Quản lý hóa đơn & hợp đồng</Link></li>
                <li><Link to="/dang-ky?role=owner">Dành cho chủ nhà đăng tin</Link></li>
              </ul>
            </div>

            {/* Contact column */}
            <div className="footer-links-col">
              <h4>Thông tin liên hệ</h4>
              <div className="footer-contact-item">
                <Phone size={17} />
                <span>Hotline: 1900 8899 (8h00 - 21h00)</span>
              </div>
              <div className="footer-contact-item">
                <Mail size={17} />
                <span>Email: hotro@phongminh.vn</span>
              </div>
              <div className="footer-contact-item">
                <MapPin size={17} />
                <span>Toàn quốc: Hà Nội, TP.HCM, Đà Nẵng</span>
              </div>
              <p style={{ fontSize: "12.5px", color: "#64748B", marginTop: "12px", lineHeight: "1.5" }}>
                Hỗ trợ tư vấn tìm phòng trọ sinh viên, người đi làm và gia đình trẻ 24/7.
              </p>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p>© {CURRENT_YEAR} Phòng Mình. Bản quyền thuộc về Đồ án Quản lý phòng trọ.</p>
            <div style={{ display: "flex", gap: "24px", color: "#64748B" }}>
              <span>Điều khoản sử dụng</span>
              <span>Chính sách bảo mật</span>
              <span>Quy chế hoạt động</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Comparison Floating Dock & Modal */}
      <ComparisonDock />
      <ComparisonModal />
    </div>
  );
}
