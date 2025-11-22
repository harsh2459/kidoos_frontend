import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerOTPAPI } from "../api/customer";

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

  const RESEND_SECONDS = 45;
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  // Function to check if phone number is fake/invalid
  function isValidRealPhone(phone) {
    const p = phone.trim();

    // Must be exactly 10 digits
    if (!phoneRegex.test(p)) return false;

    // Indian phone numbers must start with 6, 7, 8, or 9
    if (!['6', '7', '8', '9'].includes(p[0])) return false;

    // Check for all same digits (0000000000, 1111111111, etc.)
    if (/^(\d)\1{9}$/.test(p)) return false;

    // Check for obvious sequential patterns
    const sequences = [
      '0123456789', '1234567890', '9876543210', '0987654321',
      '1111111111', '2222222222', '3333333333', '4444444444',
      '5555555555', '6666666666', '7777777777', '8888888888',
      '9999999999', '0000000000', '6854214574', '4574123456',
      '9988998899', '9879879878', '7897897897', '7778889997',
    ];
    if (sequences.includes(p)) return false;

    // Check if too few unique digits (less than 5 unique digits is suspicious)
    const uniqueDigits = new Set(p.split(''));
    if (uniqueDigits.size < 5) return false;

    // Check for repeated pairs (6677889900, 1122334455)
    // Must have at least 4 pairs to be considered fake
    const pairs = p.match(/(\d)\1/g) || [];
    if (pairs.length >= 4) return false;

    // Check for consecutive triples in sequence (like 666777888)
    if (/(\d)\1{2}(\d)\2{2}/.test(p)) return false;

    // Check for 4+ consecutive same digits (like 6666 or 7777)
    if (/(\d)\1{3,}/.test(p)) return false;

    // Check for ascending/descending sequences of 5+ digits
    let ascending = 0, descending = 0;
    for (let i = 1; i < p.length; i++) {
      if (parseInt(p[i]) === parseInt(p[i - 1]) + 1) ascending++;
      else ascending = 0;

      if (parseInt(p[i]) === parseInt(p[i - 1]) - 1) descending++;
      else descending = 0;

      if (ascending >= 4 || descending >= 4) return false;
    }

    return true;
  }

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
  const phoneValid = useMemo(() => {
    const p = (form.phone || "").trim();
    return phoneRegex.test(p) && isValidRealPhone(p);
  }, [form.phone]);

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
        setInfo("Email verified ✓");
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
        // SIGNUP - Both Email and Phone are REQUIRED
        if (!f.name || !f.password || !f.email || !f.phone) {
          setErr("Name, Email, Phone number and Password are all required");
          setLoading(false);
          return;
        }

        // Validate email format
        if (!emailValid) {
          setErr("Please enter a valid email address");
          setLoading(false);
          return;
        }

        // Validate phone number format
        if (!phoneValid) {
          setErr("Please enter a valid Indian mobile number (starting with 6, 7, 8, or 9)");
          setLoading(false);
          return;
        }

        // Email must be verified for signup
        if (!emailVerified) {
          setErr("Please verify your email before creating the account");
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

        await register({
          name: f.name,
          email: f.email,
          phone: f.phone,
          password: f.password,
          emailOtpTicket: f.emailOtpTicket,
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
    <div className="min-h-[70vh] grid place-items-center px-3 xs:px-4 sm:px-5 md:px-6 py-6 xs:py-7 sm:py-8 md:py-10 lg:py-12">
      <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg">
        <div className="bg-card rounded-theme shadow-theme p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 border border-border-subtle">
          {/* Header + tabs */}
          <div className="mb-3 xs:mb-4 sm:mb-5 md:mb-6">
            <h1 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold">
              {mode === "login" ? "Login" : "Create account"}
            </h1>
            <p className="text-fg-subtle text-xs xs:text-xs sm:text-sm md:text-sm mt-0.5 xs:mt-1">
              {mode === "login"
                ? "Use your customer credentials to continue."
                : "Sign up to start shopping faster."}
            </p>
          </div>

          <div className="flex gap-1.5 xs:gap-2 sm:gap-2 md:gap-3 mb-3 xs:mb-3.5 sm:mb-4">
            <button onClick={() => switchMode("login")}
              className={`px-2 xs:px-2.5 sm:px-3 md:px-4 py-1.5 xs:py-2 sm:py-2 md:py-2.5 rounded-lg border text-xs xs:text-xs sm:text-sm md:text-sm ${mode === "login" ? "bg-surface-subtle text-fg border-border" : "bg-surface text-fg-subtle border-border-subtle hover:bg-surface-subtle"}`}>
              Login
            </button>
            <button onClick={() => switchMode("signup")}
              className={`px-2 xs:px-2.5 sm:px-3 md:px-4 py-1.5 xs:py-2 sm:py-2 md:py-2.5 rounded-lg border text-xs xs:text-xs sm:text-sm md:text-sm ${mode === "signup" ? "bg-surface-subtle text-fg border-border" : "bg-surface text-fg-subtle border-border-subtle hover:bg-surface-subtle"}`}>
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3 xs:space-y-3.5 sm:space-y-4 md:space-y-5">
            {mode === "signup" && (
              <div>
                <label className="block text-xs xs:text-xs sm:text-sm md:text-sm mb-0.5 xs:mb-1 font-medium">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  className="w-full text-xs xs:text-xs sm:text-sm md:text-sm"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  autoFocus
                  required={mode === "signup"}
                />
              </div>
            )}

            <div>
              <label className="block text-xs xs:text-xs sm:text-sm md:text-sm mb-0.5 xs:mb-1 font-medium">
                Email {mode === "signup" && <span className="text-danger">*</span>}
              </label>

              <div className="relative">
                <input
                  type="email"
                  className="w-full pr-24 xs:pr-28 sm:pr-32 md:pr-36 text-xs xs:text-xs sm:text-sm md:text-sm"
                  placeholder="you@example.com"
                  disabled={emailVerified}
                  value={form.email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  required={mode === "signup"}
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
                    className="absolute right-0.5 xs:right-1 top-1/2 -translate-y-1/2 text-[10px] xs:text-xs sm:text-xs px-2 xs:px-2.5 sm:px-3 py-0.5 xs:py-1 rounded-md border bg-surface hover:bg-surface-subtle disabled:opacity-50"
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

              {mode === "signup" && emailOtpSent && !emailVerified && (
                <div className="mt-1.5 xs:mt-2 flex gap-1.5 xs:gap-2">
                  <input
                    className="flex-1 text-xs xs:text-xs sm:text-sm md:text-sm"
                    placeholder="Enter 6-digit code"
                    value={form.emailOtp}
                    onChange={(e) => set("emailOtp", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={verifyEmailOtp}
                    disabled={otpVerifying || !form.emailOtp.trim()}
                    className="px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 rounded-md border bg-surface hover:bg-surface-subtle disabled:opacity-50 text-xs xs:text-xs sm:text-sm"
                  >
                    {otpVerifying ? "Checking…" : "Submit OTP"}
                  </button>
                </div>
              )}

              {info && (
                <div className="mt-1 xs:mt-1.5 sm:mt-2 text-[10px] xs:text-xs sm:text-xs text-success">
                  {info}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs xs:text-xs sm:text-sm md:text-sm mb-0.5 xs:mb-1 font-medium">
                Phone Number {mode === "signup" && <span className="text-danger">*</span>}
              </label>
              <input
                type="tel"
                className="w-full text-xs xs:text-xs sm:text-sm md:text-sm"
                placeholder="9999999999"
                value={form.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  set("phone", value);
                }}
                maxLength="10"
                required={mode === "signup"}
              />
              {mode === "signup" && form.phone && !phoneValid && (
                <p className="text-[10px] xs:text-xs sm:text-xs text-danger mt-0.5 xs:mt-1">
                  {form.phone.length === 10
                    ? "Invalid phone number. Please enter a real mobile number starting with 6, 7, 8, or 9"
                    : "Please enter a valid 10-digit phone number"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs xs:text-xs sm:text-sm md:text-sm mb-0.5 xs:mb-1 font-medium">
                Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  className="w-full pr-12 xs:pr-14 sm:pr-16 text-xs xs:text-xs sm:text-sm md:text-sm"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-1 xs:right-2 top-1/2 -translate-y-1/2 text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md border bg-surface hover:bg-surface-subtle"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-[10px] xs:text-xs sm:text-xs text-fg-subtle mt-0.5 xs:mt-1">Minimum 6 characters</p>
              )}
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-xs xs:text-xs sm:text-sm md:text-sm mb-0.5 xs:mb-1 font-medium">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd2 ? "text" : "password"}
                    className="w-full pr-12 xs:pr-14 sm:pr-16 text-xs xs:text-xs sm:text-sm md:text-sm"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd2((s) => !s)}
                    className="absolute right-1 xs:right-2 top-1/2 -translate-y-1/2 text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md border bg-surface hover:bg-surface-subtle"
                  >
                    {showPwd2 ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            )}

            {err && (
              <div className="text-danger bg-danger-soft border border-danger/30 rounded-lg px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 text-xs xs:text-xs sm:text-sm">
                {err}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">
              {loading ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}