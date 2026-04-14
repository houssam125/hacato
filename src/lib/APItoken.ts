import API_BASE_URL from "@/API_BASE_URL";
import axios from "axios";

export const dashboardApi = axios.create({
  baseURL: API_BASE_URL, // رابط الـ API
});

// إضافة Authorization Bearer Token تلقائياً
dashboardApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // استخدم نفس التوكن

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});
