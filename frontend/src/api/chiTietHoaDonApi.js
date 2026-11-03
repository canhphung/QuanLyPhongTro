import sessionClient from "./sessionClient";

const path = (id) => `/api/hoa-don/${id}/chi-tiet`;
export const saveChiTiet = async ({ hoaDonId, editingId, data }) =>
  (editingId == null
    ? await sessionClient.post(path(hoaDonId), data)
    : await sessionClient.put(`${path(hoaDonId)}/${editingId}`, data)).data;
export const deleteChiTiet = async ({ hoaDonId, id }) =>
  sessionClient.delete(`${path(hoaDonId)}/${id}`);
