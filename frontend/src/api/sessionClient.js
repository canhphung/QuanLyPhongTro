import axios from "axios";
import { getSessionVersion, SESSION_EXPIRED } from "../utils/sessionState";
const options = { baseURL: import.meta.env.VITE_API_URL, withCredentials: true };
const tokenClient = axios.create(options);
const sessionClient = axios.create(options);
// Lấy CSRF trước ghi; không tự gửi lại POST/PUT khi token hoặc mạng lỗi.
sessionClient.interceptors.request.use(async (config) => {
  config.sessionVersion = getSessionVersion();
  if (!["get", "head", "options"].includes((config.method || "get").toLowerCase())) {
    const { data } = await tokenClient.get("/api/auth/csrf", { signal: config.signal });
    config.headers.set(data.headerName, data.token);
  }
  return config;
});
sessionClient.interceptors.response.use((response) => response, (error) => {
  const status = error.response?.status;
  const path = error.config?.url;
  if (status === 401 && error.config?.sessionVersion === getSessionVersion()
      && path !== "/api/auth/login" && path !== "/api/auth/register")
    window.dispatchEvent(new Event(SESSION_EXPIRED));
  return Promise.reject(error);
});
export default sessionClient;
