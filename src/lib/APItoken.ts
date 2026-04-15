import API_BASE_URL from "@/API_BASE_URL";
import axios from "axios";

export const dashboardApi = axios.create({
  baseURL: API_BASE_URL, // API base URL
});

// Automatically add Authorization Bearer Token
dashboardApi.interceptors.request.use((config) => {
  // const token = localStorage.getItem("token"); // reuse the same token

  // if (token) {
  //   config.headers["Authorization"] = `Bearer ${token}`;
  // }

  return config;
});
