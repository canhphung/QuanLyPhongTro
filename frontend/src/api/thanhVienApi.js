import sessionClient from "./sessionClient";

const path = (id) => `/api/hop-dong/${id}/thanh-vien`;
export const getThanhVien = async (id, dangO, signal) =>
  (await sessionClient.get(path(id), { params: { dangO }, signal })).data;
export const saveThanhVien = async ({ hopDongId, editingId, data }) =>
  (editingId == null
    ? await sessionClient.post(path(hopDongId), data)
    : await sessionClient.put(`${path(hopDongId)}/${editingId}`, data)).data;
export const deleteThanhVien = async ({ hopDongId, nguoiThueId }) =>
  sessionClient.delete(`${path(hopDongId)}/${nguoiThueId}`);
