import { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("admin_jwt") || "");
  const [role, setRole] = useState(localStorage.getItem("admin_role") || "");

  const login = (t, r) => {
    localStorage.setItem("admin_jwt", t);
    if (r) localStorage.setItem("admin_role", r);
    setToken(t); setRole(r || "");
  };
  const logout = () => {
    localStorage.removeItem("admin_jwt");
    localStorage.removeItem("admin_role");
    setToken(""); setRole("");
    window.location.href = "/";
  };
  const isAdmin = role === "admin" || role === "editor";

  const value = useMemo(()=>({ token, role, isAdmin, login, logout }), [token, role, isAdmin]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
