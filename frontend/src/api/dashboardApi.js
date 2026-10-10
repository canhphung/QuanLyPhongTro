import axiosClient from "./axiosClient";

export const getDashboard = async () => {
  const response = await axiosClient.get("/api/dashboard");

  return response.data;
};