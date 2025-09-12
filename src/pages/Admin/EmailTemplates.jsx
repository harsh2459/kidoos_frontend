// src/pages/Admin/EmailTemplates.jsx
import { useEffect, useMemo, useState } from "react";
import { EmailAPI } from "../../api/emails";
import AdminTabs from "../../components/AdminTabs";

function cx(...a) { return a.filter(Boolean).join(" "); }

const CATEGORIES = [
  { id: "order", label: "Order" },
  { id: "abandoned_cart", label: "Abandoned Cart" },
  { id: "marketing", label: "Marketing" },
  { id: "other", label: "Other" },
];

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        EmailAPI.listTemplates(),
        EmailAPI.listSenders(),
      ]);

      const tArr =
        Array.isArray(t.data?.items) ? t.data.items :
        Array.isArray(t.data?.templates) ? t.data.templates :
        Array.isArray(t.data) ? t.data : [];

      const sArr =
        Array.isArray(s.data?.items) ? s.data.items :
        Array.isArray(s.data?.senders) ? s.data.senders :
        Array.isArray(s.data) ? s.data : [];

      setTemplates(tArr);
      setSenders(sArr);
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

  async function save() {
    setSaving(true);
    try {
      const payload = { ...editing };
      if (payload.category !== "abandoned_cart") payload.abandonedDay = null;
      if (!payload.text) delete payload.text;
      if (!payload.fromEmail) delete payload.fromEmail;
      if (!payload.fromName) delete payload.fromName;

      if (editing._id || (editing.slug && templates.some(t => t.slug === editing.slug))) {
        await EmailAPI.updateTemplate(editing._id || editing.slug, payload);
      } else {
        await EmailAPI.createTemplate(payload);
      }
      setEditing(null);
      await load();
    } finally { setSaving(false); }
  }

  async function remove(idOrSlug) {
    if (!window.confirm("Delete this template?")) return;
    await EmailAPI.deleteTemplate(idOrSlug);
    await load();
  }

  // quick test form
  const [testTo, setTestTo] = useState("");
  const [testCtx, setTestCtx] = useState('{"name":"Nirav","order_id":"123","amount":499}');
  const [testingSlug, setTestingSlug] = useState("");

  async function test(slug) {
    if (!testTo.trim()) { alert("Enter a test recipient (To)"); return; }
    let ctx;
    try { ctx = testCtx ? JSON.parse(testCtx) : {}; }
    catch { alert("Context must be valid JSON"); return; }
    setTestingSlug(slug);
    try {
      await EmailAPI.testTemplate(slug, { to: testTo, ctx });
      alert("Test email queued/sent (check inbox).");
    } catch (e) {
      alert(e?.response?.data?.error || "Test failed");
    } finally { setTestingSlug(""); }
  }

  const filtered = useMemo(() => {
    if (!filter) return templates;
    return templates.filter(t =>
      [t.slug, t.title, t.category, t.subject].join(" ").toLowerCase().includes(filter.toLowerCase())
    );
  }, [templates, filter]);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <AdminTabs />

      <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <button onClick={newTpl} className="px-3 py-2 rounded-lg bg-brand font-semibold">+ Add</button>
      </div>

      {/* Quick test bar */}
      <div className="bg-surface border border-border-subtle rounded-xl p-3 mb-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input placeholder="Send test to" className="w-full min-w-0" value={testTo} onChange={e => setTestTo(e.target.value)} />
          <input placeholder="Filter templates…" className="w-full min-w-0" value={filter} onChange={e => setFilter(e.target.value)} />
          <textarea
            className="w-full h-[42px] min-h-[42px] resize-y min-w-0"
            placeholder='JSON context (e.g., {"name":"Nirav"})'
            value={testCtx} onChange={e => setTestCtx(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-surface border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-subtle">
              <tr className="bg-[#e3e3e3]">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 hidden sm:table-cell">Category</th>
                <th className="py-3 px-4 hidden lg:table-cell">Day</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 hidden md:table-cell">Sender</th>
                <th className="py-3 px-4 hidden sm:table-cell">Active</th>
                <th className="py-3 px-4 w-[280px] sm:w-[360px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-10 text-center text-fg-subtle">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-fg-subtle">No templates.</td></tr>
              ) : filtered.map((t, i) => (
                <tr key={t._id || t.slug || i} className={i % 2 ? "bg-surface-subtle/60" : "bg-surface"}>
                  <td className="py-2 px-4 font-mono">{i + 1}</td>
                  <td className="py-2 px-4 font-mono">{t.slug}</td>
                  <td className="py-2 px-4 font-medium">{t.title}</td>
                  <td className="py-2 px-4 hidden sm:table-cell">{t.category}</td>
                  <td className="py-2 px-4 hidden lg:table-cell">{t.abandonedDay ?? "—"}</td>
                  <td className="py-2 px-4 truncate max-w-[240px] sm:max-w-[280px]">{t.subject}</td>
                  <td className="py-2 px-4 hidden md:table-cell">
                    {(senders.find(s => String(s._id) === String(t.mailSender))?.label) || "—"}
                  </td>
                  <td className="py-2 px-4 hidden sm:table-cell">
                    {t.isActive ? <span className="badge-green">Active</span> : <span className="badge">—</span>}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                      <button onClick={() => setEditing(t)} className="px-3 py-1.5 rounded-lg border bg-surface hover:bg-surface-subtle">Edit</button>
                      <button
                        disabled={!!testingSlug}
                        onClick={() => test(t.slug)}
                        className={cx("px-3 py-1.5 rounded-lg btn-muted", testingSlug === t.slug && "opacity-60")}
                      >
                        {testingSlug === t.slug ? "Testing…" : "Send test"}
                      </button>
                      <button onClick={() => remove(t._id || t.slug)} className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Editor
          tpl={editing}
          senders={senders}
          onClose={() => setEditing(null)}
          onChange={setEditing}
          onSave={save}
          saving={saving}
        />
      )}
    </div>
  );
}

function Editor({ tpl, senders, onClose, onChange, onSave, saving }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div className="relative bg-surface border border-border-subtle w-full sm:rounded-xl sm:shadow-xl
                      max-w-[1000px] sm:max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-lg font-semibold">{tpl._id ? "Edit Template" : "Add Template"}</h2>
          <button onClick={onClose} className="text-fg-subtle hover:text-fg">✕</button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Row label="Slug"><input className="w-full min-w-0 font-mono" value={tpl.slug} onChange={e => onChange({ ...tpl, slug: e.target.value })} /></Row>
            <Row label="Title"><input className="w-full min-w-0" value={tpl.title} onChange={e => onChange({ ...tpl, title: e.target.value })} /></Row>
            <Row label="Category">
              <select className="w-full min-w-0" value={tpl.category} onChange={e => onChange({ ...tpl, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Row>
          </div>

          {tpl.category === "abandoned_cart" && (
            <Row label="Abandoned Day (1–7, or blank)">
              <input
                type="number" min={1} max={7} className="w-full min-w-0"
                value={tpl.abandonedDay ?? ""}
                onChange={e => {
                  const v = e.target.value.trim();
                  onChange({ ...tpl, abandonedDay: v === "" ? null : Math.max(1, Math.min(7, Number(v) || 1)) });
                }}
              />
            </Row>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Row label="Subject"><input className="w-full min-w-0" value={tpl.subject} onChange={e => onChange({ ...tpl, subject: e.target.value })} /></Row>
            <Row label="Mail Sender">
              <select className="w-full min-w-0" value={tpl.mailSender || ""} onChange={e => onChange({ ...tpl, mailSender: e.target.value })}>
                <option value="">— Select —</option>
                {senders.map(s => <option key={s._id} value={s._id}>{s.label} — {s.fromEmail}</option>)}
              </select>
            </Row>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Row label="HTML (supports {{placeholders}})"><textarea className="w-full h-48 min-w-0" value={tpl.html} onChange={e => onChange({ ...tpl, html: e.target.value })} /></Row>
            <Row label="Text (optional)"><textarea className="w-full h-48 min-w-0" value={tpl.text || ""} onChange={e => onChange({ ...tpl, text: e.target.value })} /></Row>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Row label="Always To (comma emails)"><input className="w-full min-w-0" value={(tpl.alwaysTo || []).join(", ")} onChange={e => onChange({ ...tpl, alwaysTo: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} /></Row>
            <Row label="Always CC (comma emails)"><input className="w-full min-w-0" value={(tpl.alwaysCc || []).join(", ")} onChange={e => onChange({ ...tpl, alwaysCc: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} /></Row>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Row label="Always BCC (comma emails)"><input className="w-full min-w-0" value={(tpl.alwaysBcc || []).join(", ")} onChange={e => onChange({ ...tpl, alwaysBcc: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} /></Row>
            <Row label="Override From (optional)">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input placeholder="From name" className="w-full min-w-0" value={tpl.fromName || ""} onChange={e => onChange({ ...tpl, fromName: e.target.value })} />
                <input placeholder="From email" className="w-full min-w-0" value={tpl.fromEmail || ""} onChange={e => onChange({ ...tpl, fromEmail: e.target.value })} />
              </div>
            </Row>
          </div>

          <Row label="Active">
            <select className="w-full max-w-[160px]" value={tpl.isActive ? "1" : "0"} onChange={e => onChange({ ...tpl, isActive: e.target.value === "1" })}>
              <option value="1">Yes</option><option value="0">No</option>
            </select>
          </Row>
        </div>

        <div className="px-4 sm:px-5 py-3 border-t border-border-subtle flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border bg-surface hover:bg-surface-subtle">Cancel</button>
          <button disabled={saving} onClick={onSave} className="px-4 py-2 rounded-lg bg-brand font-semibold hover:brightness-110">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="min-w-0">
      <label className="block text-sm mb-1">{label}</label>
      {children}
    </div>
  );
}
