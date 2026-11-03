import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "./context";
import {
  X,
  Check,
  Minus,
  Scale,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import { RoomPhoto } from "./ui";
import { money } from "./data";

const STANDARD_AMENITIES = [
  "Máy lạnh",
  "Tủ lạnh",
  "Máy giặt",
  "Giường nệm",
  "Tủ quần áo",
  "WC riêng",
  "Ban công",
  "Thang máy",
  "Khóa vân tay",
  "Nuôi thú cưng",
  "Chỗ để xe",
  "Giờ giấc tự do",
];

export function ComparisonModal() {
  const {
    compareIds,
    compareModalOpen,
    setCompareModalOpen,
    removeFromCompare,
    clearCompare,
    publicRooms,
  } = useAppData();

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && compareModalOpen) {
        setCompareModalOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [compareModalOpen, setCompareModalOpen]);

  if (!compareModalOpen || !compareIds || compareIds.length === 0) return null;

  const rooms = compareIds
    .map((id) => publicRooms.find((r) => r.id === id))
    .filter(Boolean);

  if (rooms.length === 0) {
    return null;
  }

  return (
    <div
      className="comparison-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      onClick={() => setCompareModalOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        overflowY: "auto",
        animation: "modalFadeIn 0.25s ease-out",
      }}
    >
      <div
        className="comparison-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "1180px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid #E2E8F0",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F8FAFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #2563EB, #4F46E5)",
                display: "grid",
                placeItems: "center",
                color: "#FFFFFF",
              }}
            >
              <Scale size={20} />
            </div>
            <div>
              <h2
                id="compare-modal-title"
                style={{
                  margin: 0,
                  fontSize: "19px",
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-0.3px",
                }}
              >
                So sánh chi tiết {rooms.length} phòng trọ
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                Đối chiếu thông số, chi phí điện nước và tiện ích cạnh nhau để chọn phòng phù hợp nhất
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={clearCompare}
              style={{
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                color: "#64748B",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
            >
              <Trash2 size={15} /> Xóa tất cả
            </button>
            <button
              onClick={() => setCompareModalOpen(false)}
              aria-label="Đóng bảng so sánh"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#E2E8F0",
                border: "none",
                display: "grid",
                placeItems: "center",
                color: "#475569",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Comparison Matrix Table Content */}
        <div style={{ overflowX: "auto", overflowY: "auto", padding: "24px 28px", flex: 1 }}>
          <table
            style={{
              width: "100%",
              minWidth: "760px",
              borderCollapse: "separate",
              borderSpacing: "0",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: "200px",
                    textAlign: "left",
                    padding: "12px 16px",
                    background: "#F8FAFC",
                    borderBottom: "2px solid #CBD5E1",
                    borderRadius: "12px 0 0 0",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                  }}
                >
                  Tiêu chí so sánh
                </th>
                {rooms.map((room) => (
                  <th
                    key={room.id}
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      borderBottom: "2px solid #CBD5E1",
                      background: "#FFFFFF",
                      position: "relative",
                      verticalAlign: "top",
                      minWidth: "220px",
                    }}
                  >
                    <div style={{ position: "relative", marginBottom: "12px" }}>
                      <div
                        style={{
                          width: "100%",
                          height: "140px",
                          borderRadius: "14px",
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                        }}
                      >
                        <RoomPhoto photo={room.photo} alt={room.title} />
                      </div>
                      <button
                        onClick={() => removeFromCompare(room.id)}
                        aria-label={`Xóa ${room.title}`}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "rgba(15, 23, 42, 0.7)",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "50%",
                          width: "26px",
                          height: "26px",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                        }}
                        title="Bỏ phòng này"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#0F172A",
                        lineHeight: "1.3",
                        marginBottom: "6px",
                        minHeight: "40px",
                      }}
                    >
                      {room.title}
                    </div>

                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "#2563EB",
                        marginBottom: "12px",
                      }}
                    >
                      {money(room.price)}
                      <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 500 }}>
                        /tháng
                      </span>
                    </div>

                    <Link
                      to={`/phong-tro/${room.id}`}
                      onClick={() => setCompareModalOpen(false)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#2563EB",
                        color: "#FFFFFF",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Chi tiết <ArrowUpRight size={14} />
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Category: Thông số phòng */}
              <tr>
                <td
                  colSpan={rooms.length + 1}
                  style={{
                    padding: "14px 16px 8px",
                    fontWeight: 800,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#2563EB",
                    background: "#F1F5F9",
                    borderTop: "1px solid #E2E8F0",
                  }}
                >
                  Thông số cơ bản
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Diện tích</td>
                {rooms.map((r) => (
                  <td key={r.id} style={cellStyle}>
                    <strong>{r.area}</strong> m²
                  </td>
                ))}
              </tr>
              <tr>
                <td style={labelStyle}>Số phòng</td>
                {rooms.map((r) => (
                  <td key={r.id} style={cellStyle}>
                    Phòng <strong>{r.number || "01"}</strong>
                  </td>
                ))}
              </tr>
              <tr>
                <td style={labelStyle}>Loại phòng</td>
                {rooms.map((r) => (
                  <td key={r.id} style={cellStyle}>
                    <span
                      style={{
                        background: "#EFF6FF",
                        color: "#1D4ED8",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {r.type || "Phòng trọ"}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td style={labelStyle}>Trạng thái</td>
                {rooms.map((r) => {
                  const avail = r.available !== false && r.roomState !== "DA_THUE";
                  return (
                    <td key={r.id} style={cellStyle}>
                      <span
                        style={{
                          color: avail ? "#10B981" : "#EF4444",
                          fontWeight: 700,
                        }}
                      >
                        {avail ? "● Còn phòng" : "● Đã thuê"}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Category: Chi phí & Dịch vụ */}
              <tr>
                <td
                  colSpan={rooms.length + 1}
                  style={{
                    padding: "14px 16px 8px",
                    fontWeight: 800,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#2563EB",
                    background: "#F1F5F9",
                    borderTop: "1px solid #E2E8F0",
                  }}
                >
                  Chi phí & Dịch vụ
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Tiền cọc ước tính</td>
                {rooms.map((r) => (
                  <td key={r.id} style={cellStyle}>
                    <strong>{money(r.deposit || r.price)}</strong> (1 tháng)
                  </td>
                ))}
              </tr>
              <tr>
                <td style={labelStyle}>Tiền điện</td>
                {rooms.map((r) => (
                  <td key={r.id} style={cellStyle}>
                    {r.electricityFee ? `${money(r.electricityFee)}/kWh` : "3.500 đ/kWh"}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={labelStyle}>Tiền nước</td>
                {rooms.map((r) => (
                  <td key={r.id} style={cellStyle}>
                    {r.waterFee ? `${money(r.waterFee)}/m³` : "15.000 đ/m³"}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={labelStyle}>Internet / Wifi</td>
                {rooms.map((r) => (
                  <td key={r.id} style={cellStyle}>
                    {r.internetFee ? `${money(r.internetFee)}/tháng` : "100.000 đ/phòng"}
                  </td>
                ))}
              </tr>

              {/* Category: Vị trí & Tòa nhà */}
              <tr>
                <td
                  colSpan={rooms.length + 1}
                  style={{
                    padding: "14px 16px 8px",
                    fontWeight: 800,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#2563EB",
                    background: "#F1F5F9",
                    borderTop: "1px solid #E2E8F0",
                  }}
                >
                  Vị trí & Chủ quản
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Khu vực / Quận</td>
                {rooms.map((r) => (
                  <td key={r.id} style={cellStyle}>
                    <strong>{r.district}</strong>, {r.city}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={labelStyle}>Tòa nhà / Dãy trọ</td>
                {rooms.map((r) => (
                  <td key={r.id} style={cellStyle}>
                    {r.building || "Nhà riêng cho thuê"}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={labelStyle}>Chủ nhà</td>
                {rooms.map((r) => (
                  <td key={r.id} style={cellStyle}>
                    <span style={{ fontWeight: 600, color: "#1E293B" }}>
                      {r.hostName || "Chủ trọ"}
                    </span>{" "}
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#10B981",
                        background: "#ECFDF5",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        marginLeft: "4px",
                      }}
                    >
                      Đã xác thực
                    </span>
                  </td>
                ))}
              </tr>

              {/* Category: Tiện nghi & Nội thất */}
              <tr>
                <td
                  colSpan={rooms.length + 1}
                  style={{
                    padding: "14px 16px 8px",
                    fontWeight: 800,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#2563EB",
                    background: "#F1F5F9",
                    borderTop: "1px solid #E2E8F0",
                  }}
                >
                  Tiện ích & Nội thất
                </td>
              </tr>
              {STANDARD_AMENITIES.map((amenity) => (
                <tr key={amenity}>
                  <td style={labelStyle}>{amenity}</td>
                  {rooms.map((r) => {
                    const has = (r.amenities || []).some(
                      (a) => a.toLowerCase().includes(amenity.toLowerCase()) ||
                        amenity.toLowerCase().includes(a.toLowerCase())
                    );
                    return (
                      <td key={r.id} style={cellStyle}>
                        {has ? (
                          <div
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "50%",
                              background: "#DCFCE7",
                              color: "#16A34A",
                              display: "inline-grid",
                              placeItems: "center",
                            }}
                          >
                            <Check size={16} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "50%",
                              background: "#F1F5F9",
                              color: "#94A3B8",
                              display: "inline-grid",
                              placeItems: "center",
                            }}
                          >
                            <Minus size={14} />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid #E2E8F0",
            background: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "13px", color: "#64748B" }}>
            * Thông số và chi phí mang tính tham khảo theo hợp đồng mẫu. Chi tiết cụ thể vui lòng trao đổi trực tiếp với chủ trọ.
          </div>
          <button
            onClick={() => setCompareModalOpen(false)}
            style={{
              background: "#0F172A",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "13.5px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Đóng bảng so sánh
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  padding: "12px 16px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#475569",
  background: "#F8FAFC",
  borderBottom: "1px solid #E2E8F0",
};

const cellStyle = {
  padding: "12px 16px",
  textAlign: "center",
  fontSize: "13.5px",
  color: "#1E293B",
  borderBottom: "1px solid #E2E8F0",
  background: "#FFFFFF",
};
