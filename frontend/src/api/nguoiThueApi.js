import axiosClient from "./axiosClient";

// Lấy tất cả người thuê
export const getAllNguoiThue = async () => {
  const response = await axiosClient.get("/api/nguoi-thue");

  return response.data;
};

// Lấy người thuê theo ID
export const getNguoiThueById = async (id) => {
  const response = await axiosClient.get(
      `/api/nguoi-thue/${id}`
  );

  return response.data;
};

// Tìm kiếm theo tên
export const searchNguoiThue = async (ten) => {
  const response = await axiosClient.get(
      "/api/nguoi-thue/search",
      {
        params: {
          ten: ten,
        },
      }
  );

  return response.data;
};

// Thêm người thuê
export const createNguoiThue = async (data) => {
  const response = await axiosClient.post(
      "/api/nguoi-thue",
      data
  );

  return response.data;
};

// Cập nhật người thuê
export const updateNguoiThue = async ({ id, data }) => {
  const response = await axiosClient.put(
      `/api/nguoi-thue/${id}`,
      data
  );

  return response.data;
};

// Xóa người thuê
export const deleteNguoiThue = async (id) => {
  await axiosClient.delete(`/api/nguoi-thue/${id}`);
};