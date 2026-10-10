import axiosClient from './axiosClient'

export const getAllPhong = async () => {
  const response = await axiosClient.get('/api/phong')

  return response.data
}

export const getPhongById = async (id) => {
  const response = await axiosClient.get(`/api/phong/${id}`)

  return response.data
}

export const createPhong = async (data) => {
  const response = await axiosClient.post('/api/phong', data)

  return response.data
}

export const deletePhong = async (id) => {
  await axiosClient.delete(`/api/phong/${id}`);
};

export const updatePhong = async ({ id, data }) => {
  const response = await axiosClient.put(
      `/api/phong/${id}`,
      data
  );

  return response.data;
};

export const getPhongPage = async (params) => {
  const response = await axiosClient.get("/api/phong/phan-trang", {
    params,
  });

  return response.data;
};

export const updateTrangThaiPhong = async ({ id, trangThai }) => {
  const response = await axiosClient.patch(
      `/api/phong/${id}/trang-thai`,
      { trangThai }
  );

  return response.data;
};