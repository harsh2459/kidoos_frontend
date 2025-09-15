// src/contexts/CustomerAuth.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const LS_KEY = "customer_jwt";

// MUST match your backend mount: app.use("/api/customer", customerRoutes)
const CUST_PREFIX =
  process.env.REACT_APP_CUST_API_PREFIX?.trim() || "/customer";

const withPrefix = (p) => `${CUST_PREFIX}${p}`;

const Ctx = createContext(null);

// Safe default so components don't crash if provider is missing
export const useCustomer = () =>
  useContext(Ctx) || {
    token: "",
    customer: null,
    isCustomer: false,
    loading: false,
    login: async () => { },
    register: async () => { },
    logout: () => { },
    setCustomer: () => { },
  };

// Try a few paths so it works whether your routes are /auth/login or /login
async function postWithFallback(paths, body, cfg) {
  let lastErr;
  for (const p of paths) {
    try {
      return await api.post(withPrefix(p), body, cfg);
    } catch (e) {
      // only swallow 404 to try the next variant
      if (e?.response?.status !== 404) throw e;
      lastErr = e;
    }
  }
  throw lastErr;
}

export default function CustomerProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(LS_KEY) || "");
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const isCustomer = Boolean(token && customer);

  // Attach token **only** for /customer/* requests so admin APIs are unaffected
  useEffect(() => {
    const id = api.interceptors.request.use((cfg) => {
      const url = String(cfg?.url || "");
      const targetIsCustomer =
        url.startsWith(CUST_PREFIX) || url.includes(`${CUST_PREFIX}/`);
      if (token && targetIsCustomer) {
        cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` };
      }
      return cfg;
    });
    return () => api.interceptors.request.eject(id);
  }, [token]);

  async function refresh() {
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get(withPrefix("/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomer(data?.customer || null);
    } catch {
      localStorage.removeItem(LS_KEY);
      setToken("");
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); /* eslint-disable-line */ }, []);

  async function login({ email, phone, password }) {
    const body = { email: email || undefined, phone: phone || undefined, password };
    const { data } = await postWithFallback(["/auth/login", "/login"], body);
    if (!data?.token) throw new Error(data?.error || "Login failed");
    localStorage.setItem(LS_KEY, data.token);
    setToken(data.token);
    setCustomer(data.customer || null);
    return data;
  }

  async function register({ name, email, phone, password, emailOtpTicket }) {
    const body = {
      name,
      email: email || undefined,
      phone: phone || undefined,
      password,
      emailOtpTicket,              // <-- forward the short-lived ticket
    };
    const { data } = await postWithFallback(["/auth/register", "/register"], body);
    if (!data?.token) throw new Error(data?.error || "Registration failed");
    localStorage.setItem(LS_KEY, data.token);
    setToken(data.token);
    setCustomer(data.customer || null);
    return data;
  }

  function logout() {
    localStorage.removeItem(LS_KEY);
    setToken("");
    setCustomer(null);
  }

  const value = useMemo(() => ({
    token, customer, isCustomer, loading,
    login, register, logout, setCustomer,
  }), [token, customer, isCustomer, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
