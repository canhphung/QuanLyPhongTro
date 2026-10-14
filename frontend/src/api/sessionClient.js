import axios from "axios";

const options = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
};
const tokenClient = axios.create(options);
const sessionClient = axios.create(options);

// Lấy token hiện tại trước mọi thao tác ghi, kể cả login/logout.
// Không tự retry POST để tránh tạo giao dịch hoặc bản ghi lặp.
sessionClient.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();
  if (!["get", "head", "options"].includes(method)) {
    const { data } = await tokenClient.get("/api/auth/csrf");
    config.headers.set(data.headerName, data.token);
  }
  return config;
});

export default sessionClient;
