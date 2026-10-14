import sessionClient from "./sessionClient";

// Lấy toàn bộ dịch vụ.
export const getAllDichVu = async () => {
  const response = await sessionClient.get("/api/dich-vu");
  return response.data;
};

// Lấy dịch vụ theo ID.
export const getDichVuById = async (id) => {
  const response = await sessionClient.get(`/api/dich-vu/${id}`);
  return response.data;
};

// Thêm dịch vụ.
export const createDichVu = async (data) => {
  const response = await sessionClient.post("/api/dich-vu", data);
  return response.data;
};

// Cập nhật dịch vụ.
export const updateDichVu = async ({ id, data }) => {
  const response = await sessionClient.put(`/api/dich-vu/${id}`, data);
  return response.data;
};

// Xóa dịch vụ.
export const deleteDichVu = async (id) => {
  await sessionClient.delete(`/api/dich-vu/${id}`);
};
export const getDichVuPage = async (params, signal) =>
  (await sessionClient.get("/api/dich-vu/phan-trang", { params, signal })).data;
