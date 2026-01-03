// src/pages/Admin/EmailTemplates.jsx
import { useEffect, useMemo, useState } from "react";
import { EmailAPI } from "../../api/emails";
import { t } from "../../lib/toast";
import AdminTabs from "../../components/AdminTabs";
import { 
  LayoutTemplate, 
  Plus, 
  Search, 
  Send, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Code, 
  Mail,
  Settings,
  FileText,
  AlertTriangle,
  FlaskConical,
  Copy
} from "lucide-react";

const CATEGORIES = [
  { id: "order", label: "Order", color: "bg-blue-100 text-blue-700" },
  { id: "abandoned_cart", label: "Abandoned Cart", color: "bg-amber-100 text-amber-700" },
  { id: "marketing", label: "Marketing", color: "bg-purple-100 text-purple-700" },
  { id: "other", label: "Other", color: "bg-gray-100 text-gray-700" },
];

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // Template object or null
  const [testing, setTesting] = useState(null); // Template object (for testing) or null
  const [filter, setFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        EmailAPI.listTemplates(),
        EmailAPI.listSenders(),
      ]);

      const tArr = Array.isArray(tRes.data?.items) ? tRes.data.items :
                   Array.isArray(tRes.data?.templates) ? tRes.data.templates : 
                   Array.isArray(tRes.data) ? tRes.data : [];

      const sArr = Array.isArray(sRes.data?.items) ? sRes.data.items :
                   Array.isArray(sRes.data?.senders) ? sRes.data.senders : 
                   Array.isArray(sRes.data) ? sRes.data : [];

      setTemplates(tArr);
      setSenders(sArr);
    } catch (err) {
      t.err("Failed to load data");
    } finally { setLoading(false); }
  }
  
  useEffect(() => { load(); }, []);

  function newTpl() {
    setEditing({
      _id: null,
      slug: "",
      title: "",
      category: "order",
      abandonedDay: null,
      subject: "",
      html: "",
      text: "",
      mailSender: "",
      isActive: true,
      alwaysTo: [],
      alwaysCc: [],
      alwaysBcc: [],
      fromEmail: "",
      fromName: "",
    });
  }

  async function remove(idOrSlug) {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    await EmailAPI.deleteTemplate(idOrSlug);
    await load();
    t.success("Template deleted");
  }

  const filtered = useMemo(() => {
    if (!filter) return templates;
    return templates.filter(t =>
      [t.slug, t.title, t.category, t.subject].join(" ").toLowerCase().includes(filter.toLowerCase())
    );
  }, [templates, filter]);

  // Styles
  const searchInputClass = "w-full bg-white border border-[#E3E8E5] rounded-xl pl-11 pr-4 py-3 text-sm text-[#1A3C34] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all placeholder:text-[#8BA699] shadow-sm";

  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">
      <AdminTabs />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-[#1A3C34] tracking-tight">Email Templates</h1>
            <p className="text-[#5C756D] mt-1 text-sm">Design and manage your automated email notifications.</p>
        </div>
        <div className="flex gap-3">
             {/* Stats Pills */}
             <div className="hidden lg:flex items-center bg-white border border-[#E3E8E5] rounded-xl p-1.5 shadow-sm">
                <div className="px-4 py-1 border-r border-[#F4F7F5]">
                    <span className="block text-xs font-bold text-[#8BA699] uppercase">Total</span>
                    <span className="block text-lg font-bold text-[#1A3C34] leading-none">{templates.length}</span>
                </div>
                <div className="px-4 py-1">
                    <span className="block text-xs font-bold text-[#8BA699] uppercase">Active</span>
                    <span className="block text-lg font-bold text-[#1A3C34] leading-none">{templates.filter(t => t.isActive).length}</span>
                </div>
             </div>

            <button 
                onClick={newTpl} 
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A3C34] text-white font-bold text-sm hover:bg-[#2F523F] transition-all shadow-md active:scale-95"
            >
                <Plus className="w-5 h-5" /> Create Template
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8BA699] w-5 h-5" />
        <input 
            className={searchInputClass}
            placeholder="Search by slug, title, or subject..." 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
        />
      </div>

      {/* Main Grid Layout */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-[#E3E8E5]">
             <Loader2 className="w-10 h-10 animate-spin text-[#1A3C34] mb-4" />
             <p className="text-[#5C756D] font-medium">Loading templates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border border-[#E3E8E5]">
            <div className="w-16 h-16 bg-[#F4F7F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutTemplate className="w-8 h-8 text-[#8BA699]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A3C34]">No templates found</h3>
            <p className="text-[#5C756D] mt-2">Try adjusting your search or create a new template.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(t => {
                const cat = CATEGORIES.find(c => c.id === t.category) || CATEGORIES[3];
                return (
                    <div key={t._id || t.slug} className="group bg-white border border-[#E3E8E5] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#1A3C34]/30 transition-all flex flex-col h-full">
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-3 items-center">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color.replace('text-', 'bg-').replace('100', '50')}`}>
                                    <Mail className={`w-5 h-5 ${cat.color}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1A3C34] line-clamp-1" title={t.title}>{t.title}</h3>
                                    <div className="flex items-center gap-2 text-xs mt-0.5">
                                        <span className={`px-1.5 py-0.5 rounded font-medium ${cat.color}`}>{cat.label}</span>
                                        {t.abandonedDay && <span className="text-amber-600 font-medium flex items-center gap-1"><AlertTriangle size={10} /> Day {t.abandonedDay}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => setTesting(t)} className="p-2 text-[#5C756D] hover:bg-[#F4F7F5] hover:text-[#1A3C34] rounded-lg transition-colors" title="Test">
                                    <FlaskConical size={18} />
                                </button>
                                <button onClick={() => setEditing(t)} className="p-2 text-[#5C756D] hover:bg-[#F4F7F5] hover:text-[#1A3C34] rounded-lg transition-colors" title="Edit">
                                    <Edit3 size={18} />
                                </button>
                            </div>
                        </div>
                        
                        {/* Slug Block */}
                        <div className="bg-[#FAFBF9] border border-[#E3E8E5] rounded-lg px-3 py-2 mb-4 flex items-center justify-between group-hover:border-[#1A3C34]/20 transition-colors">
                            <code className="text-xs font-mono text-[#1A3C34] truncate">{t.slug}</code>
                            <Copy size={12} className="text-[#8BA699] cursor-pointer hover:text-[#1A3C34]" onClick={() => { navigator.clipboard.writeText(t.slug); t.success("Copied slug!"); }} />
                        </div>

                        {/* Subject Preview */}
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase text-[#8BA699] tracking-wider mb-1">Subject</p>
                            <p className="text-sm text-[#5C756D] line-clamp-2 min-h-[40px] leading-relaxed">
                                {t.subject}
                            </p>
                        </div>

                        {/* Footer Status */}
                        <div className="mt-5 pt-4 border-t border-[#F4F7F5] flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                {t.isActive ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                        <CheckCircle2 size={12} /> Active
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                                        <XCircle size={12} /> Inactive
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-[#8BA699] font-medium">
                                Sender: {(senders.find(s => String(s._id) === String(t.mailSender))?.label) || "—"}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      )}

      {/* --- MODALS --- */}
      {editing && (
        <TemplateEditor 
            tpl={editing} 
            senders={senders} 
            onClose={() => setEditing(null)} 
            onSave={() => { setEditing(null); load(); }} 
        />
      )}

      {testing && (
        <TestLabModal 
            tpl={testing} 
            onClose={() => setTesting(null)} 
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENT: EDITOR MODAL (TABBED)
// ----------------------------------------------------------------------
function TemplateEditor({ tpl: initialTpl, senders, onClose, onSave }) {
    const [tpl, setTpl] = useState(initialTpl);
    const [activeTab, setActiveTab] = useState("essentials");
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        try {
            const payload = { ...tpl };
            if (payload.category !== "abandoned_cart") payload.abandonedDay = null;
            
            // Basic Validation
            if (!payload.slug?.trim()) return t.err("Slug is required");
            if (!payload.subject?.trim()) return t.err("Subject is required");
            if (!payload.mailSender) return t.err("Please select a Sender");

            // Cleanup
            if (!payload.text) delete payload.text;
            if (!payload.fromEmail) delete payload.fromEmail;
            if (!payload.fromName) delete payload.fromName;

            // API Call
            if (tpl._id) {
                await EmailAPI.updateTemplate(tpl._id, payload);
            } else {
                await EmailAPI.createTemplate(payload);
            }
            t.success("Template saved successfully");
            onSave();
        } catch (e) {
            t.err(e?.response?.data?.error || "Save failed");
        } finally {
            setSaving(false);
        }
    }

    const inputBase = "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-2.5 text-sm text-[#1A3C34] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all placeholder:text-[#8BA699]";
    const labelBase = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-1.5";

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#F4F7F5] bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#E8F5E9] text-[#1A3C34] rounded-lg">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#1A3C34]">{tpl._id ? "Edit Template" : "New Template"}</h2>
                            <p className="text-xs text-[#5C756D]">{tpl.title || "Untitled"}</p>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex bg-[#F4F7F5] p-1 rounded-xl">
                        {[
                            { id: "essentials", label: "Essentials", icon: Settings },
                            { id: "content", label: "Content Design", icon: FileText },
                            { id: "delivery", label: "Delivery", icon: Send },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                                    ${activeTab === tab.id 
                                        ? "bg-white text-[#1A3C34] shadow-sm text-shadow-sm" 
                                        : "text-[#5C756D] hover:text-[#1A3C34]"
                                    }
                                `}
                            >
                                <tab.icon size={14} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <button onClick={onClose} className="p-2 text-[#5C756D] hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#FCFDFD]">
                    
                    {/* TAB: ESSENTIALS */}
                    {activeTab === "essentials" && (
                        <div className="space-y-6 max-w-3xl mx-auto">
                            <div className="bg-white p-6 rounded-2xl border border-[#E3E8E5] shadow-sm space-y-5">
                                <h3 className="font-bold text-[#1A3C34] border-b border-[#F4F7F5] pb-2">Core Information</h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelBase}>Template Slug (Unique ID)</label>
                                        <div className="relative">
                                            <Code className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8BA699] w-4 h-4" />
                                            <input 
                                                className={`${inputBase} pl-10 font-mono`}
                                                value={tpl.slug}
                                                onChange={e => setTpl({...tpl, slug: e.target.value})}
                                                placeholder="order_confirmation_v1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelBase}>Internal Title</label>
                                        <input 
                                            className={inputBase}
                                            value={tpl.title}
                                            onChange={e => setTpl({...tpl, title: e.target.value})}
                                            placeholder="Order Confirmation Email"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelBase}>Category</label>
                                        <select 
                                            className={inputBase}
                                            value={tpl.category}
                                            onChange={e => setTpl({...tpl, category: e.target.value})}
                                        >
                                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelBase}>Sender Configuration</label>
                                        <select 
                                            className={inputBase}
                                            value={tpl.mailSender || ""}
                                            onChange={e => setTpl({...tpl, mailSender: e.target.value})}
                                        >
                                            <option value="">-- Select Sender --</option>
                                            {senders.map(s => <option key={s._id} value={s._id}>{s.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {tpl.category === "abandoned_cart" && (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                                        <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                                        <div>
                                            <label className="text-xs font-bold text-amber-800 uppercase">Automation Trigger</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-amber-900">Send email</span>
                                                <input 
                                                    type="number" min={1} max={7}
                                                    className="w-16 px-2 py-1 border border-amber-300 rounded text-center font-bold text-amber-900"
                                                    value={tpl.abandonedDay ?? ""}
                                                    onChange={e => setTpl({...tpl, abandonedDay: parseInt(e.target.value) || 1})}
                                                />
                                                <span className="text-sm text-amber-900">days after cart abandonment.</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-[#E3E8E5] shadow-sm">
                                <label className={labelBase}>Email Subject Line</label>
                                <input 
                                    className={`${inputBase} text-lg font-medium`}
                                    value={tpl.subject}
                                    onChange={e => setTpl({...tpl, subject: e.target.value})}
                                    placeholder="Your order #{{order_id}} has been received!"
                                />
                                <p className="text-xs text-[#5C756D] mt-2 flex items-center gap-1">
                                    <Code size={10} /> Supports Liquid/Handlebars variables like {'{{name}}'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TAB: CONTENT */}
                    {activeTab === "content" && (
                        <div className="h-full flex flex-col gap-4">
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-[400px]">
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between mb-2">
                                        <label className={labelBase}>HTML Body</label>
                                        <span className="text-xs bg-blue-50 text-blue-700 px-2 rounded">Primary</span>
                                    </div>
                                    <textarea 
                                        className="flex-1 w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs p-4 rounded-xl focus:outline-none resize-none shadow-inner"
                                        value={tpl.html}
                                        onChange={e => setTpl({...tpl, html: e.target.value})}
                                        placeholder="<html>...</html>"
                                    />
                                </div>
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between mb-2">
                                        <label className={labelBase}>Plain Text Fallback</label>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 rounded">Optional</span>
                                    </div>
                                    <textarea 
                                        className="flex-1 w-full bg-white border border-[#E3E8E5] text-[#1A3C34] font-mono text-xs p-4 rounded-xl focus:outline-none focus:border-[#1A3C34] resize-none"
                                        value={tpl.text || ""}
                                        onChange={e => setTpl({...tpl, text: e.target.value})}
                                        placeholder="Text version for simpler email clients..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: DELIVERY */}
                    {activeTab === "delivery" && (
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-[#E3E8E5] shadow-sm space-y-5">
                                <h3 className="font-bold text-[#1A3C34] border-b border-[#F4F7F5] pb-2">Routing Options</h3>
                                
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelBase}>Always CC</label>
                                        <input 
                                            className={inputBase}
                                            value={(tpl.alwaysCc || []).join(", ")}
                                            onChange={e => setTpl({...tpl, alwaysCc: e.target.value.split(",").filter(Boolean)})}
                                            placeholder="manager@store.com, admin@store.com"
                                        />
                                        <p className="text-xs text-[#8BA699] mt-1">Comma separated emails</p>
                                    </div>
                                    <div>
                                        <label className={labelBase}>Always BCC</label>
                                        <input 
                                            className={inputBase}
                                            value={(tpl.alwaysBcc || []).join(", ")}
                                            onChange={e => setTpl({...tpl, alwaysBcc: e.target.value.split(",").filter(Boolean)})}
                                            placeholder="archive@store.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelBase}>Override "From Name"</label>
                                    <input 
                                        className={inputBase}
                                        value={tpl.fromName || ""}
                                        onChange={e => setTpl({...tpl, fromName: e.target.value})}
                                        placeholder="Leave empty to use Sender default"
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-[#E3E8E5] shadow-sm flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-[#1A3C34]">Template Status</h4>
                                    <p className="text-sm text-[#5C756D]">Disable to stop sending this email automatically.</p>
                                </div>
                                <label className={`
                                    flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl border transition-all select-none
                                    ${tpl.isActive ? "bg-[#1A3C34] border-[#1A3C34]" : "bg-white border-[#E3E8E5]"}
                                `}>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={tpl.isActive} 
                                        onChange={e => setTpl({...tpl, isActive: e.target.checked})} 
                                    />
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${tpl.isActive ? "bg-white/20" : "bg-gray-200"}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 bg-white`} style={{left: tpl.isActive ? '1.1rem' : '0.125rem'}}></div>
                                    </div>
                                    <span className={`font-bold text-sm ${tpl.isActive ? "text-white" : "text-[#5C756D]"}`}>
                                        {tpl.isActive ? "Active" : "Paused"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#F4F7F5] bg-white flex justify-between items-center">
                    <div className="text-xs text-[#8BA699] font-mono">
                        ID: {tpl._id || "New"}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[#E3E8E5] text-[#5C756D] font-bold text-sm hover:bg-[#F4F7F5] transition-all">
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A3C34] text-white font-bold text-sm hover:bg-[#2F523F] shadow-lg active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save Template"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// SUB-COMPONENT: TEST LAB MODAL
// ----------------------------------------------------------------------
function TestLabModal({ tpl, onClose }) {
    const [email, setEmail] = useState("");
    const [jsonCtx, setJsonCtx] = useState('{\n  "name": "John Doe",\n  "order_id": "ORD-12345",\n  "amount": 1999\n}');
    const [sending, setSending] = useState(false);

    async function handleSend() {
        if (!email) return t.err("Please enter an email address");
        let ctx = {};
        try { ctx = JSON.parse(jsonCtx); } catch { return t.err("Invalid JSON context"); }

        setSending(true);
        try {
            await EmailAPI.testTemplate(tpl.slug, { to: email, ctx });
            t.success(`Test sent to ${email}`);
        } catch (e) {
            t.err(e?.response?.data?.error || "Test failed");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-[#1A3C34] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <FlaskConical className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Test Lab</h3>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white"><X /></button>
                </div>
                
                <div className="p-6 space-y-5">
                    <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        Testing template: <span className="font-mono font-bold">{tpl.slug}</span>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-1.5">Recipient Email</label>
                        <input 
                            className="w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-2.5 text-sm text-[#1A3C34] focus:ring-2 focus:ring-[#1A3C34]"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-1.5">JSON Context Data</label>
                        <textarea 
                            className="w-full h-32 bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-2.5 text-sm font-mono text-[#1A3C34] focus:ring-2 focus:ring-[#1A3C34]"
                            value={jsonCtx}
                            onChange={e => setJsonCtx(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={handleSend}
                        disabled={sending}
                        className="w-full py-3 rounded-xl bg-[#1A3C34] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#2F523F] transition-all disabled:opacity-70"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {sending ? "Sending..." : "Fire Test Email"}
                    </button>
                </div>
            </div>
        </div>
    );
}