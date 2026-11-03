import { useEffect, useRef, useState } from "react";
import { Locate, Layers, AlertCircle, RefreshCw, X } from "lucide-react";
import { money, shortPrice } from "./data";

// Deterministic district coordinates for VN cities
const DISTRICT_COORDS = {
  // TP. Hồ Chí Minh
  "Quận 1": [10.7769, 106.7009],
  "Quận 3": [10.7844, 106.6843],
  "Quận 4": [10.7578, 106.7013],
  "Quận 5": [10.7540, 106.6634],
  "Quận 6": [10.7481, 106.6352],
  "Quận 7": [10.7340, 106.7218],
  "Quận 8": [10.7241, 106.6286],
  "Quận 10": [10.7672, 106.6667],
  "Quận 11": [10.7629, 106.6502],
  "Quận 12": [10.8672, 106.6413],
  "Bình Thạnh": [10.8031, 106.7099],
  "Thủ Đức": [10.8530, 106.7570],
  "Tân Bình": [10.7992, 106.6531],
  "Tân Phú": [10.7900, 106.6280],
  "Gò Vấp": [10.8387, 106.6653],
  "Phú Nhuận": [10.7997, 106.6803],
  "Bình Tân": [10.7654, 106.6039],
  "Nhà Bè": [10.6953, 106.7289],
  "Hóc Môn": [10.8839, 106.5916],
  "Củ Chi": [11.0067, 106.4950],

  // Hà Nội
  "Cầu Giấy": [21.0362, 105.7906],
  "Đống Đa": [21.0181, 105.8234],
  "Hai Bà Trưng": [21.0069, 105.8574],
  "Hoàn Kiếm": [21.0285, 105.8542],
  "Thanh Xuân": [20.9937, 105.8122],
  "Nam Từ Liêm": [21.0135, 105.7602],
  "Bắc Từ Liêm": [21.0664, 105.7592],
  "Hà Đông": [20.9723, 105.7763],
  "Ba Đình": [21.0353, 105.8342],
  "Tây Hồ": [21.0710, 105.8234],
  "Hoàng Mai": [20.9754, 105.8642],
  "Long Biên": [21.0364, 105.8927],

  // Đà Nẵng
  "Hải Châu": [16.0678, 108.2208],
  "Thanh Khê": [16.0645, 108.1884],
  "Sơn Trà": [16.0898, 108.2443],
  "Ngũ Hành Sơn": [16.0125, 108.2520],
  "Liên Chiểu": [16.0792, 108.1498],
  "Cẩm Lệ": [16.0195, 108.1965],

  // Bình Dương
  "Thủ Dầu Một": [10.9805, 106.6519],
  "Dĩ An": [10.9069, 106.7722],
  "Thuận An": [10.9238, 106.6975],

  // Đồng Nai
  "Biên Hòa": [10.9574, 106.8427],
};

function getRoomCoords(room) {
  // Check if room has direct lat/lng
  if (room.lat && room.lng) {
    return [Number(room.lat), Number(room.lng)];
  }

  // Lookup district in coords map
  const districtKey = Object.keys(DISTRICT_COORDS).find((k) =>
    (room.district || "").toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes((room.district || "").toLowerCase())
  );

  let base = DISTRICT_COORDS[districtKey];
  if (!base) {
    // City default
    if ((room.city || "").includes("Hà Nội")) base = [21.0285, 105.8542];
    else if ((room.city || "").includes("Đà Nẵng")) base = [16.0544, 108.2022];
    else if ((room.city || "").includes("Bình Dương")) base = [10.9805, 106.6519];
    else base = [10.7769, 106.7009]; // TP.HCM default
  }

  // Deterministic slight offset for room so pins don't overlap exactly
  const idNum = Number(room.id) || 1;
  const latOffset = ((idNum * 17) % 31 - 15) * 0.0016;
  const lngOffset = ((idNum * 23) % 31 - 15) * 0.0016;

  return [base[0] + latOffset, base[1] + lngOffset];
}

export function RoomMap({
  rooms = [],
  activeRoomId = null,
  onSelectRoom = () => {},
  className = "",
  style = {},
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [geoStatus, setGeoStatus] = useState(""); // '' | 'loading' | 'denied' | 'success'
  const [geoErrorMsg, setGeoErrorMsg] = useState("");

  // Dynamically load Leaflet if not present
  useEffect(() => {
    if (window.L) {
      setMapReady(true);
      return;
    }

    // Inject CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    // Inject Script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.async = true;
    script.onload = () => {
      setMapReady(true);
    };
    script.onerror = () => {
      setGeoErrorMsg("Không thể tải thư viện bản đồ. Vui lòng kiểm tra kết nối mạng.");
    };
    document.body.appendChild(script);

    return () => {
      // Keep script cached
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapReady || !window.L || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const L = window.L;

    // Default center: TP.HCM
    const initialCoords = [10.7769, 106.7009];

    const map = L.map(mapContainerRef.current, {
      center: initialCoords,
      zoom: 12,
      zoomControl: false,
    });

    // Clean OpenStreetMap tiles with English / VN labels
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom Zoom controls
    L.control.zoom({ position: "bottomright" }).addTo(map);

    markersGroupRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapReady]);

  // Update Markers when rooms change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !window.L) return;
    const L = window.L;
    const group = markersGroupRef.current;
    group.clearLayers();

    if (rooms.length === 0) return;

    const bounds = L.latLngBounds([]);

    rooms.forEach((room) => {
      const coords = getRoomCoords(room);
      bounds.extend(coords);

      const isActive = room.id === activeRoomId;
      const priceText = `${shortPrice(room.price)} tr`;

      // Custom Airbnb-style HTML pin
      const icon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div class="map-price-pill ${isActive ? "is-selected" : ""}" data-room-id="${room.id}">
            <span>${priceText}</span>
          </div>
        `,
        iconSize: [64, 30],
        iconAnchor: [32, 15],
      });

      const marker = L.marker(coords, { icon });

      // Rich popup preview
      const popupHtml = `
        <div class="map-room-popup">
          <div class="map-popup-image" style="background-image: url('${room.photo || ""}');">
            <span class="map-popup-badge">${room.type || "Phòng trọ"}</span>
          </div>
          <div class="map-popup-body">
            <div class="map-popup-price">${money(room.price)} <span>/ tháng</span></div>
            <div class="map-popup-title">${room.title}</div>
            <div class="map-popup-address">📍 ${room.district}, ${room.city}</div>
            <div class="map-popup-specs">📐 ${room.area}m² • Số ${room.number || "01"}</div>
            <a href="/phong-tro/${room.id}" class="map-popup-link">Xem chi tiết & đặt lịch &rarr;</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 260,
        className: "custom-leaflet-popup",
      });

      marker.on("click", () => {
        onSelectRoom(room.id);
      });

      group.addLayer(marker);
    });

    // Fit map bounds to show all room markers
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [rooms, activeRoomId, mapReady, onSelectRoom]);

  // Geolocation: Find rooms near me
  const locateMe = () => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      setGeoErrorMsg("Trình duyệt của bạn không hỗ trợ định vị vị trí.");
      return;
    }

    setGeoStatus("loading");
    setGeoErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeoStatus("success");

        if (mapInstanceRef.current && window.L) {
          const L = window.L;
          const userCoords = [latitude, longitude];

          if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
          }

          // User blue glowing beacon
          const userIcon = L.divIcon({
            className: "user-location-pin",
            html: `
              <div class="user-pulse-beacon">
                <div class="user-dot"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          userMarkerRef.current = L.marker(userCoords, { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup("<strong>Vị trí của bạn</strong><br/>Đang tìm phòng trọ xung quanh đây.")
            .openPopup();

          mapInstanceRef.current.setView(userCoords, 14, { animate: true });
        }
      },
      (error) => {
        setGeoStatus("denied");
        if (error.code === error.PERMISSION_DENIED) {
          setGeoErrorMsg(
            "Bạn đã từ chối cấp quyền truy cập vị trí. Hãy bật quyền định vị trong cài đặt trình duyệt hoặc chọn khu vực theo quận huyện phía trên."
          );
        } else {
          setGeoErrorMsg("Không thể xác định vị trí hiện tại. Vui lòng thử lại sau.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div
      className={`room-map-wrapper ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "420px",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.08)",
        ...style,
      }}
    >
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%", minHeight: "420px" }} />

      {/* Floating Map Controls */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          zIndex: 800,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button
          onClick={locateMe}
          disabled={geoStatus === "loading"}
          aria-label="Tìm phòng quanh vị trí của tôi"
          style={{
            background: "#FFFFFF",
            color: geoStatus === "success" ? "#2563EB" : "#1E293B",
            border: "1px solid #E2E8F0",
            padding: "8px 14px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          {geoStatus === "loading" ? (
            <RefreshCw size={15} className="spin-animate" />
          ) : (
            <Locate size={15} color="#2563EB" />
          )}
          <span>{geoStatus === "loading" ? "Đang định vị..." : "Tìm quanh vị trí của tôi"}</span>
        </button>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(8px)",
            color: "#FFFFFF",
            padding: "6px 12px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Layers size={13} color="#60A5FA" />
          <span>{rooms.length} phòng hiển thị trên bản đồ</span>
        </div>
      </div>

      {/* Geolocation Denial / Error Notice Banner */}
      {geoErrorMsg && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "16px",
            right: "16px",
            zIndex: 850,
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "14px",
            padding: "12px 16px",
            color: "#991B1B",
            fontSize: "13px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          }}
        >
          <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ flex: 1, lineHeight: "1.4" }}>
            <strong>Thông báo định vị:</strong> {geoErrorMsg}
          </div>
          <button
            onClick={() => setGeoErrorMsg("")}
            style={{
              background: "transparent",
              border: "none",
              color: "#991B1B",
              cursor: "pointer",
              padding: "2px",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
