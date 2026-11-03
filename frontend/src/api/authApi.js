import sessionClient from "./sessionClient";

export const getMe = async ({ signal } = {}) => {
  try {
    return (await sessionClient.get("/api/auth/me", { signal })).data;
  } catch (error) {
    if (error.response?.status === 401) return null;
    throw error;
  }
};

export const register = async (data) =>
  (await sessionClient.post("/api/auth/register", data)).data;

export const login = async ({ email, password }) => {
  await sessionClient.post(
    "/api/auth/login",
    new URLSearchParams({ email: email.trim().toLowerCase(), password }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return getMe();
};

export const logout = async () => {
  await sessionClient.post("/api/auth/logout");
};
