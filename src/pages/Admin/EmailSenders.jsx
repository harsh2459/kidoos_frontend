import { useEffect, useMemo, useState } from "react";
import { EmailAPI } from "../../api/emails";
import AdminTabs from "../../components/AdminTabs";
import { t } from "../../lib/toast";

function cx(...a) { return a.filter(Boolean).join(" "); }

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
      type: "gmail",         // "gmail" | "smtp"
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
        delete payload.user; delete payload.pass; // still allow username/password via SMTP below if you want both; keep it simple for now
      }
      if (editing._id) {
        await EmailAPI.updateSender(editing._id, payload);
      } else {
        await EmailAPI.createSender(payload);
      }
      setEditing(null);
      await load();
    } finally { setSaving(false); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this sender?")) return;
    await EmailAPI.deleteSender(id);
    await load();
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

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <AdminTabs />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Email Senders</h1>
        <button onClick={newSender} className="px-3 py-2 rounded-lg bg-brand font-semibold">+ Add</button>
      </div>

      <div className="bg-surface border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-subtle">
              <tr className="bg-[#e3e3e3]">
                <th className="py-3 px-4">Label</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">From</th>
                <th className="py-3 px-4">Active</th>
                <th className="py-3 px-4 w-[360px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-fg-subtle">Loading…</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-fg-subtle">No senders. Click “Add”.</td></tr>
              ) : list.map((s, i) => (
                <tr key={s._id || i} className={i % 2 ? "bg-surface-subtle/60" : "bg-surface"}>
                  <td className="py-2 px-4 font-medium">{s.label}</td>
                  <td className="py-2 px-4 uppercase">{s.type}</td>
                  <td className="py-2 px-4">{s.fromName ? `${s.fromName} <${s.fromEmail}>` : s.fromEmail}</td>
                  <td className="py-2 px-4">{s.isActive ? <span className="badge-green">Active</span> : <span className="badge">—</span>}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        placeholder="Test to"
                        className="bg-surface border border-border rounded-lg px-2 py-1"
                        value={testTo} onChange={e => setTestTo(e.target.value)}
                      />
                      <button disabled={!s._id || testing} onClick={() => test(s)} className="px-3 py-1.5 rounded-lg btn-muted">
                        {testing ? "Testing…" : "Send test"}
                      </button>
                      <button onClick={() => setEditing(s)} className="px-3 py-1.5 rounded-lg border bg-surface hover:bg-surface-subtle">Edit</button>
                      <button onClick={() => remove(s._id)} className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer / Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-surface border border-border-subtle rounded-xl shadow-xl w-[720px] max-w-[94vw]">
            <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing._id ? "Edit Sender" : "Add Sender"}</h2>
              <button onClick={() => setEditing(null)} className="text-fg-subtle hover:text-fg">✕</button>
            </div>

            <div className="p-5 space-y-3">
              <Row label="Label">
                <input className="w-full" value={editing.label} onChange={e => setEditing({ ...editing, label: e.target.value })} />
              </Row>

              <Row label="Type">
                <select className="w-full" value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })}>
                  <option value="gmail">Gmail (App Password)</option>
                  {/* <option value="smtp">SMTP</option> */}
                </select>
              </Row>

              <div className="grid md:grid-cols-2 gap-3">
                <Row label="From name">
                  <input className="w-full" value={editing.fromName || ""} onChange={e => setEditing({ ...editing, fromName: e.target.value })} />
                </Row>
                <Row label="From email">
                  <input className="w-full" value={editing.fromEmail || ""} onChange={e => setEditing({ ...editing, fromEmail: e.target.value })} />
                </Row>
              </div>

              {editing.type === "gmail" ? (
                <div className="grid md:grid-cols-2 gap-3">
                  <Row label="Gmail user (email)">
                    <input className="w-full" value={editing.user || ""} onChange={e => setEditing({ ...editing, user: e.target.value })} />
                  </Row>
                  <Row label="Gmail App password">
                    <input className="w-full" type="password" value={editing.pass || ""} onChange={e => setEditing({ ...editing, pass: e.target.value })} />
                  </Row>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-3">
                    <Row label="Host"><input className="w-full" value={editing.host || ""} onChange={e => setEditing({ ...editing, host: e.target.value })} /></Row>
                    <Row label="Port"><input type="number" className="w-full" value={editing.port || 587} onChange={e => setEditing({ ...editing, port: Number(e.target.value) || 587 })} /></Row>
                    <Row label="Secure (TLS)">
                      <select className="w-full" value={editing.secure ? "1" : "0"} onChange={e => setEditing({ ...editing, secure: e.target.value === "1" })}>
                        <option value="0">No</option><option value="1">Yes</option>
                      </select>
                    </Row>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Row label="SMTP user"><input className="w-full" value={editing.user || ""} onChange={e => setEditing({ ...editing, user: e.target.value })} /></Row>
                    <Row label="SMTP password"><input type="password" className="w-full" value={editing.pass || ""} onChange={e => setEditing({ ...editing, pass: e.target.value })} /></Row>
                  </div>
                </>
              )}

              <Row label="Active">
                <select className="w-full w-40" value={editing.isActive ? "1" : "0"} onChange={e => setEditing({ ...editing, isActive: e.target.value === "1" })}>
                  <option value="1">Yes</option><option value="0">No</option>
                </select>
              </Row>
            </div>

            <div className="px-5 py-4 border-t border-border-subtle flex items-center justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-lg border bg-surface hover:bg-surface-subtle">Cancel</button>
              <button disabled={saving} onClick={save} className="px-4 py-2 rounded-lg bg-brand font-semibold hover:brightness-110">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      {children}
    </div>
  );
}
