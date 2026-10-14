import sessionClient from "./sessionClient";
const base = (admin) => admin ? "/api/admin/tin-dang" : "/api/tin-dang";
export const getTinDangPage = async (params, signal, admin = false) =>
  (await sessionClient.get(base(admin), { params, signal })).data;
export const getTinDang = async (id, signal, admin = false) =>
  (await sessionClient.get(base(admin) + "/" + id, { signal })).data;
export const getLichSuTinDang = async (id, signal, admin = false) =>
  (await sessionClient.get(base(admin) + "/" + id + "/lich-su", { signal })).data;
export const saveTinDang = async ({ id, data }) =>
  (id == null ? await sessionClient.post(base(false), data) : await sessionClient.put(base(false) + "/" + id, data)).data;
export const actionTinDang = async ({ id, action, phienBan, lyDo = null, admin = false }) =>
  (await sessionClient.patch(base(admin) + "/" + id + "/" + action, { phienBan, lyDo })).data;
export const deleteTinDang = async ({ id, phienBan }) => {
  await sessionClient.delete(base(false) + "/" + id, { params: { phienBan } });
};
export const getPublicTinDangPage = async (params, signal) =>
  (await sessionClient.get("/api/cong-khai/tin-dang", { params, signal })).data;
export const getPublicTinDang = async (id, signal) =>
  (await sessionClient.get("/api/cong-khai/tin-dang/" + id, { signal })).data;
