import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  MapPin,
  Clock,
  Sparkles,
  X,
  TrendingUp,
  Tag,
  Building,
} from "lucide-react";
import { useAppData } from "./context";

const POPULAR_KEYWORDS = [
  { text: "Phòng trọ Thủ Đức", city: "TP. Hồ Chí Minh", district: "Thủ Đức" },
  { text: "Căn hộ mini Quận 7", city: "TP. Hồ Chí Minh", district: "Quận 7" },
  { text: "Phòng trọ Bình Thạnh", city: "TP. Hồ Chí Minh", district: "Bình Thạnh" },
  { text: "Căn hộ Cầu Giấy", city: "Hà Nội", district: "Cầu Giấy" },
  { text: "Phòng trọ giá rẻ dưới 3 triệu", budget: "0-3000000" },
  { text: "Phòng có máy lạnh & ban công", amenity: "Máy lạnh" },
  { text: "Phòng trọ Hải Châu", city: "Đà Nẵng", district: "Hải Châu" },
];

export function SearchAutocomplete({
  value = "",
  onChange = () => {},
  onSearch = () => {},
  placeholder = "Tìm theo quận huyện, tên đường, loại phòng hoặc tiện ích...",
  className = "",
  autoFocus = false,
}) {
  const { publicRooms: rooms, recentSearches, addRecentSearch, clearRecentSearches } =
    useAppData();
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute suggestions based on query
  const suggestions = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return [];

    const norm = (str) =>
      (str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");

    const normQ = norm(q);

    const matches = [];

    // Match districts & cities
    const districtsSeen = new Set();
    rooms.forEach((r) => {
      const dName = `${r.district}, ${r.city}`;
      if (!districtsSeen.has(dName) && (norm(r.district).includes(normQ) || norm(r.city).includes(normQ))) {
        districtsSeen.add(dName);
        matches.push({
          type: "location",
          label: dName,
          subtitle: "Khu vực",
          icon: MapPin,
          city: r.city,
          district: r.district,
        });
      }
    });

    // Match room titles
    rooms.forEach((r) => {
      if (norm(r.title).includes(normQ) || norm(r.address).includes(normQ)) {
        matches.push({
          type: "room",
          label: r.title,
          subtitle: `${r.district} • ${r.area}m²`,
          icon: Building,
          id: r.id,
          query: r.title,
        });
      }
    });

    // Match popular amenities
    const commonAmenities = ["Máy lạnh", "Ban công", "Tủ lạnh", "Máy giặt", "WC riêng", "Nuôi thú cưng"];
    commonAmenities.forEach((a) => {
      if (norm(a).includes(normQ)) {
        matches.push({
          type: "amenity",
          label: `Tiện ích: ${a}`,
          subtitle: "Lọc phòng có tiện nghi này",
          icon: Tag,
          amenity: a,
        });
      }
    });

    return matches.slice(0, 6);
  }, [value, rooms]);

  const handleSelect = (item) => {
    setOpen(false);
    if (item.type === "location") {
      onChange(item.label);
      addRecentSearch(item.label, `Khu vực: ${item.label}`);
      onSearch({ city: item.city, district: item.district, q: "" });
    } else if (item.type === "amenity") {
      onChange(item.amenity);
      addRecentSearch(item.amenity, `Tiện ích: ${item.amenity}`);
      onSearch({ amenity: item.amenity, q: "" });
    } else if (item.type === "room") {
      onChange(item.label);
      addRecentSearch(item.label, `Phòng: ${item.label}`);
      onSearch({ q: item.label });
    } else if (item.query !== undefined) {
      onChange(item.query || item.desc);
      addRecentSearch(item.query || item.desc);
      onSearch({ q: item.query || item.desc });
    } else {
      onChange(item.text);
      addRecentSearch(item.text);
      onSearch({
        city: item.city,
        district: item.district,
        budget: item.budget,
        amenity: item.amenity,
        q: item.city || item.district ? "" : item.text,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      } else {
        setOpen(false);
        addRecentSearch(value);
        onSearch({ q: value });
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`search-autocomplete-wrap ${className}`}
      style={{ position: "relative", width: "100%" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#FFFFFF",
          border: open ? "1.5px solid #2563EB" : "1.5px solid #E2E8F0",
          borderRadius: "14px",
          padding: "10px 16px",
          boxShadow: open
            ? "0 0 0 3px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05)"
            : "0 2px 6px rgba(0, 0, 0, 0.04)",
          transition: "all 0.2s ease",
        }}
      >
        <Search size={18} color="#2563EB" style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: "14.5px",
            color: "#0F172A",
            background: "transparent",
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            aria-label="Xóa nội dung tìm kiếm"
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              padding: "2px",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Autocomplete & History Dropdown */}
      {open && (
        <div
          className="search-dropdown-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 990,
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            maxHeight: "380px",
            overflowY: "auto",
            animation: "modalFadeIn 0.2s ease-out",
          }}
        >
          {/* Active typed suggestions */}
          {suggestions.length > 0 && (
            <div style={{ padding: "8px 0" }}>
              <div
                style={{
                  padding: "6px 16px",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#64748B",
                }}
              >
                Gợi ý phù hợp
              </div>
              {suggestions.map((item, idx) => {
                const IconComponent = item.icon || Search;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(item)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 16px",
                      background: isSelected ? "#EFF6FF" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: isSelected ? "#DBEAFE" : "#F1F5F9",
                        color: isSelected ? "#2563EB" : "#64748B",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 600,
                          color: "#1E293B",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.label}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Recent Searches Section */}
          {recentSearches && recentSearches.length > 0 && !value && (
            <div style={{ padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 16px 8px",
                }}
              >
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#64748B",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Clock size={13} /> Tìm kiếm gần đây
                </div>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94A3B8",
                    fontSize: "11.5px",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                >
                  Xóa lịch sử
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recentSearches.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelect(s)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 16px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "#334155",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Clock size={14} color="#94A3B8" />
                    <span style={{ flex: 1 }}>{s.desc || s.query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Keywords Section */}
          {!value && (
            <div style={{ padding: "12px 16px" }}>
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "#64748B",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "10px",
                }}
              >
                <TrendingUp size={13} color="#2563EB" /> Xu hướng tìm kiếm
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {POPULAR_KEYWORDS.map((k) => (
                  <button
                    key={k.text}
                    type="button"
                    onClick={() => handleSelect(k)}
                    style={{
                      background: "#F1F5F9",
                      border: "1px solid #E2E8F0",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "12.5px",
                      color: "#334155",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#EFF6FF";
                      e.currentTarget.style.borderColor = "#93C5FD";
                      e.currentTarget.style.color = "#1D4ED8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#F1F5F9";
                      e.currentTarget.style.borderColor = "#E2E8F0";
                      e.currentTarget.style.color = "#334155";
                    }}
                  >
                    <Sparkles size={12} color="#2563EB" />
                    <span>{k.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
