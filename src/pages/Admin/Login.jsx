// src/pages/admin/Login.jsx
import { useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight
} from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login: setAuth } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.ok && data.token) {
        localStorage.setItem("admin_jwt", data.token);
        t.ok("Logged in successfully");
        setAuth(data.token, data.role);
        window.location.href = "/admin/orders";
      } else {
        setError("Invalid credentials provided.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login connection failed");
    } finally {
      setLoading(false);
    }
  }

  // Shared Styles
  const inputClass = "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl pl-11 pr-11 py-3.5 text-sm text-[#384959] focus:outline-none focus:ring-2 focus:ring-[#88BDF2]/30 focus:border-[#88BDF2] transition-all placeholder:text-[#8BA699]";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-1.5 ml-1";

  return (
    <div className="min-h-screen flex justify-center bg-[#FAFBF9] px-4">
      <div className="w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-white border border-[#E3E8E5] rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#384959] px-8 py-10 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-inner text-center">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
              <p className="text-white/60 text-sm mt-2">Secure access for store management</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            <form onSubmit={submit} className="space-y-6">

              {/* Email Input */}
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8BA699] group-focus-within:text-[#00ADB5] transition-colors">

                  </div>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="admin@kiddosintellect.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8BA699] group-focus-within:text-[#00ADB5] transition-colors">

                  </div>
                  <input
                    type={showPwd ? "text" : "password"}
                    className={inputClass}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8BA699] hover:text-[#88BDF2] transition-colors focus:outline-none"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="p-1 bg-red-100 rounded-full mt-0.5">
                    <ShieldCheck size={12} className="text-red-600" />
                  </div>
                  <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  group w-full flex items-center justify-center gap-2 py-4 rounded-xl 
                  bg-[#384959] text-white font-bold text-sm shadow-lg shadow-[#384959]/20 
                  hover:bg-[#6A89A7] hover:shadow-xl hover:-translate-y-0.5 
                  active:translate-y-0 active:scale-95 transition-all duration-200
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
                "
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}