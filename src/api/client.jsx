// src/api/client.jsx - COMPLETE FIXED VERSION
import axios from "axios";

/** Resolve base URL and normalize to ".../api" */
function resolveBaseURL() {
  let u =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE) ||
    (typeof window !== "undefined" && window.API_BASE) ||
    "http://localhost:5050/api";

  u = String(u || "").trim().replace(/\/+$/, "");
  const apiIdx = u.toLowerCase().lastIndexOf("/api");
  if (apiIdx === -1) u = `${u}/api`;
  else if (apiIdx !== u.length - 4) u = u.slice(0, apiIdx + 4);
  return u;
}

const BASE_URL = resolveBaseURL();

// ✅ DON'T set default Content-Type for the instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 
    Accept: "application/json" 
    // ❌ DON'T set Content-Type here - it breaks FormData
  },
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

  // Initialize headers if not exists
  if (!config.headers) {
    config.headers = {};
  }

  // Add authorization token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ CRITICAL: Handle Content-Type correctly
  if (config.data instanceof FormData) {
    // For FormData, completely remove Content-Type
    // Browser will auto-set it with boundary
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  } else if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
    // For non-FormData, set JSON as default
    config.headers["Content-Type"] = "application/json";
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