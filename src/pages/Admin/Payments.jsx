// PaymentsAdmin.jsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function PaymentsAdmin(){
  const [token] = useState(localStorage.getItem("admin_jwt") || "");
  const [razorpay, setRazorpay] = useState({ enabled:false, config:{ keyId:"", keySecret:"" } });
  console.log(token);
  
  
  useEffect(()=>{ (async()=>{
    const { data } = await api.get("/settings", { headers:{ Authorization:`Bearer ${token}` }});
    if (data.ok) {
      const rp = (data.payments?.providers || []).find(p => p.id === "razorpay");
      if (rp) setRazorpay({ enabled: !!rp.enabled, config: { keyId: rp.config?.keyId || "", keySecret: rp.config?.keySecret || "" } });
    }
  })(); }, [token]);

  const save = async () => {
    await api.post("/settings/payments",
      { providers: [{ id:"razorpay", enabled: razorpay.enabled, config:{ keyId: razorpay.config.keyId, keySecret: razorpay.config.keySecret } }] },
      { headers:{ Authorization:`Bearer ${token}` } }
    );
    alert("Payments saved");
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Razorpay</div>
          <label className="flex items-center gap-2 text-sm select-none">
            <input type="checkbox"
                   checked={razorpay.enabled}
                   onChange={()=>setRazorpay(r=>({...r, enabled: !r.enabled}))}
                   className="h-4 w-4"/>
            <span>Enabled</span>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <Input label="Key ID" value={razorpay.config.keyId} onChange={v=>setRazorpay(r=>({...r, config:{...r.config, keyId:v}}))} />
          <Input label="Key Secret" value={razorpay.config.keySecret} onChange={v=>setRazorpay(r=>({...r, config:{...r.config, keySecret:v}}))} />
        </div>
      </div>

      <button onClick={save} className="mt-6 px-5 py-2.5 rounded-lg bg-brand font-semibold hover:brightness-110">Save</button>
    </div>
  );
}

function Input({label, value, onChange}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  );
}
