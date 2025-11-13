// src/pages/admin/EditBook.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { assetUrl, toRelativeFromPublic } from "../../api/asset";
import { t } from "../../lib/toast";

export default function EditBook() {
  const { slug } = useParams();
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [book, setBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // free-text versions so commas are allowed while typing
  const [authorsText, setAuthorsText] = useState("");
  const [categoriesText, setCategoriesText] = useState("");
  const [tagsText, setTagsText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // ✅ FIX: Use admin route directly with slug - it handles both ID and slug
        const { data } = await api.get(`/books/admin/${slug}`, auth);
        const b = data?.book || null;

        if (!b) {
          t.err("Book not found");
          return;
        }

        // normalize images to array of relative paths
        const coverArr = Array.isArray(b?.assets?.coverUrl)
          ? b.assets.coverUrl
          : (b?.assets?.coverUrl ? [b.assets.coverUrl] : []);
        const normalizedCovers = coverArr.map(toRelativeFromPublic);

        setBook({ ...b, assets: { ...(b.assets || {}), coverUrl: normalizedCovers } });

        setAuthorsText((b.authors || []).join(", "));
        setCategoriesText((b.categories || []).join(", "));
        setTagsText((b.tags || []).join(", "));
      } catch (error) {
        console.error("❌ Error loading book:", error);
        t.err(error?.response?.data?.error || "Failed to load book");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-8">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-8">
        <div className="text-center py-10 text-red-600">
          Book not found
        </div>
      </div>
    );
  }

  // ---------- safe setters ----------
  const setField  = (k, v) => setBook((prev) => ({ ...prev, [k]: v }));
  const setInv    = (k, v) => setBook((prev) => ({ ...prev, inventory: { ...(prev.inventory || {}), [k]: v } }));
  const setAssets = (k, v) => setBook((prev) => ({ ...prev, assets: { ...(prev.assets || {}), [k]: v } }));

  /* ---------------- Images (multiple) ---------------- */
  async function uploadImages(files) {
    if (!files?.length) return [];
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("files", f));
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
      setAssets("coverUrl", [ ...(book.assets?.coverUrl || []), ...paths ]);
      return paths;
    } catch (e) {
      t.err(e?.response?.data?.error || "Upload failed");
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
    setAssets("coverUrl", (book.assets?.coverUrl || []).filter((_, idx) => idx !== i));
  }

  function setAsCover(i) {
    setAssets("coverUrl", ((arr) => {
      const list = [...(arr || [])];
      if (i <= 0 || i >= list.length) return list;
      const [picked] = list.splice(i, 1);
      list.unshift(picked);
      return list;
    })(book.assets?.coverUrl || []));
  }

  /* ---------------- Save ---------------- */
  const splitCsv = (str = "") => str.split(",").map(s => s.trim()).filter(Boolean);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: (book.title || "").trim(),
        subtitle: book.subtitle,
        authors: splitCsv(authorsText),
        language: book.language,
        edition: book.edition,
        printType: (book.printType || "").toLowerCase() || undefined,
        pages: Number(book.pages) || 0,

        mrp: Number(book.mrp) || 0,
        price: Number(book.price) || 0,
        discountPct: Number(book.discountPct) || 0,
        taxRate: Number(book.taxRate) || 0,
        currency: book.currency || "INR",

        inventory: {
          sku: book.inventory?.sku,
          stock: Number(book.inventory?.stock) || 0,
          lowStockAlert: Number(book.inventory?.lowStockAlert) || 5,
        },

        assets: {
          coverUrl: (book.assets?.coverUrl || []).map(toRelativeFromPublic),
          samplePdfUrl: toRelativeFromPublic(book.assets?.samplePdfUrl) || book.assets?.samplePdfUrl || undefined,
        },

        categories: splitCsv(categoriesText),
        tags: splitCsv(tagsText),
        descriptionHtml: book.descriptionHtml || "",
        visibility: (book.visibility || "public").toLowerCase(),
      };

      await api.patch(`/books/${book._id}`, payload, auth);
      t.ok("Saved successfully!");
    } catch (e) {
      t.err(e.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- Pricing: bi-directional auto calc ---------------- */
  const toNum = (v) => (v === "" || v === null || v === undefined ? NaN : Number(v));

  function calcDiscountPct(mrp, price) {
    const M = toNum(mrp), P = toNum(price);
    if (!isFinite(M) || M <= 0 || !isFinite(P)) return "";
    const pct = Math.round(((M - P) / M) * 100);
    return String(Math.min(100, Math.max(0, pct)));
  }
  function calcPriceFromDiscount(mrp, discountPct) {
    const M = toNum(mrp), D = toNum(discountPct);
    if (!isFinite(M) || M <= 0 || !isFinite(D)) return "";
    const price = Math.round(M * (1 - Math.min(100, Math.max(0, D)) / 100));
    return String(Math.max(0, price));
  }

  function handlePriceChange(field) {
    return (e) => {
      const raw = e.target.value;
      setBook((prev) => {
        const next = { ...prev, [field]: raw };

        const mrp   = field === "mrp"         ? raw : (prev.mrp ?? "");
        const price = field === "price"       ? raw : (prev.price ?? "");
        const disc  = field === "discountPct" ? raw : (prev.discountPct ?? "");

        const newDiscount = calcDiscountPct(mrp, price);
        next.discountPct = newDiscount;

        if (field === "mrp") {
          next.price = calcPriceFromDiscount(raw, newDiscount);
        } else if (field === "discountPct") {
          next.price = calcPriceFromDiscount(mrp, disc);
        }

        return next;
      });
    };
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Edit Book</h1>
        <span className={`px-3 py-1 rounded-full text-sm border ${
          book.visibility === "public"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-gray-100 text-gray-700 border-gray-200"
        }`}>
          {book.visibility || "draft"}
        </span>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Basic Info */}
        <Card title="Basic Info">
          <Row label="Title" hintRight="Shown in catalog">
            <input
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
              placeholder="e.g. Strategic Management MPA-011"
              value={book.title || ""}
              onChange={(e) => setField("title", e.target.value)}
            />
          </Row>

          <div className="grid md:grid-cols-2 gap-3">
            <Row label="Subtitle">
              <input
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.subtitle || ""}
                onChange={(e) => setField("subtitle", e.target.value)}
              />
            </Row>
            <Row label="Authors" hintRight="comma separated">
              <input
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={authorsText}
                onChange={(e) => setAuthorsText(e.target.value)}
              />
            </Row>
          </div>
        </Card>

        {/* Details */}
        <Card title="Details">
          <div className="grid md:grid-cols-4 gap-3">
            <Row label="Language">
              <input
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.language || ""}
                onChange={(e) => setField("language", e.target.value)}
              />
            </Row>
            <Row label="Edition">
              <input
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.edition || ""}
                onChange={(e) => setField("edition", e.target.value)}
              />
            </Row>
            <Row label="Format">
              <select
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.printType || "paperback"}
                onChange={(e) => setField("printType", e.target.value)}>
                <option value="paperback">Paperback</option>
                <option value="hardcover">Hardcover</option>
                <option value="ebook">eBook (PDF/Kindle)</option>
              </select>
            </Row>
            <Row label="Pages">
              <input
                type="number"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.pages ?? ""}
                onChange={(e) => setField("pages", e.target.value)}
                placeholder="0"
              />
            </Row>
          </div>
        </Card>

        {/* Pricing */}
        <Card title="Pricing">
          <div className="grid md:grid-cols-4 gap-3">
            <Row label="MRP">
              <input
                type="number"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.mrp ?? ""}
                onChange={handlePriceChange("mrp")}
                placeholder="0"
              />
            </Row>
            <Row label="Sale price">
              <input
                type="number"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.price ?? ""}
                onChange={handlePriceChange("price")}
                placeholder="0"
              />
            </Row>
            <Row label="Discount %">
              <input
                type="number"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.discountPct ?? ""}
                onChange={handlePriceChange("discountPct")}
                placeholder="0"
              />
            </Row>
            <Row label="Tax %">
              <input
                type="number"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.taxRate ?? ""}
                onChange={(e) => setField("taxRate", e.target.value)}
                placeholder="0"
              />
            </Row>
          </div>
        </Card>

        {/* Inventory */}
        <Card title="Inventory">
          <div className="grid md:grid-cols-2 gap-3">
            <Row label="Stock">
              <input
                type="number"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.inventory?.stock ?? ""}
                onChange={(e) => setInv("stock", e.target.value)}
                placeholder="0"
              />
            </Row>
            <Row label="Low stock alert">
              <input
                type="number"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={book.inventory?.lowStockAlert ?? ""}
                onChange={(e) => setInv("lowStockAlert", e.target.value)}
                placeholder="5"
              />
            </Row>
          </div>
        </Card>

        {/* Categorization */}
        <Card title="Categorization">
          <div className="grid md:grid-cols-2 gap-3">
            <Row label="Categories" hintRight="comma separated">
              <input
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={categoriesText}
                onChange={(e) => setCategoriesText(e.target.value)}
              />
            </Row>
            <Row label="Tags" hintRight="comma separated">
              <input
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
              />
            </Row>
          </div>

          <Row label="Description">
            <textarea
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 h-32"
              value={book.descriptionHtml || ""}
              onChange={(e) => setField("descriptionHtml", e.target.value)}
            />
          </Row>
        </Card>

        {/* Media & Visibility */}
        <Card title="Media & Visibility">
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" multiple onChange={onPickImages} />
            {uploading && <span className="text-xs text-gray-600">Uploading…</span>}
          </div>

          {Array.isArray(book.assets?.coverUrl) && book.assets.coverUrl.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {book.assets.coverUrl.map((p, i) => (
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
            <div className="mt-2 text-sm text-gray-500">No images yet.</div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <label className="text-sm">Visibility</label>
            <select
              className="bg-white border border-gray-300 rounded-lg px-3 py-2"
              value={book.visibility || "public"}
              onChange={(e) => setField("visibility", e.target.value)}
            >
              <option value="public">Public</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            disabled={saving || uploading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- UI building blocks ---------------- */
function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div className="text-sm font-semibold text-gray-700 mb-3">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, hintRight, children }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm">{label}</label>
        {hintRight ? <span className="text-xs text-gray-500">{hintRight}</span> : null}
      </div>
      {children}
    </div>
  );
}