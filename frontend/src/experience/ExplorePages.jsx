import { useState, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  MapPin,
  ArrowUpRight,
  Check,
  CalendarDays,
  DoorOpen,
  Ruler,
  BedDouble,
  CookingPot,
  Wifi,
  Snowflake,
  Share2,
  Clock3,
  LayoutGrid,
  List,
  Phone,
  MessageSquare,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Map,
  AlertCircle,
} from "lucide-react";
import { useAppData } from "./context";
import {
  RoomPhoto,
  RoomCard,
  EmptyState,
  SaveButton,
  Modal,
  Lightbox,
} from "./ui";
import { money, shortPrice, TODAY_INPUT } from "./data";
import { RoomMap } from "./RoomMap";
import { SearchAutocomplete } from "./SearchAutocomplete";

export function RoomSearchPage({ savedOnly = false }) {
  const { publicRooms: rooms, saved, user, notify } = useAppData();
  const [params, setParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list' | 'map'
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = viewMode === "map" ? 10 : 9;

  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [keyword, setKeyword] = useState(params.get("q") || "");
  const city = params.get("city") || "";
  const district = params.get("district") || "";
  const budget = params.get("budget") || "";
  const type = params.get("type") || "";
  const area = params.get("area") || "";
  const amenities = params.getAll("amenity");

  function change(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "city") next.delete("district");
    setParams(next);
    setPage(1);
  }

  function toggleAmenity(value) {
    const next = new URLSearchParams(params);
    const values = amenities.includes(value)
      ? amenities.filter((x) => x !== value)
      : [...amenities, value];
    next.delete("amenity");
    values.forEach((x) => next.append("amenity", x));
    setParams(next);
    setPage(1);
  }

  const result = useMemo(() => {
    const [min, max] = budget ? budget.split("-").map(Number) : [0, Infinity];
    const normalized = (text) =>
      String(text || "")
        .toLocaleLowerCase("vi")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");

    return rooms
      .filter((room) => {
        return (
          room.available &&
          room.published !== false &&
          (!savedOnly || saved.includes(room.id)) &&
          (!city || room.city === city) &&
          (!district || room.district === district) &&
          (!type || room.type === type) &&
          (!area || room.area >= Number(area)) &&
          room.price >= min &&
          room.price <= max &&
          amenities.every((x) => (room.amenities || []).includes(x)) &&
          (!params.get("q") ||
            normalized(
              `${room.title} ${room.address} ${room.building} ${(room.amenities || []).join(" ")}`,
            ).includes(normalized(params.get("q"))))
        );
      })
      .sort((a, b) => {
        if (sort === "price-up") return a.price - b.price;
        if (sort === "price-down") return b.price - a.price;
        if (sort === "area") return b.area - a.area;
        return b.id - a.id;
      });
  }, [rooms, savedOnly, saved, city, district, type, area, budget, amenities, params, sort]);

  const totalPages = Math.ceil(result.length / itemsPerPage) || 1;
  const paginatedRooms = result.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const districts = useMemo(() => {
    return [
      ...new Set(
        rooms
          .filter((x) => !city || x.city === city)
          .map((x) => x.district)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b, "vi"));
  }, [rooms, city]);

  const availableCities = useMemo(() => {
    return [...new Set(rooms.map((r) => r.city).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "vi"),
    );
  }, [rooms]);

  if (savedOnly && !user) {
    return (
      <div className="client-container" style={{ padding: "80px 24px" }}>
        <EmptyState
          title="Lưu phòng trọ yêu thích của bạn"
          message="Vui lòng đăng nhập để xem và quản lý danh sách phòng đã lưu."
          action={
            <Link className="btn-header-register" to="/dang-nhap?next=%2Fyeu-thich">
              Đăng nhập ngay
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="search-page-wrapper">
      {/* Search Header Banner */}
      <section className="search-page-header">
        <div className="client-container">
          <div className="detail-breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>{savedOnly ? "Phòng đã lưu" : "Tìm kiếm phòng trọ"}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>
                {savedOnly ? "Danh sách phòng bạn đã lưu" : "Tìm phòng trọ, căn hộ cho thuê"}
              </h1>
              <p style={{ fontSize: "15px", color: "#64748B", marginTop: "4px" }}>
                {savedOnly
                  ? `Bạn đang lưu ${saved.length} phòng trọ yêu thích.`
                  : "Tìm kiếm thông minh với bộ lọc chi tiết theo khu vực, ngân sách và tiện nghi."}
              </p>
            </div>

            {/* Intelligent Search Autocomplete */}
            <div style={{ width: "380px", maxWidth: "100%" }}>
              <SearchAutocomplete
                value={keyword}
                onChange={setKeyword}
                onSearch={(criteria) => {
                  const next = new URLSearchParams(params);
                  Object.entries(criteria).forEach(([k, v]) => {
                    if (v) next.set(k, v);
                    else next.delete(k);
                  });
                  setParams(next);
                  setPage(1);
                }}
                placeholder="Tìm theo quận huyện, loại phòng, tiện ích..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Search Layout */}
      <div className="client-container" style={{ paddingBottom: "80px" }}>
        <div className="search-page-layout">
          {/* ================= Left Filter Sidebar ================= */}
          <aside className="filter-sidebar-card">
            <div className="filter-group-header">
              <h3>Bộ lọc tìm kiếm</h3>
              <button
                type="button"
                className="text-button"
                style={{ color: "#2563EB", fontSize: "13px", fontWeight: 600 }}
                onClick={() => {
                  setParams({});
                  setKeyword("");
                  setPage(1);
                }}
              >
                Đặt lại tất cả
              </button>
            </div>

            {/* City */}
            <div className="filter-group-item">
              <label className="filter-group-label">Tỉnh / Thành phố</label>
              <select
                className="search-field-select"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                }}
                value={city}
                onChange={(e) => change("city", e.target.value)}
              >
                <option value="">Tất cả thành phố</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="filter-group-item">
              <label className="filter-group-label">Quận / Huyện</label>
              <select
                className="search-field-select"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                }}
                value={district}
                onChange={(e) => change("district", e.target.value)}
              >
                <option value="">Tất cả quận huyện</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Budget range */}
            <div className="filter-group-item">
              <label className="filter-group-label">Khoảng giá thuê / tháng</label>
              <select
                className="search-field-select"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                }}
                value={budget}
                onChange={(e) => change("budget", e.target.value)}
              >
                <option value="">Mọi mức giá</option>
                <option value="0-3000000">Dưới 3 triệu</option>
                <option value="3000000-5000000">3 – 5 triệu</option>
                <option value="5000000-8000000">5 – 8 triệu</option>
                <option value="8000000-20000000">Trên 8 triệu</option>
              </select>
            </div>

            {/* Room Type */}
            <div className="filter-group-item">
              <label className="filter-group-label">Loại phòng</label>
              {["Phòng trọ", "Studio", "Căn hộ mini"].map((t) => (
                <label key={t} className="filter-checkbox-item">
                  <input
                    type="radio"
                    name="roomTypeFilter"
                    checked={type === t}
                    onChange={() => change("type", type === t ? "" : t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
              {type && (
                <button
                  type="button"
                  className="text-button"
                  style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}
                  onClick={() => change("type", "")}
                >
                  Xóa lọc loại phòng
                </button>
              )}
            </div>

            {/* Min Area */}
            <div className="filter-group-item">
              <label className="filter-group-label">Diện tích tối thiểu</label>
              <select
                className="search-field-select"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                }}
                value={area}
                onChange={(e) => change("area", e.target.value)}
              >
                <option value="">Không giới hạn</option>
                <option value="20">Từ 20 m²</option>
                <option value="25">Từ 25 m²</option>
                <option value="30">Từ 30 m²</option>
                <option value="40">Từ 40 m² trở lên</option>
              </select>
            </div>

            {/* Amenities */}
            <div className="filter-group-item">
              <label className="filter-group-label">Tiện nghi cần có</label>
              {[
                "Máy lạnh",
                "Nội thất",
                "Ban công",
                "Bếp riêng",
                "WC riêng",
                "Tự do giờ giấc",
                "Gác lửng",
                "Thú cưng",
                "Thang máy",
                "Khóa vân tay",
              ].map((item) => (
                <label key={item} className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={amenities.includes(item)}
                    onChange={() => toggleAmenity(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* ================= Right Results Area ================= */}
          <div>
            {/* Top Toolbar */}
            <div className="search-results-top-bar">
              <div className="search-results-count">
                Tìm thấy <span>{result.length}</span> phòng trọ phù hợp
              </div>

              <div className="search-results-actions">
                {/* View Mode Toggle: Grid, List, Map */}
                <div className="view-mode-toggle">
                  <button
                    className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => setViewMode("grid")}
                    aria-label="Xem dạng lưới"
                    title="Xem dạng lưới ô"
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => setViewMode("list")}
                    aria-label="Xem dạng danh sách"
                    title="Xem dạng danh sách ngang"
                  >
                    <List size={18} />
                  </button>
                  <button
                    className={`view-mode-btn ${viewMode === "map" ? "active" : ""}`}
                    onClick={() => setViewMode("map")}
                    aria-label="Xem dạng bản đồ phân bố"
                    title="Xem trên bản đồ trực quan"
                  >
                    <Map size={18} />
                  </button>
                </div>

                {/* Share Search Link button */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      notify("Đã sao chép liên kết tìm kiếm kèm toàn bộ bộ lọc!");
                    } catch {
                      notify("Bạn có thể sao chép liên kết từ thanh địa chỉ trình duyệt.");
                    }
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                  title="Chia sẻ đường dẫn tìm kiếm kèm bộ lọc"
                >
                  <Share2 size={15} />
                  <span className="hidden-mobile">Chia sẻ</span>
                </button>

                {/* Sort selection */}
                <select
                  className="search-sort-select"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    change("sort", e.target.value);
                  }}
                >
                  <option value="newest">Mới đăng nhất</option>
                  <option value="price-up">Giá thấp đến cao</option>
                  <option value="price-down">Giá cao đến thấp</option>
                  <option value="area">Diện tích lớn nhất</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {(city || district || budget || type || area || amenities.length > 0) && (
              <div className="search-active-filter-chips">
                <span style={{ fontSize: "13px", color: "#64748B", alignSelf: "center" }}>
                  Đang lọc:
                </span>
                {city && (
                  <span className="active-filter-pill">
                    {city}
                    <button onClick={() => change("city", "")}>×</button>
                  </span>
                )}
                {district && (
                  <span className="active-filter-pill">
                    {district}
                    <button onClick={() => change("district", "")}>×</button>
                  </span>
                )}
                {budget && (
                  <span className="active-filter-pill">
                    Giá: {budget}
                    <button onClick={() => change("budget", "")}>×</button>
                  </span>
                )}
                {type && (
                  <span className="active-filter-pill">
                    {type}
                    <button onClick={() => change("type", "")}>×</button>
                  </span>
                )}
                {area && (
                  <span className="active-filter-pill">
                    Từ {area} m²
                    <button onClick={() => change("area", "")}>×</button>
                  </span>
                )}
                {amenities.map((a) => (
                  <span key={a} className="active-filter-pill">
                    {a}
                    <button onClick={() => toggleAmenity(a)}>×</button>
                  </span>
                ))}
                <button
                  type="button"
                  style={{
                    background: "transparent",
                    border: 0,
                    color: "#EF4444",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setParams({});
                    setKeyword("");
                  }}
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Results Grid / List / Map Split */}
            {paginatedRooms.length > 0 ? (
              viewMode === "map" ? (
                <div
                  className="search-map-split-view"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.05fr 1fr",
                    gap: "24px",
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      maxHeight: "820px",
                      overflowY: "auto",
                      paddingRight: "6px",
                    }}
                  >
                    {paginatedRooms.map((room) => (
                      <div
                        key={room.id}
                        onMouseEnter={() => setActiveRoomId(room.id)}
                        style={{
                          borderRadius: "16px",
                          outline: activeRoomId === room.id ? "2px solid #2563EB" : "none",
                          transition: "outline 0.15s ease",
                        }}
                      >
                        <RoomCard room={room} listView={true} />
                      </div>
                    ))}
                  </div>
                  <div style={{ position: "sticky", top: "90px", height: "760px" }}>
                    <RoomMap
                      rooms={result}
                      activeRoomId={activeRoomId}
                      onSelectRoom={(id) => setActiveRoomId(id)}
                      style={{ height: "760px", minHeight: "600px" }}
                    />
                  </div>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "results-cards-grid" : "results-cards-list"}>
                  {paginatedRooms.map((room) => (
                    <RoomCard key={room.id} room={room} listView={viewMode === "list"} />
                  ))}
                </div>
              )
            ) : (
              <EmptyState
                title={savedOnly ? "Bạn chưa lưu căn phòng nào" : "Không tìm thấy phòng phù hợp"}
                message={
                  savedOnly
                    ? "Bấm vào biểu tượng trái tim ở góc mỗi căn phòng để lưu lại và xem sau."
                    : "Hãy thử nới rộng khoảng giá, đổi quận huyện hoặc xóa bớt một tiện nghi lọc."
                }
                action={
                  <button
                    className="btn-header-register"
                    onClick={() => {
                      setParams({});
                      setKeyword("");
                    }}
                  >
                    Xóa tất cả bộ lọc
                  </button>
                }
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="client-pagination">
                <button
                  className="pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-btn ${page === p ? "active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  aria-label="Trang sau"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const amenityIconMap = {
  "Nội thất": BedDouble,
  "Bếp riêng": CookingPot,
  "Máy lạnh": Snowflake,
  "Ban công": DoorOpen,
  "Gác lửng": Ruler,
  "Wifi": Wifi,
  "Tự do giờ giấc": Clock3,
};

export function RoomDetailPage() {
  const { id } = useParams();
  const { publicRooms: rooms, requests, mutate, notify, user } = useAppData();
  const room = rooms.find((x) => x.id === Number(id));

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [intent, setIntent] = useState("Xem phòng");
  const [submitted, setSubmitted] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!room) {
    return (
      <div className="client-container" style={{ padding: "80px 24px" }}>
        <EmptyState
          title="Không tìm thấy thông tin phòng"
          message="Phòng này có thể đã được thuê hoặc gỡ tin. Vui lòng quay lại danh sách phòng."
          action={
            <Link className="btn-header-register" to="/tim-phong">
              Xem các phòng khác
            </Link>
          }
        />
      </div>
    );
  }

  // All photos for gallery
  const allImages = room.images && room.images.length > 0
    ? room.images
    : room.photo
      ? [room.photo]
      : [];

  const similarRooms = rooms
    .filter((x) => x.id !== room.id && (x.city === room.city || x.type === room.type))
    .slice(0, 3);

  async function handleBook(event) {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");

    try {
      await mutate("/requests", "POST", {
        roomId: room.id,
        type: intent,
        date: form.get("date"),
        time: form.get("time").slice(0, 5),
        name: form.get("name"),
        phone: form.get("phone"),
        note: form.get("note"),
      });
      setSubmitted(true);
      notify("Đã gửi yêu cầu thành công đến chủ trọ.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Đã sao chép liên kết phòng trọ vào bộ nhớ tạm.");
    } catch {
      notify("Bạn có thể sao chép đường dẫn từ thanh địa chỉ trình duyệt.");
    }
  }

  return (
    <div className="room-detail-container">
      {/* Breadcrumbs */}
      <div className="detail-breadcrumbs">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/tim-phong">Tìm phòng</Link>
        <span>/</span>
        <span>{room.district}, {room.city}</span>
      </div>

      {/* Header Info */}
      <div className="detail-header-row">
        <div>
          <h1 className="detail-title-main">{room.title}</h1>
          <p className="detail-location-sub">
            <MapPin size={17} color="#2563EB" />
            <span>{room.address || `${room.district}, ${room.city}`}</span>
          </p>
        </div>

        <div className="detail-header-actions">
          <SaveButton id={room.id} style={{ position: "static", width: "42px", height: "42px" }} />
          <button className="btn-detail-action" onClick={handleShare}>
            <Share2 size={16} />
            Chia sẻ
          </button>
        </div>
      </div>

      {/* Airbnb-style Photo Gallery */}
      <div className="detail-airbnb-gallery">
        <div className="gallery-primary-img" onClick={() => setLightboxIndex(0)}>
          <RoomPhoto photo={allImages[0] || room.photo} alt={room.title} eager />
        </div>

        <div className="gallery-sub-grid">
          <div className="gallery-sub-img" onClick={() => setLightboxIndex(1)}>
            <RoomPhoto photo={allImages[1] || allImages[0]} alt="Ảnh phụ 1" />
          </div>
          <div className="gallery-sub-img" onClick={() => setLightboxIndex(2)}>
            <RoomPhoto photo={allImages[2] || allImages[0]} alt="Ảnh phụ 2" />
          </div>
        </div>

        <button className="btn-view-all-photos" onClick={() => setLightboxIndex(0)}>
          Xem tất cả ({allImages.length || 1}) ảnh
        </button>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <Lightbox
          images={allImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Detail 2-column layout */}
      <div className="detail-content-layout">
        {/* Left Column (Main Information) */}
        <div>
          {/* 4 Key Specs */}
          <div className="detail-specs-bar">
            <div className="spec-bar-box">
              <span>Diện tích</span>
              <strong>{room.area} m²</strong>
            </div>
            <div className="spec-bar-box">
              <span>Loại phòng</span>
              <strong>{room.type || "Phòng trọ"}</strong>
            </div>
            <div className="spec-bar-box">
              <span>Số phòng</span>
              <strong>{room.number || "01"}</strong>
            </div>
            <div className="spec-bar-box">
              <span>Tình trạng</span>
              <strong style={{ color: room.available ? "#10B981" : "#64748B" }}>
                {room.available ? "Còn phòng" : "Đã cho thuê"}
              </strong>
            </div>
          </div>

          {/* Description Section */}
          <div className="detail-block-section" style={{ borderTop: 0, paddingTop: 0 }}>
            <h3>Mô tả chi tiết căn phòng</h3>
            <p style={{ fontSize: "15px", color: "#334155", lineHeight: "1.75", whiteSpace: "pre-line" }}>
              {room.description || "Phòng trọ sạch sẽ, thoáng mát, an ninh tốt, giờ giấc thoải mái, vị trí thuận tiện đi lại và gần các trường đại học, trạm xe buýt."}
            </p>
          </div>

          {/* Amenities Section */}
          <div className="detail-block-section">
            <h3>Tiện ích & Cơ sở vật chất</h3>
            <div className="detail-amenities-grid">
              {(room.amenities || ["Máy lạnh", "Nội thất", "Wifi"]).map((item) => {
                const Icon = amenityIconMap[item] || Wifi;
                return (
                  <div key={item} className="detail-amenity-card">
                    <Icon size={20} />
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fees Breakdown Section */}
          <div className="detail-block-section">
            <h3>Bảng chi phí sinh hoạt minh bạch</h3>
            <table className="detail-fees-table">
              <tbody>
                <tr>
                  <td>Tiền thuê phòng mỗi tháng</td>
                  <td style={{ color: "#2563EB", fontSize: "17px" }}>{money(room.price)} / tháng</td>
                </tr>
                {(room.fees || []).map((fee) => (
                  <tr key={fee.id}>
                    <td>
                      {fee.name} ({fee.mode || "Theo thực tế"})
                    </td>
                    <td>{money(fee.price)} / {fee.unit}</td>
                  </tr>
                ))}
                <tr>
                  <td>Tiền đặt cọc phòng</td>
                  <td>Thỏa thuận trong hợp đồng (thường 1 tháng)</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: "13px", color: "#64748B", marginTop: "12px" }}>
              * Đơn giá do chủ trọ niêm yết công khai. Chỉ số công tơ điện nước được chốt vào ngày bàn giao phòng.
            </p>
          </div>

          {/* Move-in Budget & Cost Estimator */}
          <div className="detail-block-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Dự toán ngân sách dọn vào & sinh hoạt</h3>
              <span style={{ fontSize: "12px", background: "#EFF6FF", color: "#2563EB", padding: "4px 10px", borderRadius: "20px", fontWeight: 600 }}>
                Dự toán minh bạch
              </span>
            </div>

            <div style={{ background: "#F8FAFC", borderRadius: "18px", border: "1px solid #E2E8F0", padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "16px" }}>
                <div style={{ background: "#FFFFFF", padding: "14px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "4px" }}>Tiền cọc giữ phòng</div>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A" }}>{money(room.deposit || room.price)}</div>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>Quy ước 1 tháng</span>
                </div>
                <div style={{ background: "#FFFFFF", padding: "14px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "4px" }}>Tiền thuê tháng đầu</div>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: "#2563EB" }}>{money(room.price)}</div>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>Thanh toán đầu tháng</span>
                </div>
                <div style={{ background: "#FFFFFF", padding: "14px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "4px" }}>Dịch vụ dự kiến</div>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A" }}>~ 400.000 đ</div>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>Điện, nước, internet</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "13px", color: "#64748B" }}>Tổng ngân sách ban đầu cần chuẩn bị khi dọn vào:</div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", marginTop: "2px" }}>
                    {money((room.deposit || room.price) + room.price + 400000)}
                  </div>
                </div>
                <div style={{ fontSize: "13px", color: "#1E40AF", background: "#EFF6FF", padding: "8px 14px", borderRadius: "10px", border: "1px solid #BFDBFE" }}>
                  💡 Ở ghép 2 người: khoảng <strong>{money(Math.round(((room.deposit || room.price) + room.price + 400000) / 2))}</strong> / người tháng đầu
                </div>
              </div>
            </div>
          </div>

          {/* Location & Map Section */}
          <div className="detail-block-section">
            <h3>Vị trí & Khu vực lân cận</h3>
            <div style={{ height: "300px", borderRadius: "16px", overflow: "hidden", marginBottom: "16px" }}>
              <RoomMap rooms={[room]} activeRoomId={room.id} style={{ height: "300px", minHeight: "300px" }} />
            </div>
            <div
              style={{
                background: "#F8FAFC",
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#EFF6FF", color: "#2563EB", display: "grid", placeItems: "center" }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <strong style={{ display: "block", fontSize: "15px", color: "#0F172A" }}>
                    {room.address || `${room.district}, ${room.city}`}
                  </strong>
                  <span style={{ fontSize: "13px", color: "#64748B" }}>
                    Địa chỉ được chủ trọ cung cấp và xác minh
                  </span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room.address || `${room.district}, ${room.city}`)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-header-login"
                style={{ whiteSpace: "nowrap" }}
              >
                Mở Google Maps <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column (Sticky Booking & Host Box) */}
        <div>
          <div className="detail-booking-card">
            {/* Price Box */}
            <div className="booking-card-price">
              <span>Giá thuê niêm yết</span>
              <div>
                <strong>{shortPrice(room.price)} triệu</strong>
                <span> / tháng</span>
              </div>
            </div>

            {/* Host Profile Box */}
            <div className="booking-host-profile">
              <span className="host-avatar-large">
                {(room.hostName || "CT").slice(0, 2).toUpperCase()}
              </span>
              <div className="host-info-wrap">
                <strong>{room.hostName || "Chủ trọ"}</strong>
                <span>
                  <ShieldCheck size={14} /> Chủ nhà đã xác minh
                </span>
              </div>
            </div>

            {/* Check pending appointment */}
            {requests.some((r) => r.roomId === room.id && r.status === "Chờ xác nhận") && (
              <div
                style={{
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "12.5px",
                  color: "#1D4ED8",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>Bạn đã gửi 1 lịch hẹn đang chờ xác nhận cho căn phòng này.</span>
              </div>
            )}

            {/* Quick Action CTA Buttons */}
            <button
              className="btn-book-primary"
              disabled={!room.available}
              onClick={() => {
                setIntent("Xem phòng");
                setBookingModalOpen(true);
                setSubmitted(false);
              }}
            >
              <CalendarDays size={18} />
              Đặt lịch hẹn xem phòng
            </button>

            <button
              className="btn-book-secondary"
              disabled={!room.available}
              onClick={() => {
                setIntent("Đăng ký thuê");
                setBookingModalOpen(true);
                setSubmitted(false);
              }}
            >
              Đăng ký giữ chỗ thuê phòng
            </button>

            {/* Direct Call & Direct Zalo Messaging Buttons */}
            {room.hostPhone && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                <a
                  href={`tel:${room.hostPhone}`}
                  className="btn-book-secondary"
                  style={{ color: "#059669", textDecoration: "none", justifyContent: "center" }}
                  title="Gọi trực tiếp cho chủ trọ"
                >
                  <Phone size={15} /> Gọi điện
                </a>
                <a
                  href={`https://zalo.me/${room.hostPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-book-secondary"
                  style={{ color: "#0284C7", textDecoration: "none", justifyContent: "center" }}
                  title="Mở ứng dụng Zalo chat trực tiếp với chủ trọ"
                >
                  <MessageSquare size={15} /> Nhắn Zalo
                </a>
              </div>
            )}

            <p style={{ fontSize: "12.5px", color: "#64748B", textAlign: "center", marginTop: "16px" }}>
              Không thu bất kỳ khoản phí môi giới nào từ người tìm phòng.
            </p>
          </div>
        </div>
      </div>

      {/* Similar Rooms Recommendation Grid */}
      {similarRooms.length > 0 && (
        <section style={{ marginTop: "64px", paddingTop: "48px", borderTop: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0F172A" }}>
              Phòng tương tự tại khu vực này
            </h2>
            <Link to="/tim-phong" className="btn-view-property">
              Xem thêm phòng khác <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="results-cards-grid">
            {similarRooms.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>
        </section>
      )}

      {/* Booking Appointment Modal */}
      {bookingModalOpen && (
        <Modal
          title={
            submitted
              ? "Gửi yêu cầu thành công!"
              : intent === "Xem phòng"
                ? "Đặt lịch hẹn xem phòng"
                : "Đăng ký thuê phòng"
          }
          onClose={() => setBookingModalOpen(false)}
        >
          {submitted ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  color: "#10B981",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Check size={32} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                Yêu cầu của bạn đã được chuyển tới chủ trọ
              </h3>
              <p style={{ fontSize: "14.5px", color: "#64748B", marginBottom: "24px", lineHeight: "1.5" }}>
                Chủ nhà sẽ nhận được thông báo và liên hệ lại với bạn theo số điện thoại đã cung cấp.
                Bạn có thể theo dõi tiến độ trong mục Yêu cầu của tôi.
              </p>
              <Link
                to="/tai-khoan/yeu-cau"
                className="btn-header-register"
                onClick={() => setBookingModalOpen(false)}
              >
                Xem yêu cầu của tôi
              </Link>
            </div>
          ) : !user ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: "15px", color: "#475569", marginBottom: "20px" }}>
                Vui lòng đăng nhập để đặt lịch hẹn xem phòng và nhận phản hồi từ chủ trọ.
              </p>
              <Link
                to={`/dang-nhap?next=${encodeURIComponent(`/phong-tro/${room.id}`)}`}
                className="btn-header-register"
                onClick={() => setBookingModalOpen(false)}
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <form onSubmit={handleBook} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Ngày hẹn</span>
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={TODAY_INPUT}
                    min={TODAY_INPUT}
                    style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                  />
                </label>

                <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Giờ hẹn</span>
                  <input
                    name="time"
                    type="time"
                    required
                    defaultValue="09:00"
                    style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Họ và tên</span>
                  <input
                    name="name"
                    required
                    defaultValue={user.name}
                    placeholder="Nguyễn Văn A"
                    style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                  />
                </label>

                <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Số điện thoại</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    defaultValue={user.phone || ""}
                    placeholder="0912 345 678"
                    style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                  />
                </label>
              </div>

              <label className="field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Lời nhắn gửi chủ nhà (tùy chọn)</span>
                <textarea
                  name="note"
                  rows={3}
                  placeholder="Ví dụ: Em muốn xem phòng vào sáng thứ Bảy này..."
                  style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                />
              </label>

              {error && (
                <p style={{ color: "#EF4444", fontSize: "13.5px" }}>{error}</p>
              )}

              <button
                type="submit"
                className="btn-book-primary"
                disabled={busy}
                style={{ marginTop: "8px" }}
              >
                {busy ? "Đang gửi yêu cầu..." : "Xác nhận gửi lịch hẹn"}
              </button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
