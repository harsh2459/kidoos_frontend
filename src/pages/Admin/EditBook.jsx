import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { assetUrl, toRelativeFromPublic } from "../../api/asset";

export default function EditBook() {
  const { slug } = useParams();
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [book, setBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/books/${slug}`);
      setBook(data?.book || null);
    })();
  }, [slug]);

  if (!book) return <div className="mx-auto max-w-screen-xl px-4 py-8">Loading…</div>;

  const set = (k, v) => setBook(prev => ({ ...prev, [k]: v }));
  const setInv = (k, v) => setBook(prev => ({ ...prev, inventory: { ...(prev.inventory || {}), [k]: v } }));
  const setAssets = (k, v) => setBook(prev => ({ ...prev, assets: { ...(prev.assets || {}), [k]: v } }));

  async function uploadCover(file) {
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      const res = await api.post("/uploads/image", fd, { ...auth, headers: { ...auth.headers, "Content-Type": "multipart/form-data" } });
      setAssets("coverUrl", res.data.path);
    } finally { setUploading(false); }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: book.title, subtitle: book.subtitle, authors: book.authors, language: book.language,
        isbn10: book.isbn10, isbn13: book.isbn13, edition: book.edition, printType: book.printType,
        pages: book.pages || 0, mrp: book.mrp || 0, price: book.price || 0,
        discountPct: book.discountPct || 0, taxRate: book.taxRate || 0, currency: book.currency || "INR",
        inventory: { sku: book.inventory?.sku, stock: Number(book.inventory?.stock) || 0, lowStockAlert: Number(book.inventory?.lowStockAlert) || 5 },
        assets: {
          coverUrl: toRelativeFromPublic(book.assets?.coverUrl),
          samplePdfUrl: toRelativeFromPublic(book.assets?.samplePdfUrl) || book.assets?.samplePdfUrl
        },
        categories: book.categories || [], tags: book.tags || [],
        descriptionHtml: book.descriptionHtml || "", visibility: book.visibility || "public",
      };
      await api.put(`/books/${book._id}`, payload, auth);
      alert("Saved");
    } catch (e) { alert(e.response?.data?.error || "Save failed"); }
    finally { setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Book</h1>

      <form onSubmit={save} className="space-y-6">
        {/* Cards */}
        <Card title="Basics">
          <Row label="Title"><input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
            value={book.title} onChange={e => set("title", e.target.value)} /></Row>
          <Row label="Subtitle"><input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
            value={book.subtitle || ""} onChange={e => set("subtitle", e.target.value)} /></Row>
          <Row label="Authors (comma separated)">
            <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={(book.authors || []).join(", ")}
              onChange={e => set("authors", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
          </Row>
        </Card>

        <Card title="Identifiers & Details">
          <div className="grid md:grid-cols-3 gap-3">
            <Row label="ISBN-10"><input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={book.isbn10 || ""} onChange={e => set("isbn10", e.target.value)} /></Row>
            <Row label="ISBN-13"><input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={book.isbn13 || ""} onChange={e => set("isbn13", e.target.value)} /></Row>
            <Row label="Language"><input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={book.language || ""} onChange={e => set("language", e.target.value)} /></Row>
          </div>

          <div className="grid md:grid-cols-4 gap-3 mt-3">
            <Row label="Format">
              <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.printType || "paperback"} onChange={e => set("printType", e.target.value)}>
                <option value="paperback">Paperback</option>
                <option value="hardcover">Hardcover</option>
                <option value="ebook">eBook (PDF/Kindle)</option>
              </select>
            </Row>
            <Row label="Pages"><input type="number" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={book.pages || 0} onChange={e => set("pages", Number(e.target.value) || 0)} /></Row>
            <Row label="MRP"><input type="number" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={book.mrp || 0} onChange={e => set("mrp", Number(e.target.value) || 0)} /></Row>
            <Row label="Sale price"><input type="number" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={book.price || 0} onChange={e => set("price", Number(e.target.value) || 0)} /></Row>
          </div>
        </Card>

        <Card title="Inventory">
          <div className="grid md:grid-cols-3 gap-3">
            <Row label="SKU"><input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={book.inventory?.sku || ""} onChange={e => setInv("sku", e.target.value)} /></Row>
            <Row label="Stock"><input type="number" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={book.inventory?.stock || 0} onChange={e => setInv("stock", Number(e.target.value) || 0)} /></Row>
            <Row label="Low stock alert"><input type="number" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={book.inventory?.lowStockAlert || 5} onChange={e => setInv("lowStockAlert", Number(e.target.value) || 5)} /></Row>
          </div>
        </Card>

        <Card title="Categories & Description">
          <Row label="Categories (comma separated)">
            <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={(book.categories || []).join(", ")}
              onChange={e => set("categories", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
          </Row>
          <Row label="Tags (comma separated)">
            <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={(book.tags || []).join(", ")}
              onChange={e => set("tags", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
          </Row>
          <Row label="Description">
            <textarea className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 h-32"
              value={book.descriptionHtml || ""} onChange={e => set("descriptionHtml", e.target.value)} />
          </Row>
        </Card>

        <Card title="Media & Visibility">
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadCover(e.target.files[0])} />
            {uploading && <span className="text-xs text-gray-600">Uploading…</span>}
            {book.assets?.coverUrl && <img src={assetUrl(book.assets.coverUrl)} alt="cover" className="h-16 w-12 object-cover rounded-md" />}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <label className="text-sm">Visibility</label>
            <select className="bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={book.visibility || "public"} onChange={e => set("visibility", e.target.value)}>
              <option value="public">Public</option><option value="draft">Draft</option>
            </select>
          </div>
        </Card>

        <div className="flex justify-end">
          <button disabled={saving || uploading}
            className="px-5 py-2.5 rounded-lg bg-brand  font-semibold hover:brightness-110 disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div className="text-sm font-semibold text-gray-700 mb-3">{title}</div>
      {children}
    </div>
  );
}
function Row({ label, children }) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="block text-sm mb-1">{label}</label>
      {children}
    </div>
  );
}
