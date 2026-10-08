import axiosClient from "./axiosClient";

// Lấy tất cả hợp đồng
export const getAllHopDong = async () => {
  const response = await axiosClient.get("/api/hop-dong");

  return response.data;
};

// Lấy hợp đồng theo ID
export const getHopDongById = async (id) => {
  const response = await axiosClient.get(
      `/api/hop-dong/${id}`
  );

  return response.data;
};

// Thêm hợp đồng
export const createHopDong = async (data) => {
  const response = await axiosClient.post(
      "/api/hop-dong",
      data
  );

  return response.data;
};

// Cập nhật hợp đồng
export const updateHopDong = async ({ id, data }) => {
  const response = await axiosClient.put(
      `/api/hop-dong/${id}`,
      data
  );

  return response.data;
};

// Kết thúc hợp đồng
export const ketThucHopDong = async (id) => {
  const response = await axiosClient.patch(
      `/api/hop-dong/${id}/ket-thuc`
  );

  return response.data;
};

// Hủy hợp đồng
export const huyHopDong = async (id) => {
  const response = await axiosClient.patch(
      `/api/hop-dong/${id}/huy`
  );

  return response.data;
};
