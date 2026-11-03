import { useState } from "react";
import {
  X,
  Bookmark,
  Check,
  FolderPlus,
} from "lucide-react";
import { useAppData } from "./context";

export function CollectionsModal({ room, isOpen, onClose }) {
  const {
    collections,
    createCollection,
    addToCollection,
    removeFromCollection,
  } = useAppData();

  const [newColName, setNewColName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen || !room) return null;

  const handleToggleCollection = (col) => {
    const isIncluded = col.roomIds.includes(room.id);
    if (isIncluded) {
      removeFromCollection(col.id, room.id);
    } else {
      addToCollection(col.id, room.id);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const newCol = createCollection(newColName.trim());
    addToCollection(newCol.id, room.id);
    setNewColName("");
    setIsCreating(false);
  };

  return (
    <div
      className="collection-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1050,
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "modalFadeIn 0.2s ease-out",
      }}
    >
      <div
        className="collection-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid #E2E8F0",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F8FAFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#EFF6FF",
                color: "#2563EB",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Bookmark size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>
                Lưu vào bộ sưu tập
              </h3>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#64748B" }}>
                Phân loại phòng trọ để dễ dàng theo dõi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            style={{
              background: "#F1F5F9",
              border: "none",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Room preview banner */}
        <div
          style={{
            padding: "12px 24px",
            background: "#EFF6FF",
            borderBottom: "1px solid #DBEAFE",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              overflow: "hidden",
              flexShrink: 0,
              background: "#CBD5E1",
            }}
          >
            <img
              src={room.photo}
              alt={room.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 700,
                color: "#1E293B",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {room.title}
            </div>
            <div style={{ fontSize: "12px", color: "#2563EB", fontWeight: 600 }}>
              {room.district}, {room.city}
            </div>
          </div>
        </div>

        {/* Collections List */}
        <div style={{ padding: "16px 24px", maxHeight: "280px", overflowY: "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {collections.map((col) => {
              const isSaved = col.roomIds.includes(room.id);
              return (
                <button
                  key={col.id}
                  onClick={() => handleToggleCollection(col)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: isSaved ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                    background: isSaved ? "#F0Fdf4" : "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: isSaved ? "#DCFCE7" : "#F1F5F9",
                        color: isSaved ? "#16A34A" : "#64748B",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Bookmark size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#1E293B" }}>
                        {col.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        {col.roomIds.length} phòng đã lưu
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      border: isSaved ? "none" : "1.5px solid #CBD5E1",
                      background: isSaved ? "#10B981" : "transparent",
                      color: "#FFFFFF",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {isSaved && <Check size={14} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Create New Collection Section */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #E2E8F0",
            background: "#F8FAFC",
          }}
        >
          {isCreating ? (
            <form onSubmit={handleCreate} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                autoFocus
                placeholder="Tên bộ sưu tập mới..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                style={{
                  flex: 1,
                  padding: "9px 14px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13.5px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!newColName.trim()}
                style={{
                  background: "#2563EB",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Tạo
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                style={{
                  background: "#E2E8F0",
                  border: "none",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1.5px dashed #CBD5E1",
                borderRadius: "12px",
                background: "transparent",
                color: "#2563EB",
                fontSize: "13.5px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#CBD5E1")}
            >
              <FolderPlus size={16} />
              <span>Tạo bộ sưu tập mới</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
