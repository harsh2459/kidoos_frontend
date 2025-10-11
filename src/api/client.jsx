// src/api/client.jsx
import axios from "axios";

/** Resolve base URL and normalize to ".../api" */
function resolveBaseURL() {
  let u =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE) ||
    (typeof window !== "undefined" && window.API_BASE) ||
    "https://kiddoos-backend.onrender.com/api";

  u = String(u || "").trim().replace(/\/+$/, "");
  const apiIdx = u.toLowerCase().lastIndexOf("/api");
  if (apiIdx === -1) u = `${u}/api`;
  else if (apiIdx !== u.length - 4) u = u.slice(0, apiIdx + 4);
  return u;
}

const BASE_URL = resolveBaseURL();
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  validateStatus: (s) => (s >= 200 && s < 300) || s === 304 || s === 400 || s === 401 || s === 422,
});

function getTokens() {
  try {
    return {
      admin: localStorage.getItem("admin_jwt") || "",
      customer: localStorage.getItem("customer_jwt") || "",
    };
  } catch {
    return { admin: "", customer: "" };
  }
}

/** Attach admin token for /books, /admin, /auth; customer for /customer */
api.interceptors.request.use((config) => {
  const url = String(config?.url || "");
  const metaAuth = config?.meta?.auth;
  let token = "";

  if (metaAuth === "admin" || metaAuth === "customer") token = getTokens()[metaAuth];
  else if (metaAuth === "none") token = "";
  else if (url.startsWith("/admin/") || url.startsWith("/auth/") || url.startsWith("/books"))
    token = getTokens().admin;
  else if (url.startsWith("/customer/")) token = getTokens().customer;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = String(err?.config?.url || "");
    if (status === 401) {
      try {
        if (url.startsWith("/admin/") || url.startsWith("/auth/") || url.startsWith("/books")) {
          localStorage.removeItem("admin_jwt");
          if (typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
            window.location.href = "/admin/login";
          }
        } else if (url.startsWith("/customer/")) {
          localStorage.removeItem("customer_jwt");
          localStorage.removeItem("customer_profile");
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      } catch {}
    }
    return Promise.reject(err);
  }
);

export default api;
export { api, BASE_URL };
