import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";

export default function AdminSetup(){
  const { isAdmin, token, login: setAuth } = useAuth();
  const [hasAdmin, setHasAdmin] = useState(null);
  const [error, setError] = useState("");
  const [first, setFirst] = useState({ name:"Admin", email:"", password:"" });
  const [more,  setMore]  = useState({ name:"", email:"", password:"" });

  useEffect(()=>{ (async()=>{
    try { const { data } = await api.get("/auth/has-admin"); setHasAdmin(!!data?.hasAdmin); }
    catch { setHasAdmin(true); }
  })(); }, []);

  if (hasAdmin === null) return <div className="mx-auto max-w-screen-xl px-4 py-8">Loading…</div>;

  async function createFirst(e){
    e.preventDefault(); setError("");
    try{
      const { data } = await api.post("/auth/register-first-admin", first);
      if (data.ok && data.token){ setAuth(data.token, "admin"); window.location.href = "/admin/settings"; }
      else setError(data.error || "Failed");
    }catch(err){ setError(err.response?.data?.error || "Failed"); }
  }
  async function createMore(e){
    e.preventDefault(); setError("");
    try{ await api.post("/auth/create-admin", more, { headers:{ Authorization:`Bearer ${token}` }}); alert("Admin created"); setMore({ name:"", email:"", password:"" }); }
    catch(err){ setError(err.response?.data?.error || "Failed"); }
  }

  if (!hasAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-2">Create Admin</h1>
          <p className="text-gray-600 mb-5">First-time setup</p>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <form onSubmit={createFirst} className="space-y-3">
            <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" placeholder="Name"
                   value={first.name} onChange={e=>setFirst({...first, name:e.target.value})}/>
            <input type="email" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" placeholder="Email"
                   value={first.email} onChange={e=>setFirst({...first, email:e.target.value})}/>
            <input type="password" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" placeholder="Password (min 8)"
                   value={first.password} onChange={e=>setFirst({...first, password:e.target.value})}/>
            <button className="w-full px-4 py-2 rounded-lg bg-brand  font-semibold">Create Admin</button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-2">Add another Admin</h1>
        <p className="text-gray-600 mb-5">Only visible to signed-in admins</p>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <form onSubmit={createMore} className="space-y-3">
          <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" placeholder="Name"
                 value={more.name} onChange={e=>setMore({...more, name:e.target.value})}/>
          <input type="email" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" placeholder="Email"
                 value={more.email} onChange={e=>setMore({...more, email:e.target.value})}/>
          <input type="password" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" placeholder="Password (min 8)"
                 value={more.password} onChange={e=>setMore({...more, password:e.target.value})}/>
          <button className="w-full px-4 py-2 rounded-lg bg-brand  font-semibold">Create Admin</button>
        </form>
      </div>
    </div>
  );
}
