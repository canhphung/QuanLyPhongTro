import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight, Heart, UserRound } from "lucide-react";
import { Brand, DataNote } from "./ui";
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
  const { saved, user } = useAppData();
  return (
    <div className="public-site">
      <a className="skip-link" href="#main-content">
        Đến nội dung chính
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav aria-label="Điều hướng chính" className="desktop-nav">
            <NavLink to="/tim-phong">Tìm phòng</NavLink>
            {user?.roles?.includes("ADMIN") && (
              <NavLink to="/quan-tri/tin-dang">Duyệt tin đăng</NavLink>
            )}
            <NavLink to="/yeu-thich">
              Phòng đã lưu
              {saved.length > 0 && (
                <span className="nav-count">{saved.length}</span>
              )}
            </NavLink>
            <Link to="/chu-tro/tong-quan">
              Dành cho chủ trọ <ArrowUpRight size={14} />
            </Link>
          </nav>
          <div className="header-actions">
            <Link
              to={user ? "/tai-khoan" : "/dang-nhap"}
              className="account-link"
            >
              <UserRound size={17} />
              <span>{user ? user.name.split(" ").at(-1) : "Đăng nhập"}</span>
            </Link>
            <button
              className="menu-toggle icon-button"
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Điều hướng trên điện thoại">
            <Link to="/tim-phong" onClick={() => setMenuOpen(false)}>
              Tìm phòng
            </Link>
            <Link to="/yeu-thich" onClick={() => setMenuOpen(false)}>
              <Heart size={16} />
              Phòng đã lưu ({saved.length})
            </Link>
            <Link to="/tai-khoan" onClick={() => setMenuOpen(false)}>
              Tài khoản người thuê
            </Link>
            <Link to="/chu-tro/tong-quan" onClick={() => setMenuOpen(false)}>
              Dành cho chủ trọ
            </Link>
          </nav>
        )}
      </header>
      <main id="main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <Brand light />
            <p>Có một nơi vừa vặn với mình.</p>
          </div>
          <div className="footer-links">
            <div>
              <p>Tìm chốn riêng</p>
              <Link to="/tim-phong">Khám phá phòng</Link>
              <Link to="/yeu-thich">Phòng đã lưu</Link>
              <Link to="/#cau-hoi">Câu hỏi thường gặp</Link>
            </div>
            <div>
              <p>Chuyện thuê nhà</p>
              <Link to="/tai-khoan/yeu-cau">Lịch xem phòng</Link>
              <Link to="/tai-khoan/hop-dong">Hợp đồng của tôi</Link>
              <Link to="/chu-tro/tin-dang">Đăng tin cho thuê</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {CURRENT_YEAR} Phòng mình. Một đồ án Quản lý phòng trọ.</p>
          <DataNote />
        </div>
      </footer>
    </div>
  );
}
