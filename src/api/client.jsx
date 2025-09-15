import axios from "axios";

/** Resolve API base once. Normalize to ".../api" */
function resolveBaseURL() {
  // Priority: Vite env -> CRA env -> window -> default
  let u =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE) ||
    (typeof window !== "undefined" && window.API_BASE) ||
    "http://localhost:5050/api"; // fallback

  u = String(u).trim();
  
  // Remove trailing slashes
  u = u.replace(/\/+$/, "");
  // If someone passed ".../api/anything", normalize to just ".../api"
  const m = u.match(/^(.*?\/api)(?:\/.*)?$/i);
  if (m) u = m[1];
  else if (!/\/api$/i.test(u)) u = u + "/api";

  return u;
}

const baseURL = resolveBaseURL();
console.log("[api] baseURL =", baseURL);

export const api = axios.create({
  baseURL,
  validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
});

// Attach tokens to the right namespaces
api.interceptors.request.use((config) => {
  const url = String(config.url || "");
  const isCustomer = url.startsWith("/customer/");
  const isAdmin = url.startsWith("/admin/") || url.startsWith("/auth/");
  if (isCustomer) {
    const t = localStorage.getItem("customer_jwt");
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  if (isAdmin) {
    const t = localStorage.getItem("admin_jwt");
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = String(err?.config?.url || "");
    if (err?.response?.status === 401) {
      if (url.startsWith("/admin/") || url.startsWith("/auth/")) {
        localStorage.removeItem("admin_jwt");
        if (window.location.pathname !== "/admin/login") window.location.href = "/admin/login";
      } else if (url.startsWith("/customer/")) {
        localStorage.removeItem("customer_jwt");
        localStorage.removeItem("customer_profile");
        if (window.location.pathname !== "/login") window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);
