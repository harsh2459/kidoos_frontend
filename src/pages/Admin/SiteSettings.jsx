// src/pages/admin/SiteSettings.jsx
import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { assetUrl, toRelativeFromPublic } from "../../api/asset";
import { t } from "../../lib/toast";
import { 
  Globe, 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Loader2, 
  Layout, 
  MousePointerClick,
  CheckCircle2
} from "lucide-react";

export default function SiteSettings() {
  const token = localStorage.getItem("admin_jwt") || "";
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [form, setForm] = useState({ title: "", logoUrl: "", faviconUrl: "" });
  const [saving, setSaving] = useState(false);
  const [upLogo, setUpLogo] = useState(false);
  const [upFavi, setUpFavi] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/settings", auth);
        if (data.ok && data.site) {
          setForm({
            title: data.site.title || "",
            logoUrl: toRelativeFromPublic(data.site.logoUrl || ""),
            faviconUrl: toRelativeFromPublic(data.site.faviconUrl || ""),
          });
        }
      } catch (e) {
        console.error("Failed to load settings");
      }
    })();
  }, []);

  async function uploadImage(file) {
    const fd = new FormData();
    fd.append("files", file);
    try {
      const res = await api.post("/uploads/image", fd, {
        ...auth,
        headers: { ...auth.headers, "Content-Type": "multipart/form-data" }
      });
      return { path: res.data.images[0].path, previewUrl: res.data.images[0].previewUrl };
    } catch (error) {
      t.err("Error uploading image.");
      return {};
    }
  }

  async function onPickLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpLogo(true);
    try {
      const { path } = await uploadImage(file);
      if(path) setForm(f => ({ ...f, logoUrl: path }));
    } finally { setUpLogo(false); }
  }

  async function onPickFavicon(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpFavi(true);
    try {
      const { path } = await uploadImage(file);
      if(path) setForm(f => ({ ...f, faviconUrl: path }));
    } finally { setUpFavi(false); }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: form.title || "",
        logoUrl: toRelativeFromPublic(form.logoUrl || ""),
        faviconUrl: toRelativeFromPublic(form.faviconUrl || ""),
      };

      const response = await api.put("/settings/site", payload, auth);

      if (response.data.ok) {
        t.ok("Site settings updated successfully");
        
        // Update browser tab immediately
        if (form.faviconUrl) {
          const absFavi = assetUrl(form.faviconUrl);
          let link = document.querySelector("link[rel='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = absFavi;
        }
        if (form.title) document.title = form.title;
      } else {
        t.err("Failed to save settings");
      }
    } catch (error) {
      t.err(error.response?.data?.error || "Error saving settings");
    } finally {
      setSaving(false);
    }
  }

  // Styles
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-2";
  const inputClass = "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-3 text-sm text-[#384959] focus:outline-none focus:ring-2 focus:ring-[#384959]/20 focus:border-[#384959] transition-all placeholder:text-[#8BA699]";

  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">
     
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-[#384959] tracking-tight">Site Configuration</h1>
            <p className="text-[#5C756D] mt-1 text-sm">Manage your store's identity, branding, and assets.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-7 space-y-6">
            <form onSubmit={save} className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm p-6 space-y-8">
                
                {/* General Section */}
                <div>
                    <h3 className="font-bold text-[#384959] text-lg border-b border-[#F4F7F5] pb-3 mb-5 flex items-center gap-2">
                        <Globe className="w-5 h-5" /> General Identity
                    </h3>
                    <div>
                        <label className={labelClass}>Store Name (Title)</label>
                        <input
                            className={inputClass}
                            placeholder="e.g. Kiddos Intellect"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />
                        <p className="text-xs text-[#8BA699] mt-2">Displayed in the browser tab and search engine results.</p>
                    </div>
                </div>

                {/* Branding Section */}
                <div>
                    <h3 className="font-bold text-[#384959] text-lg border-b border-[#F4F7F5] pb-3 mb-5 flex items-center gap-2">
                        <Layout className="w-5 h-5" /> Branding Assets
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* LOGO UPLOAD */}
                        <div>
                            <label className={labelClass}>Main Logo</label>
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    id="logo-upload" 
                                    accept="image/*" 
                                    onChange={onPickLogo} 
                                    className="hidden" 
                                />
                                <label 
                                    htmlFor="logo-upload"
                                    className={`
                                        flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all
                                        ${form.logoUrl 
                                            ? "border-[#E3E8E5] bg-white hover:border-[#384959]" 
                                            : "border-[#E3E8E5] bg-[#FAFBF9] hover:bg-white hover:border-[#384959]"
                                        }
                                    `}
                                >
                                    {upLogo ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#384959] mb-2" />
                                            <span className="text-xs text-[#5C756D]">Uploading...</span>
                                        </div>
                                    ) : form.logoUrl ? (
                                        <div className="p-4 flex flex-col items-center w-full h-full relative">
                                            <img src={assetUrl(form.logoUrl)} alt="Logo" className="h-full w-auto object-contain" />
                                            <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-xs font-bold flex items-center gap-1">
                                                    <Upload className="w-4 h-4" /> Change
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-[#8BA699] group-hover:text-[#384959]">
                                            <ImageIcon className="w-8 h-8 mb-2" />
                                            <span className="text-xs font-bold">Upload Logo</span>
                                            <span className="text-[10px] mt-1 text-[#5C756D]">PNG/SVG preferred</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                            {/* Manual URL Input */}
                            <div className="mt-3 relative">
                                <input 
                                    className="w-full bg-white border border-[#E3E8E5] rounded-lg pl-3 pr-8 py-1.5 text-xs text-[#5C756D] focus:border-[#384959] focus:outline-none"
                                    placeholder="Or paste URL..."
                                    value={form.logoUrl}
                                    onChange={e => setForm({...form, logoUrl: toRelativeFromPublic(e.target.value)})}
                                />
                            </div>
                        </div>

                        {/* FAVICON UPLOAD */}
                        <div>
                            <label className={labelClass}>Favicon</label>
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    id="favi-upload" 
                                    accept="image/*,.ico" 
                                    onChange={onPickFavicon} 
                                    className="hidden" 
                                />
                                <label 
                                    htmlFor="favi-upload"
                                    className={`
                                        flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all
                                        ${form.faviconUrl 
                                            ? "border-[#E3E8E5] bg-white hover:border-[#384959]" 
                                            : "border-[#E3E8E5] bg-[#FAFBF9] hover:bg-white hover:border-[#384959]"
                                        }
                                    `}
                                >
                                    {upFavi ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#384959] mb-2" />
                                            <span className="text-xs text-[#5C756D]">Uploading...</span>
                                        </div>
                                    ) : form.faviconUrl ? (
                                        <div className="p-4 flex flex-col items-center w-full h-full relative">
                                            <img src={assetUrl(form.faviconUrl)} alt="Favicon" className="w-12 h-12 object-contain" />
                                            <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-xs font-bold flex items-center gap-1">
                                                    <Upload className="w-4 h-4" /> Change
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-[#8BA699] group-hover:text-[#384959]">
                                            <MousePointerClick className="w-8 h-8 mb-2" />
                                            <span className="text-xs font-bold">Upload Favicon</span>
                                            <span className="text-[10px] mt-1 text-[#5C756D]">32x32px .ico/.png</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                            {/* Manual URL Input */}
                            <div className="mt-3 relative">
                                <input 
                                    className="w-full bg-white border border-[#E3E8E5] rounded-lg pl-3 pr-8 py-1.5 text-xs text-[#5C756D] focus:border-[#384959] focus:outline-none"
                                    placeholder="Or paste URL..."
                                    value={form.faviconUrl}
                                    onChange={e => setForm({...form, faviconUrl: toRelativeFromPublic(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-[#F4F7F5] flex justify-end">
                    <button
                        type="submit"
                        disabled={saving || upLogo || upFavi}
                        className="
                            flex items-center gap-2 px-8 py-3.5 rounded-xl 
                            bg-[#384959] text-white font-bold text-sm shadow-md 
                            hover:bg-[#6A89A7] active:scale-95 transition-all 
                            disabled:opacity-70 disabled:cursor-not-allowed
                        "
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Saving Changes..." : "Save Configuration"}
                    </button>
                </div>
            </form>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-5 space-y-6">
            
            {/* Live Preview Card */}
            <div className="bg-[#384959] rounded-2xl shadow-xl overflow-hidden text-white p-6 relative">
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <h3 className="font-bold text-lg mb-1 relative z-10">Live Preview</h3>
                <p className="text-white/60 text-sm mb-6 relative z-10">See how your branding appears to customers.</p>

                {/* 1. Browser Tab Preview */}
                <div className="bg-[#2C3E50] rounded-t-xl p-3 pb-0 relative z-10 shadow-lg">
                    <div className="flex items-center gap-2 bg-white text-[#384959] px-3 py-2 rounded-t-lg w-48 text-xs font-medium shadow-sm relative top-1">
                        {form.faviconUrl ? (
                            <img src={assetUrl(form.faviconUrl)} className="w-4 h-4 object-contain" alt="" />
                        ) : (
                            <Globe className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="truncate max-w-[120px]">{form.title || "New Tab"}</span>
                        <span className="ml-auto text-gray-400 text-[10px]">✕</span>
                    </div>
                    <div className="bg-white h-8 w-full flex items-center px-4 gap-3 text-gray-400 border-b border-gray-200">
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-md h-5"></div>
                    </div>
                </div>

                {/* 2. Navbar Preview */}
                <div className="bg-white p-4 rounded-b-xl relative z-10 min-h-[120px] flex flex-col shadow-lg border-t border-gray-100">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                        <div className="flex items-center gap-3">
                            {form.logoUrl ? (
                                <img src={assetUrl(form.logoUrl)} className="h-8 w-auto object-contain" alt="Brand" />
                            ) : (
                                <div className="h-8 w-8 bg-[#384959] rounded text-white grid place-items-center font-bold text-xs">
                                    LOG
                                </div>
                            )}
                            <div className="hidden sm:flex gap-4 text-[10px] font-bold text-gray-400 ml-4">
                                <span>CATALOG</span>
                                <span>ABOUT</span>
                                <span>CONTACT</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                            <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg flex-1 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs font-medium">
                        Page Content Area
                    </div>
                </div>
            </div>

            {/* Helper Info */}
            <div className="bg-white border border-[#E3E8E5] rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#384959] shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-[#384959] text-sm">Pro Tips</h4>
                        <ul className="text-xs text-[#5C756D] mt-2 space-y-1.5 list-disc list-inside">
                            <li>Use a <strong>transparent PNG</strong> or SVG for the logo to blend with any background.</li>
                            <li>Favicons should be square (1:1 ratio) for best results.</li>
                            <li>Keep your site title concise (under 60 chars) for better SEO.</li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}