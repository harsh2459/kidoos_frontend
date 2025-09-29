import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { t } from "../../lib/toast";

export default function VisibilityAdmin(){
  const token = localStorage.getItem("admin_jwt") || "";
  const [publicNav, setPublicNav] = useState(["catalog","theme","admin","cart"]);
  const [pages, setPages] = useState({
    catalog:{public:true}, theme:{public:true}, adminLogin:{public:true}
  });

  useEffect(()=>{ (async()=>{
    const { data } = await api.get("/settings", { headers:{ Authorization:`Bearer ${token}` }});
    if (data.ok && data.visibility){
      setPublicNav(data.visibility.publicNav || publicNav);
      setPages(data.visibility.pages || pages);
    }
  })(); }, []);

  const togglePublic = (key) => setPages(p => ({ ...p, [key]: { public: !(p[key]?.public) }}));

  const save = async () => {
    await api.put("/settings/visibility", { publicNav, pages }, { headers:{ Authorization:`Bearer ${token}` }});
    t.ok("Saved");
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Visibility</h1>

      <div className="bg-card rounded-theme p-4 mb-6">
        <div className="font-semibold mb-2">Public Navbar</div>
        <p className="text-fg-muted text-sm mb-3">Visitors see items in this list (order matters):</p>
        <div className="flex flex-wrap gap-2">
          {publicNav.map((id, idx)=>(
            <span key={idx} className="px-3 py-1 bg-surface-subtle rounded-theme">{id}</span>
          ))}
        </div>
        <p className="text-fg-muted text-sm mt-3">Default: catalog, theme, admin, cart</p>
      </div>

      <div className="bg-card rounded-theme p-4">
        <div className="font-semibold mb-2">Pages</div>
        {["home","catalog","theme","cart","adminLogin","adminSetup"].map(key=>(
          <label key={key} className="flex items-center gap-3 py-1">
            <input type="checkbox" checked={!!pages[key]?.public} onChange={()=>togglePublic(key)} />
            <span>{key}</span>
          </label>
        ))}
      </div>

      <button onClick={save} className="mt-6 px-5 py-3 rounded-theme btn-primary">
        Save
      </button>
    </div>
  );
}
