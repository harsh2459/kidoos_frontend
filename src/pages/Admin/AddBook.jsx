// src/pages/Admin/AddBook.jsx
import { useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import slugify from "slugify";
import { assetUrl, toRelativeFromPublic } from "../../api/asset";
import { t } from "../../lib/toast";
import FancyButton from "../../components/button/button";

export default function AddBook() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // MULTI images
  const [coverUrls, setCoverUrls] = useState([]); // string[] relative "/public/..."

  const [form, setForm] = useState({
    title: "", subtitle: "", authors: "",
    language: "English", edition: "", printType: "paperback", pages: 0,
    mrp: 0, price: 0, discountPct: 0, taxRate: 0, currency: "INR",
    sku: "", stock: 0, lowStockAlert: 5, categories: "", tags: "",
    samplePdfUrl: "", descriptionHtml: "", visibility: "public",
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  /* ------------ Upload (multiple) ------------ */
  async function uploadImages(files) {
    if (!files?.length) return [];
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("files", f)); // field name MUST be "files"
    setUploading(true);
    try {
      const res = await api.post("/uploads/image", fd, {
        ...auth,
        headers: { ...auth.headers, "Content-Type": "multipart/form-data" },
      });
      const paths = (res.data?.images || [])
        .map(x => x?.path)
        .filter(Boolean)
        .map(toRelativeFromPublic);
      if (!paths.length) t.info("No images returned from server.");
      setCoverUrls(prev => [...prev, ...paths]); // append
      return paths;
    } catch (err) {
      t.err(err?.response?.data?.error || err?.message || "Upload failed");
      return [];
    } finally {
      setUploading(false);
    }
  }

  function onPickImages(e) {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    void uploadImages(list);
  }

  function removeImageAt(i) {
    setCoverUrls(arr => arr.filter((_, idx) => idx !== i));
  }

  function setAsCover(i) {
    setCoverUrls(arr => {
      const list = [...arr];
      if (i <= 0 || i >= list.length) return list;
      const [picked] = list.splice(i, 1);
      list.unshift(picked); // chosen image now index 0 (the cover)
      return list;
    });
  }

  /* ------------ Submit ------------ */
  function splitCsv(str = "") {
    return str.split(",").map(s => s.trim()).filter(Boolean);
  }

  async function submit(e) {
    if (e?.preventDefault) e.preventDefault();
    if (!token && !localStorage.getItem("admin_jwt")) return t.info("Please log in as Admin first.");
    if (!form.title?.trim()) return t.err("Title is required");

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      slug: slugify(form.title, { lower: true, strict: true }),
      subtitle: form.subtitle || undefined,
      authors: splitCsv(form.authors),
      language: form.language,
      pages: Number(form.pages) || 0,
      edition: form.edition || undefined,
      printType: (form.printType || "").toLowerCase() || undefined,
      mrp: Number(form.mrp) || 0,
      price: Number(form.price) || 0,
      discountPct: Number(form.discountPct) || 0,
      taxRate: Number(form.taxRate) || 0,
      currency: form.currency,
      inventory: {
        sku: form.sku || undefined,
        stock: Number(form.stock) || 0,
        lowStockAlert: Number(form.lowStockAlert) || 5,
      },
      assets: {
        coverUrl: (coverUrls || []).map(toRelativeFromPublic), // MULTI
        samplePdfUrl: toRelativeFromPublic(form.samplePdfUrl) || form.samplePdfUrl || undefined,
      },
      categories: splitCsv(form.categories),
      tags: splitCsv(form.tags),
      descriptionHtml: form.descriptionHtml || "",
      visibility: (form.visibility || "public").toLowerCase(),
    };

    try {
      await api.post("/books", payload, auth);
      t.ok("Book Created!");
      // reset some fields, keep others if you like
      setForm(f => ({
        ...f,
        title: "", subtitle: "", authors: "",
        mrp: 0, price: 0, categories: "", tags: "", samplePdfUrl: ""
      }));
      setCoverUrls([]);
    } catch (err) {
      t.err(err?.response?.data?.error || "Failed to create book");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Add Book</h1>

      <form onSubmit={submit} className="space-y-6">
        {/* Basics */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Basic Info" />
          <Field label="Title *" hint="Shown in catalog">
            <input
              className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. Strategic Management MPA-011"
            />
          </Field>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Subtitle">
              <input
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.subtitle}
                onChange={e => set("subtitle", e.target.value)}
              />
            </Field>
            <Field label="Authors" hint="comma separated">
              <input
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.authors}
                onChange={e => set("authors", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Details */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Details" />
          <div className="grid md:grid-cols-4 gap-3">
            <Field label="Language">
              <input
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.language}
                onChange={e => set("language", e.target.value)}
              />
            </Field>
            <Field label="Edition">
              <input
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.edition}
                onChange={e => set("edition", e.target.value)}
              />
            </Field>
            <Field label="Format">
              <select
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.printType}
                onChange={e => set("printType", e.target.value)}
              >
                <option value="paperback">Paperback</option>
                <option value="hardcover">Hardcover</option>
                <option value="ebook">eBook (PDF/Kindle)</option>
              </select>
            </Field>
            <Field label="Pages">
              <input
                type="number"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.pages}
                onChange={e => set("pages", e.target.value)}
              />
            </Field>
          </div>
          
        </div>

        {/* Pricing */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Pricing" />
          <div className="grid md:grid-cols-4 gap-3">
            <Field label="MRP">
              <input
                type="number"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.mrp}
                onChange={e => set("mrp", e.target.value)}
              />
            </Field>
            <Field label="Sale price">
              <input
                type="number"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.price}
                onChange={e => set("price", e.target.value)}
              />
            </Field>
            <Field label="Discount %">
              <input
                type="number"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.discountPct}
                onChange={e => set("discountPct", e.target.value)}
              />
            </Field>
            <Field label="Tax %">
              <input
                type="number"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.taxRate}
                onChange={e => set("taxRate", e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Inventory" />
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="Stock">
              <input
                type="number"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.stock}
                onChange={e => set("stock", e.target.value)}
              />
            </Field>
            <Field label="Low stock alert">
              <input
                type="number"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.lowStockAlert}
                onChange={e => set("lowStockAlert", e.target.value)}
              />
            </Field>
          </div>
        </div>
        {/* Categorization & Description */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Categorization" />
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Categories" hint="comma separated">
              <input
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.categories}
                onChange={e => set("categories", e.target.value)}
              />
            </Field>
            <Field label="Tags" hint="comma separated">
              <input
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
                value={form.tags}
                onChange={e => set("tags", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 h-32"
              value={form.descriptionHtml}
              onChange={e => set("descriptionHtml", e.target.value)}
            />
          </Field>
        </div>

        {/* Media & Visibility */}
        <div className="bg-surface border border-border-subtle rounded-xl shadow-sm p-5">
          <SectionTitle title="Media & Visibility" />

          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" multiple onChange={onPickImages} />
            {uploading && <span className="text-xs text-fg-subtle">Uploading…</span>}
          </div>

          {/* Thumbnails grid */}
          {coverUrls.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {coverUrls.map((p, i) => (
                <div key={`${p}-${i}`} className="relative border rounded-md overflow-hidden group">
                  <img src={assetUrl(p)} alt="" className="h-28 w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() => removeImageAt(i)}
                      className="px-2 py-0.5 text-xs rounded bg-white/90 border"
                    >
                      Remove
                    </button>
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => setAsCover(i)}
                        className="px-2 py-0.5 text-xs rounded bg-white/90 border"
                        title="Make cover"
                      >
                        Cover
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-sm text-fg-subtle">No images yet.</div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <label className="text-sm">Visibility</label>
            <select
              className="bg-surface border border-border rounded-lg px-3 py-2"
              value={form.visibility}
              onChange={e => set("visibility", e.target.value)}
            >
              <option value="public">Public</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Sticky actions — hidden native submit + FancyButton click */}
        <div className="sticky bottom-3 z-10">
          <div className="bg-surface/90 backdrop-blur border border-border-subtle rounded-xl shadow-md p-3 flex justify-end gap-2">
            <button type="submit" disabled={saving || uploading} className="sr-only" aria-hidden="true">
              Submit
            </button>
            <div onClick={submit}>
              <FancyButton text={saving ? "Saving…" : "Create"} />
            </div>
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
