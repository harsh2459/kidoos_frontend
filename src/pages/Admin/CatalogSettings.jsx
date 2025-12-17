// src/pages/admin/CatalogSettings.jsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { toRelativeFromPublic, assetUrl } from "../../api/asset";
import { t } from "../../lib/toast";
import { Save, Upload, Trash2, Plus, ArrowLeft, LayoutTemplate, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

export default function CatalogSettings() {
  const [token] = useState(localStorage.getItem("admin_jwt") || "");
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/settings", auth);
        if (res.data.ok) {
          const existing = res.data.catalog?.slider || [];
          // Ensure defaults for new fields
          const migrated = existing.map(s => ({
             ...s,
             layout: s.layout || 'split',
             height: s.height || 'medium',
             objectFit: s.objectFit || 'contain'
          }));
          setSlides(migrated.length > 0 ? migrated : [defaultSlide()]);
        }
      } catch (e) {
        console.error(e);
        t.err("Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const save = async () => {
    setSaving(true);
    try {
      const cleaned = slides.map(s => ({
        ...s,
        image: toRelativeFromPublic(s.image)
      }));
      await api.put("/settings/catalog", { slider: cleaned }, auth);
      t.ok("Catalog settings saved!");
    } catch (e) {
      t.err("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateSlide = (index, field, val) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: val };
    setSlides(newSlides);
  };

  const addSlide = () => setSlides([...slides, defaultSlide()]);
  const removeSlide = (index) => setSlides(slides.filter((_, i) => i !== index));

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#1A3C34] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] pb-20">
      <div className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
             <Link to="/admin/homepage" className="text-sm text-[#5C756D] hover:underline flex items-center gap-1 mb-2"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Link>
             <h1 className="text-3xl font-serif font-bold text-[#1A3C34]">Catalog Page Header</h1>
             <p className="text-[#5C756D]">Manage the banner at the top of your "All Books" page.</p>
          </div>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1A3C34] text-white font-bold hover:bg-[#2F523F] transition-all shadow-md active:scale-95 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Slides List */}
        <div className="space-y-8">
           {slides.map((slide, idx) => (
              <div key={idx} className="bg-white border border-[#E3E8E5] p-6 rounded-2xl shadow-sm relative group">
                <span className="absolute -left-3 -top-3 w-8 h-8 bg-[#1A3C34] text-white rounded-full flex items-center justify-center font-bold shadow-md">{idx + 1}</span>
                
                <div className="space-y-6">
                    {/* LAYOUT CONTROLS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F4F7F5] p-4 rounded-xl">
                        <div>
                            <label className="text-xs font-bold text-[#5C756D] uppercase mb-2 flex items-center gap-1"><LayoutTemplate className="w-3 h-3"/> Layout Type</label>
                            <select 
                                value={slide.layout || 'split'} 
                                onChange={(e) => updateSlide(idx, 'layout', e.target.value)}
                                className="w-full bg-white border border-[#DCE4E0] rounded-lg px-3 py-2 text-sm focus:border-[#1A3C34] outline-none"
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
                                className="w-full bg-white border border-[#DCE4E0] rounded-lg px-3 py-2 text-sm focus:border-[#1A3C34] outline-none"
                            >
                                <option value="small">Small (Compact)</option>
                                <option value="medium">Medium (Standard)</option>
                                <option value="large">Large (Impactful)</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-xs font-bold text-[#5C756D] uppercase mb-2">Image Fit</label>
                            <select 
                                value={slide.objectFit || 'cover'} 
                                onChange={(e) => updateSlide(idx, 'objectFit', e.target.value)}
                                className="w-full bg-white border border-[#DCE4E0] rounded-lg px-3 py-2 text-sm focus:border-[#1A3C34] outline-none"
                            >
                                <option value="cover">Cover (Fills space)</option>
                                <option value="contain">Contain (Shows full image)</option>
                            </select>
                            <p className="text-[10px] text-gray-500 mt-1">"Contain" is best for transparent characters.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       {/* Image Upload */}
                       <div className="md:col-span-2">
                           <ImageUpload 
                              label="Slide Image" 
                              value={slide.image} 
                              onChange={(v) => updateSlide(idx, 'image', v)} 
                            />
                       </div>
                       
                       {/* Text Fields */}
                       <Input label="Title" value={slide.title} onChange={(v) => updateSlide(idx, 'title', v)} placeholder="e.g. Our Collection" />
                       <Input label="Subtitle" value={slide.subtitle} onChange={(v) => updateSlide(idx, 'subtitle', v)} placeholder="e.g. curated for young minds" />
                       
                       <Input label="Button Text" value={slide.ctaText} onChange={(v) => updateSlide(idx, 'ctaText', v)} placeholder="e.g. Explore" />
                       <Input label="Button Link" value={slide.ctaLink} onChange={(v) => updateSlide(idx, 'ctaLink', v)} placeholder="/catalog" />
    
                       {/* Color Pickers */}
                       <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                          <div>
                            <label className="text-xs font-bold text-[#5C756D] block mb-1 uppercase">Background Color</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={slide.bgColor || "#1A3C34"} onChange={(e) => updateSlide(idx, 'bgColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none bg-transparent" />
                                <span className="text-sm font-mono text-gray-600">{slide.bgColor}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-[#5C756D] block mb-1 uppercase">Text Color</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={slide.textColor || "#ffffff"} onChange={(e) => updateSlide(idx, 'textColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-none bg-transparent" />
                                <span className="text-sm font-mono text-gray-600">{slide.textColor}</span>
                            </div>
                          </div>
                       </div>
                    </div>
                </div>
                
                <button onClick={() => removeSlide(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Remove Slide">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
           ))}
        </div>

        {/* Add Button */}
        <button onClick={addSlide} className="w-full mt-6 py-4 border-2 border-dashed border-[#1A3C34]/30 rounded-2xl flex items-center justify-center gap-2 text-[#1A3C34] font-bold hover:bg-[#1A3C34]/5 transition-colors">
            <Plus className="w-5 h-5" /> Add New Slide
        </button>

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function defaultSlide() {
  return {
    title: "Our Collection",
    subtitle: "Discover unique books curated for young minds.",
    image: "",
    ctaText: "",
    ctaLink: "",
    bgColor: "#1A3C34",
    textColor: "#ffffff",
    layout: "split",
    height: "medium",
    objectFit: "cover"
  };
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-bold text-[#2C3E38] block mb-2">{label}</label>
      <input 
        type="text" 
        className="w-full bg-white border border-[#DCE4E0] rounded-xl px-4 py-3 outline-none focus:border-[#1A3C34] focus:ring-2 focus:ring-[#1A3C34]/10 transition-all"
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
                className="w-full mt-2 text-xs font-mono text-[#5C756D] bg-transparent border-none outline-none"
                placeholder="Or paste image URL"
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