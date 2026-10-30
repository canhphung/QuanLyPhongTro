import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppDataContext } from "./context";

const empty = {
  publicRooms: [],
  rooms: [],
  listings: [],
  buildings: [],
  tenants: [],
  services: [],
  contracts: [],
  invoices: [],
  payments: [],
  requests: [],
  saved: [],
  user: null,
};

const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function ApiProvider({ children }) {
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const csrf = useRef("");
  const generation = useRef(0);
  const toastTimer = useRef(null);
  const navigate = useNavigate();

  // Guest saved rooms state (local storage)
  const [guestSaved, setGuestSaved] = useState(() => {
    try {
      const stored = localStorage.getItem("phongminh_guest_saved");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Room Comparison state (max 4 rooms)
  const [compareIds, setCompareIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem("phongminh_compare_ids");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Custom Collections state
  const [collections, setCollections] = useState(() => {
    try {
      const stored = localStorage.getItem("phongminh_custom_collections");
      return stored
        ? JSON.parse(stored)
        : [
            { id: "col-gan-truong", name: "Phòng gần trường học", icon: "GraduationCap", roomIds: [] },
            { id: "col-gia-re", name: "Phòng giá rẻ dưới 3tr", icon: "Coins", roomIds: [] },
            { id: "col-du-dinh", name: "Phòng dự định thuê tháng tới", icon: "Calendar", roomIds: [] },
          ];
    } catch {
      return [];
    }
  });

  // Recent Searches state
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem("phongminh_recent_searches");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Read Notification IDs
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const stored = localStorage.getItem("phongminh_read_notifs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const notify = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setNotice(message);
    toastTimer.current = setTimeout(() => setNotice(""), 5000);
  }, []);

  const call = useCallback(async (path, method = "GET", body) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(
        `${base}${path.startsWith("/api/") ? path : `/api/app${path}`}`,
        {
          method,
          credentials: "include",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            ...(method !== "GET"
              ? {
                  "Content-Type": "application/json",
                  "X-CSRF-Token": csrf.current,
                }
              : {}),
          },
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        },
      );
      const text = await response.text();
      let value;
      try {
        value = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(
          "Máy chủ trả về dữ liệu không hợp lệ. Kiểm tra cấu hình API.",
        );
      }
      if (!response.ok) {
        if (response.status === 401 && !path.startsWith("/auth/")) {
          setData(empty);
        }
        throw new Error(
          value?.message ||
            (value &&
              Object.values(value)
                .filter((v) => typeof v === "string")
                .join(". ")) ||
            `Yêu cầu thất bại (${response.status}).`,
        );
      }
      return value;
    } catch (e) {
      if (e.name === "AbortError")
        throw new Error("Máy chủ phản hồi quá lâu. Vui lòng thử lại.");
      if (e instanceof TypeError)
        throw new Error(
          "Không kết nối được máy chủ. Kiểm tra backend và đường dẫn API.",
        );
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  const refresh = useCallback(async () => {
    const ticket = ++generation.current;
    try {
      const result = await call("/state");
      if (ticket === generation.current) {
        setData(result);
        setError("");
      }
      return true;
    } catch (e) {
      if (ticket === generation.current) setError(e.message);
      return false;
    } finally {
      if (ticket === generation.current) setLoading(false);
    }
  }, [call]);

  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      const session = await call("/session");
      csrf.current = session.csrfToken;
      await refresh();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }, [call, refresh]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) initialize();
    });
    return () => {
      active = false;
    };
  }, [initialize]);

  async function mutate(path, method, body) {
    const result = await call(path, method, body);
    await refresh();
    return result;
  }

  // Auto-sync guest saved rooms upon successful authentication
  async function authenticate(action, body) {
    const session = await call(`/auth/${action}`, "POST", body);
    csrf.current = session.csrfToken;
    setData({ ...empty, user: session.user });

    // Sync guest saved rooms if any
    try {
      const stored = localStorage.getItem("phongminh_guest_saved");
      const guestIds = stored ? JSON.parse(stored) : [];
      if (guestIds.length > 0) {
        for (const roomId of guestIds) {
          try {
            await call(`/favorites/${roomId}`, "PUT");
          } catch {
            // ignore if already favorited
          }
        }
        localStorage.removeItem("phongminh_guest_saved");
        setGuestSaved([]);
        notify(`Đã đồng bộ ${guestIds.length} phòng yêu thích vào tài khoản.`);
      }
    } catch {
      // storage disabled
    }

    await refresh();
    return session.user;
  }

  async function logout() {
    await call("/auth/logout", "POST", {});
    generation.current++;
    navigate("/", { replace: true });
    setData(empty);
    await initialize();
    notify("Đã đăng xuất thành công.");
  }

  // Toggle favorite with offline/guest storage and online sync
  async function toggleSaved(id) {
    if (!data.user) {
      const isSaved = guestSaved.includes(id);
      const next = isSaved ? guestSaved.filter((x) => x !== id) : [...guestSaved, id];
      setGuestSaved(next);
      try {
        localStorage.setItem("phongminh_guest_saved", JSON.stringify(next));
      } catch {
        /* storage disabled */
      }
      notify(
        isSaved
          ? "Đã bỏ lưu phòng khỏi bộ nhớ tạm."
          : "Đã lưu phòng vào danh sách yêu thích tạm thời! Đăng nhập để đồng bộ vĩnh viễn.",
      );
      return;
    }

    try {
      const isSaved = data.saved.includes(id);
      await mutate(`/favorites/${id}`, isSaved ? "DELETE" : "PUT");
      notify(isSaved ? "Đã xóa phòng khỏi danh sách yêu thích." : "Đã lưu phòng vào danh sách yêu thích.");
    } catch (e) {
      notify(e.message);
    }
  }

  // Comparison Management
  const addToCompare = useCallback((room) => {
    if (compareIds.includes(room.id)) {
      notify("Phòng này đã có trong danh sách so sánh.");
      return;
    }
    if (compareIds.length >= 4) {
      notify("Bạn chỉ có thể so sánh tối đa 4 phòng trọ cùng lúc.");
      return;
    }
    const next = [...compareIds, room.id];
    setCompareIds(next);
    try {
      sessionStorage.setItem("phongminh_compare_ids", JSON.stringify(next));
    } catch {}
    notify(`Đã thêm vào so sánh (${next.length}/4 phòng).`);
  }, [compareIds, notify]);

  const removeFromCompare = useCallback((roomId) => {
    const next = compareIds.filter((id) => id !== roomId);
    setCompareIds(next);
    try {
      sessionStorage.setItem("phongminh_compare_ids", JSON.stringify(next));
    } catch {}
    notify("Đã bỏ phòng khỏi danh sách so sánh.");
  }, [compareIds, notify]);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    try {
      sessionStorage.removeItem("phongminh_compare_ids");
    } catch {}
    notify("Đã xóa toàn bộ danh sách so sánh.");
  }, [notify]);

  // Collections Management
  const createCollection = useCallback((name, icon = "Bookmark") => {
    const newCol = {
      id: `col-${Date.now()}`,
      name: name.trim(),
      icon,
      roomIds: [],
      createdAt: new Date().toISOString(),
    };
    const next = [...collections, newCol];
    setCollections(next);
    try {
      localStorage.setItem("phongminh_custom_collections", JSON.stringify(next));
    } catch {}
    notify(`Đã tạo bộ sưu tập "${name}".`);
    return newCol;
  }, [collections, notify]);

  const addToCollection = useCallback((collectionId, roomId) => {
    const next = collections.map((col) => {
      if (col.id === collectionId && !col.roomIds.includes(roomId)) {
        return { ...col, roomIds: [...col.roomIds, roomId] };
      }
      return col;
    });
    setCollections(next);
    try {
      localStorage.setItem("phongminh_custom_collections", JSON.stringify(next));
    } catch {}
    notify("Đã thêm phòng vào bộ sưu tập.");
  }, [collections, notify]);

  const removeFromCollection = useCallback((collectionId, roomId) => {
    const next = collections.map((col) => {
      if (col.id === collectionId) {
        return { ...col, roomIds: col.roomIds.filter((id) => id !== roomId) };
      }
      return col;
    });
    setCollections(next);
    try {
      localStorage.setItem("phongminh_custom_collections", JSON.stringify(next));
    } catch {}
    notify("Đã xóa phòng khỏi bộ sưu tập.");
  }, [collections, notify]);

  const deleteCollection = useCallback((collectionId) => {
    const next = collections.filter((c) => c.id !== collectionId);
    setCollections(next);
    try {
      localStorage.setItem("phongminh_custom_collections", JSON.stringify(next));
    } catch {}
    notify("Đã xóa bộ sưu tập.");
  }, [collections, notify]);

  // Recent Searches Management
  const addRecentSearch = useCallback((query, filterDesc) => {
    if (!query && !filterDesc) return;
    const item = {
      id: `s-${Date.now()}`,
      query: (query || "").trim(),
      desc: filterDesc || query,
      timestamp: Date.now(),
    };
    const filtered = recentSearches.filter((s) => s.desc !== item.desc);
    const next = [item, ...filtered].slice(0, 6);
    setRecentSearches(next);
    try {
      localStorage.setItem("phongminh_recent_searches", JSON.stringify(next));
    } catch {}
  }, [recentSearches]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("phongminh_recent_searches");
    } catch {}
  }, []);

  // Notifications Management
  const markNotificationRead = useCallback((id) => {
    if (readNotifIds.includes(id)) return;
    const next = [...readNotifIds, id];
    setReadNotifIds(next);
    try {
      localStorage.setItem("phongminh_read_notifs", JSON.stringify(next));
    } catch {}
  }, [readNotifIds]);

  const markAllNotificationsRead = useCallback((ids) => {
    const next = [...new Set([...readNotifIds, ...ids])];
    setReadNotifIds(next);
    try {
      localStorage.setItem("phongminh_read_notifs", JSON.stringify(next));
    } catch {}
    notify("Đã đánh dấu tất cả thông báo là đã đọc.");
  }, [readNotifIds, notify]);

  // Combined effective saved list
  const effectiveSaved = data.user ? data.saved : guestSaved;

  const value = {
    ...data,
    saved: effectiveSaved,
    loading,
    error,
    notify,
    refresh,
    call,
    mutate,
    authenticate,
    logout,
    toggleSaved,
    // Compare
    compareIds,
    addToCompare,
    removeFromCompare,
    clearCompare,
    compareModalOpen,
    setCompareModalOpen,
    // Collections
    collections,
    createCollection,
    addToCollection,
    removeFromCollection,
    deleteCollection,
    // Recent Searches
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    // Notifications
    readNotifIds,
    markNotificationRead,
    markAllNotificationsRead,
    // CRUD
    saveRecord: (key, id, body) =>
      mutate(`/owner/${key}${id ? `/${id}` : ""}`, id ? "PUT" : "POST", body),
    deleteRecord: (key, id, version) =>
      mutate(
        `/owner/${key}/${id}${version != null ? `?version=${version}` : ""}`,
        "DELETE",
      ),
    respond: (id, status) => mutate(`/requests/${id}`, "PATCH", { status }),
    uploadFiles: async (files) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }
      const response = await fetch(`/api/app/owner/upload`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-CSRF-Token": csrf.current,
        },
        body: formData,
      });
      const resText = await response.text();
      let resData;
      try {
        resData = resText ? JSON.parse(resText) : null;
      } catch {
        throw new Error("Không thể xử lý phản hồi tải ảnh từ máy chủ.");
      }
      if (!response.ok) {
        throw new Error(resData?.message || "Tải ảnh thất bại.");
      }
      return resData?.urls || [];
    },
  };

  return (
    <AppDataContext.Provider value={value}>
      {loading ? (
        <div className="connection-state" role="status">
          Đang tải dữ liệu từ máy chủ…
        </div>
      ) : (
        <>
          {error && (
            <div className="api-error" role="alert">
              <p>{error} Dữ liệu hiển thị có thể chưa được cập nhật.</p>
              <button className="button button-soft" onClick={initialize}>
                Thử kết nối lại
              </button>
            </div>
          )}
          {children}
        </>
      )}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {notice && (
          <div className="toast">
            {notice}
            <button aria-label="Đóng thông báo" onClick={() => setNotice("")}>
              ×
            </button>
          </div>
        )}
      </div>
    </AppDataContext.Provider>
  );
}
