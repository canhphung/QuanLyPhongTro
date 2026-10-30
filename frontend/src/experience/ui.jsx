import { useEffect, useRef, useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  MapPin,
  MoveUpRight,
  X,
  ArrowLeft,
  House,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  User,
  Users,
  Ruler,
  CalendarDays,
  DoorOpen,
  Bell,
  LogOut,
  FileText,
  Receipt,
  CreditCard,
  Building,
  Scale,
  Bookmark,
} from "lucide-react";
import { useAppData } from "./context";
import { money, shortPrice } from "./data";
import { CollectionsModal } from "./CollectionsModal";

export function Brand({ light = false }) {
  return (
    <Link
      to="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Phòng Mình — Trang chủ"
    >
      <span className="brand-mark">
        <House size={22} strokeWidth={2} />
      </span>
      <div className="brand-text">
        <span className="brand-name">
          Phòng Mình<span style={{ color: "#2563EB" }}>.</span>
        </span>
        <span className="brand-tagline">Thuê phòng tiện nghi</span>
      </div>
    </Link>
  );
}

export function RoomPhoto({
  photo,
  alt = "Ảnh phòng",
  className = "",
  eager = false,
}) {
  const [failedPhoto, setFailedPhoto] = useState(null);
  const failed = !!photo && failedPhoto === photo;
  const valid =
    typeof photo === "string" &&
    photo.trim().length > 0 &&
    (/^https?:\/\//i.test(photo) || photo.startsWith("/") || photo.startsWith("data:"));

  return (
    <div
      className={`room-photo ${className} ${!valid || failed ? "photo-placeholder" : ""}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#0F172A",
      }}
    >
      {valid && !failed ? (
        <img
          className="actual-room-image"
          src={photo}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
          onError={() => setFailedPhoto(photo)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "none",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#94A3B8",
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <House size={38} strokeWidth={1.3} style={{ margin: "0 auto 6px" }} />
            <span style={{ fontSize: "12px", display: "block" }}>
              {failed ? "Không tải được ảnh" : "Phòng Mình"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function SaveButton({ id, className = "" }) {
  const { saved, toggleSaved } = useAppData();
  const active = saved.includes(id);

  return (
    <button
      className={`property-action-btn property-favorite-btn ${active ? "is-active" : ""} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(id);
      }}
      aria-label={active ? "Bỏ lưu phòng" : "Lưu phòng"}
      aria-pressed={active}
      title={active ? "Đã lưu vào danh sách yêu thích" : "Lưu phòng này"}
    >
      <Heart
        size={17}
        fill={active ? "#EF4444" : "none"}
        color={active ? "#EF4444" : "#475569"}
        strokeWidth={2}
      />
    </button>
  );
}

export function CompareButton({ room, className = "" }) {
  const { compareIds, addToCompare, removeFromCompare } = useAppData();
  const isCompared = compareIds.includes(room.id);

  return (
    <button
      className={`property-action-btn ${isCompared ? "is-active" : ""} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isCompared) {
          removeFromCompare(room.id);
        } else {
          addToCompare(room);
        }
      }}
      aria-label={isCompared ? "Bỏ khỏi danh sách so sánh" : "Thêm vào danh sách so sánh"}
      aria-pressed={isCompared}
      title={isCompared ? "Đã trong so sánh (nhấn để bỏ)" : "Thêm vào so sánh (tối đa 4 phòng)"}
    >
      <Scale size={16} />
    </button>
  );
}

export function BookmarkButton({ room, onOpenCollection, className = "" }) {
  return (
    <button
      className={`property-action-btn ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenCollection(room);
      }}
      aria-label="Lưu vào bộ sưu tập riêng"
      title="Lưu vào bộ sưu tập riêng"
    >
      <Bookmark size={16} />
    </button>
  );
}

export function RoomCard({ room, compact = false, listView = false }) {
  const [collectionModalRoom, setCollectionModalRoom] = useState(null);
  const isAvailable = room.available !== false && room.roomState !== "DA_THUE";
  const isFeatured = (room.images && room.images.length > 1) || room.price >= 4000000;

  if (listView) {
    return (
      <>
        <article className="property-card-list-view">
          <div className="property-media-wrap" style={{ position: "relative" }}>
            <Link to={`/phong-tro/${room.id}`} aria-label={`Xem ${room.title}`}>
              <RoomPhoto photo={room.photo} alt={room.title} />
            </Link>
            <span className={`property-tag-badge ${isFeatured ? "property-tag-featured" : ""}`}>
              {isFeatured ? "Nổi bật" : room.type || "Phòng trọ"}
            </span>
            <span className={`property-status-indicator ${isAvailable ? "" : "rented"}`}>
              {isAvailable ? "Còn phòng" : "Đã thuê"}
            </span>
            <div className="property-top-actions">
              <CompareButton room={room} />
              <BookmarkButton room={room} onOpenCollection={setCollectionModalRoom} />
              <SaveButton id={room.id} />
            </div>
          </div>
          <div className="property-body-wrap">
            <div className="property-price-row">
              <div>
                <span className="property-price-val">{shortPrice(room.price)} triệu</span>
                <span className="property-price-unit">/ tháng</span>
              </div>
              <span className="property-type-pill">{room.type || "Phòng trọ"}</span>
            </div>
            <Link to={`/phong-tro/${room.id}`} className="property-title-link">
              {room.title}
            </Link>
            <div className="property-address-text">
              <MapPin size={15} color="#2563EB" />
              <span>{room.address || `${room.district}, ${room.city}`}</span>
            </div>
            <div className="property-specs-grid">
              <div className="property-spec-item">
                <Ruler size={15} color="#64748B" />
                <span><strong>{room.area}</strong> m²</span>
              </div>
              <div className="property-spec-item">
                <DoorOpen size={15} color="#64748B" />
                <span>Phòng <strong>{room.number || "01"}</strong></span>
              </div>
              <div className="property-spec-item">
                <Building size={15} color="#64748B" />
                <span>{room.building || "Nhà riêng"}</span>
              </div>
            </div>
            {room.amenities && room.amenities.length > 0 && (
              <div className="property-amenities-pills">
                {room.amenities.slice(0, 4).map((a) => (
                  <span key={a} className="amenity-micro-pill">{a}</span>
                ))}
                {room.amenities.length > 4 && (
                  <span className="amenity-micro-pill">+{room.amenities.length - 4}</span>
                )}
              </div>
            )}
            <div className="property-footer-row">
              <div className="property-host-snippet">
                <span className="host-mini-avatar">
                  {(room.hostName || "CT").slice(0, 2).toUpperCase()}
                </span>
                <span className="host-mini-name">{room.hostName || "Chủ trọ"}</span>
              </div>
              <Link to={`/phong-tro/${room.id}`} className="btn-view-property">
                Chi tiết <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </article>
        {collectionModalRoom && (
          <CollectionsModal
            room={collectionModalRoom}
            isOpen={!!collectionModalRoom}
            onClose={() => setCollectionModalRoom(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <article className="property-card-premium">
        <div className="property-media-wrap">
          <Link to={`/phong-tro/${room.id}`} aria-label={`Xem ${room.title}`}>
            <RoomPhoto
              photo={room.photo}
              alt={room.title}
            />
          </Link>
          <span className={`property-tag-badge ${isFeatured ? "property-tag-featured" : ""}`}>
            {isFeatured ? "Nổi bật" : room.type || "Phòng trọ"}
          </span>
          <span className={`property-status-indicator ${isAvailable ? "" : "rented"}`}>
            {isAvailable ? "Còn phòng" : "Đã thuê"}
          </span>
          <div className="property-top-actions">
            <CompareButton room={room} />
            <BookmarkButton room={room} onOpenCollection={setCollectionModalRoom} />
            <SaveButton id={room.id} />
          </div>
        </div>

        <div className="property-body-wrap">
          <div className="property-price-row">
            <div>
              <span className="property-price-val">{shortPrice(room.price)} triệu</span>
              <span className="property-price-unit">/ tháng</span>
            </div>
            <span className="property-type-pill">{room.type || "Phòng trọ"}</span>
          </div>

          <Link to={`/phong-tro/${room.id}`} className="property-title-link">
            {room.title}
          </Link>

          <div className="property-address-text">
            <MapPin size={14} color="#2563EB" />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {room.district}, {room.city === "TP. Hồ Chí Minh" ? "TP.HCM" : room.city}
            </span>
          </div>

          <div className="property-specs-grid">
            <div className="property-spec-item">
              <Ruler size={14} color="#64748B" />
              <span><strong>{room.area}</strong> m²</span>
            </div>
            <div className="property-spec-item">
              <DoorOpen size={14} color="#64748B" />
              <span>Số <strong>{room.number || "01"}</strong></span>
            </div>
            <div className="property-spec-item">
              <Users size={14} color="#64748B" />
              <span>1-2 người</span>
            </div>
          </div>

          {room.amenities && room.amenities.length > 0 && (
            <div className="property-amenities-pills">
              {room.amenities.slice(0, 3).map((a) => (
                <span key={a} className="amenity-micro-pill">{a}</span>
              ))}
              {room.amenities.length > 3 && (
                <span className="amenity-micro-pill">+{room.amenities.length - 3}</span>
              )}
            </div>
          )}

          <div className="property-footer-row">
            <div className="property-host-snippet">
              <span className="host-mini-avatar">
                {(room.hostName || "CT").slice(0, 2).toUpperCase()}
              </span>
              <span className="host-mini-name">{room.hostName || "Chủ trọ"}</span>
            </div>
            <Link to={`/phong-tro/${room.id}`} className="btn-view-property">
              Xem ngay <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </article>

      {collectionModalRoom && (
        <CollectionsModal
          room={collectionModalRoom}
          isOpen={!!collectionModalRoom}
          onClose={() => setCollectionModalRoom(null)}
        />
      )}
    </>
  );
}

export function Lightbox({ images, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, onClose]);

  if (!images || !images.length) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button
        className="lightbox-close-btn"
        onClick={onClose}
        aria-label="Đóng thư viện ảnh"
      >
        <X size={24} />
      </button>

      <div className="lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <button
            className="lightbox-nav-btn prev"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <img src={images[index]} alt={`Ảnh phòng ${index + 1}`} />

        {images.length > 1 && (
          <button
            className="lightbox-nav-btn next"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            aria-label="Ảnh sau"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      <div style={{ color: "#E2E8F0", marginTop: "16px", fontSize: "14px", fontWeight: 600 }}>
        {index + 1} / {images.length}
      </div>
    </div>
  );
}

export function NotificationDropdown({ onClose }) {
  const { invoices, contracts, requests } = useAppData();
  const unpaidBills = invoices.filter((x) => x.status !== "Đã thanh toán");
  const pendingRequests = requests.filter((x) => x.status === "Chờ xác nhận");

  return (
    <div className="header-dropdown-menu" style={{ width: "320px", right: 0 }}>
      <div className="header-dropdown-header">
        <strong>Thông báo của bạn</strong>
        <span>Cập nhật tiền phòng & hợp đồng</span>
      </div>

      {unpaidBills.length > 0 && (
        <Link
          to="/tai-khoan/hoa-don"
          className="header-dropdown-item"
          onClick={onClose}
        >
          <div style={{ color: "#EF4444" }}><Receipt size={18} /></div>
          <div>
            <strong style={{ fontSize: "13px", display: "block" }}>Hóa đơn mới</strong>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              Có {unpaidBills.length} hóa đơn cần thanh toán
            </span>
          </div>
        </Link>
      )}

      {pendingRequests.length > 0 && (
        <Link
          to="/tai-khoan/yeu-cau"
          className="header-dropdown-item"
          onClick={onClose}
        >
          <div style={{ color: "#3B82F6" }}><CalendarDays size={18} /></div>
          <div>
            <strong style={{ fontSize: "13px", display: "block" }}>Lịch hẹn xem phòng</strong>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              {pendingRequests.length} yêu cầu đang chờ chủ trọ xác nhận
            </span>
          </div>
        </Link>
      )}

      {contracts.length > 0 && (
        <Link
          to="/tai-khoan/hop-dong"
          className="header-dropdown-item"
          onClick={onClose}
        >
          <div style={{ color: "#10B981" }}><FileText size={18} /></div>
          <div>
            <strong style={{ fontSize: "13px", display: "block" }}>Hợp đồng thuê phòng</strong>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              Đang có {contracts.length} hợp đồng hiệu lực
            </span>
          </div>
        </Link>
      )}

      {unpaidBills.length === 0 && pendingRequests.length === 0 && contracts.length === 0 && (
        <div style={{ padding: "20px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
          Bạn chưa có thông báo mới nào
        </div>
      )}

      <div className="header-dropdown-divider" />
      <Link
        to="/tai-khoan"
        className="header-dropdown-item"
        style={{ justifyContent: "center", color: "#2563EB", fontWeight: 600 }}
        onClick={onClose}
      >
        Vào trung tâm khách thuê
      </Link>
    </div>
  );
}

export function HeaderUserDropdown({ user, onLogout, onClose }) {
  return (
    <div className="header-dropdown-menu">
      <div className="header-dropdown-header">
        <strong>{user.name}</strong>
        <span>{user.role === "owner" ? "Chủ trọ" : "Người thuê phòng"}</span>
      </div>

      <Link
        to="/tai-khoan"
        className="header-dropdown-item"
        onClick={onClose}
      >
        <User size={16} />
        Thông tin cá nhân
      </Link>

      {user.role === "tenant" && (
        <>
          <Link
            to="/tai-khoan/hop-dong"
            className="header-dropdown-item"
            onClick={onClose}
          >
            <FileText size={16} />
            Phòng & Hợp đồng
          </Link>
          <Link
            to="/tai-khoan/hoa-don"
            className="header-dropdown-item"
            onClick={onClose}
          >
            <Receipt size={16} />
            Hóa đơn & Tiền phòng
          </Link>
          <Link
            to="/tai-khoan/thanh-toan"
            className="header-dropdown-item"
            onClick={onClose}
          >
            <CreditCard size={16} />
            Lịch sử thanh toán
          </Link>
          <Link
            to="/tai-khoan/yeu-cau"
            className="header-dropdown-item"
            onClick={onClose}
          >
            <CalendarDays size={16} />
            Lịch hẹn & Yêu cầu
          </Link>
        </>
      )}

      <Link
        to="/yeu-thich"
        className="header-dropdown-item"
        onClick={onClose}
      >
        <Heart size={16} />
        Phòng đã lưu
      </Link>

      {user.role === "owner" && (
        <Link
          to="/chu-tro/tong-quan"
          className="header-dropdown-item"
          style={{ color: "#2563EB" }}
          onClick={onClose}
        >
          <Building size={16} />
          Bảng điều khiển Chủ trọ
        </Link>
      )}

      {user.roles?.includes("ADMIN") && (
        <Link
          to="/quan-tri/tin-dang"
          className="header-dropdown-item"
          style={{ color: "#7C3AED" }}
          onClick={onClose}
        >
          <ShieldCheck size={16} />
          Quản trị duyệt tin
        </Link>
      )}

      <div className="header-dropdown-divider" />
      <button
        className="header-dropdown-item danger"
        onClick={() => {
          onClose();
          onLogout();
        }}
      >
        <LogOut size={16} />
        Đăng xuất
      </button>
    </div>
  );
}

export function PageTitle({ title, subtitle, action }) {
  return (
    <div className="page-title" style={{ marginBottom: "24px" }}>
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "15px", color: "#64748B", marginTop: "6px" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title = "Chưa có dữ liệu", message, action }) {
  return (
    <div
      className="empty-state"
      style={{
        background: "#FFFFFF",
        borderRadius: "20px",
        padding: "48px 24px",
        border: "1px solid #E2E8F0",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "#EFF6FF",
          color: "#2563EB",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 18px",
        }}
      >
        <Search size={30} strokeWidth={1.5} />
      </div>
      <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
        {title}
      </h2>
      <p style={{ fontSize: "14.5px", color: "#64748B", maxWidth: "420px", margin: "0 auto 20px" }}>
        {message}
      </p>
      {action}
    </div>
  );
}

export function Status({ children }) {
  const value = String(children);
  const warning = /Chưa|Quá hạn|Chờ|Sắp|Nháp/.test(value);
  const success = /Đã thanh toán|Đã duyệt|Đang hoạt động|Còn phòng|Đã xác nhận|Đang hiệu lực/.test(value);

  return (
    <span
      className={`status ${warning ? "status-pending" : ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 600,
        background: success ? "#ECFDF5" : warning ? "#FFFBEB" : "#F1F5F9",
        color: success ? "#059669" : warning ? "#D97706" : "#475569",
        border: `1px solid ${success ? "#A7F3D0" : warning ? "#FDE68A" : "#E2E8F0"}`,
      }}
    >
      {success && <Check size={12} strokeWidth={2.5} />}
      {children}
    </span>
  );
}

export function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.querySelector("input,button,select,textarea")?.focus();

    function key(event) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        zIndex: 400,
        padding: "20px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`modal ${wide ? "modal-wide" : ""}`}
        style={{
          background: "#FFFFFF",
          borderRadius: "24px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.2)",
          padding: "28px",
          width: "100%",
          maxWidth: wide ? "800px" : "540px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          className="modal-heading"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            paddingBottom: "14px",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <h2 id={titleId} style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A" }}>
            {title}
          </h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            style={{ borderRadius: "50%", padding: "6px" }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function BackLink({
  to = "/tim-phong",
  children = "Quay lại danh sách",
}) {
  return (
    <Link to={to} className="back-link">
      <ArrowLeft size={16} />
      {children}
    </Link>
  );
}

export function ArrowLink({ to, children, className = "" }) {
  return (
    <Link to={to} className={`arrow-link ${className}`} style={{ color: "#2563EB", fontWeight: 700 }}>
      {children}
      <MoveUpRight size={18} />
    </Link>
  );
}

export function DataNote() {
  return (
    <p className="data-note" style={{ fontSize: "12px", color: "#64748B" }}>
      Thông tin phòng và chi phí do chủ trọ cập nhật. Vui lòng đối chiếu với hợp đồng thực tế.
    </p>
  );
}
