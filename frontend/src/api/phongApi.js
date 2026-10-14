import sessionClient from './sessionClient'

export const getAllPhong = async ({ signal } = {}) => {
  const response = await sessionClient.get('/api/phong', { signal })

  return response.data
}

export const getPhongById = async (id) => {
  const response = await sessionClient.get(`/api/phong/${id}`)

  return response.data
}

export const createPhong = async (data) => {
  const response = await sessionClient.post('/api/phong', data)

  return response.data
}

export const deletePhong = async (id) => {
  await sessionClient.delete(`/api/phong/${id}`);
};

export const updatePhong = async ({ id, data }) => {
  const response = await sessionClient.put(
      `/api/phong/${id}`,
      data
  );

  return response.data;
};

export const getPhongPage = async (params, signal) => {
  const response = await sessionClient.get("/api/phong/phan-trang", {
    params, signal,
  });

  return response.data;
};

export const updateTrangThaiPhong = async ({ id, trangThai }) => {
  const response = await sessionClient.patch(
      `/api/phong/${id}/trang-thai`,
      { trangThai }
  );

  return response.data;
};
