// src/pages/Admin/EmailSenders.jsx
import { useEffect, useState } from "react";
import { EmailAPI } from "../../api/emails";
import { t } from "../../lib/toast";

import {
  Mail,
  Plus,
  Trash2,
  Edit2,
  Send,
  Server,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Loader2,
  ShieldCheck,
  Globe
} from "lucide-react";

export default function EmailSenders() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | sender object
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testTo, setTestTo] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { data } = await EmailAPI.listSenders();
      setList(data.items || data.senders || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function newSender() {
    setEditing({
      _id: null,
      label: "",
      type: "gmail",
      fromEmail: "",
      fromName: "",
      user: "",
      pass: "",
      host: "",
      port: 587,
      secure: false,
      isActive: true,
    });
  }

  async function save() {
    setSaving(true);
    try {
      const payload = { ...editing };
      if (payload.type === "gmail") {
        delete payload.host; delete payload.port; delete payload.secure;
      } else {
        delete payload.user; delete payload.pass;
      }
      if (editing._id) {
        await EmailAPI.updateSender(editing._id, payload);
      } else {
        await EmailAPI.createSender(payload);
      }
      setEditing(null);
      await load();
      t.ok("Sender saved successfully");
    } catch (e) {
      t.err("Failed to save sender");
    } finally { setSaving(false); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this sender?")) return;
    await EmailAPI.deleteSender(id);
    await load();
    t.ok("Sender deleted");
  }

  async function test(sender) {
    if (!testTo.trim()) {
      t.info("Enter a test recipient (To)");
      return;
    }
    setTesting(true);
    try {
      await EmailAPI.testSender(sender._id, { to: testTo, subject: `Test from ${sender.label}`, text: "Hello from Email Sender test." });
      t.ok("Test email queued/sent (check inbox).");

    } catch (e) {
      t.err(e?.response?.data?.error || "Test failed");
    } finally { setTesting(false); }
  }

  // Common Input Styles
  const inputClass = "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-2.5 text-sm text-[#384959] focus:outline-none focus:ring-2 focus:ring-[#384959]/20 focus:border-[#384959] transition-all placeholder:text-[#8BA699]";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-1.5";

  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#384959] tracking-tight">Email Senders</h1>
          <p className="text-[#5C756D] mt-1 text-sm">Configure SMTP or Gmail services for system notifications.</p>
        </div>
        <button
          onClick={newSender}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#384959] text-white font-bold text-sm hover:bg-[#6A89A7] transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Sender
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FAFBF9] text-[#5C756D] font-bold uppercase text-xs tracking-wider border-b border-[#E3E8E5]">
              <tr>
                <th className="py-4 px-6">Label</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">From Address</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 w-[400px]">Test & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7F5]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-[#5C756D]">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#384959]" />
                      <p>Loading senders...</p>
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-[#5C756D]">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No email senders configured.</p>
                    <p className="text-xs mt-1">Click "Add Sender" to get started.</p>
                  </td>
                </tr>
              ) : list.map((s) => (
                <tr key={s._id} className="group hover:bg-[#FAFBF9] transition-colors">
                  <td className="py-4 px-6 font-bold text-[#384959]">{s.label}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-white border border-[#E3E8E5] text-[#5C756D] uppercase">
                      {s.type === 'gmail' ? <Mail className="w-3 h-3" /> : <Server className="w-3 h-3" />}
                      {s.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#384959]">
                    <div className="flex flex-col">
                      <span className="font-medium">{s.fromName}</span>
                      <span className="text-xs text-[#5C756D]">{s.fromEmail}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {s.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#384959] border border-[#C8E6C9]">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F5F5F5] text-[#757575] border border-[#E0E0E0]">
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {/* Test Input Group */}
                      <div className="flex items-center gap-2 bg-white border border-[#E3E8E5] rounded-lg p-1 shadow-sm focus-within:border-[#384959] transition-colors">
                        <input
                          placeholder="Test email to..."
                          className="bg-transparent border-none text-xs px-2 py-1 focus:outline-none w-32 text-[#384959]"
                          value={testTo}
                          onChange={e => setTestTo(e.target.value)}
                        />
                        <button
                          disabled={!s._id || testing}
                          onClick={() => test(s)}
                          className="p-1.5 rounded-md bg-[#F4F7F5] text-[#5C756D] hover:bg-[#384959] hover:text-white transition-all disabled:opacity-50"
                          title="Send Test"
                        >
                          {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        </button>
                      </div>

                      <div className="h-4 w-px bg-[#E3E8E5] mx-1"></div>

                      <button
                        onClick={() => setEditing(s)}
                        className="p-2 rounded-lg text-[#5C756D] hover:bg-white hover:text-[#384959] hover:shadow-sm border border-transparent hover:border-[#E3E8E5] transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(s._id)}
                        className="p-2 rounded-lg text-[#5C756D] hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm grid place-items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#F4F7F5] flex items-center justify-between bg-[#FAFBF9]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E8F5E9] text-[#384959] rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#384959]">
                  {editing._id ? "Edit Sender Configuration" : "Add New Sender"}
                </h2>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-2 text-[#5C756D] hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* Row 1: Label & Type */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Internal Label</label>
                  <input
                    className={inputClass}
                    value={editing.label}
                    onChange={e => setEditing({ ...editing, label: e.target.value })}
                    placeholder="e.g. Transactional Email"
                  />
                </div>
                <div>
                  <label className={labelClass}>Provider Type</label>
                  <div className="relative">
                    <select
                      className={`${inputClass} appearance-none cursor-pointer`}
                      value={editing.type}
                      onChange={e => setEditing({ ...editing, type: e.target.value })}
                    >
                      <option value="gmail">Gmail (App Password)</option>
                      <option value="smtp">Custom SMTP</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#5C756D]">
                      <Server className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: From Details */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>From Name</label>
                  <input
                    className={inputClass}
                    value={editing.fromName || ""}
                    onChange={e => setEditing({ ...editing, fromName: e.target.value })}
                    placeholder="e.g. My Store Support"
                  />
                </div>
                <div>
                  <label className={labelClass}>From Email</label>
                  <input
                    className={inputClass}
                    value={editing.fromEmail || ""}
                    onChange={e => setEditing({ ...editing, fromEmail: e.target.value })}
                    placeholder="support@mystore.com"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#F4F7F5] my-2"></div>

              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-[#384959]" />
                <span className="text-sm font-bold text-[#384959]">Authentication Details</span>
              </div>

              {editing.type === "gmail" ? (
                <div className="grid md:grid-cols-2 gap-5 bg-[#F0F7F4] p-5 rounded-xl border border-[#C8E6C9]">
                  <div className="md:col-span-2 text-xs text-[#384959] mb-1">
                    ℹ️ Use your Gmail address and an <strong>App Password</strong> (not your login password).
                  </div>
                  <div>
                    <label className={labelClass}>Gmail Address</label>
                    <input
                      className="w-full bg-white border border-[#E3E8E5] rounded-xl px-4 py-2.5 text-sm text-[#384959] focus:ring-2 focus:ring-[#384959]/20 focus:border-[#384959]"
                      value={editing.user || ""}
                      onChange={e => setEditing({ ...editing, user: e.target.value })}
                      placeholder="user@gmail.com"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>App Password</label>
                    <input
                      type="password"
                      className="w-full bg-white border border-[#E3E8E5] rounded-xl px-4 py-2.5 text-sm text-[#384959] focus:ring-2 focus:ring-[#384959]/20 focus:border-[#384959]"
                      value={editing.pass || ""}
                      onChange={e => setEditing({ ...editing, pass: e.target.value })}
                      placeholder="xxxx xxxx xxxx xxxx"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 bg-[#FAFBF9] p-5 rounded-xl border border-[#E3E8E5]">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className={labelClass}>SMTP Host</label>
                      <input className={inputClass} value={editing.host || ""} onChange={e => setEditing({ ...editing, host: e.target.value })} placeholder="smtp.example.com" />
                    </div>
                    <div>
                      <label className={labelClass}>Port</label>
                      <input type="number" className={inputClass} value={editing.port || 587} onChange={e => setEditing({ ...editing, port: Number(e.target.value) || 587 })} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Username</label>
                      <input className={inputClass} value={editing.user || ""} onChange={e => setEditing({ ...editing, user: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelClass}>Password</label>
                      <input type="password" className={inputClass} value={editing.pass || ""} onChange={e => setEditing({ ...editing, pass: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Encryption (Secure/TLS)</label>
                    <select className={inputClass} value={editing.secure ? "1" : "0"} onChange={e => setEditing({ ...editing, secure: e.target.value === "1" })}>
                      <option value="0">False (STARTTLS - Port 587)</option>
                      <option value="1">True (SSL/TLS - Port 465)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[#E3E8E5] hover:bg-[#FAFBF9] transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-[#384959] rounded focus:ring-[#384959]"
                    checked={editing.isActive}
                    onChange={e => setEditing({ ...editing, isActive: e.target.checked })}
                  />
                  <div>
                    <span className="block text-sm font-bold text-[#384959]">Enable this sender</span>
                    <span className="block text-xs text-[#5C756D]">If disabled, the system will skip this configuration.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#F4F7F5] flex items-center justify-end gap-3 bg-[#FAFBF9]">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2.5 rounded-xl border border-[#E3E8E5] text-[#5C756D] font-bold text-sm hover:bg-white hover:text-[#384959] transition-all"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={save}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#384959] text-white font-bold text-sm hover:bg-[#6A89A7] shadow-md active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}