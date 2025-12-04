// src/pages/admin/EditBook.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { assetUrl, toRelativeFromPublic } from "../../api/asset";
import { t } from "../../lib/toast";
import { Save, Upload, X, ChevronDown, Check, Image as ImageIcon, ArrowLeft } from "lucide-react";

export default function EditBook() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [book, setBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [whyChooseThisText, setWhyChooseThisText] = useState("");
  // free-text versions so commas are allowed while typing
  const [authorsText, setAuthorsText] = useState("");
  const [categoriesText, setCategoriesText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [suggestionsText, setSuggestionsText] = useState("");

  // categories dropdown
  const [categoryList, setCategoryList] = useState([]);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // ✅ Use admin route directly with slug - it handles both ID and slug
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
        setSuggestionsText((b.suggestions || []).join(", "));
        
        // Populate the 'Why Choose This' text box
        setWhyChooseThisText((b.whyChooseThis || []).join("\n"));

      } catch (error) {
        console.error("❌ Error loading book:", error);
        t.err(error?.response?.data?.error || "Failed to load book");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    // fetch categories for dropdown
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/books/categories", auth);
        if (!mounted) return;
        setCategoryList(res?.data?.items || []);
      } catch (e) {
        console.warn("Failed to load categories", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="bg-[#F4F7F5] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E3E8E5] border-t-[#1A3C34] rounded-full animate-spin"></div>
          <p className="text-[#5C756D]">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-[#F4F7F5] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-[#1A3C34] mb-2">Book Not Found</h2>
          <button onClick={() => navigate("/admin/books")} className="text-[#4A7C59] hover:underline">
            Return to Books List
          </button>
        </div>
      </div>
    );
  }

  // ---------- safe setters ----------
  const setField = (k, v) => setBook((prev) => ({ ...prev, [k]: v }));
  const setInv = (k, v) => setBook((prev) => ({ ...prev, inventory: { ...(prev.inventory || {}), [k]: v } }));
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
      setAssets("coverUrl", [...(book.assets?.coverUrl || []), ...paths]);
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

  // categories helper for dropdown
  const selectedFromText = () => splitCsv(categoriesText);

  function toggleCategoryInEdit(val) {
    const cur = selectedFromText();
    if (cur.includes(val)) {
      setCategoriesText(cur.filter(x => x !== val).join(", "));
    } else {
      setCategoriesText([...cur, val].join(", "));
    }
  }

  // Add new function for whyChooseThis that handles both commas and newlines
  function splitReasons(str = "") {
    return str
      .split(/[\n,]/) // Split by newlines OR commas
      .map(s => s.trim())
      .filter(Boolean);
  }

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
        whyChooseThis: splitReasons(whyChooseThisText),
        suggestions: splitCsv(suggestionsText),
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

  /* ---------------- Pricing helpers (unchanged) ---------------- */
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

        const mrp = field === "mrp" ? raw : (prev.mrp ?? "");
        const price = field === "price" ? raw : (prev.price ?? "");
        const disc = field === "discountPct" ? raw : (prev.discountPct ?? "");

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

  const selected = selectedFromText();

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34] pb-20">
      
      {/* Responsive Container */}
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-[#5C756D] hover:text-[#1A3C34] mb-2 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Books
            </button>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1A3C34]">Edit Book</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border ${book.visibility === "public"
              ? "bg-[#E8F0EB] text-[#2F523F] border-[#4A7C59]"
              : "bg-gray-100 text-gray-600 border-gray-300"
              }`}>
              {book.visibility || "draft"}
            </span>
            <button
              onClick={save}
              disabled={saving || uploading}
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A3C34] text-white font-bold hover:bg-[#2F523F] transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <form onSubmit={save} className="space-y-8">
          
          {/* Basic Info */}
          <Card title="Basic Information">
            <Row label="Title" hintRight="Shown in catalog">
              <input
                className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none"
                placeholder="e.g. Strategic Management MPA-011"
                value={book.title || ""}
                onChange={(e) => setField("title", e.target.value)}
              />
            </Row>

            <div className="grid md:grid-cols-2 gap-6">
              <Row label="Subtitle">
                <input
                  className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none"
                  value={book.subtitle || ""}
                  onChange={(e) => setField("subtitle", e.target.value)}
                />
              </Row>
              <Row label="Authors" hintRight="Comma separated">
                <input
                  className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none"
                  value={authorsText}
                  onChange={(e) => setAuthorsText(e.target.value)}
                />
              </Row>
            </div>
          </Card>

          {/* Details & Pricing Grid */}
          <div className="grid lg:grid-cols-1 gap-4">

            <Card title="Pricing & Inventory">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Row label="MRP (₹)">
                  <input
                    type="number"
                    className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]"
                    value={book.mrp ?? ""}
                    onChange={handlePriceChange("mrp")}
                    placeholder="0"
                  />
                </Row>
                <Row label="Sale Price (₹)">
                  <input
                    type="number"
                    className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34] font-bold text-[#1A3C34]"
                    value={book.price ?? ""}
                    onChange={handlePriceChange("price")}
                    placeholder="0"
                  />
                </Row>
                <Row label="Discount (%)">
                  <input
                    type="number"
                    className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34] text-green-600"
                    value={book.discountPct ?? ""}
                    onChange={handlePriceChange("discountPct")}
                    placeholder="0"
                  />
                </Row>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-[#E3E8E5] pt-6">
                <Row label="Stock">
                  <input
                    type="number"
                    className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]"
                    value={book.inventory?.stock ?? ""}
                    onChange={(e) => setInv("stock", e.target.value)}
                    placeholder="0"
                  />
                </Row>
                <Row label="Low Stock Alert">
                  <input
                    type="number"
                    className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]"
                    value={book.inventory?.lowStockAlert ?? ""}
                    onChange={(e) => setInv("lowStockAlert", e.target.value)}
                    placeholder="5"
                  />
                </Row>
              </div>
            </Card>
          </div>

          {/* Categorization */}
          <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm p-6 md:p-8">
            <div className="text-xl font-serif font-bold text-[#1A3C34] mb-6 border-b border-[#E3E8E5] pb-4">
              Categorization
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-[#2C3E38] block mb-2">Select Categories</label>

              <div className="relative">
                <div
                  className="flex items-center gap-2 flex-wrap p-3 border border-[#DCE4E0] rounded-xl bg-[#FAFBF9] cursor-pointer min-h-[50px]"
                  onClick={() => setCatOpen(v => !v)}
                >
                  {selected.length === 0 ? (
                    <span className="text-sm text-[#8BA699]">Choose categories…</span>
                  ) : (
                    selected.map((s) => {
                      const found = categoryList.find(c => c.slug === s || c.name === s);
                      const label = found?.name || s;
                      return (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1A3C34] text-white">
                          {label}
                          <button
                            type="button"
                            onClick={(ev) => { ev.stopPropagation(); toggleCategoryInEdit(s); }}
                            className="hover:text-red-300"
                            aria-label={`Remove ${label}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })
                  )}
                  <ChevronDown className="ml-auto w-4 h-4 text-[#8BA699]" />
                </div>

                {catOpen && (
                  <div className="absolute z-30 mt-2 w-full bg-white border border-[#E3E8E5] rounded-xl shadow-xl max-h-64 overflow-auto p-2">
                    {categoryList.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">No categories found</div>
                    ) : (
                      categoryList.map((c) => {
                        const key = c.slug || c._id || c.name;
                        const val = c.slug || c.name;
                        const checked = selected.includes(val) || selected.includes(c.name);
                        return (
                          <label key={key} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#F4F7F5] rounded-lg cursor-pointer transition-colors">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${checked ? 'bg-[#1A3C34] border-[#1A3C34]' : 'border-[#DCE4E0] bg-white'}`}>
                              {checked && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-[#2C3E38]">{c.name}</div>
                              <div className="text-xs text-[#8BA699]">Books: {c.count ?? 0}</div>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-[#2C3E38] block mb-2">Categories (CSV)</label>
                <input
                  className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]"
                  value={categoriesText}
                  onChange={(e) => setCategoriesText(e.target.value)}
                  placeholder="e.g. kids, math"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[#2C3E38] block mb-2">Tags (CSV)</label>
                <input
                  className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="e.g. bestseller, new"
                />
              </div>
            </div>
          </div>

          {/* Description & Suggestions */}
          <Card title="Content & SEO">
            <div className="mb-6">
              <label className="block mb-2 text-sm font-bold text-[#2C3E38]">
                Suggestion Groups (CSV)
              </label>
              <input
                type="text"
                value={suggestionsText}
                onChange={e => setSuggestionsText(e.target.value)}
                className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]"
                placeholder="Hindu Scriptures, Epic Texts"
              />
              <p className="mt-1.5 text-xs text-[#5C756D] flex items-center gap-1">
                <span className="bg-[#E8F0EB] text-[#2F523F] px-1.5 rounded text-[10px] font-bold">TIP</span>
                Books sharing the same group will appear as "You Might Also Like"
              </p>
            </div>

            <Row label="Description (HTML supported)">
              <textarea
                className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 h-40 outline-none focus:border-[#1A3C34] font-mono text-sm"
                value={book.descriptionHtml || ""}
                onChange={(e) => setField("descriptionHtml", e.target.value)}
              />
            </Row>
            
            <div className="mt-6">
              <label className="block text-sm font-bold text-[#2C3E38] mb-2">
                "Why Choose This Book" Points
              </label>
              <textarea
                value={whyChooseThisText}
                onChange={e => setWhyChooseThisText(e.target.value)}
                rows={5}
                placeholder="Enter each point on a new line"
                className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]"
              />
            </div>
          </Card>

          {/* Media & Visibility */}
          <Card title="Media & Settings">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-[#1A3C34] text-white rounded-xl cursor-pointer hover:bg-[#2F523F] transition-colors shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Upload Images</span>
                <input type="file" accept="image/*" multiple onChange={onPickImages} className="hidden" />
              </label>
              {uploading && <span className="text-sm text-[#5C756D] animate-pulse">Uploading...</span>}
            </div>

            {Array.isArray(book.assets?.coverUrl) && book.assets.coverUrl.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {book.assets.coverUrl.map((p, i) => (
                  <div key={`${p}-${i}`} className="relative group rounded-xl overflow-hidden border border-[#E3E8E5] aspect-[3/4] bg-white">
                    <img src={assetUrl(p)} alt="" className="h-full w-full object-contain p-2" />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      {i !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsCover(i)}
                          className="px-3 py-1 text-xs font-bold bg-white text-[#1A3C34] rounded-full hover:bg-[#E8F0EB]"
                        >
                          Make Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImageAt(i)}
                        className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    
                    {i === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#1A3C34] text-white text-[10px] font-bold rounded uppercase">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#DCE4E0] rounded-xl bg-[#FAFBF9] text-[#8BA699]">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No images uploaded yet</p>
              </div>
            )}

            <div className="border-t border-[#E3E8E5] mt-8 pt-6">
              <label className="text-sm font-bold text-[#2C3E38] block mb-2">Visibility Status</label>
              <select
                className="w-full sm:w-64 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]"
                value={book.visibility || "public"}
                onChange={(e) => setField("visibility", e.target.value)}
              >
                <option value="public">Public (Visible to everyone)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
          </Card>

          {/* Mobile Floating Save Button */}
          <div className="fixed bottom-6 right-6 sm:hidden z-50">
            <button
              onClick={save}
              disabled={saving || uploading}
              className="w-14 h-14 rounded-full bg-[#1A3C34] text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform"
            >
              <Save className="w-6 h-6" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ---------------- UI building blocks ---------------- */
function Card({ title, children }) {
  return (
    <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm p-6 md:p-8">
      <div className="text-xl font-serif font-bold text-[#1A3C34] mb-6 border-b border-[#E3E8E5] pb-4">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, hintRight, children }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-bold text-[#2C3E38]">{label}</label>
        {hintRight ? <span className="text-xs text-[#8BA699] font-medium">{hintRight}</span> : null}
      </div>
      {children}
    </div>
  );
}