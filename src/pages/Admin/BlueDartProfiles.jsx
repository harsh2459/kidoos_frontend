// src/pages/Admin/BlueDartProfiles.jsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";

export default function BlueDartProfiles() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    id: null,
    label: "",
    clientName: "",
    shippingKey: "",
    trackingKey: "",
    isDefault: false,
    defaults: { weight: 0.5, length: 20, breadth: 15, height: 3 },
    // ✅ ADDED: Consigner (Pickup Address) State
    consigner: {
      name: "",
      address: "",
      address2: "",
      address3: "",
      pincode: "",
      phone: "",
      mobile: "",
      email: ""
    }
  });
  
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/bluedart-profiles", auth);
      setList(data.profiles || []);
    } catch (e) {
      // t.err("Failed to load profiles");
      console.error(e);
    }
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm({
      id: null,
      label: "",
      clientName: "",
      shippingKey: "",
      trackingKey: "",
      isDefault: false,
      defaults: { weight: 0.5, length: 20, breadth: 15, height: 3 },
      consigner: { name: "", address: "", address2: "", address3: "", pincode: "", phone: "", mobile: "", email: "" }
    });
    setShowForm(true);
  }

  function openEdit(p) {
    setForm({
      id: p._id,
      label: p.label,
      clientName: p.clientName,
      shippingKey: p.shippingKey,
      trackingKey: p.trackingKey,
      isDefault: p.isDefault,
      defaults: p.defaults || { weight: 0.5, length: 20, breadth: 15, height: 3 },
      // ✅ Load existing consigner data
      consigner: p.consigner || { name: "", address: "", address2: "", address3: "", pincode: "", phone: "", mobile: "", email: "" }
    });
    setShowForm(true);
  }

  async function save() {
    // Basic validation
    if (!form.label || !form.clientName || !form.shippingKey || !form.consigner.pincode || !form.consigner.mobile) {
      t.warn("Please fill required fields (Label, Client Name, Keys, Pincode, Mobile)");
      return;
    }

    setSaving(true);
    try {
      await api.post("/bluedart-profiles", {
        _id: form.id || undefined,
        label: form.label,
        clientName: form.clientName,
        shippingKey: form.shippingKey,
        trackingKey: form.trackingKey,
        isDefault: form.isDefault,
        defaults: form.defaults,
        consigner: form.consigner // ✅ Send consigner data
      }, auth);

      t.ok(form.id ? "Profile updated" : "Profile created");
      setShowForm(false);
      await load();
    } catch (e) {
      t.err(e.response?.data?.error || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this BlueDart profile?")) return;
    try {
      await api.delete(`/bluedart-profiles/${id}`, auth);
      t.ok("Profile deleted");
      await load();
    } catch (e) {
      t.err("Failed to delete profile");
    }
  }

  // Helper to update nested consigner state
  const setConsigner = (field, value) => {
    setForm(prev => ({
      ...prev,
      consigner: { ...prev.consigner, [field]: value }
    }));
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">BlueDart Profiles</h1>
          <p className="text-fg-muted text-sm mt-1">Manage API credentials & Pickup Locations</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          + Add Profile
        </button>
      </div>

      {/* Table Section - Kept same as before */}
      <div className="bg-surface border border-border-subtle rounded-xl shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-surface-subtle">
            <tr>
              <th className="py-3 px-4 text-left">Label</th>
              <th className="py-3 px-4 text-left">Client/Location</th>
              <th className="py-3 px-4 text-left">Pincode</th>
              <th className="py-3 px-4 text-left">Default</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-fg-muted">No profiles found.</td></tr>
            ) : (
              list.map((p, i) => (
                <tr key={p._id} className={i % 2 ? "bg-surface-subtle/60" : "bg-surface"}>
                  <td className="py-2 px-4 font-medium">{p.label}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-col">
                      <span>{p.clientName}</span>
                      <span className="text-xs text-fg-muted">{p.consigner?.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4">{p.consigner?.pincode || "—"}</td>
                  <td className="py-2 px-4">
                    {p.isDefault && <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Default</span>}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => remove(p._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 overflow-y-auto py-10">
          <div className="bg-surface border border-border-subtle rounded-xl shadow-xl w-[700px] max-w-[95vw] my-auto">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface sticky top-0">
              <h2 className="text-lg font-semibold">{form.id ? "Edit Profile" : "Add Profile"}</h2>
              <button onClick={() => setShowForm(false)} className="text-xl">×</button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* SECTION 1: CREDENTIALS */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-fg-muted tracking-wider border-b pb-1">1. API Credentials</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Profile Label *</label>
                    <input className="w-full border rounded p-2" placeholder="e.g. Main Warehouse" value={form.label} onChange={e => setForm({...form, label: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Client Name (ID) *</label>
                    <input className="w-full border rounded p-2" placeholder="e.g. SUR96891" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 mt-8">
                      <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} />
                      <span className="text-sm font-medium">Set as Default Profile</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Shipping API Key *</label>
                    <input type="password" className="w-full border rounded p-2" value={form.shippingKey} onChange={e => setForm({...form, shippingKey: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tracking API Key</label>
                    <input type="password" className="w-full border rounded p-2" value={form.trackingKey} onChange={e => setForm({...form, trackingKey: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PICKUP ADDRESS (CONSIGNER) - ✅ NEW SECTION */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-fg-muted tracking-wider border-b pb-1">2. Pickup Address (Consigner)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Shipper Name / Company *</label>
                    <input className="w-full border rounded p-2" placeholder="Your Company Name" value={form.consigner.name} onChange={e => setConsigner('name', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                    <input className="w-full border rounded p-2" placeholder="Shop/Building No, Street" value={form.consigner.address} onChange={e => setConsigner('address', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address Line 2</label>
                    <input className="w-full border rounded p-2" placeholder="Area / Colony" value={form.consigner.address2} onChange={e => setConsigner('address2', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address Line 3 (City/Landmark)</label>
                    <input className="w-full border rounded p-2" placeholder="City" value={form.consigner.address3} onChange={e => setConsigner('address3', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pincode *</label>
                    <input className="w-full border rounded p-2" placeholder="6-digit Pincode" maxLength="6" value={form.consigner.pincode} onChange={e => setConsigner('pincode', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mobile Number *</label>
                    <input className="w-full border rounded p-2" placeholder="For delivery updates" value={form.consigner.mobile} onChange={e => setConsigner('mobile', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input className="w-full border rounded p-2" value={form.consigner.email} onChange={e => setConsigner('email', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* SECTION 3: DEFAULT DIMENSIONS */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-fg-muted tracking-wider border-b pb-1">3. Default Package Settings</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-fg-muted mb-1">Weight (kg)</label>
                    <input type="number" step="0.1" className="w-full border rounded p-2" value={form.defaults.weight} onChange={e => setForm({...form, defaults: {...form.defaults, weight: Number(e.target.value)}})} />
                  </div>
                  <div>
                    <label className="block text-xs text-fg-muted mb-1">Length (cm)</label>
                    <input type="number" className="w-full border rounded p-2" value={form.defaults.length} onChange={e => setForm({...form, defaults: {...form.defaults, length: Number(e.target.value)}})} />
                  </div>
                  <div>
                    <label className="block text-xs text-fg-muted mb-1">Breadth (cm)</label>
                    <input type="number" className="w-full border rounded p-2" value={form.defaults.breadth} onChange={e => setForm({...form, defaults: {...form.defaults, breadth: Number(e.target.value)}})} />
                  </div>
                  <div>
                    <label className="block text-xs text-fg-muted mb-1">Height (cm)</label>
                    <input type="number" className="w-full border rounded p-2" value={form.defaults.height} onChange={e => setForm({...form, defaults: {...form.defaults, height: Number(e.target.value)}})} />
                  </div>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-border-subtle flex justify-end gap-3 bg-surface sticky bottom-0">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button disabled={saving} onClick={save} className="btn-primary min-w-[100px]">{saving ? "Saving..." : "Save Profile"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}