import { useAppData } from "./context";
import { Scale, X, ArrowRight, Trash2 } from "lucide-react";
import { shortPrice } from "./data";
import { RoomPhoto } from "./ui";

export function ComparisonDock() {
  const { compareIds, removeFromCompare, clearCompare, setCompareModalOpen, publicRooms } =
    useAppData();

  if (!compareIds || compareIds.length === 0) return null;

  const selectedRooms = compareIds
    .map((id) => publicRooms.find((r) => r.id === id))
    .filter(Boolean);

  return (
    <aside
      className="comparison-dock-container"
      aria-label="Thanh so sánh phòng trọ"
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 900,
        width: "min(920px, calc(100vw - 32px))",
        background: "rgba(15, 23, 42, 0.94)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "20px",
        padding: "12px 20px",
        boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.12)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        animation: "dockSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
        <div
          style={{
            width: "42px",
            height: "42px",
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
          <div style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "-0.2px" }}>
            So sánh phòng trọ
          </div>
          <div style={{ fontSize: "12px", color: "#94A3B8" }}>
            Đã chọn <strong style={{ color: "#60A5FA" }}>{selectedRooms.length}/4</strong> phòng
          </div>
        </div>
      </div>

      {/* Selected rooms thumbnails */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          overflowX: "auto",
          padding: "4px 0",
          maxWidth: "480px",
        }}
      >
        {selectedRooms.map((room) => (
          <div
            key={room.id}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.08)",
              padding: "4px 8px 4px 4px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <RoomPhoto photo={room.photo} alt={room.title} />
            </div>
            <div style={{ maxWidth: "120px", overflow: "hidden" }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "12px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#F8FAFC",
                }}
              >
                {room.title}
              </div>
              <div style={{ fontSize: "11px", color: "#60A5FA", fontWeight: 700 }}>
                {shortPrice(room.price)} tr/th
              </div>
            </div>
            <button
              onClick={() => removeFromCompare(room.id)}
              aria-label={`Bỏ ${room.title} khỏi so sánh`}
              style={{
                background: "transparent",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                padding: "2px",
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <button
          onClick={clearCompare}
          aria-label="Xóa tất cả danh sách so sánh"
          style={{
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#CBD5E1",
            padding: "8px 12px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
            e.currentTarget.style.borderColor = "#EF4444";
            e.currentTarget.style.color = "#FCA5A5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.color = "#CBD5E1";
          }}
        >
          <Trash2 size={14} />
          <span className="hidden-mobile">Xóa hết</span>
        </button>

        <button
          onClick={() => setCompareModalOpen(true)}
          style={{
            background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
            color: "#FFFFFF",
            border: "none",
            padding: "9px 18px",
            borderRadius: "10px",
            fontSize: "13.5px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(37, 99, 235, 0.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.4)";
          }}
        >
          <span>So sánh ngay ({selectedRooms.length})</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </aside>
  );
}
