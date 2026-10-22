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
    // Remove only the former prototype's local store. Server records are never cleared.
    try {
      localStorage.removeItem("phong-minh-demo-v1");
    } catch {
      /* Storage can be disabled. */
    }
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
  async function authenticate(action, body) {
    const session = await call(`/auth/${action}`, "POST", body);
    csrf.current = session.csrfToken;
    setData({ ...empty, user: session.user });
    await refresh();
    return session.user;
  }
  async function logout() {
    await call("/auth/logout", "POST", {});
    generation.current++;
    navigate("/", { replace: true });
    setData(empty);
    await initialize();
    notify("Đã đăng xuất.");
  }
  async function toggleSaved(id) {
    if (!data.user) {
      notify("Đăng nhập để lưu phòng yêu thích.");
      navigate("/dang-nhap");
      return;
    }
    try {
      await mutate(
        `/favorites/${id}`,
        data.saved.includes(id) ? "DELETE" : "PUT",
      );
    } catch (e) {
      notify(e.message);
    }
  }
  const value = {
    ...data,
    loading,
    error,
    notify,
    refresh,
    call,
    mutate,
    authenticate,
    logout,
    toggleSaved,
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
        formData.append('files', file);
      }
      const response = await fetch(`/api/app/owner/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'X-CSRF-Token': csrf.current,
        },
        body: formData,
      });
      const resText = await response.text();
      let resData;
      try {
        resData = resText ? JSON.parse(resText) : null;
      } catch {
        throw new Error('Không thể xử lý phản hồi tải ảnh từ máy chủ.');
      }
      if (!response.ok) {
        throw new Error(resData?.message || 'Tải ảnh thất bại.');
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
