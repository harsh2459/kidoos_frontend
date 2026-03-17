// src/pages/admin/Homepage.jsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { toRelativeFromPublic, assetUrl } from "../../api/asset";
import { t } from "../../lib/toast";
import {
  Save, Upload, Trash2, ArrowUp, ArrowDown,
  Layout, Type, Image as ImageIcon, Grid,
  Images, Plus, Layers, LayoutTemplate, Monitor,
  Puzzle, Gift, ChevronDown, BookOpen
} from "lucide-react";

export default function HomepageAdmin() {
  const [token] = useState(localStorage.getItem("admin_jwt") || "");
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(new Set()); // indices of open blocks

  const toggleExpand = (i) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });

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
          const loadedBlocks = (settingsRes.data.homepage?.blocks || []).map(b => {
             // Migration helpers
             if(b.type === 'slider') {
                 b.sliderHeight = b.sliderHeight || "medium";
                 if(b.slides) {
                     b.slides = b.slides.map(s => ({
                         ...s,
                         desktopImage: s.desktopImage || s.image || "", 
                         mobileImage: s.mobileImage || "",
                         objectFit: s.objectFit || "cover"
                     }))
                 }
             }
             if(b.type === 'hero-slider' && b.slides) {
                 b.slides = b.slides.map(s => ({
                     ...s,
                     image: s.image || "",
                     bgColor: s.bgColor || "#384959",
                     textColor: s.textColor || "#ffffff",
                     layout: s.layout || 'split', 
                     height: s.height || 'medium',
                     objectFit: s.objectFit || 'cover'
                 }));
             }
             return b;
          });
          setBlocks(loadedBlocks);
        }
        setCategories(catsRes.data?.items || []);
      } catch (e) {
        console.error(e);
        t.err({ title: "Load failed", sub: "Could not load homepage settings. Please refresh." });
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const addBlock = (type) => {
    setBlocks(b => {
      const next = [...b, defaultBlock(type)];
      setExpanded(prev => new Set([...prev, next.length - 1]));
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const cleaned = blocks.map((b) => {
        const nb = { ...b };
        if (nb.image) nb.image = toRelativeFromPublic(nb.image);
        if (nb.type === "hero") nb.image = toRelativeFromPublic(nb.image);
        
        if (nb.type === "puzzle") {
            if (nb.rewardImage) nb.rewardImage = toRelativeFromPublic(nb.rewardImage);
            if (nb.levels) {
                nb.levels = nb.levels.map(l => ({
                    ...l,
                    image: toRelativeFromPublic(l.image)
                }));
            }
        }
        
        if (nb.type === "slider" && Array.isArray(nb.slides)) {
          nb.slides = nb.slides.map(s => ({
            ...s,
            desktopImage: toRelativeFromPublic(s.desktopImage),
            mobileImage: toRelativeFromPublic(s.mobileImage),
            image: undefined 
          }));
        }

        if (nb.type === "hero-slider" && Array.isArray(nb.slides)) {
          nb.slides = nb.slides.map(s => ({
            ...s,
            image: toRelativeFromPublic(s.image)
          }));
        }
        
        return nb;
      });
      await api.put("/settings/homepage", { blocks: cleaned }, auth);
      t.ok({ title: "Homepage saved", sub: "Your homepage layout has been updated." });
    } catch (e) {
      t.err({ title: "Save failed", sub: "Could not save homepage settings. Please try again." });
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F4F7F5]"><div className="w-12 h-12 border-4 border-[#384959] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] pb-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#384959]">Homepage Builder</h1>
          <p className="text-[#5C756D] mt-1">Design your storefront layout.</p>
        </div>

        {/* Add Section Bar */}
        <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm p-5 mb-8">
           <span className="text-xs font-bold text-[#5C756D] uppercase tracking-wider mb-3 block">Add New Section</span>
           <div className="flex flex-wrap gap-3">
            <AddButton onClick={() => addBlock("hero")} icon={Layout} label="Hero Banner" />
            <AddButton onClick={() => addBlock("hero-slider")} icon={Layers} label="Hero Slider" />
            <AddButton onClick={() => addBlock("slider")} icon={Images} label="Image Slider" />
            <AddButton onClick={() => addBlock("puzzle")} icon={Puzzle} label="Puzzle Game" /> 
            <AddButton onClick={() => addBlock("banner")} icon={ImageIcon} label="Promo Banner" />
            <AddButton onClick={() => addBlock("grid")} icon={Grid} label="Product Grid" />
            <AddButton onClick={() => addBlock("category-browser")} icon={BookOpen} label="Category Browser" />
            <AddButton onClick={() => addBlock("html")} icon={Type} label="Custom HTML" />
           </div>
        </div>

        {/* Blocks List */}
        {blocks.length > 0 && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8BA699] uppercase tracking-wider">{blocks.length} section{blocks.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => setExpanded(expanded.size === blocks.length ? new Set() : new Set(blocks.map((_, i) => i)))}
              className="text-xs font-semibold text-[#5C756D] hover:text-[#384959] transition-colors"
            >
              {expanded.size === blocks.length ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
        )}
        <div className="space-y-3">
          {blocks.map((b, i) => {
            const isOpen = expanded.has(i);
            const typeBadge =
              b.type === 'hero'        ? 'bg-blue-50 text-blue-700 border-blue-200' :
              b.type === 'hero-slider' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
              b.type === 'slider'      ? 'bg-purple-50 text-purple-700 border-purple-200' :
              b.type === 'puzzle'      ? 'bg-pink-50 text-pink-700 border-pink-200' :
              b.type === 'html'              ? 'bg-orange-50 text-orange-700 border-orange-200' :
              b.type === 'category-browser' ? 'bg-teal-50 text-teal-700 border-teal-200' :
              'bg-gray-100 text-gray-700 border-gray-200';
            const typeLabel =
              b.type === 'html' ? 'Custom Code' : b.type === 'puzzle' ? 'Game' :
              b.type === 'hero-slider' ? 'Hero Slider' : b.type === 'grid' ? 'Product Grid' :
              b.type === 'hero' ? 'Hero' : b.type === 'slider' ? 'Image Slider' :
              b.type === 'category-browser' ? 'Category Browser' : b.type;
            const blockTitle = b.title || (b.type === 'html' ? 'Untitled HTML Block' : b.type === 'puzzle' ? 'Puzzle Game' : b.type === 'category-browser' ? 'Category Browser' : 'Untitled Section');

            return (
              <div key={i} className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${isOpen ? 'border-[#384959]/30' : 'border-[#E3E8E5] hover:border-[#C5D1CB]'}`}>

                {/* ── Block header (always visible) ── */}
                <div
                  className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                  onClick={() => toggleExpand(i)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* drag number */}
                    <span className="w-6 h-6 flex items-center justify-center rounded-md bg-[#F0F3F1] text-[11px] font-bold text-[#5C756D] shrink-0">{i + 1}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border shrink-0 ${typeBadge}`}>{typeLabel}</span>
                    <span className="text-sm font-medium text-[#384959] truncate">{blockTitle}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {/* position select */}
                    <div className="flex items-center gap-1 bg-[#F4F7F5] border border-[#DCE4E0] rounded-lg px-2 py-1">
                      <span className="text-[9px] uppercase font-bold text-[#8BA699]">Pos</span>
                      <select
                        value={i}
                        onChange={e => move(i, Number(e.target.value))}
                        className="bg-transparent text-xs font-bold text-[#384959] outline-none cursor-pointer"
                      >
                        {blocks.map((_, idx) => <option key={idx} value={idx}>{idx + 1}</option>)}
                      </select>
                    </div>
                    <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1.5 text-[#5C756D] hover:text-[#384959] disabled:opacity-30 rounded hover:bg-gray-100"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveDown(i)} disabled={i === blocks.length - 1} className="p-1.5 text-[#5C756D] hover:text-[#384959] disabled:opacity-30 rounded hover:bg-gray-100"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setBlocks(blocks.filter((_, x) => x !== i)); setExpanded(prev => { const s = new Set(prev); s.delete(i); return s; }); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    <ChevronDown className={`w-4 h-4 text-[#8BA699] ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* ── Block editor (collapsed by default) ── */}
                {isOpen && (
                  <div className="border-t border-[#E3E8E5] p-6 bg-[#FAFBF9]">
                    <BlockEditor
                      block={b}
                      categories={categories}
                      onChange={nb => setBlocks(blocks.map((x, idx) => idx === i ? nb : x))}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-[#DCE4E0] rounded-2xl bg-[#FAFBF9] text-[#8BA699]">
              <Layout className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">Homepage is empty</p>
            </div>
          )}
        </div>
      </div>
      {/* ── Floating save button ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#384959] text-white font-bold shadow-xl hover:bg-[#2a3a48] active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <style>{`
        .input-base { width: 100%; background-color: #FAFBF9; border: 1px solid #DCE4E0; border-radius: 0.75rem; padding: 0.75rem 1rem; outline: none; transition: all; }
        .input-base:focus { border-color: #384959; ring: 2px solid rgba(26,60,52,0.2); }
      `}</style>
    </div>
  );
}

function AddButton({ onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#DCE4E0] bg-white hover:border-[#384959] hover:bg-[#F4F7F5] text-[#2C3E38] font-medium transition-all active:scale-95 shadow-sm">
      <div className="p-1 bg-[#E8F0EB] rounded-md"><Icon className="w-4 h-4 text-[#384959]" /></div>
      {label}
    </button>
  );
}

function defaultBlock(type) {
  if (type === "hero") return { type, title: "Welcome", subtitle: "", image: "", ctaText: "Shop Now", ctaHref: "/catalog" };
  if (type === "banner") return { type, image: "", ctaText: "", ctaLink: "/" };
  if (type === "grid") return { type, title: "Featured Books", query: { q: "", category: "", sort: "new", limit: 8 } };
  if (type === "html") return { type, title: "Custom Code Block", html: "<h2>Custom Section</h2><p>Edit me</p>" };
  if (type === "category-browser") return {
    type,
    title: "Browse by Category",
    defaultCategory: "",
    limit: 16,
    sort: "new",
    onlyCategories: "",
  };
  
  if (type === "slider") return { 
    type, 
    title: "Homepage Slider",
    sliderHeight: "medium", 
    slides: [{ desktopImage: "", mobileImage: "", link: "/catalog", alt: "", objectFit: "cover" }] 
  };

  if (type === "hero-slider") return {
    type,
    title: "Hero Slider",
    slides: [
      { 
        title: "Welcome Back", 
        subtitle: "Discover our latest collection", 
        image: "", 
        ctaText: "Shop Now", 
        ctaLink: "/catalog",
        bgColor: "#384959",
        textColor: "#ffffff",
        layout: "split",
        height: "medium",
        objectFit: "cover"
      }
    ]
  };

  if (type === "puzzle") return { 
    type, 
    title: "Puzzle Challenge!", 
    subtitle: "Complete all 3 levels to unlock a 20% Discount!", 
    levels: [
        { difficulty: "easy", image: "", label: "Level 1: Easy", gridSize: 3 },
        { difficulty: "medium", image: "", label: "Level 2: Medium", gridSize: 4 },
        { difficulty: "hard", image: "", label: "Level 3: Hard", gridSize: 5, maxMoves: 100 }
    ],
    winMessage: "You are a Puzzle Master!",
    rewardImage: "" 
  };

  return { type };
}

function BlockEditor({ block, onChange, categories }) {
  const updateSlide = (index, field, val) => {
    const newSlides = [...(block.slides || [])];
    newSlides[index] = { ...newSlides[index], [field]: val };
    onChange({ ...block, slides: newSlides });
  };

  const updateLevel = (levelIndex, field, val) => {
    const newLevels = [...(block.levels || [])];
    if(!newLevels[0]) newLevels[0] = { difficulty: "easy", gridSize: 3, label: "Level 1" };
    if(!newLevels[1]) newLevels[1] = { difficulty: "medium", gridSize: 4, label: "Level 2" };
    if(!newLevels[2]) newLevels[2] = { difficulty: "hard", gridSize: 5, label: "Level 3", maxMoves: 100 };
    
    newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: val };
    onChange({ ...block, levels: newLevels });
  };

  const addSlide = () => {
    if (block.type === 'slider') {
        onChange({ ...block, slides: [...(block.slides || []), { desktopImage: "", mobileImage: "", link: "", alt: "", objectFit: "cover" }] });
    } else if (block.type === 'hero-slider') {
        onChange({ ...block, slides: [...(block.slides || []), { title: "New Slide", subtitle: "", image: "", ctaText: "Shop", ctaLink: "/catalog", bgColor: "#384959", textColor: "#ffffff", layout: "split", height: "medium", objectFit: "cover" }] });
    }
  };

  const removeSlide = (index) => onChange({ ...block, slides: block.slides.filter((_, i) => i !== index) });

  switch (block.type) {
    case "hero":
      return (
        <div className="grid md:grid-cols-2 gap-6">
          <Input label="Title" value={block.title} onChange={v => onChange({ ...block, title: v })} placeholder="Big Heading" />
          <Input label="Subtitle" value={block.subtitle} onChange={v => onChange({ ...block, subtitle: v })} placeholder="Small tagline" />
          <div className="md:col-span-2"><ImageUpload label="Hero Image" value={block.image} onChange={v => onChange({ ...block, image: v })} /></div>
          <Input label="CTA Button Text" value={block.ctaText} onChange={v => onChange({ ...block, ctaText: v })} placeholder="Shop Now" />
          <Input label="CTA Link" value={block.ctaHref} onChange={v => onChange({ ...block, ctaHref: v })} placeholder="/books" />
        </div>
      );
    
    case "hero-slider":
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
             <label className="text-sm font-bold text-[#2C3E38]">Hero Slides</label>
             <button onClick={addSlide} className="text-sm font-bold text-[#4A7C59] flex items-center gap-1 hover:underline"><Plus className="w-4 h-4" /> Add Hero Slide</button>
          </div>
          
          <div className="space-y-8">
            {(block.slides || []).map((slide, idx) => (
              <div key={idx} className="border border-[#E3E8E5] p-5 rounded-xl bg-[#FAFBF9] relative group shadow-sm">
                <span className="absolute -left-3 -top-3 w-6 h-6 bg-[#384959] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">{idx + 1}</span>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-[#E3E8E5]">
                        <div>
                            <label className="text-xs font-bold text-[#5C756D] uppercase mb-2 flex items-center gap-1"><LayoutTemplate className="w-3 h-3"/> Layout Type</label>
                            <select 
                                value={slide.layout || 'split'} 
                                onChange={(e) => updateSlide(idx, 'layout', e.target.value)}
                                className="input-base py-2 text-sm"
                            >
                                <option value="split">Split (Text Left / Image Right)</option>
                                <option value="full">Full Banner (Image Background)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[#5C756D] uppercase mb-2 flex items-center gap-1"><Monitor className="w-3 h-3"/> Height</label>
                            <select 
                                value={slide.height || 'medium'} 
                                onChange={(e) => updateSlide(idx, 'height', e.target.value)}
                                className="input-base py-2 text-sm"
                            >
                                <option value="small">Small (Compact)</option>
                                <option value="medium">Medium (Standard)</option>
                                <option value="large">Large (Impactful)</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-xs font-bold text-[#5C756D] uppercase mb-2">Image Fit (Split View)</label>
                            <select 
                                value={slide.objectFit || 'cover'} 
                                onChange={(e) => updateSlide(idx, 'objectFit', e.target.value)}
                                className="input-base py-2 text-sm"
                            >
                                <option value="cover">Cover (Blended)</option>
                                <option value="contain">Contain (Full Image)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                       <div className="md:col-span-2"><ImageUpload label="Slide Image" value={slide.image} onChange={(v) => updateSlide(idx, 'image', v)} /></div>
                       <Input label="Title" value={slide.title} onChange={(v) => updateSlide(idx, 'title', v)} placeholder="Heading" />
                       <Input label="Subtitle" value={slide.subtitle} onChange={(v) => updateSlide(idx, 'subtitle', v)} placeholder="Tagline" />
                       <Input label="Button Text" value={slide.ctaText} onChange={(v) => updateSlide(idx, 'ctaText', v)} placeholder="Shop Now" />
                       <Input label="Button Link" value={slide.ctaLink} onChange={(v) => updateSlide(idx, 'ctaLink', v)} placeholder="/catalog" />
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-bold text-[#2C3E38] block mb-2">Bg Color</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={slide.bgColor || "#384959"} onChange={(e) => updateSlide(idx, 'bgColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none" />
                                <span className="text-xs text-gray-500 font-mono">{slide.bgColor}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-bold text-[#2C3E38] block mb-2">Text Color</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={slide.textColor || "#ffffff"} onChange={(e) => updateSlide(idx, 'textColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none" />
                                <span className="text-xs text-gray-500 font-mono">{slide.textColor}</span>
                            </div>
                          </div>
                       </div>
                    </div>
                </div>
                <button onClick={() => removeSlide(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 bg-white p-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      );

    case "slider":
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
             <div>
                <label className="text-sm font-bold text-[#2C3E38] block mb-2">Slider Height</label>
                <select className="input-base py-2 px-3 text-sm" value={block.sliderHeight || "medium"} onChange={(e) => onChange({ ...block, sliderHeight: e.target.value })}>
                    <option value="medium">Medium (Matches Hero)</option>
                    <option value="small">Small (300px)</option>
                    <option value="large">Large (700px)</option>
                </select>
             </div>
             <button onClick={addSlide} className="text-sm font-bold text-[#4A7C59] flex items-center gap-1 hover:underline"><Plus className="w-4 h-4" /> Add Slide</button>
          </div>
          <div className="space-y-6">
            {(block.slides || []).map((slide, idx) => (
              <div key={idx} className="border border-[#E3E8E5] p-4 rounded-xl bg-[#FAFBF9] relative group">
                <span className="absolute -left-3 -top-3 w-6 h-6 bg-[#384959] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">{idx + 1}</span>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><ImageUpload label="Desktop Image" value={slide.desktopImage || slide.image} onChange={(v) => updateSlide(idx, 'desktopImage', v)} /></div>
                  <div className=""><ImageUpload label="Mobile Image (Optional)" value={slide.mobileImage} onChange={(v) => updateSlide(idx, 'mobileImage', v)} /></div>
                  <div>
                    <label className="text-sm font-bold text-[#2C3E38] block mb-2">Image Fit</label>
                    <select className="input-base appearance-none" value={slide.objectFit || 'cover'} onChange={e => updateSlide(idx, 'objectFit', e.target.value)}>
                        <option value="cover">Cover (Hero Style)</option>
                        <option value="contain">Contain (Full Image)</option>
                    </select>
                  </div>
                  <Input label="Link URL" value={slide.link} onChange={(v) => updateSlide(idx, 'link', v)} placeholder="/catalog" />
                  <Input label="Alt Text" value={slide.alt} onChange={(v) => updateSlide(idx, 'alt', v)} placeholder="Description" />
                </div>
                <button onClick={() => removeSlide(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 bg-white p-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      );
    
    case "puzzle":
      const levels = block.levels || defaultBlock('puzzle').levels;
      return (
        <div className="space-y-8">
           <div className="grid md:grid-cols-2 gap-6">
                <Input label="Section Title" value={block.title} onChange={v => onChange({ ...block, title: v })} placeholder="e.g. Puzzle Challenge" />
                <Input label="Subtitle" value={block.subtitle} onChange={v => onChange({ ...block, subtitle: v })} placeholder="Instructions for the kids" />
           </div>

           <div className="space-y-4">
               <h3 className="font-bold text-[#384959] flex items-center gap-2 border-b pb-2"><Puzzle className="w-4 h-4" /> Game Levels</h3>
               <div className="border border-blue-200 bg-blue-50/50 p-4 rounded-xl">
                    <div className="mb-3 font-bold text-[#384959] flex justify-between items-center">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Level 1: Easy (3x3)</span>
                        <span className="text-[10px] uppercase font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded tracking-wide">Always Unlocked</span>
                    </div>
                    <ImageUpload label="Easy Image (3x3)" value={levels[0]?.image} onChange={v => updateLevel(0, 'image', v)} />
               </div>

               <div className="border border-yellow-200 bg-yellow-50/50 p-4 rounded-xl">
                    <div className="mb-3 font-bold text-[#384959] flex justify-between items-center">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Level 2: Medium (4x4)</span>
                        <span className="text-[10px] uppercase font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded tracking-wide">Unlocks after Easy</span>
                    </div>
                    <ImageUpload label="Medium Image (4x4)" value={levels[1]?.image} onChange={v => updateLevel(1, 'image', v)} />
               </div>

               <div className="border border-red-200 bg-red-50/50 p-4 rounded-xl">
                    <div className="mb-3 font-bold text-[#384959] flex justify-between items-center">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Level 3: Hard (5x5)</span>
                        <span className="text-[10px] uppercase font-bold bg-red-200 text-red-800 px-2 py-0.5 rounded tracking-wide">Unlocks after Medium</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <ImageUpload label="Hard Image (5x5)" value={levels[2]?.image} onChange={v => updateLevel(2, 'image', v)} />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-[#2C3E38] block mb-2">Max Moves Allowed</label>
                            <input type="number" className="input-base" value={levels[2]?.maxMoves || 100} onChange={e => updateLevel(2, 'maxMoves', Number(e.target.value))} />
                            <p className="text-xs text-red-500 mt-1 font-medium">Game over if moves exceed this limit.</p>
                        </div>
                    </div>
               </div>
           </div>

           <div className="border-t border-gray-200 pt-6">
               <h3 className="font-bold text-[#384959] flex items-center gap-2 mb-4"><Gift className="w-4 h-4" /> Winner Rewards</h3>
               <div className="grid md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                       <ImageUpload label="Reward Image (Appears on Win)" value={block.rewardImage} onChange={v => onChange({ ...block, rewardImage: v })} />
                   </div>
                   <div className="md:col-span-2">
                       <Input label="Grand Win Message (Shown after Level 3)" value={block.winMessage} onChange={v => onChange({ ...block, winMessage: v })} placeholder="Champion! You unlocked 20% off!" />
                   </div>
               </div>
           </div>
        </div>
      );

    case "banner": return (<div className="grid md:grid-cols-2 gap-6"><div className="md:col-span-2"><ImageUpload label="Banner Image" value={block.image} onChange={v => onChange({ ...block, image: v })} /></div><Input label="Button Text" value={block.ctaText} onChange={v => onChange({ ...block, ctaText: v })} /><Input label="Button Link" value={block.ctaLink} onChange={v => onChange({ ...block, ctaLink: v })} /></div>);
    
    // ✅ ADDED SORT FILTER HERE
    case "grid": return (
      <div className="grid md:grid-cols-2 gap-6">
        <Input label="Section Title" value={block.title} onChange={v => onChange({ ...block, title: v })} />
        
        {/* Category Filter */}
        <div>
          <label className="text-sm font-bold text-[#2C3E38] block mb-2">Category Filter</label>
          <select 
            className="input-base" 
            value={block.query.category} 
            onChange={e => onChange({ ...block, query: { ...block.query, category: e.target.value } })}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        {/* ✅ NEW SORT SELECTOR */}
        <div>
          <label className="text-sm font-bold text-[#2C3E38] block mb-2">Sort Order</label>
          <select
            className="input-base"
            value={block.query.sort || "new"}
            onChange={e => onChange({ ...block, query: { ...block.query, sort: e.target.value } })}
          >
            <option value="new">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="a-z">Name: A to Z</option>
          </select>
        </div>

        <Input label="Search Query" value={block.query.q} onChange={v => onChange({ ...block, query: { ...block.query, q: v } })} />
        <Input label="Limit" type="number" value={block.query.limit} onChange={v => onChange({ ...block, query: { ...block.query, limit: Number(v) || 8 } })} />
      </div>
    );
    
    case "html": return (<div className="space-y-4"><Input label="Block Name" value={block.title} onChange={v => onChange({ ...block, title: v })} /><div><label className="text-sm font-bold text-[#2C3E38] block mb-2">HTML</label><textarea value={block.html} onChange={e => onChange({ ...block, html: e.target.value })} className="input-base h-40 font-mono text-sm" /></div></div>);

    case "category-browser":
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Section Title"
              value={block.title}
              onChange={v => onChange({ ...block, title: v })}
              placeholder="Browse by Category"
            />

            {/* Default Category */}
            <div>
              <label className="text-sm font-bold text-[#2C3E38] block mb-2">Default Category</label>
              <select
                className="input-base"
                value={block.defaultCategory || ""}
                onChange={e => onChange({ ...block, defaultCategory: e.target.value })}
              >
                <option value="">All Books (default)</option>
                {categories.map(c => (
                  <option key={c._id} value={c.slug || c.name}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs text-[#8BA699] mt-1">Which tab is pre-selected when the page loads.</p>
            </div>

            {/* Sort order */}
            <div>
              <label className="text-sm font-bold text-[#2C3E38] block mb-2">Sort Order</label>
              <select
                className="input-base"
                value={block.sort || "new"}
                onChange={e => onChange({ ...block, sort: e.target.value })}
              >
                <option value="new">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="a-z">Name: A to Z</option>
              </select>
            </div>

            {/* Items per category */}
            <Input
              label="Books to Show per Category"
              type="number"
              value={block.limit}
              onChange={v => onChange({ ...block, limit: Number(v) || 16 })}
              placeholder="16"
            />
          </div>

          {/* Only show specific categories */}
          <div>
            <label className="text-sm font-bold text-[#2C3E38] block mb-2">
              Show Only These Categories (optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
              {categories.map(c => {
                const val = c.slug || c.name;
                const selected = (block.onlyCategories || "").split(",").map(s => s.trim()).filter(Boolean);
                const isChecked = selected.includes(val);
                return (
                  <label
                    key={c._id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                      isChecked
                        ? "border-[#384959] bg-[#384959]/5 text-[#384959] font-semibold"
                        : "border-[#DCE4E0] bg-white text-[#5C756D] hover:border-[#384959]/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-[#384959]"
                      checked={isChecked}
                      onChange={() => {
                        const current = (block.onlyCategories || "").split(",").map(s => s.trim()).filter(Boolean);
                        const next = isChecked ? current.filter(x => x !== val) : [...current, val];
                        onChange({ ...block, onlyCategories: next.join(", ") });
                      }}
                    />
                    {c.name}
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-[#8BA699]">
              Leave all unchecked to show every category. Check specific ones to limit the pills.
            </p>
          </div>
        </div>
      );

    default: return null;
  }
}

function Input({ label, value, onChange, placeholder, type="text" }) {
  return (<div><label className="text-sm font-bold text-[#2C3E38] block mb-2">{label}</label><input type={type} className="input-base" value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></div>);
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
        const response = await api.post("/uploads/image", formData, { headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${localStorage.getItem("admin_jwt")}` } });
        if (response.data.ok) onChange(response.data.images[0].path);
      } catch (error) { t.err({ title: "Upload failed", sub: "Could not upload image. Please try again." }); } finally { setUploading(false); }
    }
  };
  return (<div><label className="text-sm font-bold text-[#2C3E38] block mb-2">{label}</label><div className="flex gap-4 items-start"><div className="flex-1"><label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-dashed border-[#384959] rounded-xl cursor-pointer hover:bg-[#F4F7F5] transition-colors text-[#384959] font-medium group">{uploading ? "Uploading..." : <><Upload className="w-4 h-4" /> Choose Image</>}<input type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></label><input type="text" className="input-base mt-2 text-xs font-mono text-[#5C756D]" placeholder="Or paste URL" value={value || ""} onChange={(e) => onChange(e.target.value)} /></div>{value && (<div className="w-24 h-24 border border-[#E3E8E5] rounded-lg bg-white p-1 shadow-sm flex-shrink-0"><img src={assetUrl(value)} alt="Preview" className="w-full h-full object-contain rounded" /></div>)}</div></div>);
}