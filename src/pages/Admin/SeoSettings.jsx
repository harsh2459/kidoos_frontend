import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { useSite } from "../../contexts/SiteConfig";
import { t } from "../../lib/toast";
import { Search, Plus, X, Save, CheckCircle2, Circle } from "lucide-react";

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export default function SeoSettings() {
  const { token } = useAuth();
  const { setSeo } = useSite();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [form, setForm] = useState({
    globalKeywords: "",
    homepageVariants: [],
    defaultDescription: "",
    defaultOgImage: "",
    googleVerification: "",
    extraMeta: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // keyword tag input
  const [kwInput, setKwInput] = useState("");

  useEffect(() => {
    api.get("/settings/seo", auth).then(res => {
      if (res.data?.ok) {
        const s = res.data.seo;
        setForm({
          globalKeywords: s.globalKeywords || "",
          homepageVariants: Array.isArray(s.homepageVariants) ? s.homepageVariants : [],
          defaultDescription: s.defaultDescription || "",
          defaultOgImage: s.defaultOgImage || "",
          googleVerification: s.googleVerification || "",
          extraMeta: Array.isArray(s.extraMeta) ? s.extraMeta : [],
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  // ── keyword tag helpers ──────────────────────────────────────────────────
  const keywords = form.globalKeywords
    ? form.globalKeywords.split(",").map(k => k.trim()).filter(Boolean)
    : [];

  function addKeyword() {
    const kw = kwInput.trim();
    if (!kw) return;
    const next = [...keywords.filter(k => k.toLowerCase() !== kw.toLowerCase()), kw];
    set("globalKeywords", next.join(", "));
    setKwInput("");
  }

  function removeKeyword(kw) {
    set("globalKeywords", keywords.filter(k => k !== kw).join(", "));
  }

  // ── homepage variant helpers ─────────────────────────────────────────────
  function addVariant() {
    set("homepageVariants", [
      ...form.homepageVariants,
      { id: String(Date.now()), title: "", description: "", active: form.homepageVariants.length === 0 },
    ]);
  }

  function updateVariant(id, field, val) {
    set("homepageVariants", form.homepageVariants.map(v => v.id === id ? { ...v, [field]: val } : v));
  }

  function removeVariant(id) {
    const remaining = form.homepageVariants.filter(v => v.id !== id);
    // if we removed the active one, make the first remaining active
    if (form.homepageVariants.find(v => v.id === id)?.active && remaining.length > 0) {
      remaining[0].active = true;
    }
    set("homepageVariants", remaining);
  }

  function setActiveVariant(id) {
    set("homepageVariants", form.homepageVariants.map(v => ({ ...v, active: v.id === id })));
  }

  // ── extra meta helpers ───────────────────────────────────────────────────
  function addExtraMeta() {
    set("extraMeta", [...form.extraMeta, { name: "", content: "" }]);
  }

  function updateExtraMeta(i, field, val) {
    const next = form.extraMeta.map((m, idx) => idx === i ? { ...m, [field]: val } : m);
    set("extraMeta", next);
  }

  function removeExtraMeta(i) {
    set("extraMeta", form.extraMeta.filter((_, idx) => idx !== i));
  }

  // ── save ─────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.put("/settings/seo", form, auth);
      if (res.data?.ok) {
        setSeo(res.data.seo);
        t.ok({ title: "Saved", sub: "SEO settings updated." });
      }
    } catch (e) {
      t.err({ title: "Error", sub: e.message || "Failed to save." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-800" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Search className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-sm text-gray-500">Control how your website appears in Google and other search engines</p>
        </div>
      </div>

      <div className="space-y-8">

        {/* ── Global Keywords ─────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Global Keywords</h2>
          <p className="text-xs text-gray-400 mb-4">
            These keywords are added to <strong>every page</strong> on your site — great for terms like "gita for kids", "children's bhagavad gita", etc.
          </p>

          {/* Tag display */}
          <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
            {keywords.map(kw => (
              <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm rounded-full font-medium">
                {kw}
                <button onClick={() => removeKeyword(kw)} className="text-indigo-400 hover:text-indigo-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {keywords.length === 0 && <p className="text-xs text-gray-400 self-center">No keywords added yet</p>}
          </div>

          {/* Add keyword input */}
          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="e.g. gita for kids"
              value={kwInput}
              onChange={e => setKwInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
            />
            <button
              onClick={addKeyword}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Press Enter or click Add. Each keyword/phrase is added as a tag.</p>
        </div>

        {/* ── Homepage SEO Variants ────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Homepage SEO</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Add as many title + description pairs as you want. The <span className="font-semibold text-indigo-600">active</span> one is what Google shows.
              </p>
            </div>
            <button
              onClick={addVariant}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add variant
            </button>
          </div>

          {form.homepageVariants.length === 0 && (
            <div className="mt-4 border-2 border-dashed border-gray-200 rounded-xl py-8 text-center">
              <p className="text-sm text-gray-400">No variants yet. Click <strong>Add variant</strong> to create your first.</p>
            </div>
          )}

          <div className="mt-4 space-y-4">
            {form.homepageVariants.map((v, idx) => (
              <div key={v.id} className={`border-2 rounded-2xl p-4 transition-colors ${v.active ? "border-indigo-400 bg-indigo-50/40" : "border-gray-200 bg-white"}`}>
                {/* Variant header */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setActiveVariant(v.id)}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    {v.active
                      ? <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      : <Circle className="w-5 h-5 text-gray-300" />}
                    <span className={v.active ? "text-indigo-700 font-semibold" : "text-gray-500"}>
                      {v.active ? "Active (shown on Google)" : `Variant ${idx + 1} — click to activate`}
                    </span>
                  </button>
                  <button onClick={() => removeVariant(v.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Title */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title <span className="text-gray-400 font-normal">— shown as the heading in Google results</span></label>
                  <input
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    placeholder="e.g. Kiddos Intellect - Bhagavad Gita for Kids & Children's Books India"
                    value={v.title}
                    onChange={e => updateVariant(v.id, "title", e.target.value)}
                    maxLength={80}
                  />
                  <p className="text-xs text-gray-400 mt-1">{v.title.length}/80 — ideal: under 60</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description <span className="text-gray-400 font-normal">— shown below the title in Google results</span></label>
                  <textarea
                    rows={2}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
                    placeholder="e.g. Shop Bhagavad Gita for kids, children's spiritual books and premium educational materials. Free shipping above ₹500."
                    value={v.description}
                    onChange={e => updateVariant(v.id, "description", e.target.value)}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-400 mt-1">{v.description.length}/200 — ideal: under 160</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Default / Fallback SEO ───────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Default / Fallback</h2>
            <p className="text-xs text-gray-400">Used on pages that don't have their own description or image set.</p>
          </div>

          <Field label="Default Description" hint="Fallback description for any page that doesn't have one.">
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              placeholder="Premium children's books and educational materials..."
              value={form.defaultDescription}
              onChange={e => set("defaultDescription", e.target.value)}
              maxLength={200}
            />
          </Field>

          <Field label="Default Social Image URL" hint="Image shown when sharing any page link on WhatsApp, Facebook, etc. Use a full URL or an image path like /images/share-banner.jpg">
            <input
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="/images/share-banner.jpg or https://..."
              value={form.defaultOgImage}
              onChange={e => set("defaultOgImage", e.target.value)}
            />
          </Field>
        </div>

        {/* ── Verification & Advanced ──────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Verification & Advanced</h2>
          </div>

          <Field label="Google Search Console Verification Code" hint='Paste only the content value from the meta tag Google gives you, e.g. "abcdef123456"'>
            <input
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="abcdef1234567890"
              value={form.googleVerification}
              onChange={e => set("googleVerification", e.target.value)}
            />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Extra Meta Tags</p>
                <p className="text-xs text-gray-400">Add any custom meta tags, e.g. for Bing or Pinterest verification.</p>
              </div>
              <button
                onClick={addExtraMeta}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add tag
              </button>
            </div>

            {form.extraMeta.length === 0 && (
              <p className="text-xs text-gray-400 py-2">No extra meta tags added.</p>
            )}

            <div className="space-y-2">
              {form.extraMeta.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="w-36 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder='name="..."'
                    value={m.name}
                    onChange={e => updateExtraMeta(i, "name", e.target.value)}
                  />
                  <input
                    className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="content"
                    value={m.content}
                    onChange={e => updateExtraMeta(i, "content", e.target.value)}
                  />
                  <button onClick={() => removeExtraMeta(i)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Save button ──────────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save SEO Settings"}
          </button>
        </div>

      </div>
    </div>
  );
}
