// src/pages/admin/ApiUsers.jsx
import { useEffect, useState } from "react";
import { BlueDartAPI } from "../../api/bluedart";
import { api } from "../../api/client"; 
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";
import { 
    Truck, Plus, Edit3, Trash2, Save, X, Loader2, Package, 
    MapPin, Key, CheckCircle2, AlertTriangle, Building2, 
    Copy, Eye, EyeOff, Box, Star, Rocket, RefreshCw, Zap
} from "lucide-react";

// ✅ Shiprocket API calls
const ShiprocketProfileAPI = {
    list: (auth) => api.get("/shiprocket/profiles", auth),
    save: (data, auth) => {
        if (data._id) return api.put(`/shiprocket/profiles/${data._id}`, data, auth);
        return api.post("/shiprocket/profiles", data, auth);
    },
    delete: (id, auth) => api.delete(`/shiprocket/profiles/${id}`, auth),
    activate: (id, auth) => api.post(`/shiprocket/profiles/${id}/activate`, {}, auth),
    test: (id, auth) => api.post(`/shiprocket/profiles/${id}/test`, {}, auth),
};

export default function ApiUsers() {
    const { token } = useAuth();
    const auth = {
        headers: {
            Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}`
        }
    };

    const [activeService, setActiveService] = useState("bluedart"); // 'bluedart' | 'shiprocket'

    // --- STATE ---
    const [bdList, setBdList] = useState([]);
    const [bdLoading, setBdLoading] = useState(true);
    const [bdEditing, setBdEditing] = useState(null);

    const [srList, setSrList] = useState([]);
    const [srLoading, setSrLoading] = useState(true);
    const [srEditing, setSrEditing] = useState(null);
    const [testingConnection, setTestingConnection] = useState(null);

    const [showConfirm, setShowConfirm] = useState(null);

    async function loadAll() {
        setBdLoading(true);
        setSrLoading(true);
        
        BlueDartAPI.listProfiles(auth)
            .then(({ data }) => setBdList(data.profiles || []))
            .catch(() => t.error("Failed to load BlueDart profiles"))
            .finally(() => setBdLoading(false));

        ShiprocketProfileAPI.list(auth)
            .then(({ data }) => setSrList(data.profiles || []))
            .catch((e) => console.error("Failed to load Shiprocket profiles", e))
            .finally(() => setSrLoading(false));
    }

    useEffect(() => { loadAll(); }, []);

    // --- HANDLERS ---
    function openBdNew() {
        setBdEditing({
            _id: null,
            label: "",
            clientName: "",
            shippingKey: "",
            trackingKey: "",
            isDefault: false,
            defaults: { weight: 0.3, length: 20, breadth: 15, height: 3 },
            consigner: { name: "", address: "", city: "", pincode: "", phone: "" }
        });
    }

    function openSrNew() {
        setSrEditing({
            _id: null,
            label: "",
            email: "",
            password: "",
            pickupLocation: "Primary",
            defaults: { weight: 0.3, length: 20, breadth: 15, height: 3 },
            active: false
        });
    }

    async function handleSrActivate(id) {
        try {
            await ShiprocketProfileAPI.activate(id, auth);
            t.success("Profile Activated");
            loadAll();
        } catch (e) {
            t.error(e.response?.data?.error || "Activation failed");
        }
    }

    async function handleSrTest(id) {
        setTestingConnection(id);
        try {
            await ShiprocketProfileAPI.test(id, auth);
            t.success("Connection Successful! Credentials valid.");
        } catch (e) {
            t.error(e.response?.data?.error || "Connection Failed");
        } finally {
            setTestingConnection(null);
        }
    }

    function handleDelete(type, id) { setShowConfirm({ type, id }); }

    async function confirmDelete() {
        if (!showConfirm) return;
        try {
            if (showConfirm.type === 'bd') await BlueDartAPI.deleteProfile(showConfirm.id, auth);
            else await ShiprocketProfileAPI.delete(showConfirm.id, auth);
            
            t.success("Profile deleted successfully");
            await loadAll();
        } catch (error) {
            t.error("Failed to delete profile");
        } finally {
            setShowConfirm(null);
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        t.success("Copied to clipboard");
    };

    return (
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#384959] tracking-tight">Shipping Profiles</h1>
                    <p className="text-[#5C756D] mt-1 text-sm">Manage API credentials for your courier partners.</p>
                </div>
                <button 
                    onClick={activeService === 'bluedart' ? openBdNew : openSrNew} 
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#384959] text-white font-bold text-sm hover:bg-[#6A89A7] shadow-md transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Add {activeService === 'bluedart' ? 'BlueDart' : 'Shiprocket'} Profile
                </button>
            </div>

            {/* Service Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[#E3E8E5]">
                <button
                    onClick={() => setActiveService("bluedart")}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all ${
                        activeService === "bluedart" 
                        ? "border-[#384959] text-[#384959]" 
                        : "border-transparent text-[#8BA699] hover:text-[#384959]"
                    }`}
                >
                    <Truck className="w-4 h-4" /> BlueDart
                </button>
                <button
                    onClick={() => setActiveService("shiprocket")}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all ${
                        activeService === "shiprocket" 
                        ? "border-[#384959] text-[#384959]" 
                        : "border-transparent text-[#8BA699] hover:text-[#384959]"
                    }`}
                >
                    <Rocket className="w-4 h-4" /> Shiprocket
                </button>
            </div>

            {/* --- BLUEDART LIST --- */}
            {activeService === "bluedart" && (
                <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#FAFBF9] text-[#5C756D] font-bold uppercase text-xs tracking-wider border-b border-[#E3E8E5]">
                                <tr>
                                    <th className="py-4 px-6">Profile Name</th>
                                    <th className="py-4 px-4">Client ID</th>
                                    <th className="py-4 px-4 hidden lg:table-cell">Default Package</th>
                                    <th className="py-4 px-4 hidden md:table-cell">Consigner</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 px-6 text-right w-[160px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F4F7F5]">
                                {bdLoading ? (
                                    <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#384959]" /></td></tr>
                                ) : bdList.length === 0 ? (
                                    <tr><td colSpan={6} className="py-20 text-center text-[#5C756D]"><p>No BlueDart profiles found.</p></td></tr>
                                ) : bdList.map((p) => (
                                    <tr key={p._id} className="group hover:bg-[#FAFBF9] transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${p.isDefault ? "bg-[#384959] text-white border-[#384959]" : "bg-[#E8F5E9] text-[#384959] border-[#C8E6C9]"}`}>
                                                    {p.isDefault ? <Star className="w-4 h-4 fill-current" /> : String(p.label).slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#384959]">{p.label}</div>
                                                    {p.isDefault && <span className="text-[10px] font-bold text-[#5C756D]">Primary Account</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="group/copy flex items-center gap-2">
                                                <div className="font-mono text-xs text-[#384959] bg-[#F4F7F5] px-2 py-1 rounded-md border border-[#E3E8E5]">{p.clientName}</div>
                                                <button onClick={() => copyToClipboard(p.clientName)} className="text-[#8BA699] hover:text-[#384959] opacity-0 group-hover/copy:opacity-100 transition-opacity"><Copy size={12} /></button>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 hidden lg:table-cell text-[#5C756D]"><div className="flex items-center gap-1.5 text-xs"><Box className="w-3.5 h-3.5" />{p.defaults?.length}x{p.defaults?.breadth}x{p.defaults?.height}cm • {p.defaults?.weight}kg</div></td>
                                        <td className="py-4 px-4 hidden md:table-cell"><div className="text-xs text-[#5C756D] max-w-[200px] truncate flex items-center gap-2"><Building2 className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{p.consigner?.name || "—"}</span></div></td>
                                        <td className="py-4 px-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#384959] border border-[#C8E6C9]"><CheckCircle2 className="w-3 h-3" /> Active</span></td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setBdEditing(p)} className="p-2 rounded-lg text-[#5C756D] hover:bg-white hover:text-[#384959] border border-transparent hover:border-[#E3E8E5] transition-all"><Edit3 className="w-4 h-4" /></button>
                                                {!p.isDefault && <button onClick={() => handleDelete('bd', p._id)} className="p-2 rounded-lg text-[#5C756D] hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all"><Trash2 className="w-4 h-4" /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- SHIPROCKET LIST --- */}
            {activeService === "shiprocket" && (
                <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#FAFBF9] text-[#5C756D] font-bold uppercase text-xs tracking-wider border-b border-[#E3E8E5]">
                                <tr>
                                    <th className="py-4 px-6">Profile Name</th>
                                    <th className="py-4 px-4">Email ID</th>
                                    <th className="py-4 px-4">Pickup Location</th>
                                    <th className="py-4 px-4 hidden lg:table-cell">Default Dims</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 px-6 text-right w-[180px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F4F7F5]">
                                {srLoading ? (
                                    <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#384959]" /></td></tr>
                                ) : srList.length === 0 ? (
                                    <tr><td colSpan={6} className="py-20 text-center text-[#5C756D]"><p>No Shiprocket profiles found.</p></td></tr>
                                ) : srList.map((p) => (
                                    <tr key={p._id} className="group hover:bg-[#FAFBF9] transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${p.active ? "bg-[#384959] text-white border-[#384959]" : "bg-[#E8F5E9] text-[#384959] border-[#C8E6C9]"}`}>
                                                    {p.active ? <Zap className="w-4 h-4 fill-current" /> : String(p.label).slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#384959]">{p.label}</div>
                                                    {p.active && <span className="text-[10px] font-bold text-[#5C756D]">Active Account</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-[#384959] font-mono text-xs">{p.email}</td>
                                        <td className="py-4 px-4 text-[#5C756D] font-medium">{p.pickupLocation}</td>
                                        <td className="py-4 px-4 hidden lg:table-cell text-[#5C756D]">
                                            <div className="flex items-center gap-1.5 text-xs"><Box className="w-3.5 h-3.5" />{p.defaults?.length}x{p.defaults?.breadth}x{p.defaults?.height}cm • {p.defaults?.weight}kg</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {p.active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#384959] border border-[#C8E6C9]"><CheckCircle2 className="w-3 h-3" /> Active</span>
                                            ) : (
                                                <button onClick={() => handleSrActivate(p._id)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F4F7F5] text-[#5C756D] border border-[#E3E8E5] hover:bg-[#384959] hover:text-white transition-colors">Activate</button>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleSrTest(p._id)} disabled={testingConnection === p._id} className="p-2 rounded-lg text-[#5C756D] hover:bg-white hover:text-[#384959] border border-transparent hover:border-[#E3E8E5] transition-all" title="Test Connection">
                                                    {testingConnection === p._id ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => setSrEditing(p)} className="p-2 rounded-lg text-[#5C756D] hover:bg-white hover:text-[#384959] border border-transparent hover:border-[#E3E8E5] transition-all"><Edit3 className="w-4 h-4" /></button>
                                                {!p.active && <button onClick={() => handleDelete('sr', p._id)} className="p-2 rounded-lg text-[#5C756D] hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all"><Trash2 className="w-4 h-4" /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- MODALS --- */}
            {bdEditing && (
                <ProfileEditor profile={bdEditing} auth={auth} onClose={() => setBdEditing(null)} onSave={() => { setBdEditing(null); loadAll(); }} />
            )}

            {srEditing && (
                <ShiprocketEditor profile={srEditing} auth={auth} onClose={() => setSrEditing(null)} onSave={() => { setSrEditing(null); loadAll(); }} />
            )}

            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-[#384959] mb-2">Delete Profile?</h3>
                        <p className="text-[#5C756D] text-sm mb-6 leading-relaxed">Are you sure you want to delete this profile?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(null)} className="flex-1 px-4 py-2.5 text-[#5C756D] font-bold text-sm border border-[#E3E8E5] rounded-xl hover:bg-[#F4F7F5]">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 shadow-md">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// SUB-COMPONENT: BLUEDART EDITOR (Standard)
// ----------------------------------------------------------------------
function ProfileEditor({ profile: initialProfile, auth, onClose, onSave }) {
    const [form, setForm] = useState(initialProfile);
    const [activeTab, setActiveTab] = useState("credentials");
    const [saving, setSaving] = useState(false);
    const [showSecrets, setShowSecrets] = useState(false);

    async function handleSave() {
        if (!form.label?.trim()) return t.error("Label is required");
        if (!form.clientName?.trim()) return t.error("Client Name is required");
        if (!form.shippingKey?.trim()) return t.error("Shipping Key is required");

        setSaving(true);
        try {
            const payload = { ...form };
            if (form._id) payload._id = form._id;
            await BlueDartAPI.saveProfile(payload, auth);
            t.success(`Profile ${form._id ? 'updated' : 'created'} successfully`);
            onSave();
        } catch (error) { t.error("Failed to save profile"); } finally { setSaving(false); }
    }

    const inputClass = "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-2.5 text-sm text-[#384959] focus:outline-none focus:ring-2 focus:ring-[#384959]/20 focus:border-[#384959] transition-all placeholder:text-[#8BA699]";
    const labelClass = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-1.5";

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-[#F4F7F5] bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#E8F5E9] text-[#384959] rounded-lg"><Truck className="w-5 h-5" /></div>
                        <div><h2 className="text-lg font-bold text-[#384959]">{form._id ? "Edit BlueDart Profile" : "New BlueDart Profile"}</h2><p className="text-xs text-[#5C756D]">{form.label || "Untitled Profile"}</p></div>
                    </div>
                    <div className="flex bg-[#F4F7F5] p-1 rounded-xl">
                        {[ { id: "credentials", label: "Credentials", icon: Key }, { id: "defaults", label: "Defaults", icon: Package }, { id: "warehouse", label: "Warehouse", icon: MapPin } ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? "bg-white text-[#384959] shadow-sm" : "text-[#5C756D] hover:text-[#384959]"}`}><tab.icon size={14} /> <span className="hidden sm:inline">{tab.label}</span></button>
                        ))}
                    </div>
                    <button onClick={onClose} className="p-2 text-[#5C756D] hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-[#FCFDFD]">
                    {activeTab === "credentials" && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-[#E3E8E5] shadow-sm space-y-5">
                                <h3 className="font-bold text-[#384959] border-b border-[#F4F7F5] pb-2">Profile Identity</h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <div><label className={labelClass}>Profile Label</label><input className={inputClass} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Standard Delivery" /></div>
                                    <div><label className={labelClass}>Client Name / ID</label><input className={`${inputClass} font-mono`} value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="SUR96891" /></div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-[#E3E8E5] shadow-sm space-y-5">
                                <div className="flex items-center justify-between border-b border-[#F4F7F5] pb-2">
                                    <h3 className="font-bold text-[#384959]">API Secrets</h3>
                                    <button onClick={() => setShowSecrets(!showSecrets)} className="text-xs font-bold text-[#5C756D] flex items-center gap-1 hover:text-[#384959]">{showSecrets ? <EyeOff size={12} /> : <Eye size={12} />}{showSecrets ? "Hide Secrets" : "Show Secrets"}</button>
                                </div>
                                <div><label className={labelClass}>Shipping API Key</label><div className="relative"><input type={showSecrets ? "text" : "password"} className={`${inputClass} pr-10 font-mono`} value={form.shippingKey} onChange={e => setForm({ ...form, shippingKey: e.target.value })} /><Key className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BA699] w-4 h-4" /></div></div>
                                <div><label className={labelClass}>Tracking API Key</label><div className="relative"><input type={showSecrets ? "text" : "password"} className={`${inputClass} pr-10 font-mono`} value={form.trackingKey} onChange={e => setForm({ ...form, trackingKey: e.target.value })} /><Key className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BA699] w-4 h-4" /></div></div>
                            </div>
                        </div>
                    )}
                    {activeTab === "defaults" && (
                        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-[#E3E8E5] shadow-sm">
                            <h3 className="font-bold text-[#384959] mb-4">Standard Package Size</h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div><label className={labelClass}>Weight (kg)</label><input type="number" step="0.1" className={inputClass} value={form.defaults.weight} onChange={e => setForm({ ...form, defaults: { ...form.defaults, weight: Number(e.target.value) } })} /></div>
                                <div><label className={labelClass}>Length (cm)</label><input type="number" className={inputClass} value={form.defaults.length} onChange={e => setForm({ ...form, defaults: { ...form.defaults, length: Number(e.target.value) } })} /></div>
                                <div><label className={labelClass}>Breadth (cm)</label><input type="number" className={inputClass} value={form.defaults.breadth} onChange={e => setForm({ ...form, defaults: { ...form.defaults, breadth: Number(e.target.value) } })} /></div>
                                <div><label className={labelClass}>Height (cm)</label><input type="number" className={inputClass} value={form.defaults.height} onChange={e => setForm({ ...form, defaults: { ...form.defaults, height: Number(e.target.value) } })} /></div>
                            </div>
                        </div>
                    )}
                    {activeTab === "warehouse" && (
                         <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-[#E3E8E5] shadow-sm space-y-5">
                            <h3 className="font-bold text-[#384959] border-b border-[#F4F7F5] pb-2">Consigner Details</h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div><label className={labelClass}>Company Name</label><input className={inputClass} value={form.consigner.name} onChange={e => setForm({ ...form, consigner: { ...form.consigner, name: e.target.value } })} /></div>
                                <div><label className={labelClass}>Phone</label><input className={inputClass} value={form.consigner.phone} onChange={e => setForm({ ...form, consigner: { ...form.consigner, phone: e.target.value } })} /></div>
                                <div className="col-span-2"><label className={labelClass}>Street Address</label><textarea rows={2} className={inputClass} value={form.consigner.address} onChange={e => setForm({ ...form, consigner: { ...form.consigner, address: e.target.value } })} /></div>
                                <div><label className={labelClass}>City</label><input className={inputClass} value={form.consigner.city} onChange={e => setForm({ ...form, consigner: { ...form.consigner, city: e.target.value } })} /></div>
                                <div><label className={labelClass}>Pincode</label><input className={inputClass} value={form.consigner.pincode} onChange={e => setForm({ ...form, consigner: { ...form.consigner, pincode: e.target.value } })} /></div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-[#F4F7F5] bg-white flex items-center justify-between">
                     <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.isDefault ? 'bg-[#384959] border-[#384959]' : 'bg-white border-[#E3E8E5]'}`}>
                            {form.isDefault && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                        <span className="text-sm font-bold text-[#384959]">Set as Primary Profile</span>
                    </label>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[#E3E8E5] text-[#5C756D] font-bold text-sm hover:bg-[#F4F7F5] transition-all">Cancel</button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#384959] text-white font-bold text-sm hover:bg-[#6A89A7] shadow-lg active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// SUB-COMPONENT: SHIPROCKET EDITOR (Styling Corrected)
// ----------------------------------------------------------------------
function ShiprocketEditor({ profile: initialProfile, auth, onClose, onSave }) {
    const [form, setForm] = useState(initialProfile);
    const [activeTab, setActiveTab] = useState("credentials");
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSave() {
        if (!form.label?.trim()) return t.error("Label is required");
        if (!form.email?.trim()) return t.error("Email is required");
        if (!form._id && !form.password?.trim()) return t.error("Password is required for new profiles");

        setSaving(true);
        try {
            await ShiprocketProfileAPI.save(form, auth);
            t.success(`Profile ${form._id ? 'updated' : 'created'} successfully`);
            onSave();
        } catch (error) {
            t.error(error.response?.data?.error || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    }

    // Using standard project styles
    const inputClass = "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-2.5 text-sm text-[#384959] focus:outline-none focus:ring-2 focus:ring-[#384959]/20 focus:border-[#384959] transition-all placeholder:text-[#8BA699]";
    const labelClass = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-1.5";

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#F4F7F5] bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#E8F5E9] text-[#384959] rounded-lg"><Rocket className="w-5 h-5" /></div>
                        <div><h2 className="text-lg font-bold text-[#384959]">{form._id ? "Edit Shiprocket Profile" : "New Shiprocket Profile"}</h2><p className="text-xs text-[#5C756D]">{form.label || "Untitled Profile"}</p></div>
                    </div>
                    {/* Tabs */}
                    <div className="flex bg-[#F4F7F5] p-1 rounded-xl">
                        {[ { id: "credentials", label: "Credentials", icon: Key }, { id: "defaults", label: "Defaults", icon: Package } ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? "bg-white text-[#384959] shadow-sm" : "text-[#5C756D] hover:text-[#384959]"}`}><tab.icon size={14} /> <span className="hidden sm:inline">{tab.label}</span></button>
                        ))}
                    </div>
                    <button onClick={onClose} className="p-2 text-[#5C756D] hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#FCFDFD]">
                    {activeTab === "credentials" && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-[#E3E8E5] shadow-sm space-y-5">
                                <h3 className="font-bold text-[#384959] border-b border-[#F4F7F5] pb-2">Profile Identity</h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className={labelClass}>Profile Label (Internal Use)</label>
                                        <input className={inputClass} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="e.g. Surat Main Warehouse" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Shiprocket Email</label>
                                        <input className={inputClass} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Pickup Location (Alias)</label>
                                        <input className={inputClass} value={form.pickupLocation} onChange={e => setForm({ ...form, pickupLocation: e.target.value })} placeholder="Primary" />
                                        <p className="text-[10px] text-[#5C756D] mt-1">Must match 'Pickup Location Nickname' in Shiprocket Settings</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelClass}>Shiprocket Password</label>
                                        <div className="relative">
                                            <input type={showPassword ? "text" : "password"} className={`${inputClass} pr-10`} value={form.password || ""} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={form._id ? "Leave empty to keep unchanged" : "Password"} />
                                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BA699] hover:text-[#384959]">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "defaults" && (
                        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-[#E3E8E5] shadow-sm">
                            <h3 className="font-bold text-[#384959] mb-4">Default Dimensions</h3>
                            <p className="text-xs text-[#5C756D] mb-6">These dimensions will be used if your Book product doesn't have specific dimensions set.</p>
                            <div className="grid grid-cols-2 gap-5">
                                <div><label className={labelClass}>Weight (kg)</label><input type="number" step="0.1" className={inputClass} value={form.defaults.weight} onChange={e => setForm({ ...form, defaults: { ...form.defaults, weight: Number(e.target.value) } })} /></div>
                                <div><label className={labelClass}>Length (cm)</label><input type="number" className={inputClass} value={form.defaults.length} onChange={e => setForm({ ...form, defaults: { ...form.defaults, length: Number(e.target.value) } })} /></div>
                                <div><label className={labelClass}>Breadth (cm)</label><input type="number" className={inputClass} value={form.defaults.breadth} onChange={e => setForm({ ...form, defaults: { ...form.defaults, breadth: Number(e.target.value) } })} /></div>
                                <div><label className={labelClass}>Height (cm)</label><input type="number" className={inputClass} value={form.defaults.height} onChange={e => setForm({ ...form, defaults: { ...form.defaults, height: Number(e.target.value) } })} /></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#F4F7F5] bg-white flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[#E3E8E5] text-[#5C756D] font-bold text-sm hover:bg-[#F4F7F5] transition-all">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#384959] text-white font-bold text-sm hover:bg-[#6A89A7] shadow-lg active:scale-95 transition-all disabled:opacity-70">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </div>
        </div>
    );
}