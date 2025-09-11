import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function PaymentsAdmin(){
  const [token] = useState(localStorage.getItem("admin_jwt") || "");
  const [providers, setProviders] = useState([
    { id:"razorpay", name:"Razorpay", enabled:false, config:{ keyId:"", keySecret:"" } },
    { id:"stripe",   name:"Stripe",   enabled:false, config:{ secretKey:"" } },
  ]);

  useEffect(()=>{ (async()=>{
    const { data } = await api.get("/settings", { headers:{ Authorization:`Bearer ${token}` }});
    if (data.ok && data.payments?.providers?.length) setProviders(data.payments.providers);
  })(); }, [token]);

  const save   = async () => { await api.put("/settings/payments", { providers }, { headers:{ Authorization:`Bearer ${token}` }}); alert("Payments saved"); };
  const toggle = (id) => setProviders(prev => prev.map(p => p.id===id ? {...p, enabled: !p.enabled} : p));
  const setCfg = (id, key, value) => setProviders(prev => prev.map(p => p.id===id ? {...p, config:{...p.config,[key]:value}} : p));

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {providers.map(p=>(
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{p.name}</div>
              <label className="flex items-center gap-2 text-sm select-none">
                <input type="checkbox" checked={!!p.enabled} onChange={()=>toggle(p.id)} className="h-4 w-4"/>
                <span>Enabled</span>
              </label>
            </div>
            {p.id === "razorpay" && (
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <Input label="Key ID" value={p.config?.keyId||""} onChange={v=>setCfg(p.id,"keyId",v)} />
                <Input label="Key Secret" value={p.config?.keySecret||""} onChange={v=>setCfg(p.id,"keySecret",v)} />
              </div>
            )}
            {p.id === "stripe" && (
              <div className="grid md:grid-cols-1 gap-3 mt-3">
                <Input label="Secret Key" value={p.config?.secretKey||""} onChange={v=>setCfg(p.id,"secretKey",v)} />
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={save} className="mt-6 px-5 py-2.5 rounded-lg bg-brand  font-semibold hover:brightness-110">Save</button>
    </div>
  );
}

function Input({label, value, onChange}){
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  );
}
