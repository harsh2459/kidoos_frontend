// src/pages/admin/AddBook.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { assetUrl, toRelativeFromPublic } from "../../api/asset";
import { t } from "../../lib/toast";
import { 
  Save, Upload, X, ChevronDown, Check, Image as ImageIcon, 
  ArrowLeft, PlusCircle, Edit3, Lock, Layout, Trash2, Plus 
} from "lucide-react";

export default function AddBook() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  // ✅ NEW: Tab State for switching views
  const [activeTab, setActiveTab] = useState("general");

  const [book, setBook] = useState({
    title: "",
    subtitle: "",
    language: "English",
    edition: "",
    pages: "",
    mrp: "",
    price: "",
    discountPct: "",
    inventory: { stock: 0, lowStockAlert: 5, sku: "KI-", asin: "490110" },
    dimensions: { weight: 0, length: 0, width: 0, height: 0 },
    visibility: "public",
    assets: { coverUrl: [] },
    descriptionHtml: "",
    // ✅ NEW: Template Data Initialization
    templateType: "standard",
    layoutConfig: {
      story: { heading: "Why We Created This?", text: "", quote: "", imageUrl: "" },
      curriculum: [],
      specs: [],
      testimonials: []
    }
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Text inputs
  const [authorsText, setAuthorsText] = useState("");
  const [categoriesText, setCategoriesText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [suggestionsText, setSuggestionsText] = useState("");
  const [whyChooseThisText, setWhyChooseThisText] = useState("");

  const [categoryList, setCategoryList] = useState([]);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/books/categories", auth);
        setCategoryList(res?.data?.items || []);
      } catch (e) {
        console.warn("Failed to load categories", e);
      }
    })();
  }, []);

  // --- Helper Functions ---
  const setField = (k, v) => setBook((prev) => ({ ...prev, [k]: v }));
  const setInv = (k, v) => setBook((prev) => ({ ...prev, inventory: { ...prev.inventory, [k]: v } }));
  const setAssets = (k, v) => setBook((prev) => ({ ...prev, assets: { ...prev.assets, [k]: v } }));
  const setDim = (k, v) => setBook((prev) => ({ ...prev, dimensions: { ...prev.dimensions, [k]: v } }));

  // ✅ NEW: Page Builder Helpers
  const setConfig = (section, key, val) => {
    setBook(prev => ({
      ...prev,
      layoutConfig: {
        ...prev.layoutConfig,
        [section]: { ...prev.layoutConfig[section], [key]: val }
      }
    }));
  };

  const updateItem = (section, index, key, val) => {
    setBook(prev => {
      const list = [...(prev.layoutConfig[section] || [])];
      list[index] = { ...list[index], [key]: val };
      return {
        ...prev,
        layoutConfig: { ...prev.layoutConfig, [section]: list }
      };
    });
  };

  const addItem = (section, template) => {
    setBook(prev => ({
      ...prev,
      layoutConfig: {
        ...prev.layoutConfig,
        [section]: [...(prev.layoutConfig[section] || []), template]
      }
    }));
  };

  const removeItem = (section, index) => {
    setBook(prev => ({
      ...prev,
      layoutConfig: {
        ...prev.layoutConfig,
        [section]: prev.layoutConfig[section].filter((_, i) => i !== index)
      }
    }));
  };

  // --- Image Handling ---
  async function uploadImages(files) {
    if (!files?.length) return;
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
    } catch (e) {
      t.err("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onPickImages(e) {
    const list = Array.from(e.target.files || []);
    if (list.length) uploadImages(list);
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

  // --- Data Parsing ---
  const splitCsv = (str = "") => str.split(",").map(s => s.trim()).filter(Boolean);
  const splitReasons = (str = "") => str.split(/[\n,]/).map(s => s.trim()).filter(Boolean);

  const selectedFromText = () => splitCsv(categoriesText);
  function toggleCategory(val) {
    const cur = selectedFromText();
    if (cur.includes(val)) {
      setCategoriesText(cur.filter(x => x !== val).join(", "));
    } else {
      setCategoriesText([...cur, val].join(", "));
    }
  }

  // --- Pricing Logic ---
  const toNum = (v) => (v === "" || v === null ? NaN : Number(v));

  function handlePriceChange(field) {
    return (e) => {
      const raw = e.target.value;
      setBook((prev) => {
        const next = { ...prev, [field]: raw };
        const mrp = field === "mrp" ? raw : prev.mrp;
        const price = field === "price" ? raw : prev.price;
        const disc = field === "discountPct" ? raw : prev.discountPct;

        if (field === "mrp" || field === "price") {
          const M = toNum(mrp), P = toNum(price);
          if (isFinite(M) && M > 0 && isFinite(P)) {
            next.discountPct = String(Math.round(((M - P) / M) * 100));
          }
        } else if (field === "discountPct") {
          const M = toNum(mrp), D = toNum(disc);
          if (isFinite(M) && M > 0 && isFinite(D)) {
            next.price = String(Math.round(M * (1 - D / 100)));
          }
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
        ...book,
        authors: splitCsv(authorsText),
        categories: splitCsv(categoriesText),
        tags: splitCsv(tagsText),
        suggestions: splitCsv(suggestionsText),
        whyChooseThis: splitReasons(whyChooseThisText),
        pages: Number(book.pages) || 0,
        mrp: Number(book.mrp) || 0,
        price: Number(book.price) || 0,
        discountPct: Number(book.discountPct) || 0,
        inventory: {
          sku: book.inventory.sku || "",
          asin: book.inventory.asin || "", 
          stock: Number(book.inventory.stock) || 0,
          lowStockAlert: Number(book.inventory.lowStockAlert) || 5,
        },
        dimensions: {
          weight: Number(book.dimensions.weight) || 0,
          length: Number(book.dimensions.length) || 0,
          width: Number(book.dimensions.width) || 0,
          height: Number(book.dimensions.height) || 0,
        },
        // ✅ NEW: Ensure layoutConfig and templateType are sent
        templateType: book.templateType,
        layoutConfig: book.layoutConfig
      };

      await api.post("/books", payload, auth);
      t.ok("Book created successfully!");
      navigate("/admin/books");
    } catch (e) {
      console.error(e);
      t.err(e.response?.data?.error || "Failed to create book");
    } finally {
      setSaving(false);
    }
  }

  const selected = selectedFromText();

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34] pb-20">
   
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Header with Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/admin/books")}
              className="flex items-center gap-2 text-[#5C756D] hover:text-[#1A3C34] mb-2 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Books
            </button>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1A3C34]">Add New Book</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ NEW: Tab Buttons */}
            <div className="bg-white rounded-lg p-1 flex shadow-sm border border-[#E3E8E5]">
               <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-[#1A3C34] text-white shadow' : 'text-[#5C756D] hover:bg-gray-50'}`}>
                   General Info
               </button>
               <button onClick={() => setActiveTab('builder')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'builder' ? 'bg-[#1A3C34] text-white shadow' : 'text-[#5C756D] hover:bg-gray-50'}`}>
                   <Layout className="w-4 h-4" /> Page Builder
               </button>
            </div>

            <button
              onClick={save}
              disabled={saving || uploading}
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A3C34] text-white font-bold hover:bg-[#2F523F] transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              {saving ? "Creating..." : "Create Book"}
            </button>
          </div>
        </div>

        <form onSubmit={save} className="space-y-8">

          {/* --- TAB 1: GENERAL INFO (Your Existing Code) --- */}
          <div className={activeTab === 'general' ? 'block space-y-8' : 'hidden'}>
            
            <Card title="Basic Information">
              <Row label="Title" hintRight="Required">
                <input required className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none" placeholder="e.g. My First Book of Colors" value={book.title} onChange={(e) => setField("title", e.target.value)} />
              </Row>
              <div className="grid md:grid-cols-2 gap-6">
                <Row label="Subtitle"><input className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none" placeholder="e.g. A fun learning adventure" value={book.subtitle} onChange={(e) => setField("subtitle", e.target.value)} /></Row>
                <Row label="Authors" hintRight="Comma separated"><input className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none" placeholder="e.g. Dr. Seuss" value={authorsText} onChange={(e) => setAuthorsText(e.target.value)} /></Row>
              </div>
            </Card>

            <Card title="Identification">
              <div className="grid md:grid-cols-2 gap-6">
                <Row label="SKU" hintRight="Unique identifier"><input className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all outline-none" placeholder="e.g. KI-001" value={book.inventory.sku} onChange={(e) => setInv("sku", e.target.value)} /></Row>
                <Row label="HSN" hintRight="Amazon ID"><div className="relative"><input className="w-full bg-gray-100 border border-[#DCE4E0] rounded-xl px-4 py-3 pr-10 text-gray-600 cursor-not-allowed" placeholder="Amazon ID" value={book.inventory.asin} readOnly /><Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /></div></Row>
              </div>
            </Card>

            <Card title="Pricing & Inventory">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Row label="MRP (₹)"><input type="number" className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]" value={book.mrp} onChange={handlePriceChange("mrp")} placeholder="0" /></Row>
                <Row label="Sale Price (₹)"><input type="number" className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34] font-bold text-[#1A3C34]" value={book.price} onChange={handlePriceChange("price")} placeholder="0" /></Row>
                <Row label="Discount (%)"><input type="number" className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34] text-green-600" value={book.discountPct} onChange={handlePriceChange("discountPct")} placeholder="0" /></Row>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-[#E3E8E5] pt-6">
                <Row label="Stock"><input type="number" className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]" value={book.inventory.stock} onChange={(e) => setInv("stock", e.target.value)} placeholder="0" /></Row>
                <Row label="Low Stock Alert"><input type="number" className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]" value={book.inventory.lowStockAlert} onChange={(e) => setInv("lowStockAlert", e.target.value)} placeholder="5" /></Row>
              </div>
            </Card>

            {/* Categorization & Media (Kept same logic) */}
            <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm p-6 md:p-8">
              <div className="text-xl font-serif font-bold text-[#1A3C34] mb-6 border-b border-[#E3E8E5] pb-4">Categorization</div>
              <div className="mb-6">
                <label className="text-sm font-bold text-[#2C3E38] block mb-2">Select Categories</label>
                <div className="relative">
                  <div className="flex items-center gap-2 flex-wrap p-3 border border-[#DCE4E0] rounded-xl bg-[#FAFBF9] cursor-pointer min-h-[50px]" onClick={() => setCatOpen(v => !v)}>
                    {selected.length === 0 ? <span className="text-sm text-[#8BA699]">Choose categories…</span> : selected.map((s) => (<span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1A3C34] text-white">{s}<button type="button" onClick={(ev) => { ev.stopPropagation(); toggleCategory(s); }} className="hover:text-red-300"><X className="w-3 h-3" /></button></span>))}
                    <ChevronDown className="ml-auto w-4 h-4 text-[#8BA699]" />
                  </div>
                  {catOpen && (<div className="absolute z-30 mt-2 w-full bg-white border border-[#E3E8E5] rounded-xl shadow-xl max-h-64 overflow-auto p-2">{categoryList.map((c) => { const val = c.slug || c.name; const checked = selected.includes(val) || selected.includes(c.name); return (<label key={c._id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#F4F7F5] rounded-lg cursor-pointer transition-colors"><div className={`w-5 h-5 rounded border flex items-center justify-center ${checked ? 'bg-[#1A3C34] border-[#1A3C34]' : 'border-[#DCE4E0] bg-white'}`}>{checked && <Check className="w-3.5 h-3.5 text-white" />}</div><div className="flex-1 font-medium text-sm text-[#2C3E38]">{c.name}</div></label>); })}</div>)}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Row label="Categories (CSV)"><input className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]" value={categoriesText} onChange={(e) => setCategoriesText(e.target.value)} /></Row>
                <Row label="Tags (CSV)"><input className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]" value={tagsText} onChange={(e) => setTagsText(e.target.value)} /></Row>
              </div>
            </div>

            <Card title="Content & SEO">
              <div className="mb-6"><label className="block mb-2 text-sm font-bold text-[#2C3E38]">Suggestion Groups (CSV)</label><input type="text" value={suggestionsText} onChange={e => setSuggestionsText(e.target.value)} className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]" /></div>
              <Row label="Description"><textarea className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 h-40 outline-none focus:border-[#1A3C34] font-mono text-sm" value={book.descriptionHtml} onChange={(e) => setField("descriptionHtml", e.target.value)} placeholder="Book description..." /></Row>
              <div className="mt-6"><label className="block text-sm font-bold text-[#2C3E38] mb-2">"Why Choose This Book" Points</label><textarea value={whyChooseThisText} onChange={e => setWhyChooseThisText(e.target.value)} rows={5} className="w-full bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]" /></div>
            </Card>

            <Card title="Media & Settings">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <label className="flex items-center gap-2 px-4 py-2.5 bg-[#1A3C34] text-white rounded-xl cursor-pointer hover:bg-[#2F523F] transition-colors shadow-sm"><Upload className="w-4 h-4" /><span>Upload Images</span><input type="file" accept="image/*" multiple onChange={onPickImages} className="hidden" /></label>
                {uploading && <span className="text-sm text-[#5C756D] animate-pulse">Uploading...</span>}
              </div>
              {book.assets.coverUrl.length > 0 ? (<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{book.assets.coverUrl.map((p, i) => (<div key={`${p}-${i}`} className="relative group rounded-xl overflow-hidden border border-[#E3E8E5] aspect-[3/4] bg-white"><img src={assetUrl(p)} className="h-full w-full object-contain p-2" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">{i !== 0 && (<button type="button" onClick={() => setAsCover(i)} className="px-3 py-1 text-xs font-bold bg-white text-[#1A3C34] rounded-full">Cover</button>)}<button type="button" onClick={() => removeImageAt(i)} className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full">Remove</button></div>{i === 0 && <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#1A3C34] text-white text-[10px] font-bold rounded uppercase">Cover</div>}</div>))}</div>) : (<div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#DCE4E0] rounded-xl bg-[#FAFBF9] text-[#8BA699]"><ImageIcon className="w-8 h-8 mb-2 opacity-50" /><p className="text-sm">No images uploaded yet</p></div>)}
              <div className="border-t border-[#E3E8E5] mt-8 pt-6"><label className="text-sm font-bold text-[#2C3E38] block mb-2">Visibility Status</label><select className="w-full sm:w-64 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34]" value={book.visibility} onChange={(e) => setField("visibility", e.target.value)}><option value="public">Public</option><option value="draft">Draft</option></select></div>
            </Card>
          </div>

          {/* --- TAB 2: PAGE BUILDER (✅ NEW CMS Fields) --- */}
          <div className={activeTab === 'builder' ? 'block space-y-8' : 'hidden'}>
            
            {/* 1. Theme Selection */}
            <Card title="Theme & Mission">
                <div className="mb-6">
                    <label className="block text-sm font-bold text-[#2C3E38] mb-2">Page Template</label>
                    <select 
                        value={book.templateType} 
                        onChange={e => setField("templateType", e.target.value)}
                        className="w-full p-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl outline-none focus:border-[#1A3C34]"
                    >
                        <option value="standard">Standard (Default)</option>
                        <option value="spiritual">Spiritual (Gold/Green)</option>
                        <option value="activity">Activity (Blue/Orange)</option>
                    </select>
                </div>

                <div className="space-y-4 border-t border-[#E3E8E5] pt-6">
                    <h3 className="font-bold text-[#1A3C34]">Mission Section</h3>
                    <div>
                      <label className="block text-sm font-bold text-[#2C3E38] mb-2">Heading</label>
                      <input className="input-field" value={book.layoutConfig?.story?.heading} onChange={e => setConfig("story", "heading", e.target.value)} placeholder="e.g. Why We Created This?" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#2C3E38] mb-2">Main Story Text</label>
                        <textarea 
                            className="w-full p-3 bg-[#FAFBF9] border border-[#DCE4E0] rounded-xl outline-none h-32"
                            value={book.layoutConfig?.story?.text}
                            onChange={e => setConfig("story", "text", e.target.value)}
                            placeholder="Tell the story behind this book..."
                        />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#2C3E38] mb-2">Highlight Quote</label>
                      <input className="input-field" value={book.layoutConfig?.story?.quote} onChange={e => setConfig("story", "quote", e.target.value)} placeholder="e.g. A tool for grandparents to bond..." />
                    </div>
                </div>
            </Card>

            {/* 2. Product Specs */}
            <Card title="Product Specifications">
                <p className="text-sm text-[#5C756D] mb-4">Generates the details table (e.g. Paper Quality, Binding).</p>
                {book.layoutConfig?.specs?.map((spec, i) => (
                    <div key={i} className="flex gap-4 items-center mb-3">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <input className="input-field" placeholder="Label (e.g. Binding)" value={spec.label} onChange={e => updateItem("specs", i, "label", e.target.value)} />
                            <input className="input-field" placeholder="Value (e.g. Hardbound)" value={spec.value} onChange={e => updateItem("specs", i, "value", e.target.value)} />
                        </div>
                        <button type="button" onClick={() => removeItem("specs", i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                    </div>
                ))}
                <button type="button" onClick={() => addItem("specs", { label: "", value: "", icon: "check" })} className="mt-2 text-sm font-bold text-[#1A3C34] flex items-center gap-1 hover:underline">
                    <Plus className="w-4 h-4" /> Add Specification
                </button>
            </Card>

            {/* 3. Curriculum / Skills */}
            <Card title="Curriculum & Skills">
                <p className="text-sm text-[#5C756D] mb-4">Add the key learning outcomes (the icon grid).</p>
                {book.layoutConfig?.curriculum?.map((item, i) => (
                    <div key={i} className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E3E8E5] mb-4 relative group">
                        <button type="button" onClick={() => removeItem("curriculum", i)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-[#2C3E38]">Title</label><input className="input-field" value={item.title} onChange={e => updateItem("curriculum", i, "title", e.target.value)} placeholder="e.g. Cognitive Skills" /></div>
                            <div><label className="text-xs font-bold text-[#2C3E38]">Icon Name</label><input className="input-field" value={item.icon} onChange={e => updateItem("curriculum", i, "icon", e.target.value)} placeholder="e.g. brain, heart" /></div>
                        </div>
                        <div className="mt-3">
                            <label className="text-xs font-bold text-[#8BA699]">Description</label>
                            <input className="input-field mt-1" value={item.description} onChange={e => updateItem("curriculum", i, "description", e.target.value)} placeholder="e.g. Enhances memory and focus..." />
                        </div>
                    </div>
                ))}
                <button type="button" onClick={() => addItem("curriculum", { title: "", description: "", icon: "star" })} className="w-full py-3 border-2 border-dashed border-[#DCE4E0] rounded-xl text-[#5C756D] font-bold hover:bg-white hover:border-[#1A3C34] transition-all flex justify-center items-center gap-2">
                    <Plus className="w-5 h-5" /> Add Curriculum Point
                </button>
            </Card>

            {/* 4. Testimonials */}
            <Card title="Manual Testimonials">
                {book.layoutConfig?.testimonials?.map((review, i) => (
                    <div key={i} className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E3E8E5] mb-4 relative">
                        <button type="button" onClick={() => removeItem("testimonials", i)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        <div className="grid md:grid-cols-3 gap-4 mb-3">
                            <input className="input-field" placeholder="Name" value={review.name} onChange={e => updateItem("testimonials", i, "name", e.target.value)} />
                            <input className="input-field" placeholder="Role/Location" value={review.role} onChange={e => updateItem("testimonials", i, "role", e.target.value)} />
                            <input className="input-field" type="number" placeholder="Rating (1-5)" value={review.rating} onChange={e => updateItem("testimonials", i, "rating", e.target.value)} />
                        </div>
                        <textarea className="input-field h-20" value={review.text} onChange={e => updateItem("testimonials", i, "text", e.target.value)} placeholder="Review content..." />
                    </div>
                ))}
                <button type="button" onClick={() => addItem("testimonials", { name: "", role: "", text: "", rating: 5 })} className="mt-2 text-sm font-bold text-[#1A3C34] flex items-center gap-1 hover:underline">
                    <Plus className="w-4 h-4" /> Add Review
                </button>
            </Card>
          </div>

          {/* Floating Mobile Save */}
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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-[#2C3E38]">{label}</label>
        {hintRight && <span className="text-xs text-[#5C756D]">{hintRight}</span>}
      </div>
      {children}
    </div>
  );
}