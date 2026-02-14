import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerAPI, CustomerOTPAPI } from "../api/customer";
import GoogleLoginButton from "../components/button/GoogleLoginButton";
import { KeyRound, User, Mail, Phone, Lock, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function CustomerAuth() {
  const { login, register } = useCustomer();
  const nav = useNavigate();
  const loc = useLocation();
  const next = loc.state?.next || "/";

  // --- VRINDAVAN THEME ASSETS ---
  const authBg = "url('/images-webp/auth-spiritual-bg.webp')"; 
  const mandalaBg = "url('/images-webp/homepage/mandala-bg.webp')";

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
    if (!phoneRegex.test(p)) return false;
    if (!['6', '7', '8', '9'].includes(p[0])) return false;
    if (/^(\d)\1{9}$/.test(p)) return false;
    const sequences = [
      '0123456789', '1234567890', '9876543210', '0987654321',
      '1111111111', '2222222222', '3333333333', '4444444444',
      '5555555555', '6666666666', '7777777777', '8888888888',
      '9999999999', '0000000000', '6854214574', '4574123456',
      '9988998899', '9879879878', '7897897897', '7778889997',
    ];
    if (sequences.includes(p)) return false;
    const uniqueDigits = new Set(p.split(''));
    if (uniqueDigits.size < 5) return false;
    const pairs = p.match(/(\d)\1/g) || [];
    if (pairs.length >= 4) return false;
    if (/(\d)\1{2}(\d)\2{2}/.test(p)) return false;
    if (/(\d)\1{3,}/.test(p)) return false;
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      const pendingItem = loc.state?.pendingItem;

      if (mode === "login") {
        if (!f.password || (!f.email && !f.phone)) {
          setErr("Enter password and either Email or Phone");
        } else {
          const res = await login({
            email: f.email || undefined,
            phone: f.phone || undefined,
            password: f.password,
          });

          if (pendingItem && res?.token) {
            try {
              await CustomerAPI.addToCart(res.token, {
                bookId: pendingItem.bookId,
                qty: pendingItem.qty
              });
            } catch (cartErr) {
              console.error("Failed to add pending item:", cartErr);
            }
          }
          nav(next, { replace: true });
        }

      } else {
        // SIGNUP Validation
        if (!f.name || !f.password || !f.email || !f.phone) {
          setErr("Name, Email, Phone number and Password are all required");
          setLoading(false);
          return;
        }
        if (!emailValid) {
          setErr("Please enter a valid email address");
          setLoading(false);
          return;
        }
        if (!phoneValid) {
          setErr("Please enter a valid Indian mobile number (starting with 6, 7, 8, or 9)");
          setLoading(false);
          return;
        }
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

        const res = await register({
          name: f.name,
          email: f.email,
          phone: f.phone,
          password: f.password,
          emailOtpTicket: f.emailOtpTicket,
        });

        if (pendingItem && res?.token) {
          try {
            await CustomerAPI.addToCart(res.token, {
              bookId: pendingItem.bookId,
              qty: pendingItem.qty
            });
          } catch (cartErr) {
            console.error("Failed to add pending item:", cartErr);
          }
        }
        nav(next, { replace: true });
      }
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Reusable styles for the "Liquid Glass" inputs
  const glassInputStyle = "w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#3E2723] placeholder-[#3E2723]/50 shadow-inner";

  return (
    <div className="min-h-screen grid place-items-center px-4 py-12 relative overflow-hidden font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723]">
      
      {/* --- Background Layers --- */}
      <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-100" 
          style={{
              backgroundImage: authBg,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }}
      />
      <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none"></div> {/* Slight dark overlay for contrast */}
      <div 
          className="absolute inset-0 opacity-10 pointer-events-none z-0 mix-blend-overlay" 
          style={{ backgroundImage: mandalaBg, backgroundSize: '600px', backgroundRepeat: 'repeat' }}
      ></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* --- LIQUID GLASS AUTH CARD --- */}
        <div className="bg-white/10 backdrop-blur-[20px] rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] p-8 border border-white/20 ring-1 ring-[#D4AF37]/20 relative overflow-hidden">
          
          {/* Top Decoration (Shiny edge) */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"></div>

          {/* Header */}
          <div className="mb-8 text-center relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-sm ring-1 ring-[#D4AF37]/20">
                <KeyRound className="w-6 h-6 text-[#D4AF37] drop-shadow-sm" />
            </div>
            <h1 className="text-3xl font-['Cinzel'] font-bold text-[#3E2723] mb-2 drop-shadow-sm">
              {mode === "login" ? "Welcome Back" : "Join the Family"}
            </h1>
            <p className="text-[#3E2723]/80 text-sm font-medium">
              {mode === "login"
                ? "Enter your details to access your sacred library."
                : "Create an account to start your journey."}
            </p>
          </div>

          {/* Google Login */}
          <div className="mb-6 relative z-10">
            <GoogleLoginButton />
          </div>

          <div className="relative mb-6 z-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3E2723]/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-[#3E2723]/70 font-['Cinzel'] font-bold tracking-widest backdrop-blur-md rounded">Or Continue With</span>
            </div>
          </div>

          {/* Tabs (Glassy) */}
          <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-xl mb-6 border border-white/20 relative z-10">
            <button 
                onClick={() => switchMode("login")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all font-['Cinzel'] ${
                    mode === "login" 
                    ? "bg-white/40 text-[#3E2723] shadow-sm border border-white/30 backdrop-blur-sm" 
                    : "text-[#3E2723]/70 hover:text-[#3E2723] hover:bg-white/10"
                }`}
            >
              Login
            </button>
            <button 
                onClick={() => switchMode("signup")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all font-['Cinzel'] ${
                    mode === "signup" 
                    ? "bg-white/40 text-[#3E2723] shadow-sm border border-white/30 backdrop-blur-sm" 
                    : "text-[#3E2723]/70 hover:text-[#3E2723] hover:bg-white/10"
                }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-5 relative z-10">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-[#3E2723] uppercase tracking-wide mb-1.5 ml-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3E2723]/60" />
                    <input
                    className={glassInputStyle}
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    autoFocus
                    required={mode === "signup"}
                    />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#3E2723] uppercase tracking-wide mb-1.5 ml-1">
                Email Address {mode === "signup" && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3E2723]/60" />
                <input
                  type="email"
                  className={`${glassInputStyle} pr-24 disabled:opacity-60`}
                  placeholder="name@example.com"
                  disabled={emailVerified}
                  value={form.email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  required={mode === "signup"}
                />
                
                {mode === "signup" && (
                  <button
                    type="button"
                    onClick={emailVerified ? undefined : sendEmailOtp}
                    disabled={otpSending || emailVerified || !emailValid || cooldown > 0}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-[#3E2723] hover:bg-white/40 disabled:opacity-50 transition-all uppercase tracking-wider backdrop-blur-sm"
                  >
                    {emailVerified ? "Verified" : cooldown > 0 ? `${cooldown}s` : emailOtpSent ? "Resend" : "Verify"}
                  </button>
                )}
              </div>

              {/* OTP Input (Glassy) */}
              {mode === "signup" && emailOtpSent && !emailVerified && (
                <div className="mt-3 flex gap-2 animate-fade-in-up">
                  <input
                    className={`flex-1 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#D4AF37] text-center tracking-widest font-bold text-[#3E2723] shadow-inner`}
                    placeholder="ENTER OTP"
                    value={form.emailOtp}
                    onChange={(e) => set("emailOtp", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={verifyEmailOtp}
                    disabled={otpVerifying || !form.emailOtp.trim()}
                    className="px-6 py-2.5 bg-[#3E2723]/90 text-[#F3E5AB] rounded-xl font-bold hover:bg-[#3E2723] disabled:opacity-50 transition-colors border border-[#D4AF37]/30 backdrop-blur-sm"
                  >
                    {otpVerifying ? "..." : "Confirm"}
                  </button>
                </div>
              )}

              {info && (
                <div className="mt-2 text-xs font-medium text-green-800 flex items-center gap-1 bg-green-100/50 backdrop-blur-sm p-2 rounded-lg border border-green-200/50">
                    <CheckCircle className="w-3 h-3" /> {info}
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-xs font-bold text-[#3E2723] uppercase tracking-wide mb-1.5 ml-1">
                Phone Number {mode === "signup" && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3E2723]/60" />
                <input
                    type="tel"
                    className={glassInputStyle}
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    set("phone", value);
                    }}
                    maxLength="10"
                    required={mode === "signup"}
                />
              </div>
              {mode === "signup" && form.phone && !phoneValid && (
                <p className="text-xs text-red-200 mt-1.5 ml-1 font-medium drop-shadow-sm">
                  {form.phone.length === 10
                    ? "Invalid number format. Must start with 6, 7, 8, or 9."
                    : "Please enter a valid 10-digit number."}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#3E2723] uppercase tracking-wide mb-1.5 ml-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3E2723]/60" />
                <input
                  type={showPwd ? "text" : "password"}
                  className={`${glassInputStyle} pr-16`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#3E2723]/70 hover:text-[#3E2723] uppercase tracking-wider"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-xs text-[#3E2723]/70 mt-1.5 ml-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> Minimum 6 characters
                </p>
              )}
            </div>

            {/* Confirm Password */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-[#3E2723] uppercase tracking-wide mb-1.5 ml-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3E2723]/60" />
                  <input
                    type={showPwd2 ? "text" : "password"}
                    className={`${glassInputStyle} pr-16`}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd2((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#3E2723]/70 hover:text-[#3E2723] uppercase tracking-wider"
                  >
                    {showPwd2 ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message (Glassy) */}
            {err && (
              <div className="p-3 bg-red-100/50 backdrop-blur-sm border border-red-200/50 rounded-xl text-red-800 text-sm flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {err}
              </div>
            )}

            {/* Submit Button (Premium Gold Glass) */}
            <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-4 bg-gradient-to-r from-[#C59D5F]/90 to-[#B0894C]/90 backdrop-blur-md text-white rounded-xl font-bold font-['Cinzel'] tracking-widest text-sm uppercase hover:from-[#D4AF37] hover:to-[#C59D5F] hover:shadow-[0_5px_15px_rgba(212,175,55,0.3)] transition-all transform active:scale-95 disabled:opacity-70 border border-[#D4AF37]/50 relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading 
                  ? "Processing..." 
                  : mode === "login" 
                      ? "Enter the Library" 
                      : "Create Account"
                }
              </span>
               {/* Shine effect on hover */}
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out z-0"></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}