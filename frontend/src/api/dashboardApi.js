import sessionClient from "./sessionClient";
export const getDashboard = async (thang, signal) =>
  (await sessionClient.get("/api/dashboard", { params: thang ? { thang } : {}, signal })).data;
