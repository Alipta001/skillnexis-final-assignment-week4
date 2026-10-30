import axios from "axios";

export const apiBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: apiBaseUrl });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fieldFormToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error, fallback = "Something went wrong.") {
  return error.response?.data?.message || error.message || fallback;
}

export function getImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${new URL(apiBaseUrl).origin}${image}`;
}

export default api;
