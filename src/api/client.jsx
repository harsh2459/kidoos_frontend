import axios from "axios";

function resolveBaseURL() {
  let u =
    (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE) ||
    (typeof window !== "undefined" && window.API_BASE) ||
    "https://kiddosintellect.com/api";
        // "http://localhost:5050/api";

  u = String(u || "").trim().replace(/\/+$/, "");
  const apiIdx = u.toLowerCase().lastIndexOf("/api"); 

  if (apiIdx === -1) {
    u = `${u}/api`;
  } else if (apiIdx !== u.length - 4) {
    u = u.slice(0, apiIdx + 4);
  } 
  return u;
}

const BASE_URL = resolveBaseURL();

  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: {
      Accept: "application/json"
    },
    validateStatus: (s) => (s >= 200 && s < 300) || s === 304 || s === 400 || s === 401 || s === 422,
  });

function getTokens() {  
  try {
    return {
      admin: localStorage.getItem("admin_jwt"),
      customer: localStorage.getItem("customer_jwt"),
    };
  } catch {
    return { admin: "", customer: "" };
  }
} 

/** ✅ IMPROVED: Attach tokens based on URL pattern and meta.auth */
api.interceptors.request.use((config) => {
  const url = String(config?.url || "");
  const metaAuth = config?.meta?.auth;
  let token = "";

  // ✅ Priority 1: Explicit meta.auth directive
  if (metaAuth === "admin") {
    token = getTokens().admin;
  } else if (metaAuth === "customer") {
    token = getTokens().customer; 
  } else if (metaAuth === "none") {
    token = "";
  }
  
  // ✅ Priority 2: Auto-detect from URL pattern
  else if (url.startsWith("/customer/")) {
    token = getTokens().customer;
  } else if (url.startsWith("/admin/") || url.startsWith("/auth/") || url.startsWith("/books")) {
    token = getTokens().admin;
  }

  // Initialize headers if not exists
  if (!config.headers) {
    config.headers = {};
  }

  // Add authorization token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // ✅ REMOVED: console.log that caused spam
  }

  // ✅ CRITICAL: Handle Content-Type correctly
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  } else if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    const status = err?.response?.status;
    const url = String(err?.config?.url || "");

    // ✅ Only log errors, not every request
    if (status >= 400) {
      console.error("❌ API Error:", { url, status, error: err?.response?.data });
    }

    if (status === 401) {
      console.error("🚫 401 Unauthorized for:", url);
      try {
        // ✅ Check if it's a customer route
        if (url.startsWith("/customer/")) {
          console.error("🚫 Customer token invalid, logging out");
          localStorage.removeItem("customer_jwt");
          localStorage.removeItem("customer_profile");
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        // Admin routes
        else if (url.startsWith("/admin/") || url.startsWith("/auth/") || url.startsWith("/books")) {
          console.error("🚫 Admin token invalid, logging out");
          localStorage.removeItem("admin_jwt");
          if (typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
            window.location.href = "/admin/login";
          } 
        }
      } catch (e) {
        console.error("Error handling 401:", e);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
export { api, BASE_URL };