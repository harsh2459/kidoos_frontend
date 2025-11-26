// src/pages/Admin/PopupSettings.jsx
import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { assetUrl } from '../../api/asset';
import { t } from "../../lib/toast";
import FancyButton from "../../components/button/button";
import { Trash2, Plus, Eye, EyeOff, TrendingUp, MousePointerClick, Target, Upload, Palette, Image as ImageIcon, X as XIcon } from 'lucide-react';
import AdminTabs from '../../components/AdminTabs';

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
                textColor: "#000000",
                accentColor: "#4F46E5",
                borderRadius: "16px",
                padding: "32px",
                maxWidth: "600px",
                fontFamily: "system-ui",
                titleFontSize: "28px",
                titleFontWeight: "700",
                descriptionFontSize: "16px",
                ctaBackgroundColor: "#4F46E5",
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

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            t.err("Image must be less than 5MB");
            return;
        }

        setUploadingImage(configId);
        try {
            const formData = new FormData();
            formData.append('files', file); // ✅ Use 'files' (plural)

            console.log('📤 Frontend: Starting upload...');

            const response = await api.post('/uploads/image', formData, auth);

            console.log('📦 Frontend: Upload response:', response);
            console.log('📦 Frontend: Response data:', response.data);

            if (response.data.ok && response.data.images && response.data.images.length > 0) {
                // ✅ Get the URL from the correct field
                const imageUrl = response.data.images[0].path || response.data.images[0].previewUrl;

                console.log('✅ Frontend: Image URL extracted:', imageUrl);

                updateConfig(configId, 'imageUrl', imageUrl);
                t.ok("Image uploaded successfully");
            } else {
                console.log('❌ Frontend: No images in response:', response.data);
                t.err("Upload failed - no image returned");
            }
        } catch (error) {
            console.error('❌ Frontend: Upload error:', error);
            console.error('❌ Frontend: Error response:', error.response?.data);
            console.error('❌ Frontend: Error details:', error.message);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <AdminTabs />
                <div className="max-w-6xl mx-auto p-6">
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const totalImpressions = configs.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = configs.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalDismissals = configs.reduce((sum, c) => sum + (c.dismissals || 0), 0);
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminTabs />

            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Popup Marketing</h2>
                        <p className="text-gray-600 mt-1">Design and manage promotional popups</p>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer bg-white px-5 py-3 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            className="w-5 h-5 text-indigo-600"
                        />
                        <span className="font-medium text-gray-700">
                            {enabled ? '🟢 Popups Enabled' : '🔴 Popups Disabled'}
                        </span>
                    </label>

                </div>

                {/* Analytics Summary */}
                {configs.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Target className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Impressions</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <MousePointerClick className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Clicks</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <TrendingUp className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">CTR</p>
                                    <p className="text-2xl font-bold text-gray-900">{avgCTR}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <XIcon className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Dismissals</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalDismissals.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Popup Configurations */}
                <div className="space-y-6 mb-6">
                    {configs.map((config, idx) => {
                        const selectedBook = books.find(b => b._id === config.productId);

                        return (
                            <div key={config._id} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-gray-900">Popup #{idx + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => updateConfig(config._id, 'isActive', !config.isActive)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all ${config.isActive
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {config.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                            {config.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => deleteConfig(config._id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Title */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={config.title}
                                            onChange={(e) => updateConfig(config._id, 'title', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Special Offer!"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <textarea
                                            value={config.description}
                                            onChange={(e) => updateConfig(config._id, 'description', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            rows={2}
                                            placeholder="Limited time offer on our featured product..."
                                        />
                                    </div>

                                    {/* Design Type */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Design Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => updateConfig(config._id, 'designType', 'custom')}
                                                className={`p-4 border-2 rounded-lg text-left transition-all ${config.designType === 'custom'
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Palette className={config.designType === 'custom' ? 'text-indigo-600' : 'text-gray-400'} size={24} />
                                                <h4 className="font-semibold mt-2">Custom Design</h4>
                                                <p className="text-xs text-gray-600 mt-1">Fully customizable with product data</p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => updateConfig(config._id, 'designType', 'image')}
                                                className={`p-4 border-2 rounded-lg text-left transition-all ${config.designType === 'image'
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <ImageIcon className={config.designType === 'image' ? 'text-indigo-600' : 'text-gray-400'} size={24} />
                                                <h4 className="font-semibold mt-2">Image Upload</h4>
                                                <p className="text-xs text-gray-600 mt-1">Upload a complete popup design</p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* CUSTOM DESIGN - Product Selection */}
                                    {config.designType === 'custom' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Product <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={config.productId}
                                                    onChange={(e) => updateConfig(config._id, 'productId', e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Select a product</option>
                                                    {books.map(b => (
                                                        <option key={b._id} value={b._id}>{b.title}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={config.discountPercentage}
                                                    onChange={(e) => updateConfig(config._id, 'discountPercentage', parseInt(e.target.value) || 0)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="0"
                                                />
                                            </div>

                                            {/* Product Preview */}
                                            {selectedBook && (
                                                <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                                    <div className="flex items-center gap-4">
                                                        {selectedBook.assets?.coverUrl?.[0] && (
                                                            <img
                                                                src={assetUrl(selectedBook.assets.coverUrl[0])}
                                                                alt={selectedBook.title}
                                                                className="w-20 h-28 object-cover rounded-lg shadow-md"
                                                            />
                                                        )}
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">{selectedBook.title}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">{selectedBook.author}</p>
                                                            <p className="text-lg font-bold text-indigo-600 mt-2">₹{selectedBook.price}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* IMAGE DESIGN - Image Upload */}
                                    {config.designType === 'image' && (
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <ImageIcon size={16} className="inline mr-2" />
                                                Popup Image <span className="text-red-500">*</span>
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                                                {config.imageUrl ? (
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={assetUrl(config.imageUrl)}
                                                            alt="Popup preview"
                                                            className="max-h-64 mx-auto rounded-lg shadow-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => updateConfig(config._id, 'imageUrl', '')}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                                                        >
                                                            <XIcon size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer block">
                                                        {uploadingImage === config._id ? (
                                                            <div className="py-8">
                                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                                                <p className="text-sm text-gray-600 mt-4">Uploading...</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                                                                <p className="text-base text-gray-700 font-medium mb-2">Click to upload popup image</p>
                                                                <p className="text-sm text-gray-500">PNG, JPG up to 5MB • Recommended: 800x600px</p>
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
                                        </div>
                                    )}

                                    {/* CTA Configuration */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
                                        <input
                                            type="text"
                                            value={config.ctaText}
                                            onChange={(e) => updateConfig(config._id, 'ctaText', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Shop Now"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link (optional)</label>
                                        <input
                                            type="text"
                                            value={config.ctaLink}
                                            onChange={(e) => updateConfig(config._id, 'ctaLink', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="/product/slug or external URL"
                                        />
                                    </div>

                                    {/* Trigger Configuration */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Type</label>
                                        <select
                                            value={config.triggerType}
                                            onChange={(e) => updateConfig(config._id, 'triggerType', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="time">Time Delay (seconds)</option>
                                            <option value="scroll">Scroll Percentage</option>
                                            <option value="exit">Exit Intent</option>
                                        </select>
                                    </div>

                                    {config.triggerType !== 'exit' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Trigger Value ({config.triggerType === 'time' ? 'seconds' : 'scroll %'})
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={config.triggerType === 'scroll' ? 100 : undefined}
                                                value={config.triggerValue}
                                                onChange={(e) => updateConfig(config._id, 'triggerValue', parseInt(e.target.value) || 0)}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>
                                    )}

                                    {/* Target Pages */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Show on Pages</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['all', 'home', 'products', 'cart'].map(page => (
                                                <label key={page} className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.targetPages.includes(page)}
                                                        onChange={(e) => {
                                                            const newPages = e.target.checked
                                                                ? [...config.targetPages, page]
                                                                : config.targetPages.filter(p => p !== page);
                                                            updateConfig(config._id, 'targetPages', newPages);
                                                        }}
                                                        className="w-4 h-4 text-indigo-600"
                                                    />
                                                    <span className="capitalize text-sm font-medium text-gray-700">{page}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Visitor Targeting */}
                                    <div>
                                        <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border">
                                            <input
                                                type="checkbox"
                                                checked={config.showToNewVisitors}
                                                onChange={(e) => updateConfig(config._id, 'showToNewVisitors', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Show to new visitors</span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border">
                                            <input
                                                type="checkbox"
                                                checked={config.showToReturningVisitors}
                                                onChange={(e) => updateConfig(config._id, 'showToReturningVisitors', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Show to returning visitors</span>
                                        </label>
                                    </div>

                                    {/* Frequency Control */}
                                    <div>
                                        <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border">
                                            <input
                                                type="checkbox"
                                                checked={config.showOncePerSession}
                                                onChange={(e) => updateConfig(config._id, 'showOncePerSession', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Show once per session</span>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border">
                                            <input
                                                type="checkbox"
                                                checked={config.showOncePerDay}
                                                onChange={(e) => updateConfig(config._id, 'showOncePerDay', e.target.checked)}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Show once per day</span>
                                        </label>
                                    </div>

                                    {/* Date Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={config.startDate ? config.startDate.split('T')[0] : ''}
                                            onChange={(e) => updateConfig(config._id, 'startDate', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date (optional)</label>
                                        <input
                                            type="date"
                                            value={config.endDate ? config.endDate.split('T')[0] : ''}
                                            onChange={(e) => updateConfig(config._id, 'endDate', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* CUSTOM DESIGN CUSTOMIZATION */}
                                    {config.designType === 'custom' && (
                                        <div className="col-span-2 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedConfig(expandedConfig === config._id ? null : config._id)}
                                                className="flex items-center gap-2 text-lg font-semibold text-purple-900 mb-4 hover:text-purple-700 transition-colors"
                                            >
                                                <Palette size={20} />
                                                {expandedConfig === config._id ? '🔽 Hide' : '▶️ Show'} Design Customization
                                            </button>

                                            {expandedConfig === config._id && (
                                                <div className="grid grid-cols-3 gap-4 mt-4">
                                                    {/* Layout */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                                                        <select
                                                            value={config.customDesign?.layout || 'left-right'}
                                                            onChange={(e) => updateCustomDesign(config._id, 'layout', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg"
                                                        >
                                                            <option value="left-right">Image Left/Right</option>
                                                            <option value="top-bottom">Image Top/Bottom</option>
                                                            <option value="centered">Centered</option>
                                                        </select>
                                                    </div>

                                                    {/* Background Color */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                                                        <input
                                                            type="color"
                                                            value={config.customDesign?.backgroundColor || '#ffffff'}
                                                            onChange={(e) => updateCustomDesign(config._id, 'backgroundColor', e.target.value)}
                                                            className="w-full h-10 border rounded-lg cursor-pointer"
                                                        />
                                                    </div>

                                                    {/* Text Color */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                                                        <input
                                                            type="color"
                                                            value={config.customDesign?.textColor || '#000000'}
                                                            onChange={(e) => updateCustomDesign(config._id, 'textColor', e.target.value)}
                                                            className="w-full h-10 border rounded-lg cursor-pointer"
                                                        />
                                                    </div>

                                                    {/* Accent Color */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                                                        <input
                                                            type="color"
                                                            value={config.customDesign?.accentColor || '#4F46E5'}
                                                            onChange={(e) => updateCustomDesign(config._id, 'accentColor', e.target.value)}
                                                            className="w-full h-10 border rounded-lg cursor-pointer"
                                                        />
                                                    </div>

                                                    {/* Button Background */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Button Background</label>
                                                        <input
                                                            type="color"
                                                            value={config.customDesign?.ctaBackgroundColor || '#4F46E5'}
                                                            onChange={(e) => updateCustomDesign(config._id, 'ctaBackgroundColor', e.target.value)}
                                                            className="w-full h-10 border rounded-lg cursor-pointer"
                                                        />
                                                    </div>

                                                    {/* Button Text Color */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                                                        <input
                                                            type="color"
                                                            value={config.customDesign?.ctaTextColor || '#ffffff'}
                                                            onChange={(e) => updateCustomDesign(config._id, 'ctaTextColor', e.target.value)}
                                                            className="w-full h-10 border rounded-lg cursor-pointer"
                                                        />
                                                    </div>

                                                    {/* Border Radius */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                                                        <input
                                                            type="text"
                                                            value={config.customDesign?.borderRadius || '16px'}
                                                            onChange={(e) => updateCustomDesign(config._id, 'borderRadius', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg"
                                                            placeholder="16px"
                                                        />
                                                    </div>

                                                    {/* Max Width */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Width</label>
                                                        <input
                                                            type="text"
                                                            value={config.customDesign?.maxWidth || '600px'}
                                                            onChange={(e) => updateCustomDesign(config._id, 'maxWidth', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg"
                                                            placeholder="600px"
                                                        />
                                                    </div>

                                                    {/* Animation Type */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Animation</label>
                                                        <select
                                                            value={config.customDesign?.animationType || 'slideUp'}
                                                            onChange={(e) => updateCustomDesign(config._id, 'animationType', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded-lg"
                                                        >
                                                            <option value="slideUp">Slide Up</option>
                                                            <option value="slideDown">Slide Down</option>
                                                            <option value="fade">Fade</option>
                                                            <option value="zoomIn">Zoom In</option>
                                                        </select>
                                                    </div>

                                                    {/* Show Product Image */}
                                                    <div className="col-span-3">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={config.customDesign?.showProductImage !== false}
                                                                onChange={(e) => updateCustomDesign(config._id, 'showProductImage', e.target.checked)}
                                                                className="w-4 h-4"
                                                            />
                                                            <span className="text-sm font-medium text-gray-700">Show Product Image</span>
                                                        </label>
                                                    </div>

                                                    {config.customDesign?.showProductImage !== false && (
                                                        <>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Image Position</label>
                                                                <select
                                                                    value={config.customDesign?.imagePosition || 'left'}
                                                                    onChange={(e) => updateCustomDesign(config._id, 'imagePosition', e.target.value)}
                                                                    className="w-full px-3 py-2 border rounded-lg"
                                                                >
                                                                    <option value="left">Left</option>
                                                                    <option value="right">Right</option>
                                                                    <option value="top">Top</option>
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Image Size</label>
                                                                <input
                                                                    type="text"
                                                                    value={config.customDesign?.imageSize || '50%'}
                                                                    onChange={(e) => updateCustomDesign(config._id, 'imageSize', e.target.value)}
                                                                    className="w-full px-3 py-2 border rounded-lg"
                                                                    placeholder="50%"
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Analytics */}
                                    {(config.impressions > 0 || config.clicks > 0 || config.dismissals > 0) && (
                                        <div className="col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-200">
                                            <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <TrendingUp size={18} />
                                                Performance Analytics
                                            </div>
                                            <div className="grid grid-cols-4 gap-4">
                                                <div>
                                                    <span className="text-xs text-gray-600 block mb-1">Impressions</span>
                                                    <span className="text-xl font-bold text-gray-900">{config.impressions || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-600 block mb-1">Clicks</span>
                                                    <span className="text-xl font-bold text-gray-900">{config.clicks || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-600 block mb-1">CTR</span>
                                                    <span className="text-xl font-bold text-green-600">
                                                        {config.impressions > 0
                                                            ? ((config.clicks / config.impressions) * 100).toFixed(1)
                                                            : 0}%
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-600 block mb-1">Dismissals</span>
                                                    <span className="text-xl font-bold text-red-600">{config.dismissals || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {configs.length === 0 && (
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <ImageIcon size={64} className="mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No popups configured yet</h3>
                        <p className="text-gray-500 mb-6">Create your first promotional popup to engage visitors</p>
                    </div>
                )}

                {/* Actions */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 shadow-2xl z-50 backdrop-blur-sm bg-opacity-95">
                    <div className="max-w-6xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Status Info */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {enabled ? '✅ Popups Enabled' : '⚠️ Popups Disabled'}
                                    </span>
                                </div>
                                <div className="h-6 w-px bg-gray-300"></div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold">{configs.length}</span> total popups
                                    {configs.filter(c => c.isActive).length > 0 && (
                                        <span className="ml-2">
                                            • <span className="font-semibold text-green-600">{configs.filter(c => c.isActive).length}</span> active
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={addNewConfig}
                                    className="flex items-center gap-2 px-5 py-2.5 border-2 border-indigo-300 bg-white rounded-lg hover:border-indigo-500 hover:bg-indigo-50 text-indigo-600 font-semibold transition-all"
                                >
                                    <Plus size={18} />
                                    Add New Popup
                                </button>

                                <button
                                    onClick={save}
                                    disabled={saving}
                                    className={`flex items-center gap-2 px-8 py-2.5 rounded-lg font-bold text-white shadow-lg transition-all ${saving
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105 active:scale-95'
                                        }`}
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            Save All Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add padding at bottom so content doesn't hide behind fixed bar */}
                <div className="h-24"></div>
            </div>
        </div>
    );
}
