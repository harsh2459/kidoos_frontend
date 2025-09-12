import axios from "axios";
let baseURL = "http://localhost:5050/api";
if (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) baseURL = process.env.REACT_APP_API_BASE;
if (typeof window !== "undefined" && window.API_BASE) baseURL = window.API_BASE;

export const api = axios.create({ baseURL });

/* --- attach tokens per namespace --- */
api.interceptors.request.use((config) => {
  const isCustomer = (config.url || "").startsWith("/customer/");
  const isAdmin = (config.url || "").startsWith("/admin/");
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

/* --- handle 401s separately --- */
api.interceptors.response.use(
  r => r,
  err => {
    const url = err?.config?.url || "";
    if (err?.response?.status === 401) {
      if (url.startsWith("/admin/")) {
        // If this was NOT a customer endpoint, then treat it as admin 401.
        const url = String(err?.config?.url || "");
        const isCustomerApi = /\/customer(\/|$)/.test(url);
        if (!isCustomerApi) {
          localStorage.removeItem("admin_jwt");
          if (window.location.pathname !== "/admin/login") {
            window.location.href = "/admin/login";
          }
        }
      } else if (url.startsWith("/customer/")) {
        localStorage.removeItem("customer_jwt");
        localStorage.removeItem("customer_profile");
        if (window.location.pathname !== "/login") window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);
