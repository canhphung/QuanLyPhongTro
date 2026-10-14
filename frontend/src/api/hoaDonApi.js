import sessionClient from "./sessionClient";

// Lấy tất cả hóa đơn (có thể lọc theo trạng thái)
export const getAllHoaDon = async (trangThai, signal) => {
  const response = await sessionClient.get("/api/hoa-don", {
    signal,
    params: trangThai
        ? {
          trangThai: trangThai,
        }
        : {},
  });

  return response.data;
};

// Lấy hóa đơn theo ID (kèm dòng chi tiết)
export const getHoaDonById = async (id, signal) => {
  const response = await sessionClient.get(
      `/api/hoa-don/${id}`, { signal }
  );

  return response.data;
};

// Lấy danh sách hóa đơn theo hợp đồng
export const getHoaDonByHopDong = async (hopDongId) => {
  const response = await sessionClient.get(
      `/api/hoa-don/hop-dong/${hopDongId}`
  );

  return response.data;
};

// Thêm hóa đơn
export const createHoaDon = async (data) => {
  const response = await sessionClient.post(
      "/api/hoa-don",
      data
  );

  return response.data;
};

// Cập nhật hóa đơn
export const updateHoaDon = async ({ id, data }) => {
  const response = await sessionClient.put(
      `/api/hoa-don/${id}`,
      data
  );

  return response.data;
};

// Xóa hóa đơn
export const deleteHoaDon = async (id) => {
  await sessionClient.delete(`/api/hoa-don/${id}`);
};

export const getHoaDonPage = async (params, signal) =>
  (await sessionClient.get("/api/hoa-don/phan-trang", { params, signal })).data;
