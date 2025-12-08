// src/pages/admin/Setup.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";

import {
  ShieldCheck,
  UserPlus,
  User,   // Added
  Mail,   // Added
  Lock,   // Added
  Loader2,
  CheckCircle2,
  Shield,
  Key,
  LayoutDashboard,
  FileText
} from "lucide-react";

export default function AdminSetup() {
  const { isAdmin, token, login: setAuth } = useAuth();
  const [hasAdmin, setHasAdmin] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Form States
  const [first, setFirst] = useState({ name: "Admin", email: "", password: "" });
  const [more, setMore] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/has-admin");
        setHasAdmin(!!data?.hasAdmin);
      } catch {
        setHasAdmin(true);
      }
    })();
  }, []);

  if (hasAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1A3C34]" />
      </div>
    );
  }

  // --- LOGIC: CREATE FIRST ADMIN ---
  async function createFirst(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { data } = await api.post("/auth/register-first-admin", first);
      if (data.ok && data.token) {
        setAuth(data.token, "admin");
        window.location.href = "/admin/settings";
      } else {
        setError(data.error || "Failed to register");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setSaving(false);
    }
  }

  // --- LOGIC: CREATE ADDITIONAL ADMIN ---
  async function createMore(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/auth/create-admin", more, { headers: { Authorization: `Bearer ${token}` } });
      t.ok(`Admin account created for ${more.name}`);
      setMore({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  }

  // Shared UI Components
  const FeatureItem = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-3 text-white/80">
      <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
        <Icon size={16} className="text-white" />
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );

  const InputField = ({ label, icon: Icon, type = "text", value, onChange, placeholder }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-[#5C756D]">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8BA699] group-focus-within:text-[#1A3C34] transition-colors">
          {/* Conditional check to prevent crash if icon is missing */}
          {Icon && <Icon size={18} />}
        </div>
        <input
          type={type}
          className="w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl pl-11 pr-4 py-3 text-sm text-[#1A3C34] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all placeholder:text-[#8BA699]"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );

  // --- VIEW 1: FIRST TIME SETUP (Centered Card) ---
  if (!hasAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9] p-6">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row border border-[#E3E8E5]">

          {/* Left: Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <div className="w-12 h-12 bg-[#E8F5E9] rounded-xl flex items-center justify-center mb-4 text-[#1A3C34]">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-3xl font-bold text-[#1A3C34] tracking-tight">System Setup</h1>
              <p className="text-[#5C756D] mt-2">Welcome! Create your root administrator account to initialize the dashboard.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2 animate-in fade-in">
                <Shield size={16} /> {error}
              </div>
            )}

            <form onSubmit={createFirst} className="space-y-5">
              <InputField label="Full Name" icon={User} value={first.name} onChange={e => setFirst({ ...first, name: e.target.value })} placeholder="e.g. John Doe" />
              <InputField label="Email Address" icon={Mail} value={first.email} onChange={e => setFirst({ ...first, email: e.target.value })} placeholder="admin@kiddosintellect.com" />
              <InputField label="Secure Password" icon={Lock} type="password" value={first.password} onChange={e => setFirst({ ...first, password: e.target.value })} placeholder="Min 8 characters" />

              <button
                disabled={saving}
                className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-xl bg-[#1A3C34] text-white font-bold text-sm hover:bg-[#2F523F] transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {saving ? "Initializing..." : "Complete Setup"}
              </button>
            </form>
          </div>

          {/* Right: Visual */}
          <div className="w-full md:w-1/2 bg-[#1A3C34] p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-6">Complete Control</h2>
              <div className="space-y-4">
                <FeatureItem icon={LayoutDashboard} text="Full Dashboard Access" />
                <FeatureItem icon={UserPlus} text="Manage Team Roles" />
                <FeatureItem icon={FileText} text="View Financial Reports" />
                <FeatureItem icon={Key} text="Configure API Keys" />
              </div>
            </div>

            <div className="relative z-10 mt-12">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-white/90 text-sm italic">"Security is not just a feature, it's the foundation of your store's operation."</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not logged in (for subsequent visits)
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  // --- VIEW 2: ADD ANOTHER ADMIN (Dashboard Layout) ---
  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3C34] tracking-tight">Access Control</h1>
          <p className="text-[#5C756D] mt-1 text-sm">Manage administrators and grant system access.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Form Card */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-[#FAFBF9] border-b border-[#E3E8E5] px-8 py-5 flex items-center gap-3">
              <div className="p-2 bg-[#E8F5E9] text-[#1A3C34] rounded-lg">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-[#1A3C34]">Add New Administrator</h2>
                <p className="text-xs text-[#5C756D]">Create a new account with full access privileges.</p>
              </div>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> {error}
                </div>
              )}

              <form onSubmit={createMore} className="space-y-6 max-w-2xl">
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Full Name" icon={User} value={more.name} onChange={e => setMore({ ...more, name: e.target.value })} placeholder="New Admin Name" />
                  <InputField label="Email Address" icon={Mail} value={more.email} onChange={e => setMore({ ...more, email: e.target.value })} placeholder="email@example.com" />
                </div>

                <InputField label="Temporary Password" icon={Lock} type="password" value={more.password} onChange={e => setMore({ ...more, password: e.target.value })} placeholder="Min 8 characters" />

                <div className="pt-4 border-t border-[#F4F7F5] flex items-center justify-between">
                  <p className="text-xs text-[#8BA699]">This user will have <span className="font-bold text-[#1A3C34]">Full Access</span> immediately.</p>
                  <button
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#1A3C34] text-white font-bold text-sm hover:bg-[#2F523F] transition-all shadow-md active:scale-95 disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {saving ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Info Panel */}
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <div className="bg-[#1A3C34] rounded-2xl shadow-lg p-8 text-white h-full relative overflow-hidden flex flex-col justify-center min-h-[400px]">
            {/* Decorative Blobs */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold mb-2">Administrator Privileges</h3>
              <p className="text-white/70 text-sm mb-8 leading-relaxed">
                New administrators will receive unrestricted access to the entire backend system. Please verify their identity before proceeding.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <LayoutDashboard className="w-5 h-5 text-[#86EFAC] mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Full Dashboard Access</h4>
                    <p className="text-xs text-white/60">View orders, revenue, and analytics.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <Key className="w-5 h-5 text-[#86EFAC] mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Security & API Keys</h4>
                    <p className="text-xs text-white/60">Manage payment gateways and secrets.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}