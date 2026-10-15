import axiosClient from "./axiosClient";

// Lấy tất cả hóa đơn (có thể lọc theo trạng thái)
export const getAllHoaDon = async (trangThai) => {
  const response = await axiosClient.get("/api/hoa-don", {
    params: trangThai
        ? {
          trangThai: trangThai,
        }
        : {},
  });

  return response.data;
};

// Lấy hóa đơn theo ID (kèm dòng chi tiết)
export const getHoaDonById = async (id) => {
  const response = await axiosClient.get(
      `/api/hoa-don/${id}`
  );

  return response.data;
};

// Lấy danh sách hóa đơn theo hợp đồng
export const getHoaDonByHopDong = async (hopDongId) => {
  const response = await axiosClient.get(
      `/api/hoa-don/hop-dong/${hopDongId}`
  );

  return response.data;
};

// Thêm hóa đơn
export const createHoaDon = async (data) => {
  const response = await axiosClient.post(
      "/api/hoa-don",
      data
  );

  return response.data;
};

// Cập nhật hóa đơn
export const updateHoaDon = async ({ id, data }) => {
  const response = await axiosClient.put(
      `/api/hoa-don/${id}`,
      data
  );

  return response.data;
};

// Xóa hóa đơn
export const deleteHoaDon = async (id) => {
  await axiosClient.delete(`/api/hoa-don/${id}`);
};
