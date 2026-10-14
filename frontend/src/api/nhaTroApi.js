import sessionClient from "./sessionClient";

export const getNhaTroPage = async (page) =>
  (await sessionClient.get("/api/nha-tro", { params: { page, size: 10 } })).data;

export const saveNhaTro = async ({ id, data }) =>
  (id == null
    ? await sessionClient.post("/api/nha-tro", data)
    : await sessionClient.put(`/api/nha-tro/${id}`, data)).data;

export const deleteNhaTro = async (id) =>
  sessionClient.delete(`/api/nha-tro/${id}`);

export const getNhaTroOptions = async (signal) => {
  // Nạp đủ các trang, không giới hạn dropdown vào 10 nhà trọ đầu tiên.
  const houses = [];
  let page = 0;
  while (true) {
    const { data } = await sessionClient.get("/api/nha-tro", {
      params: { page, size: 100 }, signal,
    });
    houses.push(...data.content);
    if (data.last) return houses;
    page += 1;
  }
};
