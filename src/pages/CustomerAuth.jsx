import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCustomer } from "../contexts/CustomerAuth";

export default function CustomerAuth() {
  const { login, register } = useCustomer();
  const nav = useNavigate();
  const loc = useLocation();
  const next = loc.state?.next || "/";

  const [mode, setMode] = useState("login");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") {
        if (!form.password || (!form.email && !form.phone)) {
          setErr("Enter password and either Email or Phone");
        } else {
          await login({
            email: form.email.trim() || undefined,
            phone: form.phone.trim() || undefined,
            password: form.password,
          });
          nav(next, { replace: true });
        }
      } else {
        if (!form.name || !form.password || (!form.email && !form.phone)) {
          setErr("Name, Password and either Email or Phone are required");
        } else {
          await register({
            name: form.name.trim(),
            email: form.email.trim() || undefined,
            phone: form.phone.trim() || undefined,
            password: form.password,
          });
          nav(next, { replace: true });
        }
      }
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-theme shadow-theme p-6 border border-border-subtle">
          {/* Header + tabs */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold">
              {mode === "login" ? "Login" : "Create account"}
            </h1>
            <p className="text-fg-subtle text-sm mt-1">
              {mode === "login"
                ? "Use your customer credentials to continue."
                : "Sign up to start shopping faster."}
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode("login")}
              className={`px-3 py-2 rounded-lg border ${mode === "login"
                  ? "bg-surface-subtle text-fg border-border"
                  : "bg-surface text-fg-subtle border-border-subtle hover:bg-surface-subtle"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`px-3 py-2 rounded-lg border ${mode === "signup"
                  ? "bg-surface-subtle text-fg border-border"
                  : "bg-surface text-fg-subtle border-border-subtle hover:bg-surface-subtle"
                }`}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  className="w-full"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="block text-sm mb-1">
                Email <span className="text-fg-subtle">(or leave blank and use phone)</span>
              </label>
              <input
                type="email"
                className="w-full"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                {...(mode === "login" && !form.phone ? { autoFocus: true } : {})}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Phone (optional)</label>
              <input
                className="w-full"
                placeholder="99999 99999"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  className="w-full pr-14"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md border bg-surface hover:bg-surface-subtle"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {err && (
              <div className="text-danger bg-danger-soft border border-danger/30 rounded-lg px-3 py-2 text-sm">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <div className="mt-4 text-xs text-fg-subtle text-center">
            By continuing you agree to our terms & privacy policy.
          </div>
        </div>
      </div>
    </div>
  );
}
