// src/pages/Admin/PopupSettings.jsx
import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { assetUrl } from '../../api/asset';
import { t } from "../../lib/toast";

import { 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  MousePointerClick, 
  Target, 
  Upload, 
  Palette, 
  Image as ImageIcon, 
  X as XIcon,
  Check,
  Save,
  LayoutTemplate
} from 'lucide-react';

export default function PopupSettings() {
    const token = localStorage.getItem("admin_jwt") || "";
    const auth = { headers: { Authorization: `Bearer ${token}` } };

    const [enabled, setEnabled] = useState(false);
    const [configs, setConfigs] = useState([]);
    const [books, setBooks] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expandedConfig, setExpandedConfig] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(null);

    useEffect(() => {
        loadSettings();
        loadBooks();
    }, []);

    async function loadSettings() {
        try {
            const { data } = await api.get("/settings/popup", auth);
            if (data.ok && data.popup) {
                setEnabled(data.popup.enabled || false);
                setConfigs(data.popup.configs || []);
            }
        } catch (error) {
            t.err("Failed to load popup settings");
        } finally {
            setLoading(false);
        }
    }

    async function loadBooks() {
        try {
            const { data } = await api.get("/books?limit=1000", auth);
            setBooks(data.items || []);
        } catch (error) {
            console.error("Failed to load books");
        }
    }

    function addNewConfig() {
        const newConfig = {
            _id: `temp_${Date.now()}`,
            title: "Special Offer!",
            description: "Limited time offer on our featured product",
            designType: "custom",
            imageUrl: "",
            customDesign: {
                layout: "left-right",
                backgroundColor: "#ffffff",
                textColor: "#1A3C34",
                accentColor: "#1A3C34",
                borderRadius: "16px",
                padding: "32px",
                maxWidth: "600px",
                fontFamily: "system-ui",
                titleFontSize: "28px",
                titleFontWeight: "700",
                descriptionFontSize: "16px",
                ctaBackgroundColor: "#1A3C34",
                ctaTextColor: "#ffffff",
                ctaFontSize: "18px",
                ctaFontWeight: "600",
                ctaBorderRadius: "12px",
                ctaPadding: "16px 32px",
                showProductImage: true,
                imagePosition: "left",
                imageSize: "50%",
                overlayColor: "rgba(0, 0, 0, 0.6)",
                overlayBlur: "4px",
                animationType: "slideUp",
                animationDuration: "400ms"
            },
            productId: "",
            discountPercentage: 0,
            ctaText: "Shop Now",
            ctaLink: "",
            targetPages: ["all"],
            showToNewVisitors: true,
            showToReturningVisitors: true,
            triggerType: "time",
            triggerValue: 5,
            isActive: false,
            startDate: new Date().toISOString().split('T')[0],
            endDate: "",
            showOncePerSession: true,
            showOncePerDay: false,
            showMaxTimes: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            dismissals: 0
        };
        setConfigs([...configs, newConfig]);
        setExpandedConfig(newConfig._id);
    }

    function updateConfig(id, field, value) {
        setConfigs(configs.map(c =>
            c._id === id ? { ...c, [field]: value } : c
        ));
    }

    function updateCustomDesign(id, field, value) {
        setConfigs(configs.map(c =>
            c._id === id ? {
                ...c,
                customDesign: { ...(c.customDesign || {}), [field]: value }
            } : c
        ));
    }

    function deleteConfig(id) {
        setConfigs(configs.filter(c => c._id !== id));
    }

    async function handleImageUpload(configId, file) {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            t.err("Image must be less than 5MB");
            return;
        }

        setUploadingImage(configId);
        try {
            const formData = new FormData();
            formData.append('files', file); 

            const response = await api.post('/uploads/image', formData, auth);

            if (response.data.ok && response.data.images && response.data.images.length > 0) {
                const imageUrl = response.data.images[0].path || response.data.images[0].previewUrl;
                updateConfig(configId, 'imageUrl', imageUrl);
                t.ok("Image uploaded successfully");
            } else {
                t.err("Upload failed - no image returned");
            }
        } catch (error) {
            t.err("Failed to upload image");
        } finally {
            setUploadingImage(null);
        }
    }

    async function save(e) {
        e.preventDefault();

        // Validation
        const invalidConfigs = configs.filter(c =>
            !c.title ||
            (c.designType === 'custom' && !c.productId) ||
            (c.designType === 'image' && !c.imageUrl)
        );

        if (invalidConfigs.length > 0) {
            t.err("Please complete all required fields for active popups");
            return;
        }

        setSaving(true);
        try {
            const response = await api.put("/settings/popup", {
                enabled,
                configs: configs.map(c => {
                    const { product, ...rest } = c;
                    return rest;
                })
            }, auth);

            if (response.data.ok) {
                t.ok("Popup settings saved successfully");
                loadSettings();
            } else {
                t.err("Failed to save popup settings");
            }
        } catch (error) {
            console.error("Save error:", error);
            t.err(error.response?.data?.error || "Error saving popup settings");
        } finally {
            setSaving(false);
        }
    }

    // Common Input Class matching the theme
    const inputClass = "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-2.5 text-sm text-[#1A3C34] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all";
    const labelClass = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-1.5";

    if (loading) {
        return (
            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">
                
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E3E8E5]">
                    <div className="w-10 h-10 border-4 border-[#1A3C34] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-[#5C756D] font-medium">Loading settings...</p>
                </div>
            </div>
        );
    }

    const totalImpressions = configs.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = configs.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalDismissals = configs.reduce((sum, c) => sum + (c.dismissals || 0), 0);
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;

    return (
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8 pb-32">
        

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#1A3C34] tracking-tight">Popup Marketing</h1>
                    <p className="text-[#5C756D] mt-1 text-sm">Design and manage promotional popups for your store.</p>
                </div>
                
                <label className={`
                    flex items-center gap-3 cursor-pointer px-5 py-3 rounded-xl border transition-all shadow-sm
                    ${enabled ? "bg-[#1A3C34] border-[#1A3C34]" : "bg-white border-[#E3E8E5] hover:bg-[#F4F7F5]"}
                `}>
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        className="hidden"
                    />
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? "bg-white/20" : "bg-gray-200"}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-transform duration-200 ${enabled ? "left-6 bg-white" : "left-1 bg-gray-400"}`}></div>
                    </div>
                    <span className={`font-bold text-sm ${enabled ? "text-white" : "text-[#5C756D]"}`}>
                        {enabled ? 'Popups Enabled' : 'Popups Disabled'}
                    </span>
                </label>
            </div>

            {/* ANALYTICS SUMMARY */}
            {configs.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Impressions', val: totalImpressions.toLocaleString(), icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Clicks', val: totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'CTR', val: `${avgCTR}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Dismissals', val: totalDismissals.toLocaleString(), icon: XIcon, color: 'text-red-600', bg: 'bg-red-50' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E3E8E5] flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={stat.color} size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[#8BA699]">{stat.label}</p>
                                <p className="text-2xl font-bold text-[#1A3C34] mt-0.5">{stat.val}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* POPUP LIST */}
            <div className="space-y-6">
                {configs.map((config, idx) => {
                    const selectedBook = books.find(b => b._id === config.productId);

                    return (
                        <div key={config._id} className="bg-white border border-[#E3E8E5] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-6 pb-6 border-b border-[#F4F7F5]">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-[#FAFBF9] border border-[#E3E8E5] flex items-center justify-center font-bold text-[#1A3C34]">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-[#1A3C34]">{config.title || "Untitled Popup"}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${config.isActive ? "bg-emerald-500" : "bg-gray-300"}`}></span>
                                            <span className="text-xs font-medium text-[#5C756D]">{config.isActive ? "Active" : "Inactive"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => updateConfig(config._id, 'isActive', !config.isActive)}
                                        className={`
                                            px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                                            ${config.isActive
                                                ? 'bg-[#E8F5E9] text-[#1A3C34] border border-[#C8E6C9]'
                                                : 'bg-[#F4F7F5] text-[#5C756D] border border-[#E3E8E5] hover:bg-[#E3E8E5]'
                                            }
                                        `}
                                    >
                                        {config.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                        {config.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteConfig(config._id)}
                                        className="p-2.5 rounded-xl text-[#5C756D] hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column: Configuration */}
                                <div className="space-y-5">
                                    
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Internal Title <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={config.title}
                                                onChange={(e) => updateConfig(config._id, 'title', e.target.value)}
                                                className={inputClass}
                                                placeholder="e.g. Summer Sale Popup"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Description / Notes</label>
                                            <textarea
                                                value={config.description}
                                                onChange={(e) => updateConfig(config._id, 'description', e.target.value)}
                                                className={inputClass}
                                                rows={2}
                                                placeholder="Internal notes about this campaign..."
                                            />
                                        </div>
                                    </div>

                                    {/* Design Type Selector */}
                                    <div>
                                        <label className={labelClass}>Design Mode</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'custom', icon: LayoutTemplate, label: 'Smart Template', desc: 'Auto-generates from product' },
                                                { id: 'image', icon: ImageIcon, label: 'Image Upload', desc: 'Upload a pre-designed banner' }
                                            ].map(mode => (
                                                <button
                                                    key={mode.id}
                                                    type="button"
                                                    onClick={() => updateConfig(config._id, 'designType', mode.id)}
                                                    className={`
                                                        p-4 rounded-xl text-left border-2 transition-all duration-200
                                                        ${config.designType === mode.id
                                                            ? 'border-[#1A3C34] bg-[#F0F7F4]'
                                                            : 'border-[#E3E8E5] hover:border-[#8BA699] bg-white'
                                                        }
                                                    `}
                                                >
                                                    <mode.icon className={config.designType === mode.id ? 'text-[#1A3C34]' : 'text-[#8BA699]'} size={24} />
                                                    <h4 className={`font-bold text-sm mt-3 ${config.designType === mode.id ? 'text-[#1A3C34]' : 'text-[#5C756D]'}`}>{mode.label}</h4>
                                                    <p className="text-xs text-[#8BA699] mt-1 leading-tight">{mode.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SMART TEMPLATE CONFIG */}
                                    {config.designType === 'custom' && (
                                        <div className="bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl p-5 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <label className={labelClass}>Select Product <span className="text-red-500">*</span></label>
                                                    <select
                                                        value={config.productId}
                                                        onChange={(e) => updateConfig(config._id, 'productId', e.target.value)}
                                                        className={inputClass}
                                                    >
                                                        <option value="">-- Choose a Book --</option>
                                                        {books.map(b => (
                                                            <option key={b._id} value={b._id}>{b.title}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Discount %</label>
                                                    <input
                                                        type="number"
                                                        value={config.discountPercentage}
                                                        onChange={(e) => updateConfig(config._id, 'discountPercentage', parseInt(e.target.value) || 0)}
                                                        className={inputClass}
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div>
                                                     <label className={labelClass}>CTA Button Text</label>
                                                     <input
                                                         type="text"
                                                         value={config.ctaText}
                                                         onChange={(e) => updateConfig(config._id, 'ctaText', e.target.value)}
                                                         className={inputClass}
                                                         placeholder="Shop Now"
                                                     />
                                                </div>
                                            </div>

                                            {/* Mini Preview */}
                                            {selectedBook && (
                                                <div className="flex items-center gap-4 p-3 bg-white border border-[#E3E8E5] rounded-lg mt-2">
                                                    <div className="h-16 w-12 bg-gray-100 rounded shrink-0 overflow-hidden">
                                                        {selectedBook.assets?.coverUrl?.[0] && (
                                                            <img src={assetUrl(selectedBook.assets.coverUrl[0])} className="h-full w-full object-cover" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#1A3C34] line-clamp-1">{selectedBook.title}</p>
                                                        <p className="text-xs text-[#5C756D]">₹{selectedBook.price}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* IMAGE UPLOAD CONFIG */}
                                    {config.designType === 'image' && (
                                        <div className="bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl p-5">
                                            <label className={labelClass}>Upload Banner Image</label>
                                            <div className="border-2 border-dashed border-[#E3E8E5] rounded-xl p-6 text-center hover:border-[#1A3C34] hover:bg-white transition-all">
                                                {config.imageUrl ? (
                                                    <div className="relative inline-block max-w-full">
                                                        <img
                                                            src={assetUrl(config.imageUrl)}
                                                            alt="Preview"
                                                            className="max-h-48 rounded-lg shadow-sm"
                                                        />
                                                        <button
                                                            onClick={() => updateConfig(config._id, 'imageUrl', '')}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md"
                                                        >
                                                            <XIcon size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer block">
                                                        {uploadingImage === config._id ? (
                                                            <div className="py-4">
                                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3C34] mx-auto"></div>
                                                                <p className="text-xs text-[#5C756D] mt-2">Uploading...</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="w-12 h-12 bg-[#F4F7F5] rounded-full flex items-center justify-center mx-auto mb-3">
                                                                    <Upload size={20} className="text-[#1A3C34]" />
                                                                </div>
                                                                <p className="text-sm font-bold text-[#1A3C34]">Click to upload</p>
                                                                <p className="text-xs text-[#5C756D] mt-1">Recommended: 800x600px • Max 5MB</p>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files[0];
                                                                        if (file) handleImageUpload(config._id, file);
                                                                    }}
                                                                />
                                                            </>
                                                        )}
                                                    </label>
                                                )}
                                            </div>
                                            <div className="mt-4">
                                                <label className={labelClass}>Destination Link (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={config.ctaLink}
                                                    onChange={(e) => updateConfig(config._id, 'ctaLink', e.target.value)}
                                                    className={inputClass}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Triggers & Targeting */}
                                <div className="space-y-5">
                                    <div className="p-5 border border-[#E3E8E5] rounded-xl">
                                        <h4 className="font-bold text-[#1A3C34] mb-4 flex items-center gap-2">
                                            <Target size={18} /> Targeting Rules
                                        </h4>
                                        
                                        {/* Triggers */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className={labelClass}>Trigger Event</label>
                                                <select
                                                    value={config.triggerType}
                                                    onChange={(e) => updateConfig(config._id, 'triggerType', e.target.value)}
                                                    className={inputClass}
                                                >
                                                    <option value="time">Time Delay</option>
                                                    <option value="scroll">Scroll %</option>
                                                    <option value="exit">Exit Intent</option>
                                                </select>
                                            </div>
                                            {config.triggerType !== 'exit' && (
                                                <div>
                                                    <label className={labelClass}>Value ({config.triggerType === 'time' ? 'Sec' : '%'})</label>
                                                    <input
                                                        type="number"
                                                        value={config.triggerValue}
                                                        onChange={(e) => updateConfig(config._id, 'triggerValue', parseInt(e.target.value) || 0)}
                                                        className={inputClass}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Pages */}
                                        <div className="mb-4">
                                            <label className={labelClass}>Show on Pages</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['all', 'home', 'products', 'cart'].map(page => (
                                                    <label key={page} className={`
                                                        cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold border transition-all select-none
                                                        ${config.targetPages.includes(page) 
                                                            ? 'bg-[#1A3C34] text-white border-[#1A3C34]' 
                                                            : 'bg-white text-[#5C756D] border-[#E3E8E5] hover:border-[#8BA699]'
                                                        }
                                                    `}>
                                                        <input
                                                            type="checkbox"
                                                            checked={config.targetPages.includes(page)}
                                                            onChange={(e) => {
                                                                const newPages = e.target.checked
                                                                    ? [...config.targetPages, page]
                                                                    : config.targetPages.filter(p => p !== page);
                                                                updateConfig(config._id, 'targetPages', newPages);
                                                            }}
                                                            className="hidden"
                                                        />
                                                        <span className="capitalize">{page}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Checkbox Options */}
                                        <div className="space-y-2">
                                            {[
                                                { label: 'New Visitors Only', field: 'showToNewVisitors' },
                                                { label: 'Returning Visitors', field: 'showToReturningVisitors' },
                                                { label: 'Once per Session', field: 'showOncePerSession' },
                                                { label: 'Once per Day', field: 'showOncePerDay' },
                                            ].map((opt, i) => (
                                                <label key={i} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-[#FAFBF9] transition-colors -ml-2">
                                                    <div className={`
                                                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                        ${config[opt.field] ? 'bg-[#1A3C34] border-[#1A3C34]' : 'bg-white border-[#E3E8E5]'}
                                                    `}>
                                                        {config[opt.field] && <Check size={12} className="text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={config[opt.field]}
                                                        onChange={(e) => updateConfig(config._id, opt.field, e.target.checked)}
                                                        className="hidden"
                                                    />
                                                    <span className="text-sm text-[#1A3C34]">{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advanced Design Toggle */}
                                    {config.designType === 'custom' && (
                                        <div className="bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl p-4">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedConfig(expandedConfig === config._id ? null : config._id)}
                                                className="flex items-center justify-between w-full text-sm font-bold text-[#1A3C34]"
                                            >
                                                <span className="flex items-center gap-2"><Palette size={16} /> Advanced Styling</span>
                                                <span className="text-[#5C756D]">{expandedConfig === config._id ? 'Hide' : 'Show'}</span>
                                            </button>
                                            
                                            {expandedConfig === config._id && (
                                                <div className="mt-4 pt-4 border-t border-[#E3E8E5] grid grid-cols-2 gap-3">
                                                    {/* Simplified Design Inputs */}
                                                    <div>
                                                        <label className={labelClass}>Bg Color</label>
                                                        <input type="color" value={config.customDesign?.backgroundColor || '#ffffff'} onChange={(e) => updateCustomDesign(config._id, 'backgroundColor', e.target.value)} className="w-full h-8 rounded cursor-pointer border border-[#E3E8E5]" />
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Text Color</label>
                                                        <input type="color" value={config.customDesign?.textColor || '#1A3C34'} onChange={(e) => updateCustomDesign(config._id, 'textColor', e.target.value)} className="w-full h-8 rounded cursor-pointer border border-[#E3E8E5]" />
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Button Bg</label>
                                                        <input type="color" value={config.customDesign?.ctaBackgroundColor || '#1A3C34'} onChange={(e) => updateCustomDesign(config._id, 'ctaBackgroundColor', e.target.value)} className="w-full h-8 rounded cursor-pointer border border-[#E3E8E5]" />
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Button Text</label>
                                                        <input type="color" value={config.customDesign?.ctaTextColor || '#ffffff'} onChange={(e) => updateCustomDesign(config._id, 'ctaTextColor', e.target.value)} className="w-full h-8 rounded cursor-pointer border border-[#E3E8E5]" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* EMPTY STATE */}
            {configs.length === 0 && (
                <div className="border-2 border-dashed border-[#E3E8E5] rounded-2xl p-16 text-center bg-[#FAFBF9]">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E3E8E5] shadow-sm">
                        <LayoutTemplate size={32} className="text-[#5C756D]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A3C34] mb-2">No active popups</h3>
                    <p className="text-[#5C756D] mb-6 max-w-md mx-auto">Create a popup to promote sales, collect emails, or highlight new books to your visitors.</p>
                    <button
                        onClick={addNewConfig}
                        className="px-6 py-3 bg-[#1A3C34] text-white rounded-xl font-bold hover:bg-[#2F523F] transition-all"
                    >
                        Create First Popup
                    </button>
                </div>
            )}

            {/* FIXED ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#E3E8E5] z-50 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm font-medium text-[#5C756D]">
                        <span className="flex items-center gap-2">
                             <span className={`w-2.5 h-2.5 rounded-full ${enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                             {enabled ? 'System Active' : 'System Paused'}
                        </span>
                        <span className="h-4 w-px bg-[#E3E8E5]"></span>
                        <span>{configs.length} Popups ({configs.filter(c => c.isActive).length} Live)</span>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={addNewConfig}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1A3C34] text-[#1A3C34] font-bold text-sm hover:bg-[#F4F7F5] transition-all"
                        >
                            <Plus size={18} /> Add New
                        </button>
                        <button
                            onClick={save}
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#1A3C34] text-white font-bold text-sm hover:bg-[#2F523F] transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}