import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerOTPAPI } from "../api/customer"; // keep exact path/name
export default function CustomerAuth() {
  const { login, register } = useCustomer();
  const nav = useNavigate();
  const loc = useLocation();
  const next = loc.state?.next || "/";

  const [mode, setMode] = useState("login");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    emailOtp: "",
    emailOtpTicket: "",
  });

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // resend countdown state
  const RESEND_SECONDS = 45; // keep in sync with your backend RESEND_GAP_S
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function normalizeForm(f) {
    return {
      ...f,
      name: (f.name || "").trim(),
      email: (f.email || "").trim(),
      phone: (f.phone || "").trim(),
      password: f.password || "",
      confirmPassword: f.confirmPassword || "",
      emailOtp: (f.emailOtp || "").trim(),
      emailOtpTicket: f.emailOtpTicket || "",
    };
  }

  // cooldown tick
  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  function resetOtpFlow() {
    setEmailOtpSent(false);
    setEmailVerified(false);
    set("emailOtp", "");
    set("emailOtpTicket", "");
    setCooldown(0);
    setInfo("");
  }

  function onEmailChange(v) {
    set("email", v);
    // any edit to email invalidates previous ticket
    resetOtpFlow();
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setErr("");
    setInfo("");
    resetOtpFlow();
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      emailOtp: "",
      emailOtpTicket: "",
    });
  }

  const emailValid = useMemo(() => emailRegex.test((form.email || "").trim()), [form.email]);

  async function sendEmailOtp() {
    try {
      setErr("");
      setInfo("");
      const email = (form.email || "").trim();
      if (!email) return setErr("Enter email first");
      if (!emailValid) return setErr("Enter a valid email");
      setOtpSending(true);
      await CustomerOTPAPI.start(email);
      setEmailOtpSent(true);
      setInfo("Verification code sent to your email.");
      setCooldown(RESEND_SECONDS);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to send code");
    } finally {
      setOtpSending(false);
    }
  }

  async function verifyEmailOtp() {
    try {
      setErr("");
      setInfo("");
      const email = (form.email || "").trim();
      const code = (form.emailOtp || "").trim();
      if (!email || !code) return setErr("Enter email & OTP");
      setOtpVerifying(true);
      const { data } = await CustomerOTPAPI.verify(email, code);
      if (data?.ticket) {
        set("emailOtpTicket", data.ticket);
        setEmailVerified(true);
        setInfo("Email verified ✔");
      } else {
        setErr("Verification failed");
      }
    } catch (e) {
      setErr(e?.response?.data?.error || "Incorrect/expired code");
    } finally {
      setOtpVerifying(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");
    setLoading(true);
    try {
      const f = normalizeForm(form);

      if (mode === "login") {
        if (!f.password || (!f.email && !f.phone)) {
          setErr("Enter password and either Email or Phone");
        } else {
          await login({
            email: f.email || undefined,
            phone: f.phone || undefined,
            password: f.password,
          });
          nav(next, { replace: true });
        }
      } else {
        // SIGNUP
        if (!f.name || !f.password || (!f.email && !f.phone)) {
          setErr("Name, Password and either Email or Phone are required");
          setLoading(false);
          return;
        }
        if (f.password.length < 6) {
          setErr("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        if (f.password !== f.confirmPassword) {
          setErr("Passwords do not match");
          setLoading(false);
          return;
        }
        // If using email, it MUST be verified and must include a ticket
        if (f.email && !emailVerified) {
          setErr("Please verify your email before creating the account");
          setLoading(false);
          return;
        }

        await register({
          name: f.name,
          email: f.email || undefined,
          phone: f.phone || undefined,
          password: f.password,
          emailOtpTicket: f.email ? f.emailOtpTicket : undefined, // pass ticket when email signup
        });
        nav(next, { replace: true });
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
            <button onClick={() => switchMode("login")}
              className={`px-3 py-2 rounded-lg border ${mode === "login"
                ? "bg-surface-subtle text-fg border-border"
                : "bg-surface text-fg-subtle border-border-subtle hover:bg-surface-subtle"}`}>
              Login
            </button>
            <button onClick={() => switchMode("signup")}
              className={`px-3 py-2 rounded-lg border ${mode === "signup"
                ? "bg-surface-subtle text-fg border-border"
                : "bg-surface text-fg-subtle border-border-subtle hover:bg-surface-subtle"}`}>
              Sign up
            </button>
          </div>

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

              {/* Email + Verify/Resend button inline */}
              <div className="relative">
                <input
                  type="email"
                  className="w-full pr-32"
                  placeholder="you@example.com"
                  disabled={emailVerified}
                  value={form.email}
                  onChange={(e) => onEmailChange(e.target.value)}
                />
                {mode === "signup" && (
                  <button
                    type="button"
                    onClick={emailVerified ? undefined : sendEmailOtp}
                    disabled={
                      otpSending ||
                      emailVerified ||
                      !emailValid ||
                      cooldown > 0
                    }
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-xs px-3 py-1 rounded-md border bg-surface hover:bg-surface-subtle"
                    title={!emailValid ? "Enter a valid email" : ""}
                  >
                    {emailVerified
                      ? "Verified"
                      : cooldown > 0
                        ? `Resend (${cooldown}s)`
                        : emailOtpSent
                          ? "Resend"
                          : "Verify"}
                  </button>
                )}
              </div>

              {/* OTP input appears after we send and until verified */}
              {mode === "signup" && emailOtpSent && !emailVerified && (
                <div className="mt-2 flex gap-2">
                  <input
                    className="flex-1"
                    placeholder="Enter 6-digit code"
                    value={form.emailOtp}
                    onChange={(e) => set("emailOtp", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={verifyEmailOtp}
                    disabled={otpVerifying || !form.emailOtp.trim()}
                    className="px-3 py-2 rounded-md border bg-surface hover:bg-surface-subtle"
                  >
                    {otpVerifying ? "Checking…" : "Submit OTP"}
                  </button>
                </div>
              )}

              {/* Inline info */}
              {info && (
                <div className="mt-2 text-xs text-fg-subtle">
                  {info}
                </div>
              )}
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

            {mode === "signup" && (
              <div>
                <label className="block text-sm mb-1">Confirm password</label>
                <div className="relative">
                  <input
                    type={showPwd2 ? "text" : "password"}
                    className="w-full pr-16"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd2((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md border bg-surface hover:bg-surface-subtle"
                  >
                    {showPwd2 ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            )}

            {err && (
              <div className="text-danger bg-danger-soft border border-danger/30 rounded-lg px-3 py-2 text-sm">
                {err}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary">
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
