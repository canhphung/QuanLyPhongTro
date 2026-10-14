import sessionClient from "./sessionClient";

export const getNhaTroPage = async (page) =>
  (await sessionClient.get("/api/nha-tro", { params: { page, size: 10 } })).data;

export const saveNhaTro = async ({ id, data }) =>
  (id == null
    ? await sessionClient.post("/api/nha-tro", data)
    : await sessionClient.put(`/api/nha-tro/${id}`, data)).data;

export const deleteNhaTro = async (id) =>
  sessionClient.delete(`/api/nha-tro/${id}`);
