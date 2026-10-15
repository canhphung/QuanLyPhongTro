import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
  Check,
  Plus,
} from "lucide-react";
import { useAppData } from "./context";
import { RoomPhoto, RoomCard, ArrowLink, EmptyState } from "./ui";
import { money, shortPrice } from "./data";

const faq = [
  [
    "Tôi nên bắt đầu tìm phòng từ đâu?",
    "Chọn thành phố, khu vực và khoảng giá bạn muốn. Bạn có thể lọc thêm loại phòng, diện tích và tiện nghi ở trang tìm phòng, rồi lưu lại những căn phù hợp để xem sau.",
  ],
  [
    "Chi phí mỗi tháng gồm những gì?",
    "Ngoài tiền phòng, bạn nên kiểm tra đơn giá điện, nước, Internet, phí vệ sinh và gửi xe. Công cụ ước tính trên trang giúp bạn hình dung tổng chi phí; chi phí thực tế cần được xác nhận trong hợp đồng.",
  ],
  [
    "Làm thế nào để đặt lịch xem phòng?",
    "Mở chi tiết một tin đăng, chọn “Đặt lịch xem”, điền ngày, giờ và lời nhắn. Sau khi đăng nhập, yêu cầu được gửi đến chủ trọ và có thể xem lại trong tài khoản.",
  ],
  [
    "Tôi là chủ trọ, có thể làm gì ở đây?",
    "Khu chủ trọ có màn hình quản lý nhà, phòng, người thuê, dịch vụ, hợp đồng, hóa đơn, thanh toán và tin đăng. Đăng ký tài khoản chủ trọ để thêm nhà trọ, phòng và công bố tin đăng.",
  ],
];

function CostCalculator() {
  const { publicRooms: rooms } = useAppData();
  const [roomId, setRoomId] = useState("");
  const [usage, setUsage] = useState({});
  const room = rooms.find((x) => x.id === Number(roomId)) || rooms[0];
  if (!room) return null;
  const fees = room.fees || [];
  const total =
    Number(room.price) +
    fees.reduce(
      (sum, f) => sum + Number(f.price) * Number(usage[f.id] || 0),
      0,
    );
  return (
    <section className="cost-section section-space" id="chi-phi">
      <div className="cost-story">
        <h2>
          Vừa căn phòng.
          <br />
          Vừa túi tiền.
        </h2>
        <p>
          Ước tính theo đơn giá dịch vụ chủ trọ đã công bố. Nhập số lượng sử
          dụng dự kiến cho từng khoản phí.
        </p>
        <div className="cost-material">
          <RoomPhoto photo={room.photo} alt={room.title} />
          <span>{room.title}</span>
        </div>
      </div>
      <div className="cost-sheet" data-ui>
        <h3>Thử tính một tháng ở đây</h3>
        <label className="field">
          <span>Căn phòng bạn đang cân nhắc</span>
          <select
            value={room.id}
            onChange={(e) => {
              setRoomId(e.target.value);
              setUsage({});
            }}
          >
            {rooms.map((x) => (
              <option key={x.id} value={x.id}>
                {x.building} · {x.area} m² · {shortPrice(x.price)} triệu
              </option>
            ))}
          </select>
        </label>
        {fees.map((f) => (
          <label className="field" key={f.id}>
            <span>
              {f.name} · {money(f.price)} / {f.unit}
            </span>
            <input
              aria-label={`Số lượng ${f.name}`}
              type="number"
              min="0"
              step="0.001"
              value={usage[f.id] || 0}
              onChange={(e) =>
                setUsage({
                  ...usage,
                  [f.id]: Math.max(0, Number(e.target.value)),
                })
              }
            />
          </label>
        ))}
        {!fees.length && (
          <p>
            Chủ trọ chưa công bố đơn giá dịch vụ. Tổng dưới đây chỉ gồm tiền
            phòng.
          </p>
        )}
        <dl className="cost-breakdown">
          <div>
            <dt>Tiền phòng</dt>
            <dd>{money(room.price)}</dd>
          </div>
          {fees.map((f) => (
            <div key={f.id}>
              <dt>{f.name}</dt>
              <dd>{money(Number(f.price) * Number(usage[f.id] || 0))}</dd>
            </div>
          ))}
        </dl>
        <div className="cost-total">
          <span>Dự tính mỗi tháng</span>
          <output aria-live="polite">{money(total)}</output>
        </div>
        <p className="fine-print">
          Chưa gồm tiền cọc và các khoản chưa công bố. Chi phí cuối cùng theo
          hợp đồng.
        </p>
        <Link className="button button-dark" to={`/phong-tro/${room.id}`}>
          Xem căn phòng này
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { publicRooms: rooms } = useAppData();
  const navigate = useNavigate();
  const [chosenCity, setCity] = useState("");
  const city = chosenCity || rooms[0]?.city || "TP. Hồ Chí Minh";
  const [district, setDistrict] = useState("");
  const [budget, setBudget] = useState("");
  const [type, setType] = useState("Tất cả");
  const [photo, setPhoto] = useState(0);
  const homeRef = useRef(null);
  const heroRooms = rooms
    .filter((x) => x.available && x.published !== false)
    .slice(0, 4);
  const activeIndex = heroRooms.length ? photo % heroRooms.length : 0;
  const activeRoom = heroRooms[activeIndex] || {
    id: null,
    building: "Chưa có tin đăng",
    area: null,
    price: 0,
    district: "Khám phá phòng",
  };
  const featured = rooms.filter(
    (x) =>
      x.available &&
      x.published !== false &&
      x.city === city &&
      (type === "Tất cả" || x.type === type),
  );
  const districts = [
    ...new Set(rooms.filter((x) => x.city === city).map((x) => x.district)),
  ];
  useEffect(() => {
    const nodes = homeRef.current.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) return;
    homeRef.current.classList.add("motion-ready");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.06 },
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);
  function search(event) {
    event.preventDefault();
    const params = new URLSearchParams({ city });
    if (district) params.set("district", district);
    if (budget) params.set("budget", budget);
    navigate(`/tim-phong?${params}`);
  }
  return (
    <div ref={homeRef} className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="hero-intro">
            <h1 className="hero-heading">
              <span>Một căn phòng.</span>
              <span>Một chốn riêng.</span>
            </h1>
            <p className="hero-lead">
              Tìm một nơi để trở về, với khoảng giá vừa vặn và những điều bạn
              thật sự cần.
            </p>
          </div>
          <form className="hero-search" onSubmit={search} data-ui>
            <div className="city-tabs" role="group" aria-label="Chọn thành phố">
              {(rooms.length
                ? [...new Set(rooms.map((r) => r.city))]
                : ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng"]
              ).map((value) => (
                <button
                  type="button"
                  key={value}
                  className={city === value ? "active" : ""}
                  aria-pressed={city === value}
                  onClick={() => {
                    setCity(value);
                    setDistrict("");
                  }}
                >
                  {value === "TP. Hồ Chí Minh" ? "TP. Hồ Chí Minh" : value}
                </button>
              ))}
            </div>
            <div className="hero-fields">
              <label>
                <span>
                  <MapPin size={15} />
                  Khu vực
                </span>
                <select
                  aria-label="Khu vực tìm phòng"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="">Tất cả quận, huyện</option>
                  {districts.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Ngân sách / tháng</span>
                <select
                  aria-label="Ngân sách tìm phòng"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option value="">Chọn khoảng giá</option>
                  <option value="0-3000000">Dưới 3 triệu</option>
                  <option value="3000000-4500000">3 – 4,5 triệu</option>
                  <option value="4500000-6000000">4,5 – 6 triệu</option>
                  <option value="6000000-20000000">Trên 6 triệu</option>
                </select>
              </label>
            </div>
            <button className="button hero-search-button" type="submit">
              <Search size={19} />
              Tìm phòng phù hợp
              <ArrowRight size={19} />
            </button>
          </form>
          <div className="hero-bottom">
            <p>
              <Check size={15} />
              Xem chi phí trước khi thuê
            </p>
            <a href="#phong-noi-bat" className="plain-link">
              Khám phá các căn phòng
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
        <div className="hero-photo-panel">
          <div className="hero-photograph">
            {!heroRooms.length && <RoomPhoto alt="Chưa có ảnh phòng" />}
            {heroRooms.map((room, index) => (
              <div
                className={`hero-slide ${activeIndex === index ? "active" : ""}`}
                key={room.id}
                aria-hidden={activeIndex !== index}
              >
                <RoomPhoto
                  photo={room.photo}
                  eager
                  alt={`Ảnh ${room.title.toLowerCase()}`}
                />
              </div>
            ))}
            <div className="hero-photo-label">
              <span>
                <MapPin size={14} />
                {activeRoom.id
                  ? `${activeRoom.district}, ${activeRoom.city}`
                  : "Chờ những căn phòng mới"}
              </span>
              <span>{activeRoom.id ? "Ảnh do chủ trọ cung cấp" : ""}</span>
            </div>
          </div>
          <div className="hero-photo-caption">
            <div>
              <span>
                {activeRoom.building}
                {activeRoom.area ? ` · ${activeRoom.area} m²` : ""}
              </span>
              <Link
                to={
                  activeRoom.id ? `/phong-tro/${activeRoom.id}` : "/tim-phong"
                }
              >
                {activeRoom.price
                  ? `${shortPrice(activeRoom.price)} triệu`
                  : "Tìm phòng mới"}{" "}
                <small>{activeRoom.price ? "/ tháng" : ""}</small>
                <ArrowUpRight size={19} />
              </Link>
            </div>
            <div className="photo-controls">
              <button
                onClick={() =>
                  setPhoto(
                    (activeIndex + heroRooms.length - 1) %
                      Math.max(heroRooms.length, 1),
                  )
                }
                aria-label="Xem căn phòng trước"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="photo-dots">
                {heroRooms.map((room, index) => (
                  <button
                    key={room.id}
                    onClick={() => setPhoto(index)}
                    className={index === activeIndex ? "active" : ""}
                    aria-label={`Xem ảnh ${room.building}`}
                    aria-pressed={index === activeIndex}
                  />
                ))}
              </div>
              <button
                onClick={() =>
                  setPhoto((activeIndex + 1) % Math.max(heroRooms.length, 1))
                }
                aria-label="Xem căn phòng tiếp theo"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="featured-section section-space" id="phong-noi-bat">
        <div className="section-heading" data-reveal>
          <div>
            <h2>Chốn riêng đang chờ</h2>
            <p>Một vài căn phòng để bắt đầu câu chuyện ở mới.</p>
          </div>
          <ArrowLink to={`/tim-phong?city=${encodeURIComponent(city)}`}>
            Xem tất cả phòng
          </ArrowLink>
        </div>
        <div className="room-tabs" role="group" aria-label="Loại phòng nổi bật">
          {["Tất cả", "Phòng trọ", "Studio", "Căn hộ mini"].map((value) => (
            <button
              className={type === value ? "active" : ""}
              key={value}
              onClick={() => setType(value)}
              aria-pressed={type === value}
            >
              {value}
            </button>
          ))}
          <span>
            <SlidersHorizontal size={15} />
            {featured.length} phòng tại{" "}
            {city === "TP. Hồ Chí Minh" ? "TP.HCM" : city}
          </span>
        </div>
        <div className="featured-collection" data-ui>
          {!featured.length && (
            <EmptyState
              title="Căn phòng mới đang được cập nhật"
              message="Thử đổi thành phố hoặc chọn loại phòng khác."
            />
          )}
          {featured.slice(0, 4).map((room, index) => (
            <div
              key={room.id}
              className={index === 0 ? "featured-main" : "featured-side"}
              data-reveal
            >
              <RoomCard room={room} compact={index > 0} />
            </div>
          ))}
        </div>
      </section>
      <div data-reveal>
        <CostCalculator />
      </div>
      <section className="landlord-callout section-space" data-reveal>
        <div>
          <h2>Nhà có phòng trống?</h2>
          <p>
            Đưa căn phòng đến người cần. Giữ chuyện quản lý nhà, hợp đồng và
            tiền thuê ở cùng một nơi.
          </p>
          <Link to="/chu-tro/tin-dang" className="button button-dark">
            Dành cho chủ trọ
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="owner-preview" data-ui>
          <div className="owner-preview-head">
            <span>Không gian chủ trọ</span>
          </div>
          <p>
            Quản lý nhà trọ, phòng, hợp đồng và các khoản thu bằng tài khoản của
            bạn.
          </p>
          <Link to="/dang-ky" className="button button-soft">
            Tạo tài khoản chủ trọ <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="faq-section section-space" id="cau-hoi">
        <div className="faq-image" data-reveal>
          <RoomPhoto
            photo={rooms[0]?.photo}
            alt={rooms[0]?.title || "Ảnh phòng"}
          />
          <p>
            Chọn nơi ở.
            <br />
            Chọn nhịp sống của mình.
          </p>
        </div>
        <div className="faq-content" data-reveal>
          <h2>Trước khi chuyển nhà</h2>
          <p>Những điều bạn có thể muốn biết.</p>
          <div className="faq-list">
            {faq.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary>
                  {question}
                  <Plus size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
          <Link className="plain-link" to="/tim-phong">
            Bắt đầu tìm căn phòng của mình
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <div className="home-closing">
        <p>Thành phố rộng. Vẫn có một chỗ dành cho mình.</p>
        <Link to="/tim-phong" className="button">
          Tìm phòng phù hợp
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
