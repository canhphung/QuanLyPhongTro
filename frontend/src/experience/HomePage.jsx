import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  Check,
  Plus,
  Sparkles,
  Building2,
  Home,
  ShieldCheck,
  Clock,
  Coins,
  Compass,
  FileCheck,
  Zap,
  Droplets,
  Wifi,
  Award,
  CalendarDays,
  DoorOpen,
} from "lucide-react";
import { useAppData } from "./context";
import { RoomPhoto, RoomCard, ArrowLink } from "./ui";
import { money, shortPrice } from "./data";

const faq = [
  [
    "Tôi nên bắt đầu tìm phòng trọ từ đâu?",
    "Bạn có thể chọn Thành phố, Quận/huyện mong muốn và mức ngân sách dự kiến ngay tại thanh tìm kiếm. Hệ thống sẽ lọc ra các phòng còn trống, có đầy đủ hình ảnh, đơn giá điện nước và thông tin liên hệ của chủ trọ.",
  ],
  [
    "Làm thế nào để hẹn lịch xem phòng trực tiếp?",
    "Tại trang chi tiết của mỗi căn phòng, bạn bấm 'Đặt lịch xem', chọn ngày giờ mong muốn và để lại lời nhắn. Yêu cầu sẽ được gửi tức thì đến chủ nhà và bạn có thể theo dõi phản hồi trong mục 'Yêu cầu của tôi'.",
  ],
  [
    "Chi phí mỗi tháng khi ở phòng trọ gồm những khoản nào?",
    "Ngoài tiền thuê phòng cố định, các khoản chi phí hàng tháng thường gồm tiền điện, nước (theo chỉ số công tơ), phí Internet/Wifi, tiền thu gom rác và phí giữ xe (nếu có). Công cụ ước tính trên trang giúp bạn dự toán tổng số tiền trước khi thuê.",
  ],
  [
    "Hợp đồng thuê phòng và hóa đơn được quản lý như thế nào?",
    "Sau khi ký hợp đồng và nhận mã liên kết từ chủ trọ, tài khoản của bạn sẽ hiển thị đầy đủ hợp đồng điện tử, danh sách thành viên ở cùng, cùng từng hóa đơn chi tiết hàng tháng và lịch sử thanh toán minh bạch.",
  ],
  [
    "Tôi là chủ nhà trọ, muốn đăng tin cho thuê thì làm thế nào?",
    "Bạn chỉ cần chọn 'Đăng ký tài khoản Chủ trọ' hoặc truy cập 'Dành cho chủ trọ'. Hệ thống cung cấp bảng điều khiển chuyên nghiệp giúp bạn quản lý tòa nhà, phòng, người thuê, lập hóa đơn tự động và đăng tin tìm khách thuê.",
  ],
];

// Helper function to extract and deduplicate relevant utility fees for a room
function getRelevantFees(room) {
  const fees = room.fees || [];
  const bldg = (room.building || "").toLowerCase();

  // Categorize available fees from landlord
  const electricFees = fees.filter((f) => /điện/i.test(f.name));
  const waterFees = fees.filter((f) => /nước/i.test(f.name));
  const wifiFees = fees.filter((f) => /internet|wifi|mạng/i.test(f.name));
  const otherFees = fees.filter((f) => !/điện|nước|internet|wifi|mạng/i.test(f.name));

  const result = [];

  // 1. Electricity: pick the one matching room's building or first
  if (electricFees.length) {
    const match = electricFees.find((f) => f.name.toLowerCase().includes(bldg)) || electricFees[0];
    result.push({
      ...match,
      cleanName: "Tiền điện sinh hoạt",
      type: "electric",
      defaultQty: 80,
    });
  } else {
    result.push({
      id: "def-dien",
      name: "Điện sinh hoạt",
      cleanName: "Tiền điện sinh hoạt",
      unit: "kWh",
      price: 3500,
      type: "electric",
      defaultQty: 80,
    });
  }

  // 2. Water
  if (waterFees.length) {
    const match = waterFees.find((f) => f.name.toLowerCase().includes(bldg)) || waterFees[0];
    result.push({
      ...match,
      cleanName: "Tiền nước sinh hoạt",
      type: "water",
      defaultQty: 4,
    });
  } else {
    result.push({
      id: "def-nuoc",
      name: "Nước sinh hoạt",
      cleanName: "Tiền nước sinh hoạt",
      unit: "m³",
      price: 15000,
      type: "water",
      defaultQty: 4,
    });
  }

  // 3. Internet / Wifi
  if (wifiFees.length) {
    const match = wifiFees.find((f) => f.name.toLowerCase().includes(bldg)) || wifiFees[0];
    result.push({
      ...match,
      cleanName: "Internet / Wifi tốc độ cao",
      type: "wifi",
      defaultQty: 1,
    });
  } else {
    result.push({
      id: "def-wifi",
      name: "Internet / Wifi",
      cleanName: "Internet / Wifi tốc độ cao",
      unit: "tháng",
      price: 100000,
      type: "wifi",
      defaultQty: 1,
    });
  }

  // 4. Other services (Trash, Parking, etc.) - at most 1
  if (otherFees.length) {
    const match = otherFees.find((f) => f.name.toLowerCase().includes(bldg)) || otherFees[0];
    result.push({
      ...match,
      cleanName: match.name.split(/[–-]/)[0].trim() || match.name,
      type: "service",
      defaultQty: 1,
    });
  }

  return result;
}

function CostCalculator() {
  const { publicRooms: rooms } = useAppData();
  const [roomId, setRoomId] = useState("");
  const [usage, setUsage] = useState({});
  const [roommates, setRoommates] = useState(2);

  const room = rooms.find((x) => x.id === Number(roomId)) || rooms[0];
  if (!room) return null;

  const displayFees = getRelevantFees(room);

  // Compute total monthly estimate
  const servicesTotal = displayFees.reduce((sum, f) => {
    const qty = usage[f.id] !== undefined ? usage[f.id] : f.defaultQty;
    return sum + Number(f.price) * Number(qty || 0);
  }, 0);

  const total = Number(room.price) + servicesTotal;
  const rentPercentage = Math.round((Number(room.price) / (total || 1)) * 100);

  return (
    <section className="calculator-section-modern" id="chi-phi">
      <div className="client-container">
        <div className="calc-modern-grid">
          {/* Left Column: Story, Room Select & Selected Room Card */}
          <div className="calc-story-card">
            <span className="section-tag-modern">Dự toán thông minh</span>
            <h2>
              Chi phí minh bạch.<br />Không lo phát sinh.
            </h2>
            <p>
              Chủ động ước tính tiền phòng và các chi phí điện, nước, internet hàng tháng
              theo đơn giá niêm yết của chủ trọ trước khi quyết định thuê.
            </p>

            {/* Room Selector Dropdown */}
            <div className="calc-room-selector">
              <label>Căn phòng bạn đang cân nhắc</label>
              <select
                className="calc-room-select"
                value={room.id}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setUsage({});
                }}
              >
                {rooms.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.title} · {x.building || "Nhà trọ"} ({shortPrice(x.price)} triệu/tháng)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Room Preview Card */}
            <div className="calc-room-preview-card">
              <div className="calc-room-thumb">
                <RoomPhoto photo={room.photo} alt={room.title} />
              </div>
              <div className="calc-room-info">
                <h4>{room.title}</h4>
                <p className="calc-room-addr">
                  <MapPin size={13} color="#2563EB" />
                  <span>{room.address || `${room.district}, ${room.city}`}</span>
                </p>
                <div className="calc-room-meta">
                  <span>{room.area} m²</span>
                  <span>•</span>
                  <span>{room.type || "Phòng trọ"}</span>
                  <span>•</span>
                  <strong className="calc-room-price">{shortPrice(room.price)} tr/tháng</strong>
                </div>
              </div>
            </div>

            {/* Cost Ratio Visualization Bar */}
            <div className="calc-ratio-box">
              <div className="calc-ratio-labels">
                <span>Tiền phòng: {money(room.price)} ({rentPercentage}%)</span>
                <span style={{ color: "#D97706" }}>Dịch vụ: {money(servicesTotal)} ({100 - rentPercentage}%)</span>
              </div>
              <div className="calc-ratio-bar">
                <div className="calc-ratio-rent" style={{ width: `${rentPercentage}%` }} />
                <div className="calc-ratio-services" style={{ width: `${100 - rentPercentage}%` }} />
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Utility Inputs & Total Card */}
          <div className="calc-interactive-card">
            <div className="calc-card-head">
              <h3>Ước lượng số lượng sử dụng tháng</h3>
              <span className="calc-badge-unit">Đơn giá niêm yết</span>
            </div>

            {/* Service Input Cards */}
            <div className="calc-services-list">
              {displayFees.map((f) => {
                const currentQty = usage[f.id] !== undefined ? usage[f.id] : f.defaultQty;
                return (
                  <div key={f.id} className="calc-service-item">
                    <div className="calc-service-info">
                      <div className={`calc-service-icon ${f.type || "service"}`}>
                        {f.type === "electric" && <Zap size={22} />}
                        {f.type === "water" && <Droplets size={22} />}
                        {f.type === "wifi" && <Wifi size={22} />}
                        {f.type === "service" && <Sparkles size={22} />}
                      </div>
                      <div>
                        <strong>{f.cleanName}</strong>
                        <span>{money(f.price)} / {f.unit}</span>
                      </div>
                    </div>

                    <div className="calc-service-control">
                      <input
                        aria-label={`Số lượng ${f.cleanName}`}
                        type="number"
                        min="0"
                        step="1"
                        value={currentQty}
                        onChange={(e) =>
                          setUsage({
                            ...usage,
                            [f.id]: Math.max(0, Number(e.target.value)),
                          })
                        }
                      />
                      <span className="calc-unit-text">{f.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Summary Box */}
            <div className="calc-total-box">
              <div className="calc-total-details">
                <div>
                  <span>Tiền thuê phòng:</span>
                  <strong>{money(room.price)}</strong>
                </div>
                {displayFees.map((f) => {
                  const qty = usage[f.id] !== undefined ? usage[f.id] : f.defaultQty;
                  return (
                    <div key={f.id}>
                      <span>{f.cleanName} ({qty} {f.unit}):</span>
                      <span>{money(Number(f.price) * (qty || 0))}</span>
                    </div>
                  );
                })}
              </div>

              <div className="calc-total-footer">
                <div>
                  <span className="calc-total-label">Tổng chi phí dự tính / tháng</span>
                  <div className="calc-total-amount">{money(total)}</div>
                </div>

                <Link to={`/phong-tro/${room.id}`} className="btn-search-hero">
                  Xem phòng này <ArrowUpRight size={17} />
                </Link>
              </div>

              {/* Per-person split row */}
              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px dashed #CBD5E1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12.5px", color: "#64748B", fontWeight: 500 }}>Chia tiền theo người:</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRoommates(num)}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "8px",
                          border: roommates === num ? "1.5px solid #2563EB" : "1px solid #CBD5E1",
                          background: roommates === num ? "#EFF6FF" : "#FFFFFF",
                          color: roommates === num ? "#2563EB" : "#475569",
                          fontWeight: 700,
                          fontSize: "12.5px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "13.5px",
                    color: "#1E40AF",
                    fontWeight: 700,
                    background: "#EFF6FF",
                    padding: "6px 12px",
                    borderRadius: "10px",
                    border: "1px solid #BFDBFE",
                  }}
                >
                  Khoảng <strong>{money(Math.round(total / roommates))}</strong> / người
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { publicRooms: rooms, user } = useAppData();
  const navigate = useNavigate();

  // Search filter states
  const [chosenCity, setCity] = useState("Toàn quốc");
  const city = chosenCity || "Toàn quốc";
  const [district, setDistrict] = useState("");
  const [budget, setBudget] = useState("");
  const [type, setType] = useState("Tất cả");
  const [occupants, setOccupants] = useState("");
  const keyword = "";

  // Hero carousel photo state
  const [photo, setPhoto] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  const heroRooms = rooms
    .filter((x) => x.available && x.published !== false)
    .slice(0, 5);

  const activeIndex = heroRooms.length ? photo % heroRooms.length : 0;
  const activeRoom = heroRooms[activeIndex] || {
    id: null,
    title: "Phòng trọ cao cấp, tiện nghi",
    building: "Nhà trọ cao cấp",
    area: 25,
    price: 3500000,
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
  };

  const availableCities = [...new Set(rooms.map((room) => room.city))].filter(Boolean).sort(
    (a, b) => a.localeCompare(b, "vi"),
  );

  const districts = [
    ...new Set(
      rooms
        .filter((room) => city === "Toàn quốc" || room.city === city)
        .map((room) => room.district)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "vi"));

  // Carousel autoplay timer
  useEffect(() => {
    if (heroRooms.length < 2 || carouselPaused) return undefined;
    const timer = window.setInterval(
      () => setPhoto((curr) => (curr + 1) % heroRooms.length),
      5500,
    );
    return () => window.clearInterval(timer);
  }, [carouselPaused, heroRooms.length]);

  function searchPath() {
    const params = new URLSearchParams();
    if (city !== "Toàn quốc") params.set("city", city);
    if (district) params.set("district", district);
    if (budget) params.set("budget", budget);
    if (type !== "Tất cả") params.set("type", type);
    if (keyword.trim()) params.set("q", keyword.trim());
    return `/tim-phong${params.size ? `?${params}` : ""}`;
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    navigate(searchPath());
  }

  // Filtered featured rooms
  const featuredRooms = rooms
    .filter((room) => room.available && room.published !== false)
    .sort((a, b) => b.id - a.id)
    .slice(0, 8);

  // Newest listings
  const newestRooms = [...rooms]
    .sort((a, b) => b.id - a.id)
    .slice(0, 6);

  // Categories with live room count calculation
  const categories = [
    {
      title: "Phòng trọ giá rẻ",
      desc: "Dưới 3 triệu/tháng, tiết kiệm tối đa",
      tag: "Tiết kiệm",
      icon: Coins,
      filter: "budget=0-3000000",
      count: rooms.filter((r) => r.price <= 3000000).length,
    },
    {
      title: "Căn hộ mini",
      desc: "Không gian riêng tư, bếp và WC khép kín",
      tag: "Tiện nghi",
      icon: Building2,
      filter: "type=Căn+hộ+mini",
      count: rooms.filter((r) => r.type === "Căn hộ mini").length,
    },
    {
      title: "Studio cao cấp",
      desc: "Thiết kế hiện đại, đầy đủ nội thất sang",
      tag: "Cao cấp",
      icon: Sparkles,
      filter: "type=Studio",
      count: rooms.filter((r) => r.type === "Studio").length,
    },
    {
      title: "Phòng có nội thất",
      desc: "Giường nệm, tủ quần áo, máy lạnh sẵn sàng",
      tag: "Ở ngay",
      icon: Home,
      filter: "amenity=Nội+thất",
      count: rooms.filter((r) => r.amenities?.includes("Nội thất")).length,
    },
    {
      title: "Gần trường đại học",
      desc: "Thuận tiện di chuyển, an ninh tốt",
      tag: "Sinh viên",
      icon: Award,
      filter: "q=Đại+học",
      count: rooms.filter((r) => (r.description || "").toLowerCase().includes("học") || (r.title || "").toLowerCase().includes("sinh viên")).length || rooms.length,
    },
    {
      title: "Phòng có ban công",
      desc: "Không gian thoáng đãng, nhiều ánh sáng tự nhiên",
      tag: "Thoáng mát",
      icon: DoorOpen,
      filter: "amenity=Ban+công",
      count: rooms.filter((r) => r.amenities?.includes("Ban công")).length,
    },
    {
      title: "Phòng có máy lạnh",
      desc: "Mát mẻ ngày hè, điều hòa hoạt động tốt",
      tag: "Mát mẻ",
      icon: Zap,
      filter: "amenity=Máy+lạnh",
      count: rooms.filter((r) => r.amenities?.includes("Máy lạnh")).length,
    },
    {
      title: "Phòng tự do giờ giấc",
      desc: "Không chung chủ, khóa vân tay an toàn",
      tag: "Tự do",
      icon: Clock,
      filter: "amenity=Tự+do+giờ+giấc",
      count: rooms.filter((r) => r.amenities?.includes("Tự do giờ giấc")).length || Math.min(rooms.length, 12),
    },
  ];

  // Popular areas data
  const popularAreas = [
    {
      name: "TP. Hồ Chí Minh",
      count: rooms.filter((r) => r.city?.includes("Hồ Chí Minh") || r.city?.includes("TP.HCM")).length || 24,
      image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Hà Nội",
      count: rooms.filter((r) => r.city?.includes("Hà Nội")).length || 18,
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Đà Nẵng",
      count: rooms.filter((r) => r.city?.includes("Đà Nẵng")).length || 9,
      image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Bình Dương",
      count: rooms.filter((r) => r.city?.includes("Bình Dương")).length || 12,
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Đồng Nai",
      count: rooms.filter((r) => r.city?.includes("Đồng Nai")).length || 8,
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <div className="home-page-client">
      {/* ==================== 1. HERO SECTION ==================== */}
      <section className="hero-realestate">
        <div className="hero-realestate-backdrop" />
        <div className="client-container">
          <div className="hero-layout-grid">
            {/* Left Copy & Search */}
            <div>
              <div className="hero-badge-pill">
                <Sparkles size={16} />
                <span>Nền tảng tìm kiếm phòng trọ thế hệ mới</span>
              </div>

              <h1 className="hero-headline">
                Tìm phòng trọ lý tưởng,<br />
                <span className="text-gradient">an tâm cuộc sống.</span>
              </h1>

              <p className="hero-subhead">
                Khám phá hàng trăm phòng trọ chất lượng, giá hợp lý, minh bạch đơn giá điện nước
                và vị trí thuận tiện nhất.
              </p>

              {/* Modern Search Box */}
              <form className="hero-search-box" onSubmit={handleSearchSubmit}>
                {/* City selection tabs */}
                <div className="search-tab-bar" role="group" aria-label="Chọn thành phố">
                  {["Toàn quốc", "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", ...availableCities.filter((c) => !["Toàn quốc", "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng"].includes(c))].slice(0, 5).map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={`search-tab-btn ${city === value ? "active" : ""}`}
                      onClick={() => {
                        setCity(value);
                        setDistrict("");
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                {/* 4 Search fields */}
                <div className="search-fields-grid">
                  <div className="search-field-unit">
                    <span className="search-field-label">
                      <MapPin size={14} color="#2563EB" /> Khu vực
                    </span>
                    <select
                      className="search-field-select"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      <option value="">Tất cả quận / huyện</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="search-field-unit">
                    <span className="search-field-label">Khoảng giá</span>
                    <select
                      className="search-field-select"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    >
                      <option value="">Tất cả mức giá</option>
                      <option value="0-3000000">Dưới 3 triệu</option>
                      <option value="3000000-5000000">3 – 5 triệu</option>
                      <option value="5000000-8000000">5 – 8 triệu</option>
                      <option value="8000000-20000000">Trên 8 triệu</option>
                    </select>
                  </div>

                  <div className="search-field-unit">
                    <span className="search-field-label">Loại phòng</span>
                    <select
                      className="search-field-select"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      {["Tất cả", "Phòng trọ", "Studio", "Căn hộ mini"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="search-field-unit">
                    <span className="search-field-label">Số người ở</span>
                    <select
                      className="search-field-select"
                      value={occupants}
                      onChange={(e) => setOccupants(e.target.value)}
                    >
                      <option value="">Mọi nhu cầu</option>
                      <option value="1">1 người (ở riêng)</option>
                      <option value="2">2 người (ở đôi)</option>
                      <option value="3+">3–4 người (ở ghép)</option>
                    </select>
                  </div>
                </div>

                {/* Bottom Row with Quick Tags & Submit */}
                <div className="search-submit-row">
                  <div className="search-quick-tags">
                    <span>Gợi ý:</span>
                    <button type="button" className="search-tag-chip" onClick={() => setBudget("0-3000000")}>
                      Giá dưới 3tr
                    </button>
                    <button type="button" className="search-tag-chip" onClick={() => setType("Căn hộ mini")}>
                      Căn hộ mini
                    </button>
                    <button type="button" className="search-tag-chip" onClick={() => setType("Studio")}>
                      Studio
                    </button>
                  </div>

                  <button type="submit" className="btn-search-hero">
                    <Search size={18} />
                    Tìm kiếm ngay
                  </button>
                </div>
              </form>

              {/* Quick Trust points */}
              <div style={{ display: "flex", gap: "24px", marginTop: "24px", color: "#64748B", fontSize: "13.5px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Check size={16} color="#10B981" /> 100% hình ảnh thực tế
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Check size={16} color="#10B981" /> Không mất phí môi giới
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Check size={16} color="#10B981" /> Hẹn xem phòng tức thì
                </span>
              </div>
            </div>

            {/* Right Visual Card */}
            <div
              className="hero-visual-card"
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}
            >
              <RoomPhoto photo={activeRoom.photo} alt={activeRoom.title} className="hero-visual-image" />
              <div className="hero-visual-overlay">
                <div className="hero-visual-top">
                  <span className="hero-badge-available">
                    <ShieldCheck size={14} /> Còn phòng trống
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="pagination-btn"
                      style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.8)" }}
                      onClick={() => setPhoto((photo - 1 + heroRooms.length) % heroRooms.length)}
                      aria-label="Xem phòng trước"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      className="pagination-btn"
                      style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.8)" }}
                      onClick={() => setPhoto((photo + 1) % heroRooms.length)}
                      aria-label="Xem phòng sau"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="hero-visual-bottom">
                  <h3>{activeRoom.title}</h3>
                  <p>
                    <MapPin size={15} color="#60A5FA" />
                    {activeRoom.district}, {activeRoom.city}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="hero-visual-price">
                      {shortPrice(activeRoom.price)} triệu <small>/ tháng</small>
                    </div>
                    {activeRoom.id && (
                      <Link
                        to={`/phong-tro/${activeRoom.id}`}
                        className="btn-header-register"
                        style={{ padding: "8px 16px", fontSize: "13px" }}
                      >
                        Xem chi tiết <ArrowUpRight size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating stats card */}
              <div className="hero-floating-stat">
                <div className="stat-icon-wrap">
                  <Building2 size={20} />
                </div>
                <div className="stat-text-wrap">
                  <strong>{rooms.length}+</strong>
                  <span>Phòng đang cho thuê</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. CATEGORIES SECTION ==================== */}
      <section className="categories-section">
        <div className="client-container">
          <div className="section-head-modern">
            <span className="section-tag-modern">Khám phá theo nhu cầu</span>
            <h2>Danh mục phòng trọ nổi bật</h2>
            <p>Lựa chọn không gian sống phù hợp với phong cách và khả năng tài chính của bạn</p>
          </div>

          <div className="category-cards-grid">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.title}
                  to={`/tim-phong?${cat.filter}`}
                  className="category-card-item"
                >
                  <div className="cat-icon-box">
                    <Icon size={26} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3>{cat.title}</h3>
                    <p>{cat.desc}</p>
                  </div>
                  <div className="cat-badge-count">
                    <span>{cat.count} phòng phù hợp</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== 3. FEATURED PROPERTIES ==================== */}
      <section className="section-space" id="phong-noi-bat" style={{ padding: "64px 0", background: "#FFFFFF" }}>
        <div className="client-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="section-tag-modern">Được yêu thích nhất</span>
              <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0F172A", marginTop: "8px" }}>
                Phòng trọ nổi bật hôm nay
              </h2>
              <p style={{ fontSize: "16px", color: "#64748B", marginTop: "6px" }}>
                Những căn phòng chất lượng cao, vị trí đẹp và được khách thuê đánh giá cao
              </p>
            </div>
            <ArrowLink to="/tim-phong">
              Xem tất cả ({rooms.length}) phòng
            </ArrowLink>
          </div>

          <div className="results-cards-grid">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 4. NEWEST LISTINGS ==================== */}
      <section className="section-space" style={{ padding: "64px 0", background: "#F8FAFC" }}>
        <div className="client-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="section-tag-modern" style={{ background: "#FEF3C7", color: "#D97706" }}>
                Vừa cập nhật
              </span>
              <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0F172A", marginTop: "8px" }}>
                Phòng trọ mới đăng
              </h2>
              <p style={{ fontSize: "16px", color: "#64748B", marginTop: "6px" }}>
                Tin đăng mới nhất được duyệt trực tiếp từ các chủ trọ uy tín
              </p>
            </div>
            <Link to="/tim-phong?sort=newest" className="btn-header-login" style={{ gap: "8px" }}>
              Xem thêm tin mới <ArrowRight size={16} />
            </Link>
          </div>

          <div className="results-cards-grid">
            {newestRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 5. POPULAR AREAS ==================== */}
      <section className="popular-areas-section" id="khu-vuc-pho-bien">
        <div className="client-container">
          <div className="section-head-modern">
            <span className="section-tag-modern">Địa điểm hấp dẫn</span>
            <h2>Khu vực tìm phòng phổ biến</h2>
            <p>Khám phá các thành phố sôi động với số lượng phòng dồi dào và tiện ích xung quanh</p>
          </div>

          <div className="areas-grid-layout">
            {popularAreas.map((area) => (
              <Link
                key={area.name}
                to={`/tim-phong?city=${encodeURIComponent(area.name)}`}
                className="area-tile-card"
              >
                <img src={area.image} alt={area.name} loading="lazy" />
                <div className="area-tile-overlay">
                  <h3>{area.name}</h3>
                  <span>
                    <Building2 size={15} /> {area.count} phòng cho thuê
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 6. WHY CHOOSE US ==================== */}
      <section className="why-choose-section">
        <div className="client-container">
          <div className="section-head-modern">
            <span className="section-tag-modern">Cam kết chất lượng</span>
            <h2>Vì sao nên chọn Phòng Mình?</h2>
            <p>Chúng tôi mang lại giải pháp tìm kiếm và thuê nhà minh bạch, an toàn và tiện lợi</p>
          </div>

          <div className="benefits-cards-grid">
            <div className="benefit-card-modern">
              <div className="benefit-icon-ring">
                <ShieldCheck size={28} />
              </div>
              <h3>Thông tin phòng minh bạch</h3>
              <p>
                100% hình ảnh thực tế, bảng giá tiền phòng, điện nước và dịch vụ được niêm yết rõ ràng, không phụ phí ẩn.
              </p>
            </div>

            <div className="benefit-card-modern">
              <div className="benefit-icon-ring">
                <Compass size={28} />
              </div>
              <h3>Tìm kiếm nhanh chóng</h3>
              <p>
                Bộ lọc chi tiết theo từng quận, khoảng giá, diện tích và tiện nghi giúp bạn chọn được căn phòng ưng ý chỉ trong vài phút.
              </p>
            </div>

            <div className="benefit-card-modern">
              <div className="benefit-icon-ring">
                <CalendarDays size={28} />
              </div>
              <h3>Hẹn xem phòng dễ dàng</h3>
              <p>
                Đặt lịch xem phòng trực tiếp với chủ trọ hoàn toàn trực tuyến, nhận xác nhận qua tài khoản và tin nhắn nhanh chóng.
              </p>
            </div>

            <div className="benefit-card-modern">
              <div className="benefit-icon-ring">
                <FileCheck size={28} />
              </div>
              <h3>Quản lý hợp đồng & hóa đơn</h3>
              <p>
                Khách thuê có bảng điều khiển riêng để theo dõi hợp đồng, xem chi tiết hóa đơn điện nước và lịch sử thanh toán mỗi tháng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 7. COST CALCULATOR ==================== */}
      <CostCalculator />

      {/* ==================== 8. RENTAL PROCESS ==================== */}
      <section className="section-space" id="huong-dan-thue" style={{ padding: "64px 0", background: "#FFFFFF" }}>
        <div className="client-container">
          <div className="section-head-modern">
            <span className="section-tag-modern">Quy trình đơn giản</span>
            <h2>4 Bước tìm và thuê phòng dễ dàng</h2>
            <p>Trải nghiệm thuê nhà văn minh và nhanh gọn cùng Phòng Mình</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginTop: "32px" }}>
            <div style={{ background: "#F8FAFC", padding: "28px 20px", borderRadius: "20px", border: "1px solid #E2E8F0", textAlign: "center" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#2563EB", color: "#FFFFFF", fontWeight: 800, fontSize: "18px", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                1
              </div>
              <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>Tìm & Lọc phòng</h4>
              <p style={{ fontSize: "13.5px", color: "#64748B", lineHeight: "1.5" }}>
                Chọn khu vực, mức giá và các tiện nghi mong muốn trên trang tìm kiếm.
              </p>
            </div>

            <div style={{ background: "#F8FAFC", padding: "28px 20px", borderRadius: "20px", border: "1px solid #E2E8F0", textAlign: "center" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#2563EB", color: "#FFFFFF", fontWeight: 800, fontSize: "18px", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                2
              </div>
              <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>Hẹn lịch xem phòng</h4>
              <p style={{ fontSize: "13.5px", color: "#64748B", lineHeight: "1.5" }}>
                Gửi yêu cầu hẹn giờ xem thực tế để kiểm tra không gian và trao đổi cùng chủ nhà.
              </p>
            </div>

            <div style={{ background: "#F8FAFC", padding: "28px 20px", borderRadius: "20px", border: "1px solid #E2E8F0", textAlign: "center" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#2563EB", color: "#FFFFFF", fontWeight: 800, fontSize: "18px", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                3
              </div>
              <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>Ký kết hợp đồng</h4>
              <p style={{ fontSize: "13.5px", color: "#64748B", lineHeight: "1.5" }}>
                Thống nhất điều khoản thuê, tiền cọc và nhận mã liên kết hồ sơ người thuê.
              </p>
            </div>

            <div style={{ background: "#F8FAFC", padding: "28px 20px", borderRadius: "20px", border: "1px solid #E2E8F0", textAlign: "center" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#10B981", color: "#FFFFFF", fontWeight: 800, fontSize: "18px", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
                4
              </div>
              <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>Nhận phòng & Ở an tâm</h4>
              <p style={{ fontSize: "13.5px", color: "#64748B", lineHeight: "1.5" }}>
                Dọn vào ở, quản lý hóa đơn tiền phòng và báo hỏng thiết bị online tiện lợi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 9. LANDLORD CTA ==================== */}
      <section style={{ padding: "64px 0", background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", color: "#FFFFFF" }}>
        <div className="client-container">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "40px", alignItems: "center" }}>
            <div>
              <span className="section-tag-modern" style={{ background: "rgba(37,99,235,0.2)", color: "#60A5FA" }}>
                Dành cho chủ nhà
              </span>
              <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#FFFFFF", marginTop: "12px", marginBottom: "16px" }}>
                Bạn có phòng trọ hoặc căn hộ trống cần cho thuê?
              </h2>
              <p style={{ fontSize: "16px", color: "#94A3B8", lineHeight: "1.6", marginBottom: "28px", maxWidth: "540px" }}>
                Tiếp cận hàng nghìn khách thuê tiềm năng mỗi ngày. Hệ thống hỗ trợ quản lý phòng, hợp đồng, lập hóa đơn tự động và ghi nhận thanh toán chuyên nghiệp.
              </p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link
                  to={user?.role === "owner" ? "/chu-tro/tong-quan" : "/dang-ky?role=owner"}
                  className="btn-header-register"
                  style={{ padding: "14px 28px", fontSize: "15px" }}
                >
                  {user?.role === "owner" ? "Vào bảng điều khiển chủ trọ" : "Đăng tin cho thuê ngay"}
                  <ArrowUpRight size={18} />
                </Link>
                <Link
                  to="/tim-phong"
                  className="btn-header-login"
                  style={{ background: "transparent", color: "#FFFFFF", borderColor: "#334155" }}
                >
                  Khám phá thêm phòng
                </Link>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "24px", padding: "32px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#FFFFFF", marginBottom: "16px" }}>
                Lợi ích khi đăng tin trên Phòng Mình:
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", color: "#CBD5E1", fontSize: "14px" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={18} color="#10B981" /> Đăng tin nhanh gọn trong 2 phút
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={18} color="#10B981" /> Tiếp cận khách thuê chuẩn mực, đã xác minh
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={18} color="#10B981" /> Tự động hóa hóa đơn điện nước & nhắc tiền
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={18} color="#10B981" /> Quản lý hợp đồng và số phòng trống tức thì
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 10. FAQ SECTION ==================== */}
      <section className="faq-section section-space" id="cau-hoi" style={{ padding: "64px 0" }}>
        <div className="client-container">
          <div className="section-head-modern">
            <span className="section-tag-modern">Giải đáp thắc mắc</span>
            <h2>Những điều bạn cần biết trước khi thuê</h2>
            <p>Tổng hợp các câu hỏi phổ biến của khách thuê phòng trọ</p>
          </div>

          <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "14px" }}>
            {faq.map(([question, answer], index) => (
              <details
                key={question}
                open={index === 0}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  cursor: "pointer",
                }}
              >
                <summary style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {question}
                  <Plus size={18} color="#2563EB" />
                </summary>
                <p style={{ marginTop: "14px", fontSize: "14.5px", color: "#64748B", lineHeight: "1.6" }}>
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
