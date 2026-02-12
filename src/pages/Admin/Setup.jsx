import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";

import {
  ShieldCheck,
  UserPlus,
  User,
  Mail,
  Lock,
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
        setHasAdmin(true); // Fallback: assume admin exists to prevent hijack
      }
    })();
  }, []);

  if (hasAdmin === null) return (
    <div className="h-screen flex items-center justify-center bg-[#F4F7F5]">
      <Loader2 className="w-8 h-8 text-[#1A3C34] animate-spin" />
    </div>
  );

  // If admins exist but user isn't logged in, redirect to login
  if (!isAdmin && hasAdmin) return <Navigate to="/admin/login" />;

  async function handleFirstAdmin(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post("/auth/register-first-admin", first);
      if (data.token) {
        setAuth(data.token, data.role);
        t.success("System Secured! Welcome Admin.");
        setHasAdmin(true);
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Setup failed");
      t.error("Setup failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateAdmin(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post("/auth/create-admin", more, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.ok) {
        t.success("New Admin Created!");
        setMore({ name: "", email: "", password: "" });
      }
    } catch (err) {
      t.error(err?.response?.data?.error || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7F5] p-6 md:p-12 flex items-center justify-center font-sans text-[#2C3E38]">
      
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* LEFT SIDE: Visuals & Info */}
        <div className="hidden lg:block space-y-8">
          <div>
            <div className="h-16 w-16 bg-[#1A3C34] rounded-2xl flex items-center justify-center shadow-xl mb-6">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-[#1A3C34] mb-4">
              {hasAdmin ? "Expand Your Team" : "Secure Your System"}
            </h1>
            <p className="text-[#5C756D] text-lg leading-relaxed">
              {hasAdmin 
                ? "Grant access to trusted team members. Administrators have full control over orders, inventory, and settings." 
                : "Create the first Master Administrator account to lock down the system and start managing your digital bookstore."}
            </p>
          </div>

          <div className="bg-[#1A3C34] p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
             {/* Decorative Background Circles */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>

             <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-7 h-7 text-white" />
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

        {/* RIGHT SIDE: Forms */}
        <div className="w-full">
          
          {/* CASE 1: NO ADMIN EXISTS (First Setup) */}
          {!hasAdmin ? (
            <Card title="Initialize System" icon={ShieldCheck}>
              <form onSubmit={handleFirstAdmin} className="space-y-5">
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100"><CheckCircle2 className="w-4 h-4"/> {error}</div>}
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5C756D] ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-[#8BA699] group-focus-within:text-[#1A3C34] transition-colors" />
                    <input 
                      className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none font-medium text-[#2C3E38]"
                      placeholder="e.g. John Doe"
                      value={first.name}
                      onChange={e => setFirst({...first, name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5C756D] ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[#8BA699] group-focus-within:text-[#1A3C34] transition-colors" />
                    <input 
                      type="email"
                      className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none font-medium text-[#2C3E38]"
                      placeholder="admin@kiddosintellect.com"
                      value={first.email}
                      onChange={e => setFirst({...first, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5C756D] ml-1">Master Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[#8BA699] group-focus-within:text-[#1A3C34] transition-colors" />
                    <input 
                      type="password"
                      className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none font-medium text-[#2C3E38]"
                      placeholder="••••••••••••"
                      value={first.password}
                      onChange={e => setFirst({...first, password: e.target.value})}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full bg-[#1A3C34] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#1A3C34]/20 hover:shadow-xl hover:bg-[#142E28] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  Create Master Account
                </button>
              </form>
            </Card>
          ) : (
            
            /* CASE 2: ADMIN LOGGED IN (Add More) */
            <Card title="Add New Administrator" icon={UserPlus}>
              <form onSubmit={handleCreateAdmin} className="space-y-5">
                <div className="p-4 bg-[#F4F7F5] rounded-xl border border-[#E3E8E5] mb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    <span className="font-bold text-[#1A3C34] text-sm">System Active</span>
                  </div>
                  <p className="text-xs text-[#5C756D] ml-8">You are logged in. Use this form to add more team members.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5C756D] ml-1">Name</label>
                  <div className="relative group">
                   
                    <input 
                      className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none font-medium text-[#2C3E38]"
                      placeholder="Name"
                      value={more.name}
                      onChange={e => setMore({...more, name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5C756D] ml-1">Email</label>
                  <div className="relative group">
                   
                    <input 
                      type="email"
                      className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none font-medium text-[#2C3E38]"
                      placeholder="Email"
                      value={more.email}
                      onChange={e => setMore({...more, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5C756D] ml-1">Password</label>
                  <div className="relative group">
                    
                    <input 
                      type="password"
                      className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none font-medium text-[#2C3E38]"
                      placeholder="Password"
                      value={more.password}
                      onChange={e => setMore({...more, password: e.target.value})}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full bg-[#1A3C34] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#1A3C34]/20 hover:shadow-xl hover:bg-[#142E28] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                  Create Admin
                </button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ FIXED: COMPONENT MOVED OUTSIDE THE MAIN FUNCTION
function Card({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-[#E3E8E5] rounded-3xl p-8 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24 text-[#1A3C34]" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-[#F4F7F5] text-[#1A3C34]">
            <Icon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#1A3C34] font-serif">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}