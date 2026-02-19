// src/contexts/CustomerAuth.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { getAuthInstance, getGoogleProvider } from "../lib/firebase";
import { signInAnonymously } from "firebase/auth";
const LS_KEY = "customer_jwt";

// MUST match your backend mount: app.use("/api/customer", customerRoutes)
const CUST_PREFIX = process.env.REACT_APP_CUST_API_PREFIX?.trim() || "/customer";
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

  async function refresh() {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      // Use meta.auth to ensure proper token attachment
      const { data } = await api.get(withPrefix("/me"), {
        meta: { auth: "customer" },
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

  useEffect(() => {
    refresh();
  }, []);

  async function login({ email, phone, password }) {
    const body = {
      email: email || undefined,
      phone: phone || undefined,
      password
    };

    const { data } = await postWithFallback(["/auth/login", "/login"], body);

    if (!data?.token) {
      throw new Error(data?.error || "Login failed");
    }

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
      emailOtpTicket,
    };

    const { data } = await postWithFallback(["/auth/register", "/register"], body);

    if (!data?.token) {
      throw new Error(data?.error || "Registration failed");
    }

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

  const loginAnonymously = async () => {
    try {
      // 1. Initialize Auth (Fixes "auth is not defined" error)
      const auth = await getAuthInstance();
      
      // 2. Sign in to Firebase
      const result = await signInAnonymously(auth);
      
      // 3. Get the token
      const idToken = await result.user.getIdToken();

      // --- OPTION A: If your Backend exchanges Firebase Token for a Custom JWT (Recommended) ---
      // This ensures a user record is actually created in your database
      const { data } = await api.post(withPrefix("/auth/google"), { idToken }); 
      // ^ NOTE: We can often reuse the /auth/google endpoint if it just validates Firebase tokens, 
      // or create a specific /auth/anonymous endpoint.

      if (!data?.token) throw new Error("Backend sync failed");
      const finalToken = data.token;
      const finalCustomer = data.customer;

      /* --- OPTION B: If you just use the Firebase Token directly (Simpler) ---
      const finalToken = idToken;
      const finalCustomer = { id: result.user.uid, isAnonymous: true };
      */

      // 4. SAVE SESSION (Crucial! Otherwise refreshing the page logs them out)
      localStorage.setItem(LS_KEY, finalToken);
      setToken(finalToken);
      setCustomer(finalCustomer);

      return finalToken; 
    } catch (error) {
      console.error("Anonymous login failed", error);
      throw error;
    }
  };

  async function googleLogin() {
    try {
      // Lazy load Firebase only when Google login is triggered
      const { signInWithPopup } = await import("firebase/auth");
      const auth = await getAuthInstance();
      const googleProvider = await getGoogleProvider();

      // 1. Open Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Get Firebase ID token
      const idToken = await user.getIdToken();

      // 3. Send to YOUR backend
      const { data } = await api.post(withPrefix("/auth/google"), { idToken });

      if (!data?.token) {
        throw new Error(data?.error || "Google login failed");
      }

      // 4. Save YOUR JWT token
      localStorage.setItem(LS_KEY, data.token);
      setToken(data.token);
      setCustomer(data.customer || null);

      return data;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  }

  const value = useMemo(
    () => ({
      token,
      customer,
      isCustomer,
      loading,
      login,
      register,
      logout,
      googleLogin,
      setCustomer,
      loginAnonymously
    }),
    [token, customer, isCustomer, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}