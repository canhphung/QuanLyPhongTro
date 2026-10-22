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
} from "lucide-react";
import { useAppData } from "./context";
import { shortPrice } from "./data";

export function Brand({ light = false }) {
  return (
    <Link
      to="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Phòng mình — Trang chủ"
    >
      <span className="brand-mark">
        <House size={23} strokeWidth={1.6} />
      </span>
      <span>
        phòng mình<span className="brand-period">.</span>
      </span>
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
  const valid = typeof photo === "string" && photo.trim().length > 0 && (/^https?:\/\//i.test(photo) || photo.startsWith("/") || photo.startsWith("data:"));
  return (
    <div
      className={`room-photo ${className} ${!valid || failed ? "photo-placeholder" : ""}`}
    >
      {valid && !failed ? (
        <img
          className="actual-room-image"
          src={photo}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
          onError={() => setFailedPhoto(photo)}
        />
      ) : (
        <div>
          <House size={42} strokeWidth={1.1} />
          <span>{failed ? "Không tải được ảnh" : "Chưa có ảnh phòng"}</span>
        </div>
      )}
    </div>
  );
}
export function SaveButton({ id }) {
  const { saved, toggleSaved } = useAppData();
  const active = saved.includes(id);
  return (
    <button
      className={`save-button ${active ? "is-saved" : ""}`}
      onClick={() => toggleSaved(id)}
      aria-label={active ? "Bỏ lưu phòng" : "Lưu phòng"}
      aria-pressed={active}
    >
      <Heart
        size={19}
        fill={active ? "currentColor" : "none"}
        strokeWidth={1.7}
      />
    </button>
  );
}
export function RoomCard({ room, compact = false }) {
  return (
    <article className={`room-card ${compact ? "room-card-compact" : ""}`}>
      <div className="room-card-visual">
        <Link to={`/phong-tro/${room.id}`} aria-label={`Xem ${room.title}`}>
          <RoomPhoto
            photo={room.photo}
            alt={`Ảnh ${room.type.toLowerCase()} ${room.area} m²`}
          />
        </Link>
        <SaveButton id={room.id} />
        <span className="room-kind">{room.type}</span>
      </div>
      <div className="room-card-copy">
        <div className="room-location">
          <MapPin size={14} />
          {room.district},{" "}
          {room.city === "TP. Hồ Chí Minh" ? "TP.HCM" : room.city}
        </div>
        <h3>
          <Link to={`/phong-tro/${room.id}`}>{room.title}</Link>
        </h3>
        <p className="room-facts">
          {room.area} m² <span>·</span> {room.amenities.slice(0, 2).join(" · ")}
        </p>
        <div className="room-price-row">
          <p className="room-price">
            {shortPrice(room.price)} triệu <span>/ tháng</span>
          </p>
          <Link
            to={`/phong-tro/${room.id}`}
            className="round-link"
            aria-label={`Chi tiết ${room.title}`}
          >
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function PageTitle({ title, subtitle, action }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function EmptyState({ title = "Chưa có dữ liệu", message, action }) {
  return (
    <div className="empty-state">
      <Search size={32} strokeWidth={1.3} />
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  );
}
export function Status({ children }) {
  const value = String(children);
  const warning = /Chưa|Quá hạn|Chờ|Sắp|Nháp/.test(value);
  return (
    <span className={`status ${warning ? "status-pending" : ""}`}>
      {!warning && <Check size={12} />}
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
      if (event.key !== "Tab") return;
      const nodes = Array.from(
        dialog.querySelectorAll("button,input,select,textarea,a[href]"),
      ).filter((x) => !x.disabled);
      if (!nodes.length) return;
      if (event.shiftKey && document.activeElement === nodes[0]) {
        event.preventDefault();
        nodes.at(-1).focus();
      }
      if (!event.shiftKey && document.activeElement === nodes.at(-1)) {
        event.preventDefault();
        nodes[0].focus();
      }
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
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`modal ${wide ? "modal-wide" : ""}`}
      >
        <div className="modal-heading">
          <h2 id={titleId}>{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
          >
            <X size={21} />
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
      <ArrowLeft size={17} />
      {children}
    </Link>
  );
}
export function ArrowLink({ to, children, className = "" }) {
  return (
    <Link to={to} className={`arrow-link ${className}`}>
      {children}
      <MoveUpRight size={18} />
    </Link>
  );
}
export function DataNote() {
  return (
    <p className="data-note">
      Thông tin do chủ trọ cung cấp. Hãy xem phòng và đối chiếu thỏa thuận trước
      khi ký hợp đồng.
    </p>
  );
}
