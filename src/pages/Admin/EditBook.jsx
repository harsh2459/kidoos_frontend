// src/pages/admin/EditBook.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { assetUrl, toRelativeFromPublic } from "../../api/asset";
import { t } from "../../lib/toast";
import { Save, Upload, X, ChevronDown, Check, Image as ImageIcon, ArrowLeft, Edit3, Lock, Unlock } from "lucide-react";

export default function EditBook() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [book, setBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Text inputs for array fields
  const [whyChooseThisText, setWhyChooseThisText] = useState("");
  const [authorsText, setAuthorsText] = useState("");
  const [categoriesText, setCategoriesText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [suggestionsText, setSuggestionsText] = useState("");

  // Lock state for Dimensions
  const [dimensionsEditable, setDimensionsEditable] = useState(false);

  // Category dropdown logic
  const [categoryList, setCategoryList] = useState([]);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Use the admin route to get raw data
        const { data } = await api.get(`/books/admin/${slug}`, auth);
        const b = data?.book || null;

        if (!b) {
          t.err("Book not found");
          return;
        }

        // Normalize assets
        const coverArr = Array.isArray(b?.assets?.coverUrl)
          ? b.assets.coverUrl
          : (b?.assets?.coverUrl ? [b.assets.coverUrl] : []);
        const normalizedCovers = coverArr.map(toRelativeFromPublic);

        setBook({ 
            ...b, 
            assets: { ...(b.assets || {}), coverUrl: normalizedCovers },
            inventory: b.inventory || { sku: "", asin: "", stock: 0, lowStockAlert: 5 },
            dimensions: b.dimensions || { weight: 0, length: 0, width: 0, height: 0 }
        });

        // Populate text areas
        setAuthorsText((b.authors || []).join(", "));
        setCategoriesText((b.categories || []).join(", "));
        setTagsText((b.tags || []).join(", "));
        setSuggestionsText((b.suggestions || []).join(", "));
        setWhyChooseThisText((b.whyChooseThis || []).join("\n"));

      } catch (error) {
        console.error("❌ Error loading book:", error);
        t.err(error?.response?.data?.error || "Failed to load book");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Load Categories for dropdown
  useEffect(() => {
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

  // State Helpers
  const setField = (k, v) => setBook((prev) => ({ ...prev, [k]: v }));
  const setInv = (k, v) => setBook((prev) => ({ ...prev, inventory: { ...(prev.inventory || {}), [k]: v } }));
  const setDim = (k, v) => setBook((prev) => ({ ...prev, dimensions: { ...(prev.dimensions || {}), [k]: v } }));
  const setAssets = (k, v) => setBook((prev) => ({ ...prev, assets: { ...(prev.assets || {}), [k]: v } }));

  // --- Image Handling ---
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

  // --- Helper Functions ---
  const splitCsv = (str = "") => str.split(",").map(s => s.trim()).filter(Boolean);
  const splitReasons = (str = "") => str.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  const selectedFromText = () => splitCsv(categoriesText);

  function toggleCategoryInEdit(val) {
    const cur = selectedFromText();
    if (cur.includes(val)) {
      setCategoriesText(cur.filter(x => x !== val).join(", "));
    } else {
      setCategoriesText([...cur, val].join(", "));
    }
  }

  // --- Pricing Logic ---
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

        // Auto-calculate logic
        if (field === "mrp" || field === "price") {
            const newDiscount = calcDiscountPct(mrp === raw ? raw : mrp, price === raw ? raw : price);
            next.discountPct = newDiscount;
        } else if (field === "discountPct") {
            next.price = calcPriceFromDiscount(mrp, disc);
        }
        return next;
      });
    };
  }

  // --- Save Handler ---
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
          asin: book.inventory?.asin, // Pass back ASIN (even if read-only)
          stock: Number(book.inventory?.stock) || 0,
          lowStockAlert: Number(book.inventory?.lowStockAlert) || 5,
        },

        dimensions: {
          weight: Number(book.dimensions?.weight) || 0,
          length: Number(book.dimensions?.length) || 0,
          width: Number(book.dimensions?.width) || 0,
          height: Number(book.dimensions?.height) || 0,
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
      setDimensionsEditable(false); // Re-lock dimensions after save
    } catch (e) {
      t.err(e.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const selected = selectedFromText();

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34] pb-20">
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
            <Row label="Title" hintRight="Required">
              <input
                className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none"
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

          {/* Identification Section */}
          <Card title="Identification">
            <div className="grid md:grid-cols-2 gap-6">
              <Row label="SKU" hintRight="Stock Keeping Unit (Editable)">
                <input
                  className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none font-mono"
                  value={book.inventory?.sku || ""}
                  onChange={(e) => setInv("sku", e.target.value)}
                />
              </Row>
              <Row label="ASIN / Product ID" hintRight="Read-only Identifier">
                <div className="relative">
                  <input
                    className="w-full bg-gray-100 border border-[#DCE4E0] rounded-xl px-4 py-3 pr-10 text-gray-600 cursor-not-allowed font-mono"
                    value={book.inventory?.asin || ""}
                    readOnly
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </Row>
            </div>
          </Card>

          {/* Pricing & Inventory */}
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

          {/* Shipping Dimensions (Locked by default) */}
          <Card title="Shipping Dimensions">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#5C756D]">Package dimensions for shipping (Lock/Unlock to edit)</p>
              <button
                type="button"
                onClick={() => setDimensionsEditable(!dimensionsEditable)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${dimensionsEditable
                    ? "bg-[#1A3C34] text-white border-[#1A3C34]"
                    : "bg-white text-[#2C3E38] border-[#DCE4E0] hover:border-[#1A3C34]"
                  }`}
              >
                {dimensionsEditable ? <Lock className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {dimensionsEditable ? "Lock" : "Edit"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Row label="Weight (kg)">
                <input
                  type="number"
                  step="0.001"
                  className={`w-full border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none transition-colors ${dimensionsEditable
                      ? "bg-[#FAFBF9] focus:border-[#1A3C34] text-[#2C3E38]"
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                    }`}
                  value={book.dimensions?.weight ?? 0}
                  onChange={(e) => setDim("weight", e.target.value)}
                  disabled={!dimensionsEditable}
                  placeholder="0.000"
                />
              </Row>
              <Row label="Length (cm)">
                <input
                  type="number"
                  className={`w-full border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none transition-colors ${dimensionsEditable
                      ? "bg-[#FAFBF9] focus:border-[#1A3C34] text-[#2C3E38]"
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                    }`}
                  value={book.dimensions?.length ?? 0}
                  onChange={(e) => setDim("length", e.target.value)}
                  disabled={!dimensionsEditable}
                  placeholder="0"
                />
              </Row>
              <Row label="Width (cm)">
                <input
                  type="number"
                  className={`w-full border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none transition-colors ${dimensionsEditable
                      ? "bg-[#FAFBF9] focus:border-[#1A3C34] text-[#2C3E38]"
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                    }`}
                  value={book.dimensions?.width ?? 0}
                  onChange={(e) => setDim("width", e.target.value)}
                  disabled={!dimensionsEditable}
                  placeholder="0"
                />
              </Row>
              <Row label="Height (cm)">
                <input
                  type="number"
                  className={`w-full border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none transition-colors ${dimensionsEditable
                      ? "bg-[#FAFBF9] focus:border-[#1A3C34] text-[#2C3E38]"
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                    }`}
                  value={book.dimensions?.height ?? 0}
                  onChange={(e) => setDim("height", e.target.value)}
                  disabled={!dimensionsEditable}
                  placeholder="0"
                />
              </Row>
            </div>
          </Card>

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
              <Row label="Categories (CSV)">
                <input
                  className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]"
                  value={categoriesText}
                  onChange={(e) => setCategoriesText(e.target.value)}
                />
              </Row>
              <Row label="Tags (CSV)">
                <input
                  className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                />
              </Row>
            </div>
          </div>

          {/* Content & SEO */}
          <Card title="Content & SEO">
            <Row label="Suggestion Groups (CSV)" hintRight="For 'You Might Also Like'">
              <input
                className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]"
                value={suggestionsText}
                onChange={e => setSuggestionsText(e.target.value)}
              />
            </Row>

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
                className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 h-32 outline-none focus:border-[#1A3C34] font-mono text-sm"
                placeholder="One point per line"
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

            {book.assets.coverUrl.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {book.assets.coverUrl.map((p, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-[#E3E8E5] aspect-[3/4] bg-white">
                      <img src={assetUrl(p)} className="h-full w-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                         {i!==0 && <button type="button" onClick={() => setAsCover(i)} className="px-3 py-1 text-xs font-bold bg-white text-[#1A3C34] rounded-full">Cover</button>}
                         <button type="button" onClick={() => removeImageAt(i)} className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full">Remove</button>
                      </div>
                      {i === 0 && <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#1A3C34] text-white text-[10px] font-bold rounded uppercase">Cover</div>}
                    </div>
                  ))}
               </div>
            ) : <div className="p-8 border-2 border-dashed border-[#DCE4E0] rounded-xl bg-[#FAFBF9] text-center text-[#8BA699]"><ImageIcon className="mx-auto w-8 h-8 mb-2 opacity-50"/>No images</div>}

             <div className="mt-8 pt-6 border-t border-[#E3E8E5]">
               <label className="text-sm font-bold text-[#2C3E38] block mb-2">Visibility Status</label>
               <select className="w-full sm:w-64 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]" value={book.visibility} onChange={(e) => setField("visibility", e.target.value)}><option value="public">Public (Visible)</option><option value="draft">Draft (Hidden)</option></select>
             </div>
          </Card>

          {/* Floating Mobile Save */}
          <div className="fixed bottom-6 right-6 sm:hidden z-50">
            <button type="submit" disabled={saving || uploading} className="w-14 h-14 rounded-full bg-[#1A3C34] text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform"><Save className="w-6 h-6" /></button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Components
function Card({ title, children }) {
  return (
    <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm p-6 md:p-8">
      <div className="text-xl font-serif font-bold text-[#1A3C34] mb-6 border-b border-[#E3E8E5] pb-4">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, hintRight, children }) {
  return (
    <div className="mb-6">
      <label className="flex items-center justify-between mb-2 text-sm font-bold text-[#2C3E38]">
        <span>{label}</span>
        {hintRight && <span className="text-xs text-[#5C756D] font-normal">{hintRight}</span>}
      </label>
      {children}
    </div>
  );
}