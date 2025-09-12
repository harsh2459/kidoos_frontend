import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import AdminTabs from "../../components/AdminTabs";

export default function ApiUsers() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    id: null, label: "", email: "", password: "", pickupLocation: "Default",
    defaults: { weight: 0.5, length: 20, breadth: 15, height: 3 }
  });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await api.get("/shiprocket/profiles", auth);
    setList(data.profiles || []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function openNew() {
    setForm({
      id: null, label: "", email: "", password: "", pickupLocation: "Default",
      defaults: { weight: 0.5, length: 20, breadth: 15, height: 3 }
    });
    setShowForm(true);
  }
  function openEdit(p) {
    setForm({
      id: p._id, label: p.label, email: p.email, password: "",
      pickupLocation: p.pickupLocation,
      defaults: p.defaults || { weight: 0.5, length: 20, breadth: 15, height: 3 }
    });
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (form.id) {
        const payload = {
          label: form.label,
          email: form.email,
          pickupLocation: form.pickupLocation,
          defaults: form.defaults,
        };
        if (form.password) payload.password = form.password;
        await api.put(`/shiprocket/profiles/${form.id}`, payload, auth);
      } else {
        await api.post("/shiprocket/profiles", {
          label: form.label, email: form.email, password: form.password,
          pickupLocation: form.pickupLocation, defaults: form.defaults
        }, auth);
      }
      setShowForm(false);
      await load();
    } finally { setSaving(false); }
  }
  async function activate(id) { await api.post(`/shiprocket/profiles/${id}/activate`, null, auth); await load(); }
  async function remove(id) { if (!window.confirm("Remove this profile?")) return; await api.delete(`/shiprocket/profiles/${id}`, auth); await load(); }
  async function refresh() {
    const active = list.find(p => p.active);
    if (!active?._id) return alert("No active profile.");
    await api.post(`/shiprocket/profiles/${active._id}/refresh-token`, null, auth);
    await load();
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <AdminTabs />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Shiprocket API Users</h1>
        <div className="flex gap-2">
          <button onClick={openNew} className="px-3 py-2 rounded-lg bg-brand  font-semibold">+ Add</button>
          <button onClick={refresh} className="px-3 py-2 rounded-lg border bg-surface hover:bg-surface-subtle">Refresh token</button>
        </div>
      </div>

      <div className="bg-surface border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-subtle text-fg">
              <tr className="bg-[#e3e3e3]">
                <th className="py-3 px-4">Label</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Pickup</th>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Active</th>
                <th className="py-3 px-4 w-56">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p, i) => (
                <tr key={p._id} className={i % 2 ? "bg-surface-subtle/60" : "bg-surface"}>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-brand/70  grid place-items-center text-[10px] font-semibold">
                        {String(p.label || "SR").slice(0,2).toUpperCase()}
                      </div>
                      <span className="font-medium">{p.label}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4">{p.email}</td>
                  <td className="py-2 px-4">{p.pickupLocation}</td>
                  <td className="py-2 px-4">{p.auth?.expiresAt ? new Date(p.auth.expiresAt).toLocaleString() : "—"}</td>
                  <td className="py-2 px-4">
                    {p.active
                      ? <span className="px-2 py-0.5 rounded-full text-xs bg-success-soft text-success border border-success/30">Active</span>
                      : <span className="text-fg-subtle text-xs">—</span>}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-2">
                      {!p.active && (
                        <button onClick={() => activate(p._id)} className="px-3 py-1.5 rounded-lg border bg-surface hover:bg-surface-subtle">
                          Set active
                        </button>
                      )}
                      <button onClick={() => openEdit(p)} className="px-3 py-1.5 rounded-lg border bg-surface hover:bg-surface-subtle">
                        Edit
                      </button>
                      <button onClick={() => remove(p._id)} className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-gray-500">No profiles yet. Click “Add”.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-surface border border-border-subtle rounded-xl shadow-xl w-[560px] max-w-[92vw]">
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-lg font-semibold">{form.id ? "Edit profile" : "Add profile"}</h2>
              <button onClick={() => setShowForm(false)} className="text-fg-subtle hover:text-fg">✕</button>
            </div>

            <div className="p-5 space-y-3">
              <input className="w-full bg-surface border border-border rounded-lg px-3 py-2" placeholder="Label (e.g., Main SR)"
                     value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
              <input className="w-full bg-surface border border-border rounded-lg px-3 py-2" placeholder="API Email"
                     value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                     placeholder={form.id ? "New password (leave blank to keep)" : "API Password"}
                     type="password" value={form.password}
                     onChange={e => setForm({ ...form, password: e.target.value })} />
              <input className="w-full bg-surface border border-border rounded-lg px-3 py-2" placeholder="Pickup Location"
                     value={form.pickupLocation} onChange={e => setForm({ ...form, pickupLocation: e.target.value })} />
              <div className="grid grid-cols-4 gap-2">
                {["weight","length","breadth","height"].map(k => (
                  <input key={k} type="number" className="bg-surface border border-border rounded-lg px-3 py-2"
                         value={form.defaults[k]}
                         onChange={e => setForm({ ...form, defaults: { ...form.defaults, [k]: Number(e.target.value) || 0 } })}
                         placeholder={k}/>
                ))}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-3 py-2 rounded-lg border bg-surface hover:bg-surface-subtle">Cancel</button>
              <button disabled={saving} onClick={save}
                      className="px-4 py-2 rounded-lg bg-brand  font-semibold hover:brightness-110">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
