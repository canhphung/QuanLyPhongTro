import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal,
  X,
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
  Sun,
  Share2,
  Clock3,
} from "lucide-react";
import { useAppData } from "./context";
import {
  RoomPhoto,
  RoomCard,
  PageTitle,
  EmptyState,
  SaveButton,
  Modal,
  BackLink,
} from "./ui";
import { money, shortPrice, TODAY_INPUT } from "./data";

export function RoomSearchPage({ savedOnly = false }) {
  const { publicRooms: rooms, saved, user } = useAppData();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("recommended");
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
  }
  function toggleAmenity(value) {
    const next = new URLSearchParams(params);
    const values = amenities.includes(value)
      ? amenities.filter((x) => x !== value)
      : [...amenities, value];
    next.delete("amenity");
    values.forEach((x) => next.append("amenity", x));
    setParams(next);
  }
  const result = rooms
    .filter((room) => {
      const [min, max] = budget ? budget.split("-").map(Number) : [0, Infinity];
      const normalized = (text) =>
        text
          .toLocaleLowerCase("vi")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d");
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
        amenities.every((x) => room.amenities.includes(x)) &&
        (!params.get("q") ||
          normalized(
            `${room.title} ${room.address} ${room.building} ${(room.amenities || []).join(" ")}`,
          ).includes(normalized(params.get("q"))))
      );
    })
    .sort((a, b) =>
      sort === "price-up"
        ? a.price - b.price
        : sort === "price-down"
          ? b.price - a.price
          : sort === "area"
            ? b.area - a.area
            : a.id - b.id,
    );
  const districts = [
    ...new Set(
      rooms.filter((x) => !city || x.city === city).map((x) => x.district),
    ),
  ];
  if (savedOnly && !user)
    return (
      <div className="page-container">
        <EmptyState
          title="Lưu chốn riêng của bạn"
          message="Đăng nhập để xem danh sách phòng đã lưu."
          action={
            <Link className="button" to="/dang-nhap?next=%2Fyeu-thich">
              Đăng nhập
            </Link>
          }
        />
      </div>
    );
  return (
    <div className="explore-page page-container">
      <BackLink to="/">Trang chủ</BackLink>
      <PageTitle
        title={savedOnly ? "Căn phòng mình đã lưu" : "Tìm chốn riêng của mình"}
        subtitle={
          savedOnly
            ? "Giữ lại những nơi khiến bạn muốn dừng chân."
            : "Chọn khu vực, khoảng giá và những điều khiến bạn thấy như ở nhà."
        }
      />
      <form
        className="explore-search"
        onSubmit={(event) => {
          event.preventDefault();
          change("q", keyword);
        }}
      >
        <MapPin size={21} />
        <input
          aria-label="Tìm theo tên phòng hoặc địa chỉ"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Thử Bình Thạnh, Nguyễn Gia Trí…"
        />
        <button className="button" type="submit">
          Tìm phòng
        </button>
      </form>
      <div className="explore-layout" data-ui>
        <aside
          className={`filter-panel ${filtersOpen ? "is-open" : ""}`}
          aria-label="Bộ lọc tìm phòng"
        >
          <div className="filter-title">
            <h2>Bộ lọc</h2>
            <button
              className="plain-link"
              onClick={() => {
                setParams({});
                setKeyword("");
              }}
            >
              Đặt lại
            </button>
            <button
              className="icon-button filter-close"
              aria-label="Đóng bộ lọc"
              onClick={() => setFiltersOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <label className="field">
            <span>Thành phố</span>
            <select
              value={city}
              onChange={(e) => change("city", e.target.value)}
            >
              <option value="">Tất cả thành phố</option>
              {[...new Set(rooms.map((r) => r.city))].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Quận / huyện</span>
            <select
              value={district}
              onChange={(e) => change("district", e.target.value)}
            >
              <option value="">Tất cả khu vực</option>
              {districts.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Giá thuê / tháng</span>
            <select
              value={budget}
              onChange={(e) => change("budget", e.target.value)}
            >
              <option value="">Tất cả mức giá</option>
              <option value="0-3000000">Dưới 3 triệu</option>
              <option value="3000000-4500000">3 – 4,5 triệu</option>
              <option value="4500000-6000000">4,5 – 6 triệu</option>
              <option value="6000000-20000000">Trên 6 triệu</option>
            </select>
          </label>
          <fieldset>
            <legend>Loại phòng</legend>
            {["Phòng trọ", "Studio", "Căn hộ mini"].map((x) => (
              <label className="check-field" key={x}>
                <input
                  type="radio"
                  name="room-type"
                  checked={type === x}
                  onChange={() => change("type", type === x ? "" : x)}
                />
                {x}
              </label>
            ))}
            {type && (
              <button
                className="text-button"
                onClick={() => change("type", "")}
              >
                Tất cả loại phòng
              </button>
            )}
          </fieldset>
          <label className="field">
            <span>Diện tích từ</span>
            <select
              value={area}
              onChange={(e) => change("area", e.target.value)}
            >
              <option value="">Không giới hạn</option>
              <option value="25">25 m²</option>
              <option value="30">30 m²</option>
              <option value="35">35 m²</option>
            </select>
          </label>
          <fieldset>
            <legend>Tiện nghi mình cần</legend>
            {[
              "Nội thất",
              "Máy lạnh",
              "Ban công",
              "Gác lửng",
              "Bếp riêng",
              "Cửa sổ",
            ].map((x) => (
              <label className="check-field" key={x}>
                <input
                  type="checkbox"
                  checked={amenities.includes(x)}
                  onChange={() => toggleAmenity(x)}
                />
                {x}
              </label>
            ))}
          </fieldset>
          <button
            className="button apply-filter"
            onClick={() => setFiltersOpen(false)}
          >
            Xem {result.length} phòng
          </button>
        </aside>
        <div className="search-results">
          <div className="results-toolbar">
            <p>
              <strong>{result.length} phòng</strong> phù hợp
              {savedOnly ? " đã lưu" : ""}
            </p>
            <button
              className="filter-open button button-soft"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal size={16} />
              Bộ lọc
            </button>
            <label className="sort-select">
              <span className="sr-only">Sắp xếp phòng</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recommended">Gợi ý cho bạn</option>
                <option value="price-up">Giá thấp đến cao</option>
                <option value="price-down">Giá cao đến thấp</option>
                <option value="area">Diện tích lớn nhất</option>
              </select>
            </label>
          </div>
          {params.size > 0 && (
            <div className="active-filters">
              {[city, district, type, area && `Từ ${area} m²`, ...amenities]
                .filter(Boolean)
                .map((x) => (
                  <span key={x}>{x}</span>
                ))}
            </div>
          )}
          {result.length ? (
            <div className="results-grid">
              {result.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                savedOnly && !saved.length
                  ? "Chưa có căn phòng nào được lưu"
                  : "Chưa tìm được phòng phù hợp"
              }
              message={
                savedOnly && !saved.length
                  ? "Chạm vào trái tim ở căn phòng bạn thích. Chúng sẽ ở đây để bạn xem lại."
                  : "Thử mở rộng khu vực, điều chỉnh khoảng giá hoặc bỏ bớt một tiện nghi."
              }
              action={
                savedOnly ? (
                  <Link to="/tim-phong" className="button">
                    Khám phá phòng
                  </Link>
                ) : (
                  <button
                    className="button"
                    onClick={() => {
                      setParams({});
                      setKeyword("");
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                )
              }
            />
          )}
        </div>
      </div>
      <p className="page-data-caption">
        Tin đăng và hình ảnh do chủ trọ cung cấp.
      </p>
    </div>
  );
}

const amenityIcons = {
  "Nội thất": BedDouble,
  "Bếp riêng": CookingPot,
  "Máy lạnh": Snowflake,
  "Cửa sổ": Sun,
  "Ban công": DoorOpen,
  "Gác lửng": Ruler,
};
export function RoomDetailPage() {
  const { id } = useParams();
  const { publicRooms: rooms, requests, mutate, notify, user } = useAppData();
  const room = rooms.find((x) => x.id === Number(id));
  const [booking, setBooking] = useState(false);
  const [intent, setIntent] = useState("Xem phòng");
  const [submitted, setSubmitted] = useState(false);
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!room)
    return (
      <div className="page-container">
        <EmptyState
          title="Không tìm thấy căn phòng"
          message="Tin đăng này có thể đã được thay đổi. Hãy tìm một chốn riêng khác nhé."
          action={
            <Link className="button" to="/tim-phong">
              Về trang tìm phòng
            </Link>
          }
        />
      </div>
    );

  const today = TODAY_INPUT;
  async function book(event) {
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
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Đã sao chép đường dẫn căn phòng.");
    } catch {
      notify("Bạn có thể sao chép đường dẫn từ thanh địa chỉ của trình duyệt.");
    }
  }
  return (
    <div className="detail-page page-container">
      <BackLink />
      <div className="detail-title">
        <div>
          <p className="room-location">
            <MapPin size={16} />
            {room.address}
          </p>
          <h1>{room.title}</h1>
        </div>
        <button className="button button-soft" onClick={share}>
          <Share2 size={16} />
          Chia sẻ
        </button>
      </div>
      <div className="detail-gallery">
        <button
          className="gallery-main"
          onClick={() => setImage(room.photo)}
          aria-label="Mở ảnh phòng lớn"
        >
          <RoomPhoto
            eager
            photo={room.photo}
            alt={`Ảnh ${room.title.toLowerCase()}`}
          />
        </button>
        <div>
          {room.images.slice(1, 3).map((url, offset) => (
            <button
              key={offset}
              onClick={() => setImage(url)}
              aria-label={`Mở ảnh không gian ${offset + 1}`}
            >
              <RoomPhoto photo={url} alt={`Ảnh phòng ${offset + 1}`} />
            </button>
          ))}
        </div>
        <span className="gallery-disclaimer">Ảnh do chủ trọ cung cấp</span>
      </div>
      <div className="detail-layout">
        <div className="detail-information">
          <div className="detail-highlights">
            <span>
              <Ruler size={21} />
              <strong>{room.area} m²</strong>Diện tích
            </span>
            <span>
              <DoorOpen size={21} />
              <strong>{room.type}</strong>Loại phòng
            </span>
            <span>
              <BedDouble size={21} />
              <strong>{room.number}</strong>Số phòng
            </span>
            <span>
              <CalendarDays size={21} />
              <strong>{room.available ? "Có thể xem" : "Đã cho thuê"}</strong>
              Tình trạng
            </span>
          </div>
          <section>
            <h2>Một chút về căn phòng</h2>
            <p>{room.description}</p>
            <p>
              Bạn nên đến xem thực tế, hỏi rõ chi phí và kiểm tra các điều khoản
              trước khi quyết định thuê.
            </p>
          </section>
          <section>
            <h2>Những gì có sẵn</h2>
            <div className="amenity-grid">
              {room.amenities.map((item) => {
                const Icon = amenityIcons[item] || Wifi;
                return (
                  <span key={item}>
                    <Icon size={20} strokeWidth={1.5} />
                    {item}
                  </span>
                );
              })}
            </div>
          </section>
          <section>
            <h2>Chi phí nhìn một lần là rõ</h2>
            <div className="cost-table" data-ui>
              <div>
                <span>Tiền phòng mỗi tháng</span>
                <strong>{money(room.price)}</strong>
              </div>
              {(room.fees || []).map((f) => (
                <div key={f.id}>
                  <span>{f.name}</span>
                  <span>
                    {money(f.price)} / {f.unit}
                  </span>
                </div>
              ))}
              <div>
                <span>Tiền cọc</span>
                <span>Thỏa thuận trong hợp đồng</span>
              </div>
            </div>
            <p className="fine-print">
              Đơn giá do chủ trọ công bố, cần được đối chiếu với hợp đồng thực
              tế.
            </p>
          </section>
          <section>
            <h2>Ở quanh đây</h2>
            <div className="location-card">
              <MapPin size={25} />
              <div>
                <strong>{room.address}</strong>
                <p>Địa chỉ nhà trọ do chủ trọ cung cấp.</p>
              </div>
              <a
                className="plain-link"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room.address)}`}
                target="_blank"
                rel="noreferrer"
              >
                Xem khu vực
                <ArrowUpRight size={17} />
              </a>
            </div>
          </section>
        </div>
        <aside className="booking-panel" data-ui>
          <p className="booking-type">
            {room.type} · {room.building}
          </p>
          <p className="booking-price">
            {shortPrice(room.price)} triệu <span>/ tháng</span>
          </p>
          <p className="booking-estimate">
            Giá thuê chưa gồm các dịch vụ sử dụng.
          </p>
          <div className="host-line">
            <span className="avatar">
              {room.hostName?.split(" ").at(-1)?.slice(0, 2)}
            </span>
            <div>
              <strong>{room.hostName}</strong>
              <span>{room.hostPhone || "Liên hệ qua yêu cầu xem phòng"}</span>
            </div>
            <SaveButton id={room.id} />
          </div>
          <button
            className="button"
            disabled={!room.available}
            onClick={() => {
              setIntent("Xem phòng");
              setBooking(true);
              setSubmitted(false);
            }}
          >
            <CalendarDays size={18} />
            Đặt lịch xem
          </button>
          <button
            className="button button-soft"
            disabled={!room.available}
            onClick={() => {
              setIntent("Đăng ký thuê");
              setBooking(true);
              setSubmitted(false);
            }}
          >
            Gửi yêu cầu thuê
          </button>
          <p className="fine-print">
            <Clock3 size={14} />
            Chưa cần đặt cọc để gửi yêu cầu xem.
          </p>
          {requests.some((x) => x.roomId === room.id) && (
            <Link to="/tai-khoan/yeu-cau" className="plain-link">
              Xem yêu cầu đã gửi
              <ArrowUpRight size={15} />
            </Link>
          )}
        </aside>
      </div>
      <section className="related-section">
        <div className="section-heading">
          <h2>Một vài lựa chọn khác</h2>
          <Link className="plain-link" to="/tim-phong">
            Xem thêm phòng
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="related-grid" data-ui>
          {rooms
            .filter((x) => x.id !== room.id && x.available)
            .slice(0, 3)
            .map((x) => (
              <RoomCard key={x.id} room={x} />
            ))}
        </div>
      </section>
      {booking && (
        <Modal
          title={
            submitted
              ? "Đã lưu yêu cầu của bạn"
              : intent === "Xem phòng"
                ? "Hẹn một buổi xem phòng"
                : "Gửi yêu cầu thuê phòng"
          }
          onClose={() => setBooking(false)}
        >
          {submitted ? (
            <div className="booking-success">
              <span className="success-mark">
                <Check size={29} />
              </span>
              <h3>Hẹn gặp ở chốn riêng mới.</h3>
              <p>
                Yêu cầu đã được gửi đến chủ trọ. Bạn có thể theo dõi trạng thái
                hoặc hủy lịch trong tài khoản.
              </p>
              <Link
                to="/tai-khoan/yeu-cau"
                className="button"
                onClick={() => setBooking(false)}
              >
                Xem yêu cầu của tôi
              </Link>
            </div>
          ) : user?.role === "owner" ? (
            <p>Yêu cầu xem và thuê phòng dành cho tài khoản người thuê.</p>
          ) : !user ? (
            <div className="form-stack">
              <p>Đăng nhập để gửi yêu cầu đến chủ trọ và theo dõi phản hồi.</p>
              <Link
                className="button"
                to={`/dang-nhap?next=${encodeURIComponent(`/phong-tro/${room.id}`)}`}
              >
                Đăng nhập
              </Link>
            </div>
          ) : (
            <form className="form-stack" onSubmit={book}>
              <div className="booking-room-summary">
                <RoomPhoto photo={room.photo} alt="Phòng muốn đặt lịch" />
                <div>
                  <strong>
                    {room.building} · {room.number}
                  </strong>
                  <p>
                    {room.district} · {money(room.price)}/tháng
                  </p>
                </div>
              </div>
              <div className="form-row">
                <label className="field">
                  <span>Họ và tên</span>
                  <input
                    name="name"
                    required
                    placeholder="Tên của bạn"
                    defaultValue={user?.name}
                    autoComplete="name"
                  />
                </label>
                <label className="field">
                  <span>Số điện thoại</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    pattern="[0-9+ ()-]{9,16}"
                    placeholder="Số liên hệ"
                    defaultValue={user?.phone}
                    autoComplete="tel"
                  />
                </label>
              </div>
              <div className="form-row">
                <label className="field">
                  <span>Ngày mong muốn</span>
                  <input type="date" name="date" min={today} required />
                </label>
                <label className="field">
                  <span>Khung giờ</span>
                  <select name="time">
                    <option>09:00 – 10:00</option>
                    <option>10:00 – 11:00</option>
                    <option>14:00 – 15:00</option>
                    <option>16:00 – 17:00</option>
                    <option>18:00 – 19:00</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Lời nhắn cho chủ trọ</span>
                <textarea
                  name="note"
                  placeholder="Bạn muốn hỏi thêm điều gì về căn phòng?"
                  rows="3"
                />
              </label>
              <p className="fine-print">
                Thông tin liên hệ được gửi đến chủ trọ để xác nhận yêu cầu của
                bạn.
              </p>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <button className="button" type="submit" disabled={busy}>
                {intent === "Xem phòng" ? "Gửi lịch hẹn" : "Gửi yêu cầu thuê"}
                <ArrowUpRight size={17} />
              </button>
            </form>
          )}
        </Modal>
      )}
      {image !== null && (
        <Modal title="Ảnh phòng" wide onClose={() => setImage(null)}>
          <RoomPhoto
            photo={image}
            alt="Ảnh phòng phóng lớn"
            className="lightbox-photo"
          />
          <p className="fine-print">Hình ảnh do chủ trọ cung cấp.</p>
        </Modal>
      )}
    </div>
  );
}
