// frontend/src/api/client.jsx
import axios from "axios";
let baseURL = "http://localhost:5050/api";
if (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) baseURL = process.env.REACT_APP_API_BASE;
if (typeof window !== "undefined" && window.API_BASE) baseURL = window.API_BASE;

export const api = axios.create({ baseURL });

api.interceptors.response.use(
  r => r,
  err => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("admin_jwt");
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);
