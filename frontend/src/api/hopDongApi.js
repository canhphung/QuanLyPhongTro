import sessionClient from "./sessionClient";

// Lấy tất cả hợp đồng
export const getAllHopDong = async ({ signal } = {}) => {
  const response = await sessionClient.get("/api/hop-dong", { signal });

  return response.data;
};

// Lấy hợp đồng theo ID
export const getHopDongById = async (id, signal) => {
  const response = await sessionClient.get(
      `/api/hop-dong/${id}`, { signal }
  );

  return response.data;
};

// Thêm hợp đồng
export const createHopDong = async (data) => {
  const response = await sessionClient.post(
      "/api/hop-dong",
      data
  );

  return response.data;
};

// Cập nhật hợp đồng
export const updateHopDong = async ({ id, data }) => {
  const response = await sessionClient.put(
      `/api/hop-dong/${id}`,
      data
  );

  return response.data;
};

// Kết thúc hợp đồng
export const ketThucHopDong = async ({ id, data }) => {
  const response = await sessionClient.patch(
      `/api/hop-dong/${id}/ket-thuc`,
      data
  );

  return response.data;
};

// Hủy hợp đồng
export const huyHopDong = async (id) => {
  const response = await sessionClient.patch(
      `/api/hop-dong/${id}/huy`
  );

  return response.data;
};

export const getHopDongPage = async (params, signal) =>
  (await sessionClient.get("/api/hop-dong/phan-trang", { params, signal })).data;
