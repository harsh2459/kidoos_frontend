import { useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import slugify from "slugify";
import { assetUrl, toRelativeFromPublic } from "../../api/asset";

export default function AddBook() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [saving, setSaving] = useState(false);
  const [cover, setCover] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");

  const [form, setForm] = useState({
    title: "", subtitle: "", authors: "",
    language: "English", edition: "", printType: "paperback", pages: 0,
    mrp: 0, price: 0, discountPct: 0, taxRate: 0, currency: "INR",
    sku: "", stock: 0, lowStockAlert: 5, categories: "", tags: "",
    samplePdfUrl: "", descriptionHtml: "", visibility: "public",
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  async function uploadImage(file) {
    const fd = new FormData();
    fd.append("file", file);
    setUploadingCover(true);
    try {
      const res = await api.post("/uploads/image", fd, { ...auth, headers: { ...auth.headers, "Content-Type": "multipart/form-data" } });
      setCoverUrl(res.data?.path || "");
    } finally { setUploadingCover(false); }
  }

  async function submit(e) {
    e.preventDefault();
    if (!token && !localStorage.getItem("admin_jwt")) return alert("Please log in as Admin first.");
    if (!form.title?.trim()) return alert("Title is required");

    setSaving(true);
    if (cover && !coverUrl) await uploadImage(cover);

    const payload = {
      title: form.title.trim(),
      slug: slugify(form.title, { lower: true }),
      subtitle: form.subtitle || undefined,
      authors: form.authors ? form.authors.split(",").map(s => s.trim()).filter(Boolean) : [],
      language: form.language, pages: Number(form.pages) || 0, edition: form.edition || undefined, printType: form.printType,
      mrp: Number(form.mrp) || 0, price: Number(form.price) || 0, discountPct: Number(form.discountPct) || 0, taxRate: Number(form.taxRate) || 0,
      currency: form.currency,
      inventory: { sku: form.sku || undefined, stock: Number(form.stock) || 0, lowStockAlert: Number(form.lowStockAlert) || 5 },
      assets: {
        coverUrl: toRelativeFromPublic(coverUrl) || undefined,
        samplePdfUrl: toRelativeFromPublic(form.samplePdfUrl) || form.samplePdfUrl || undefined
      },
      categories: form.categories ? form.categories.split(",").map(s => s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
      descriptionHtml: form.descriptionHtml || "",
      visibility: form.visibility
    };

    try {
      await api.post("/books", payload, auth);
      alert("Book created!");
      setForm(f => ({ ...f, title: "", subtitle: "", authors: "", mrp: 0, price: 0 }));
      setCover(null); setCoverUrl("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create book");
    } finally { setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Add Book</h1>

      <form onSubmit={submit} className="space-y-6">
        {/* Card: Basic info */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Basic Info" />
          <Field label="Title *" hint="Shown in catalog">
            <input className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Strategic Management MPA-011" />
          </Field>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Subtitle">
              <input className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.subtitle} onChange={e => set("subtitle", e.target.value)} />
            </Field>
            <Field label="Authors" hint="comma separated">
              <input className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.authors} onChange={e => set("authors", e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Card: Details */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Details" />
          <div className="grid md:grid-cols-4 gap-3">
            <Field label="Language"><input className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.language} onChange={e => set("language", e.target.value)} /></Field>
            <Field label="Edition"><input className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.edition} onChange={e => set("edition", e.target.value)} /></Field>
            <Field label="Format">
              <select className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.printType} onChange={e => set("printType", e.target.value)}>
                <option value="paperback">Paperback</option>
                <option value="hardcover">Hardcover</option>
                <option value="ebook">eBook (PDF/Kindle)</option>
              </select>
            </Field>
            <Field label="Pages"><input type="number" className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.pages} onChange={e => set("pages", e.target.value)} /></Field>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            <Field label="Sample PDF URL"><input type="url" className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.samplePdfUrl} onChange={e => set("samplePdfUrl", e.target.value)} placeholder="https://..." /></Field>
            <div />
          </div>
        </div>

        {/* Card: Pricing */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Pricing" />
          <div className="grid md:grid-cols-4 gap-3">
            <Field label="MRP"><input type="number" className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.mrp} onChange={e => set("mrp", e.target.value)} /></Field>
            <Field label="Sale price"><input type="number" className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.price} onChange={e => set("price", e.target.value)} /></Field>
            <Field label="Discount %"><input type="number" className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.discountPct} onChange={e => set("discountPct", e.target.value)} /></Field>
            <Field label="Tax %"><input type="number" className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.taxRate} onChange={e => set("taxRate", e.target.value)} /></Field>
          </div>
        </div>

        {/* Card: Inventory */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Inventory" />
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="SKU"><input className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.sku} onChange={e => set("sku", e.target.value)} /></Field>
            <Field label="Stock"><input type="number" className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.stock} onChange={e => set("stock", e.target.value)} /></Field>
            <Field label="Low stock alert"><input type="number" className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.lowStockAlert} onChange={e => set("lowStockAlert", e.target.value)} /></Field>
          </div>
        </div>

        {/* Card: Categorization & Description */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Categorization" />
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Categories" hint="comma separated">
              <input className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.categories} onChange={e => set("categories", e.target.value)} />
            </Field>
            <Field label="Tags" hint="comma separated">
              <input className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.tags} onChange={e => set("tags", e.target.value)} />
            </Field>
          </div>
          <Field label="Description">
            <textarea className="w-full bg-surface border border-border rounded-lg px-3 py-2 h-32"
              value={form.descriptionHtml} onChange={e => set("descriptionHtml", e.target.value)} />
          </Field>
        </div>

        {/* Card: Media & Visibility */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Cover & Visibility" />
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*"
                onChange={(e) => { const f = e.target.files?.[0]; setCover(f || null); if (f) uploadImage(f); }} />
              {uploadingCover && <span className="text-xs text-fg-subtle">Uploading…</span>}
              {coverUrl && <img src={assetUrl(coverUrl)} alt="cover" className="h-16 w-12 object-cover rounded-md" />}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <label className="text-sm">Visibility</label>
              <select className="bg-surface border border-border rounded-lg px-3 py-2"
                value={form.visibility} onChange={e => set("visibility", e.target.value)}>
                <option value="public">Public</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sticky actions */}
        <div className="sticky bottom-3 z-10">
          <div className="bg-surface/90 backdrop-blur border border-border-subtle rounded-xl shadow-md p-3 flex justify-end">
            <button disabled={saving || uploadingCover}
              className="px-5 py-2.5 rounded-lg bg-brand  font-semibold hover:brightness-110 disabled:opacity-60">
              {saving ? "Saving…" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({ title }) {
  return <div className="text-sm font-semibold text-gray-700 mb-3">{title}</div>;
}
function Field({ label, hint, children }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm">{label}</label>
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
