// src/pages/Admin/BlueDartProfiles.jsx - NEW FILE
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
    defaults: { weight: 0.5, length: 20, breadth: 15, height: 3 }
  });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/bluedart/profiles", auth);
      setList(data.profiles || []);
    } catch (e) {
      t.err("Failed to load profiles");
      console.error(e);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  function openNew() {
    setForm({
      id: null,
      label: "",
      clientName: "",
      shippingKey: "",
      trackingKey: "",
      isDefault: false,
      defaults: { weight: 0.5, length: 20, breadth: 15, height: 3 }
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
      defaults: p.defaults || { weight: 0.5, length: 20, breadth: 15, height: 3 }
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.label || !form.clientName || !form.shippingKey || !form.trackingKey) {
      t.warn("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      await api.post("/bluedart/profiles", {
        _id: form.id || undefined,
        label: form.label,
        clientName: form.clientName,
        shippingKey: form.shippingKey,
        trackingKey: form.trackingKey,
        isDefault: form.isDefault,
        defaults: form.defaults
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
      await api.delete(`/bluedart/profiles/${id}`, auth);
      t.ok("Profile deleted");
      await load();
    } catch (e) {
      t.err("Failed to delete profile");
    }
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">BlueDart Profiles</h1>
          <p className="text-fg-muted text-sm mt-1">Manage BlueDart API credentials and settings</p>
        </div>
        <button onClick={openNew} className="btn-primary">
          + Add Profile
        </button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-subtle">
            <tr>
              <th className="py-3 px-4 text-left">Label</th>
              <th className="py-3 px-4 text-left">Client Name</th>
              <th className="py-3 px-4 text-left">Shipping Key</th>
              <th className="py-3 px-4 text-left">Default</th>
              <th className="py-3 px-4 text-left">Defaults (W/L/B/H)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-fg-muted">
                  No profiles yet. Add your first BlueDart profile to start shipping.
                </td>
              </tr>
            ) : (
              list.map((p, i) => (
                <tr key={p._id} className={i % 2 ? "bg-surface-subtle/60" : "bg-surface"}>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-brand/20 grid place-items-center text-xs font-semibold text-brand">
                        {String(p.label || "BD").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium">{p.label}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4">{p.clientName}</td>
                  <td className="py-2 px-4">
                    <code className="text-xs bg-surface-subtle px-2 py-1 rounded">
                      {p.shippingKey.slice(0, 8)}...
                    </code>
                  </td>
                  <td className="py-2 px-4">
                    {p.isDefault ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-success-soft text-success border border-success/30">
                        Default
                      </span>
                    ) : (
                      <span className="text-fg-subtle text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-xs text-fg-muted">
                    {p.defaults?.weight || 0.5} / {p.defaults?.length || 20} / 
                    {p.defaults?.breadth || 15} / {p.defaults?.height || 3}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1.5 rounded-lg border bg-surface hover:bg-surface-subtle text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p._id)}
                        className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-surface border border-border-subtle rounded-xl shadow-xl w-[600px] max-w-[92vw]">
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {form.id ? "Edit BlueDart Profile" : "Add BlueDart Profile"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-fg-subtle hover:text-fg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium mb-1">Profile Label *</label>
                <input
                  className="w-full"
                  placeholder="e.g., Main BlueDart Account"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Client Name *</label>
                <input
                  className="w-full"
                  placeholder="Your BlueDart client name"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                />
                <p className="text-xs text-fg-muted mt-1">
                  This is provided by BlueDart (e.g., SUR96891)
                </p>
              </div>

              {/* Shipping Key */}
              <div>
                <label className="block text-sm font-medium mb-1">Shipping API Key *</label>
                <input
                  type="password"
                  className="w-full"
                  placeholder="Your BlueDart shipping API key"
                  value={form.shippingKey}
                  onChange={(e) => setForm({ ...form, shippingKey: e.target.value })}
                />
                <p className="text-xs text-fg-muted mt-1">
                  Used for creating shipments, scheduling pickups, etc.
                </p>
              </div>

              {/* Tracking Key */}
              <div>
                <label className="block text-sm font-medium mb-1">Tracking API Key *</label>
                <input
                  type="password"
                  className="w-full"
                  placeholder="Your BlueDart tracking API key"
                  value={form.trackingKey}
                  onChange={(e) => setForm({ ...form, trackingKey: e.target.value })}
                />
                <p className="text-xs text-fg-muted mt-1">
                  Used for tracking shipments
                </p>
              </div>

              {/* Default Checkbox */}
              <div>
                <label className="flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Set as default profile</span>
                </label>
                <p className="text-xs text-fg-muted mt-1">
                  The default profile will be used for all shipments unless specified otherwise
                </p>
              </div>

              {/* Default Dimensions */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Default Package Dimensions
                </label>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-fg-muted mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full"
                      value={form.defaults.weight}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          defaults: { ...form.defaults, weight: Number(e.target.value) || 0 }
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-fg-muted mb-1">Length (cm)</label>
                    <input
                      type="number"
                      className="w-full"
                      value={form.defaults.length}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          defaults: { ...form.defaults, length: Number(e.target.value) || 0 }
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-fg-muted mb-1">Breadth (cm)</label>
                    <input
                      type="number"
                      className="w-full"
                      value={form.defaults.breadth}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          defaults: { ...form.defaults, breadth: Number(e.target.value) || 0 }
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-fg-muted mb-1">Height (cm)</label>
                    <input
                      type="number"
                      className="w-full"
                      value={form.defaults.height}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          defaults: { ...form.defaults, height: Number(e.target.value) || 0 }
                        })
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-fg-muted mt-2">
                  These will be used when order doesn't specify package dimensions
                </p>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={save}
                className="btn-primary"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}