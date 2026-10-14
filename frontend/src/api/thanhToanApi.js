import sessionClient from "./sessionClient";
export const getAllThanhToan = async (signal) => (await sessionClient.get("/api/thanh-toan", { signal })).data;
export const getThanhToanById = async (id, signal) => (await sessionClient.get(`/api/thanh-toan/${id}`, { signal })).data;
export const getThanhToanByHoaDon = async (id, signal) => (await sessionClient.get(`/api/thanh-toan/hoa-don/${id}`, { signal })).data;
export const getThanhToanPage = async (params, signal) => (await sessionClient.get("/api/thanh-toan/phan-trang", { params, signal })).data;
export const createThanhToan = async (data) => (await sessionClient.post("/api/thanh-toan", data)).data;
export const updateThanhToan = async ({ id, data }) => (await sessionClient.put(`/api/thanh-toan/${id}`, data)).data;
export const deleteThanhToan = async (id) => { await sessionClient.delete(`/api/thanh-toan/${id}`); };
