// src/pages/admin/Homepage.jsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { toRelativeFromPublic, assetUrl } from "../../api/asset";
import { t } from "../../lib/toast";
import { 
  Save, Upload, Trash2, ArrowUp, ArrowDown, 
  Layout, Type, Image as ImageIcon, Grid, Move 
} from "lucide-react";

export default function HomepageAdmin() {
  const [token] = useState(localStorage.getItem("admin_jwt") || "");
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Homepage Data & Categories
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [settingsRes, catsRes] = await Promise.all([
          api.get("/settings", auth),
          api.get("/books/categories", auth)
        ]);

        if (settingsRes.data.ok) {
          setBlocks(settingsRes.data.homepage?.blocks || []);
        }
        setCategories(catsRes.data?.items || []);
      } catch (e) {
        console.error(e);
        t.err("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const addBlock = (type) => setBlocks(b => [...b, defaultBlock(type)]);

  const save = async () => {
    setSaving(true);
    try {
      const cleaned = blocks.map((b) => {
        const nb = { ...b };
        if (nb.image) nb.image = toRelativeFromPublic(nb.image);
        if (nb.type === "hero") nb.image = toRelativeFromPublic(nb.image);
        return nb;
      });
      await api.put("/settings/homepage", { blocks: cleaned }, auth);
      t.ok("Homepage saved successfully!");
    } catch (e) {
      t.err("Failed to save homepage");
    } finally {
      setSaving(false);
    }
  };

  const move = (from, to) => {
    setBlocks(prev => {
      const arr = [...prev];
      if (from < 0 || from >= arr.length) return arr;
      if (to < 0) to = 0;
      if (to > arr.length - 1) to = arr.length - 1;
      if (from === to) return arr;
      
      const item = arr[from];
      arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  const moveUp = (i) => move(i, i - 1);
  const moveDown = (i) => move(i, i + 1);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F4F7F5]"><div className="w-12 h-12 border-4 border-[#1A3C34] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1A3C34]">Homepage Builder</h1>
            <p className="text-[#5C756D] mt-1">Design your storefront layout.</p>
          </div>
          <button 
            onClick={save} 
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A3C34] text-white font-bold hover:bg-[#2F523F] transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Add Section Bar */}
        <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm p-5 mb-8">
           <span className="text-xs font-bold text-[#5C756D] uppercase tracking-wider mb-3 block">Add New Section</span>
           <div className="flex flex-wrap gap-3">
            <AddButton onClick={() => addBlock("hero")} icon={Layout} label="Hero Banner" />
            <AddButton onClick={() => addBlock("banner")} icon={ImageIcon} label="Promo Banner" />
            <AddButton onClick={() => addBlock("grid")} icon={Grid} label="Product Grid" />
            <AddButton onClick={() => addBlock("html")} icon={Type} label="Custom HTML" />
           </div>
        </div>

        {/* Blocks List */}
        <div className="space-y-6">
          {blocks.map((b, i) => (
            <div key={i} className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md group">
              
              {/* Block Header */}
              <div className="bg-[#FAFBF9] border-b border-[#E3E8E5] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                    b.type === 'hero' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    b.type === 'grid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {b.type}
                  </span>
                  <span className="text-sm font-medium text-[#1A3C34]">
                    {b.title || (b.type === 'html' ? 'Custom Code' : 'Untitled Section')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  
                  {/* Position Switcher (Requested Feature) */}
                  <div className="flex items-center gap-2 bg-white border border-[#DCE4E0] rounded-lg px-2 py-1 mr-2">
                    <span className="text-[10px] uppercase font-bold text-[#8BA699]">Position</span>
                    <select 
                      value={i} 
                      onChange={(e) => move(i, Number(e.target.value))}
                      className="bg-transparent text-sm font-bold text-[#1A3C34] outline-none cursor-pointer"
                    >
                      {blocks.map((_, idx) => (
                        <option key={idx} value={idx}>{idx + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center border-l border-[#DCE4E0] pl-2 gap-1">
                    <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1.5 text-[#5C756D] hover:text-[#1A3C34] disabled:opacity-30 rounded hover:bg-gray-100" title="Move Up"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => moveDown(i)} disabled={i === blocks.length - 1} className="p-1.5 text-[#5C756D] hover:text-[#1A3C34] disabled:opacity-30 rounded hover:bg-gray-100" title="Move Down"><ArrowDown className="w-4 h-4" /></button>
                    <button onClick={() => setBlocks(blocks.filter((_, x) => x !== i))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded ml-1" title="Remove"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Block Content */}
              <div className="p-6">
                <BlockEditor 
                  block={b} 
                  categories={categories}
                  onChange={(nb) => setBlocks(blocks.map((x, idx) => idx === i ? nb : x))} 
                />
              </div>
            </div>
          ))}

          {blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-[#DCE4E0] rounded-2xl bg-[#FAFBF9] text-[#8BA699]">
              <Layout className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">Homepage is empty</p>
              <p className="text-sm">Add a section above to get started</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Global Styles for Inputs */}
      <style>{`
        .input-base { width: 100%; background-color: #FAFBF9; border: 1px solid #DCE4E0; border-radius: 0.75rem; padding: 0.75rem 1rem; outline: none; transition: all; }
        .input-base:focus { border-color: #1A3C34; ring: 2px solid rgba(26,60,52,0.2); }
      `}</style>
    </div>
  );
}

// --- Subcomponents ---

function AddButton({ onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#DCE4E0] bg-white hover:border-[#1A3C34] hover:bg-[#F4F7F5] text-[#2C3E38] font-medium transition-all active:scale-95 shadow-sm">
      <div className="p-1 bg-[#E8F0EB] rounded-md"><Icon className="w-4 h-4 text-[#1A3C34]" /></div>
      {label}
    </button>
  );
}

function defaultBlock(type) {
  if (type === "hero") return { type, title: "Welcome", subtitle: "", image: "", ctaText: "Shop Now", ctaHref: "/catalog" };
  if (type === "banner") return { type, image: "", ctaText: "", ctaLink: "/" };
  if (type === "grid") return { type, title: "Featured Books", query: { q: "", category: "", sort: "new", limit: 8 } };
  if (type === "html") return { type, html: "<h2>Custom Section</h2><p>Edit me</p>" };
  return { type };
}

function BlockEditor({ block, onChange, categories }) {
  switch (block.type) {
    case "hero":
      return (
        <div className="grid md:grid-cols-2 gap-6">
          <Input label="Title" value={block.title} onChange={v => onChange({ ...block, title: v })} placeholder="Big Heading" />
          <Input label="Subtitle" value={block.subtitle} onChange={v => onChange({ ...block, subtitle: v })} placeholder="Small tagline" />
          <div className="md:col-span-2">
             <ImageUpload label="Hero Image" value={block.image} onChange={v => onChange({ ...block, image: v })} />
          </div>
          <Input label="CTA Button Text" value={block.ctaText} onChange={v => onChange({ ...block, ctaText: v })} placeholder="e.g. Shop Now" />
          <Input label="CTA Link" value={block.ctaHref} onChange={v => onChange({ ...block, ctaHref: v })} placeholder="e.g. /books" />
        </div>
      );
    case "banner":
      return (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <ImageUpload label="Banner Image" value={block.image} onChange={v => onChange({ ...block, image: v })} />
          </div>
          <Input label="Button Text (Optional)" value={block.ctaText} onChange={v => onChange({ ...block, ctaText: v })} />
          <Input label="Button Link (Optional)" value={block.ctaLink} onChange={v => onChange({ ...block, ctaLink: v })} />
        </div>
      );
    case "grid":
      return (
        <div className="grid md:grid-cols-2 gap-6">
          <Input label="Section Title" value={block.title} onChange={v => onChange({ ...block, title: v })} placeholder="e.g. New Arrivals" />
          
          {/* ✅ UPDATED: Category Dropdown */}
          <div>
            <label className="text-sm font-bold text-[#2C3E38] block mb-2">Category Filter</label>
            <div className="relative">
              <select 
                className="input-base appearance-none"
                value={block.query.category} 
                onChange={e => onChange({ ...block, query: { ...block.query, category: e.target.value } })}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#5C756D]">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>

          <Input label="Search Query (Optional)" value={block.query.q} onChange={v => onChange({ ...block, query: { ...block.query, q: v } })} placeholder="e.g. Harry Potter" />
          <Input label="Limit (Items count)" type="number" value={block.query.limit} onChange={v => onChange({ ...block, query: { ...block.query, limit: Number(v) || 8 } })} />
        </div>
      );
    case "html":
      return (
        <div>
          <label className="text-sm font-bold text-[#2C3E38] block mb-2">Custom HTML</label>
          <textarea 
            value={block.html} 
            onChange={e => onChange({ ...block, html: e.target.value })} 
            className="input-base h-40 font-mono text-sm"
            placeholder="<div>...</div>"
          />
        </div>
      );
    default: return null;
  }
}

function Input({ label, value, onChange, placeholder, type="text" }) {
  return (
    <div>
      <label className="text-sm font-bold text-[#2C3E38] block mb-2">{label}</label>
      <input 
        type={type}
        className="input-base"
        value={value || ""} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
      />
    </div>
  );
}

function ImageUpload({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append("files", file);

      try {
        const response = await api.post("/uploads/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem("admin_jwt")}`,
          },
        });

        if (response.data.ok) {
          const { path } = response.data.images[0];
          onChange(path); 
        } else {
          t.err("Failed to upload image");
        }
      } catch (error) {
        console.error(error);
        t.err("Error uploading image");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div>
      <label className="text-sm font-bold text-[#2C3E38] block mb-2">{label}</label>
      <div className="flex gap-4 items-start">
        <div className="flex-1">
            <div className="relative">
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-dashed border-[#1A3C34] rounded-xl cursor-pointer hover:bg-[#F4F7F5] transition-colors text-[#1A3C34] font-medium group">
                    {uploading ? <span className="animate-pulse">Uploading...</span> : <><Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Choose Image</>}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
            </div>
            <input
                type="text"
                className="input-base mt-2 text-xs font-mono text-[#5C756D]"
                placeholder="Or paste image URL/path"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
        {value && (
            <div className="w-24 h-24 border border-[#E3E8E5] rounded-lg bg-white p-1 shadow-sm flex-shrink-0">
                <img src={assetUrl(value)} alt="Preview" className="w-full h-full object-contain rounded" />
            </div>
        )}
      </div>
    </div>
  );
}