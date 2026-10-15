import axiosClient from "./axiosClient";

// Lấy toàn bộ thanh toán.
export const getAllThanhToan = async () => {
  const response = await axiosClient.get("/api/thanh-toan");
  return response.data;
};

// Lấy thanh toán theo ID.
export const getThanhToanById = async (id) => {
  const response = await axiosClient.get(`/api/thanh-toan/${id}`);
  return response.data;
};

// Lấy lịch sử thanh toán theo hóa đơn.
export const getThanhToanByHoaDon = async (hoaDonId) => {
  const response = await axiosClient.get(
    `/api/thanh-toan/hoa-don/${hoaDonId}`
  );

  return response.data;
};

// Thêm thanh toán.
export const createThanhToan = async (data) => {
  const response = await axiosClient.post("/api/thanh-toan", data);
  return response.data;
};

// Cập nhật thanh toán.
export const updateThanhToan = async ({ id, data }) => {
  const response = await axiosClient.put(`/api/thanh-toan/${id}`, data);
  return response.data;
};

// Xóa thanh toán.
export const deleteThanhToan = async (id) => {
  await axiosClient.delete(`/api/thanh-toan/${id}`);
};