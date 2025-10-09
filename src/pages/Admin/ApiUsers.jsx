// src/pages/admin/ApiUsers.jsx - CORRECTED VERSION
import { useEffect, useState } from "react";
import { BlueDartAPI } from "../../api/bluedart";
import { useAuth } from "../../contexts/Auth";
import AdminTabs from "../../components/AdminTabs";
import { t } from "../../lib/toast";

export default function ApiUsers() {
  const { token } = useAuth();
  const auth = { 
    headers: { 
      Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` 
    } 
  };
  
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    id: null,
    label: "",           // ✅ Changed from 'name' to 'label'
    clientName: "",      // ✅ Added clientName
    shippingKey: "",     // ✅ Added API keys
    trackingKey: "",     // ✅ Added API keys
    isDefault: false,
    defaults: {
      weight: 0.5,
      length: 20,
      breadth: 15,
      height: 3
    },
    consigner: {         // ✅ Added consigner info
      name: "",
      address: "",
      city: "",
      pincode: "",
      phone: ""
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await BlueDartAPI.listProfiles(auth);
      console.log('✅ Profiles loaded:', data);
      setList(data.profiles || []);
    } catch (error) {
      console.error("❌ Load profiles error:", error);
      t.error("Failed to load BlueDart profiles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm({
      id: null,
      label: "",
      clientName: "",
      shippingKey: "",
      trackingKey: "",
      isDefault: false,
      defaults: {
        weight: 0.5,
        length: 20,
        breadth: 15,
        height: 3
      },
      consigner: {
        name: "",
        address: "",
        city: "",
        pincode: "",
        phone: ""
      }
    });
    setShowForm(true);
  }

  function openEdit(p) {
    setForm({
      id: p._id,
      label: p.label || "",
      clientName: p.clientName || "",
      shippingKey: p.shippingKey || "",
      trackingKey: p.trackingKey || "",
      isDefault: p.isDefault || false,
      defaults: p.defaults || {
        weight: 0.5,
        length: 20,
        breadth: 15,
        height: 3
      },
      consigner: p.consigner || {
        name: "",
        address: "",
        city: "",
        pincode: "",
        phone: ""
      }
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.label?.trim()) {
      t.error("Profile label is required");
      return;
    }
    if (!form.clientName?.trim()) {
      t.error("Client name is required");
      return;
    }
    if (!form.shippingKey?.trim()) {
      t.error("Shipping API key is required");
      return;
    }
    if (!form.trackingKey?.trim()) {
      t.error("Tracking API key is required");
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        label: form.label.trim(),
        clientName: form.clientName.trim(),
        shippingKey: form.shippingKey.trim(),
        trackingKey: form.trackingKey.trim(),
        isDefault: form.isDefault,
        defaults: form.defaults,
        consigner: form.consigner
      };

      if (form.id) {
        profileData._id = form.id;
      }

      console.log('💾 Saving profile:', profileData);
      await BlueDartAPI.saveProfile(profileData, auth);
      t.success(`Profile ${form.id ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      await load();
    } catch (error) {
      console.error("❌ Save profile error:", error);
      t.error(`Failed to ${form.id ? 'update' : 'create'} profile`);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id) {
    setShowConfirm(id);
  }

  async function confirmDelete() {
    if (!showConfirm) return;
    
    try {
      await BlueDartAPI.deleteProfile(showConfirm, auth);
      t.success("Profile deleted successfully");
      await load();
    } catch (error) {
      console.error("❌ Delete profile error:", error);
      t.error("Failed to delete profile");
    } finally {
      setShowConfirm(null);
    }
  }

  const validateForm = () => {
    return form.label?.trim() && 
           form.clientName?.trim() && 
           form.shippingKey?.trim() && 
           form.trackingKey?.trim() &&
           form.defaults.weight > 0 && 
           form.defaults.length > 0 && 
           form.defaults.breadth > 0 && 
           form.defaults.height > 0;
  };

  return (
    <div className="p-6 bg-surface-subtle min-h-screen">
      <AdminTabs />
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Profile?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this BlueDart profile? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-fg">BlueDart Shipping Profiles</h2>
            <p className="text-sm text-fg-subtle mt-1">
              Manage shipping profiles for BlueDart integration
            </p>
          </div>
          <button
            onClick={openNew}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Profile
          </button>
        </div>

        {/* Profile Form */}
        {showForm && (
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="border-b pb-4 mb-4">
              <h3 className="font-medium text-fg">
                {form.id ? "Edit Profile" : "New Profile"}
              </h3>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Label *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Default, Express, Standard"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.label}
                    onChange={(e) => setForm({...form, label: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SUR96891"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.clientName}
                    onChange={(e) => setForm({...form, clientName: e.target.value})}
                  />
                </div>
              </div>

              {/* API Keys */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping API Key *
                  </label>
                  <input
                    type="password"
                    placeholder="BlueDart shipping API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    value={form.shippingKey}
                    onChange={(e) => setForm({...form, shippingKey: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking API Key *
                  </label>
                  <input
                    type="password"
                    placeholder="BlueDart tracking API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                    value={form.trackingKey}
                    onChange={(e) => setForm({...form, trackingKey: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({...form, isDefault: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Default Profile</span>
                </label>
              </div>

              {/* Default Dimensions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Default Package Dimensions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={form.defaults.weight}
                      onChange={(e) => setForm({
                        ...form, 
                        defaults: {...form.defaults, weight: Number(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Length (cm) *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={form.defaults.length}
                      onChange={(e) => setForm({
                        ...form, 
                        defaults: {...form.defaults, length: Number(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Breadth (cm) *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="15"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={form.defaults.breadth}
                      onChange={(e) => setForm({
                        ...form, 
                        defaults: {...form.defaults, breadth: Number(e.target.value) || 0}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Height (cm) *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={form.defaults.height}
                      onChange={(e) => setForm({
                        ...form, 
                        defaults: {...form.defaults, height: Number(e.target.value) || 0}
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Consigner Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Consigner Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Company Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={form.consigner.name}
                      onChange={(e) => setForm({
                        ...form, 
                        consigner: {...form.consigner, name: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={form.consigner.phone}
                      onChange={(e) => setForm({
                        ...form, 
                        consigner: {...form.consigner, phone: e.target.value}
                      })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Address</label>
                    <textarea
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={form.consigner.address}
                      onChange={(e) => setForm({
                        ...form, 
                        consigner: {...form.consigner, address: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={form.consigner.city}
                      onChange={(e) => setForm({
                        ...form, 
                        consigner: {...form.consigner, city: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Pincode</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={form.consigner.pincode}
                      onChange={(e) => setForm({
                        ...form, 
                        consigner: {...form.consigner, pincode: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={save}
                disabled={saving || !validateForm()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : (form.id ? "Update Profile" : "Create Profile")}
              </button>
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Profiles List */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500">Loading profiles...</span>
                      </div>
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="text-gray-500 mb-2">No BlueDart profiles found</div>
                      <button onClick={openNew} className="text-blue-600 hover:text-blue-800 text-sm">
                        Create your first profile
                      </button>
                    </td>
                  </tr>
                ) : (
                  list.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          {String(p.label || "BD").slice(0, 2).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{p.label}</div>
                        <div className="text-sm text-gray-500">BlueDart Profile</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{p.clientName}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-900">
                        {p.defaults?.length || 20} × {p.defaults?.breadth || 15} × {p.defaults?.height || 3} cm
                        <div className="text-xs text-gray-500">{p.defaults?.weight || 0.5} kg</div>
                      </td>
                      <td className="px-6 py-4">
                        {p.isDefault ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                            Default
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          {!p.isDefault && (
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
