// src/pages/Admin/Coupons.jsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";
import { Plus, Trash2, Edit2, Save, X, Tag, ToggleLeft, ToggleRight, BarChart2, ShoppingBag, TrendingDown, BookOpen } from "lucide-react";

const EMPTY_FORM = {
  code: "",
  discountType: "percent",
  discountValue: "",
  minOrderValue: "",
  minQty: "",
  maxUses: "",
  expiresAt: "",
  isActive: true,
  description: "",
  requiredBookId: "",
  requiredBookDisplay: "", // "Title (SKU: xxx)" — display only, not sent to API
  isFirstOrderOnly: false,
};

export default function Coupons() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [tab, setTab] = useState("coupons"); // "coupons" | "report"
  const [coupons, setCoupons] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // coupon object to delete

  // Book picker state
  const [bookSearch, setBookSearch] = useState("");
  const [bookResults, setBookResults] = useState([]);
  const [bookSearchLoading, setBookSearchLoading] = useState(false);

  async function searchBooks(q) {
    if (!q.trim()) { setBookResults([]); return; }
    setBookSearchLoading(true);
    try {
      const { data } = await api.get("/books", { params: { q, limit: 10 }, ...auth });
      setBookResults(data.books || data.items || []);
    } catch {
      // silent
    } finally {
      setBookSearchLoading(false);
    }
  }

  function selectBook(book) {
    const sku = book.inventory?.sku;
    set("requiredBookId", book._id);
    set("requiredBookDisplay", sku ? `${sku} — ${book.title}` : book.title);
    setBookSearch("");
    setBookResults([]);
  }

  function clearBook() {
    set("requiredBookId", "");
    set("requiredBookDisplay", "");
    setBookSearch("");
    setBookResults([]);
  }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/coupons", auth);
      if (res.data?.ok) setCoupons(res.data.coupons);
    } catch {
      t.err("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }

  async function loadReport() {
    setReportLoading(true);
    try {
      const res = await api.get("/coupons/report", auth);
      if (res.data?.ok) setReport(res.data.report);
    } catch {
      t.err("Failed to load report");
    } finally {
      setReportLoading(false);
    }
  }

  function switchTab(t) {
    setTab(t);
    if (t === "report" && report.length === 0) loadReport();
  }

  function openNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(c) {
    setEditId(c._id);
    const book = c.requiredBookId; // populated object or null
    const bookId = book?._id || "";
    const bookDisplay = book
      ? (book.inventory?.sku ? `${book.inventory.sku} — ${book.title}` : book.title)
      : "";
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minOrderValue: c.minOrderValue ? String(c.minOrderValue) : "",
      minQty: c.minQty ? String(c.minQty) : "",
      maxUses: c.maxUses ? String(c.maxUses) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      isActive: c.isActive,
      description: c.description || "",
      requiredBookId: bookId,
      requiredBookDisplay: bookDisplay,
      isFirstOrderOnly: c.isFirstOrderOnly || false,
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    if (!form.code.trim()) { t.info("Coupon code is required"); return; }
    if (!form.discountValue || isNaN(Number(form.discountValue))) { t.info("Enter a valid discount value"); return; }
    if (form.discountType === "percent" && (Number(form.discountValue) <= 0 || Number(form.discountValue) > 100)) {
      t.info("Percent discount must be between 1 and 100"); return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        minQty: form.minQty ? Number(form.minQty) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
        description: form.description,
        requiredBookId: form.requiredBookId || null,
        isFirstOrderOnly: form.isFirstOrderOnly,
      };
      if (editId) {
        await api.put(`/coupons/${editId}`, payload, auth);
        t.success("Coupon updated");
      } else {
        await api.post("/coupons", payload, auth);
        t.success("Coupon created");
      }
      cancelForm();
      load();
    } catch (e) {
      t.err(e?.response?.data?.error || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c) {
    try {
      await api.put(`/coupons/${c._id}`, { isActive: !c.isActive }, auth);
      setCoupons(prev => prev.map(x => x._id === c._id ? { ...x, isActive: !x.isActive } : x));
    } catch {
      t.err("Failed to update coupon");
    }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/coupons/${deleteConfirm._id}`, auth);
      setCoupons(prev => prev.filter(c => c._id !== deleteConfirm._id));
      t.success("Coupon deleted");
    } catch {
      t.err("Failed to delete coupon");
    } finally {
      setDeleteConfirm(null);
    }
  }

  const fmt = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#384959] bg-white";
  const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#384959] rounded-xl flex items-center justify-center">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#384959]">Coupon Codes</h1>
            <p className="text-sm text-gray-500">Manage discount codes for customers</p>
          </div>
        </div>
        {tab === "coupons" && (
          <button onClick={openNew} className="flex items-center gap-2 bg-[#384959] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2c3a47] transition-colors">
            <Plus className="w-4 h-4" /> Add Coupon
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => switchTab("coupons")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "coupons" ? "bg-white text-[#384959] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <span className="flex items-center gap-2"><Tag className="w-4 h-4" /> Coupons</span>
        </button>
        <button
          onClick={() => switchTab("report")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${tab === "report" ? "bg-white text-[#384959] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <span className="flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Usage Report</span>
        </button>
      </div>

      {/* ── COUPONS TAB ── */}
      {tab === "coupons" && (
        <>
          {/* Form */}
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-[#384959] text-lg">{editId ? "Edit Coupon" : "New Coupon"}</h2>
                <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Coupon Code *</label>
                  <input className={inputCls + " uppercase"} placeholder="e.g. SAVE20" value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} />
                </div>

                <div>
                  <label className={labelCls}>Discount Type *</label>
                  <select className={inputCls} value={form.discountType} onChange={e => set("discountType", e.target.value)}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Discount Value * {form.discountType === "percent" ? "(%)" : "(₹)"}</label>
                  <input type="number" className={inputCls} placeholder={form.discountType === "percent" ? "e.g. 20" : "e.g. 100"} value={form.discountValue} onChange={e => set("discountValue", e.target.value)} min="1" max={form.discountType === "percent" ? "100" : undefined} />
                </div>

                <div>
                  <label className={labelCls}>Min Order Value (₹)</label>
                  <input type="number" className={inputCls} placeholder="0 = no minimum" value={form.minOrderValue} onChange={e => set("minOrderValue", e.target.value)} min="0" />
                </div>

                <div>
                  <label className={labelCls}>Min Books in Order</label>
                  <input type="number" className={inputCls} placeholder="e.g. 5 — leave blank for no min" value={form.minQty} onChange={e => set("minQty", e.target.value)} min="1" />
                  <p className="text-xs text-gray-400 mt-1">Customer must add this many books to use this coupon</p>
                </div>

                {/* Required Book Picker */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={labelCls}>Required Book (optional)</label>
                  <p className="text-xs text-gray-400 mb-2">If set, coupon only works when this specific book is in the cart</p>
                  {form.requiredBookDisplay ? (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-blue-800 flex-1">{form.requiredBookDisplay}</span>
                      <button type="button" onClick={clearBook} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={bookSearch}
                        onChange={e => { setBookSearch(e.target.value); searchBooks(e.target.value); }}
                        placeholder="Search books by title or SKU..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#384959] focus:border-transparent"
                      />
                      {bookSearchLoading && (
                        <div className="absolute right-3 top-2.5">
                          <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-[#384959] rounded-full"></div>
                        </div>
                      )}
                      {bookResults.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {bookResults.map(b => (
                            <button
                              key={b._id}
                              type="button"
                              onClick={() => selectBook(b)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 text-left border-b border-gray-100 last:border-0"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{b.title}</p>
                                <p className="text-xs text-gray-500">₹{b.price || 0} · {b.inventory?.sku || 'No SKU'}</p>
                              </div>
                              <span className="text-xs text-blue-600 font-medium flex-shrink-0">Select</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Max Uses</label>
                  <input type="number" className={inputCls} placeholder="Leave blank = unlimited" value={form.maxUses} onChange={e => set("maxUses", e.target.value)} min="1" />
                </div>

                <div>
                  <label className={labelCls}>Expiry Date</label>
                  <input type="date" className={inputCls} value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} />
                </div>

                <div className="lg:col-span-2">
                  <label className={labelCls}>Description (admin notes)</label>
                  <input className={inputCls} placeholder="e.g. Bulk buy discount — 5+ books" value={form.description} onChange={e => set("description", e.target.value)} />
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button type="button" onClick={() => set("isActive", !form.isActive)} className={`w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"} relative`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isActive ? "left-6" : "left-0.5"}`} />
                    </button>
                    <span className="text-sm font-bold text-gray-600">{form.isActive ? "Active" : "Inactive"}</span>
                  </label>
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button type="button" onClick={() => set("isFirstOrderOnly", !form.isFirstOrderOnly)} className={`w-12 h-6 rounded-full transition-colors ${form.isFirstOrderOnly ? "bg-blue-500" : "bg-gray-300"} relative`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isFirstOrderOnly ? "left-6" : "left-0.5"}`} />
                    </button>
                    <div>
                      <span className="text-sm font-bold text-gray-600">First Order Only</span>
                      {form.isFirstOrderOnly && <p className="text-xs text-blue-500">Only valid on customer's first purchase</p>}
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#384959] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#2c3a47] transition-colors disabled:opacity-60">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving…" : editId ? "Update Coupon" : "Create Coupon"}
                </button>
                <button onClick={cancelForm} className="px-6 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading coupons…</div>
          ) : coupons.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No coupons yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add Coupon" to create your first discount code</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Discount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Conditions</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Uses</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Expires</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-[#384959] bg-[#f0f4f8] px-2 py-1 rounded-lg text-xs tracking-widest">{c.code}</span>
                        {c.description && <p className="text-xs text-gray-400 mt-1">{c.description}</p>}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">
                        {c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs space-y-0.5">
                        {c.minOrderValue > 0 && <div>Min order: <b>₹{c.minOrderValue}</b></div>}
                        {c.requiredBookId ? (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span>
                              {c.minQty > 0 ? `×${c.minQty} ` : ""}
                              <b className="text-blue-700">
                                {c.requiredBookId.inventory?.sku
                                  ? `SKU: ${c.requiredBookId.inventory.sku}`
                                  : c.requiredBookId.title?.slice(0, 25)}
                              </b>
                            </span>
                          </div>
                        ) : (
                          c.minQty > 0 && <div>Min books: <b>{c.minQty}</b></div>
                        )}
                        {c.isFirstOrderOnly && <div className="text-blue-600 font-medium">1st order only</div>}
                        {!c.minOrderValue && !c.requiredBookId && !c.minQty && !c.isFirstOrderOnly && <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : <span className="text-gray-400"> / ∞</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.expiresAt
                          ? new Date(c.expiresAt) < new Date()
                            ? <span className="text-red-500 font-medium">Expired</span>
                            : new Date(c.expiresAt).toLocaleDateString("en-IN")
                          : <span className="text-gray-400">No expiry</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(c)} className="flex items-center gap-1.5">
                          {c.isActive
                            ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600 font-medium text-xs">Active</span></>
                            : <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-400 text-xs">Inactive</span></>}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-[#384959] hover:bg-gray-100 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteConfirm(c)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── USAGE REPORT TAB ── */}
      {tab === "report" && (
        <>
          {reportLoading ? (
            <div className="text-center py-20 text-gray-400">Loading report…</div>
          ) : report.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
              <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No usage data yet</p>
              <p className="text-sm text-gray-400 mt-1">Data will appear once customers start using coupon codes</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-1">
                    <Tag className="w-5 h-5 text-[#384959]" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Coupons</span>
                  </div>
                  <p className="text-3xl font-bold text-[#384959]">{report.length}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-1">
                    <ShoppingBag className="w-5 h-5 text-blue-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Orders with Coupon</span>
                  </div>
                  <p className="text-3xl font-bold text-[#384959]">{report.reduce((s, r) => s + r.totalOrders, 0)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-1">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Discount Given</span>
                  </div>
                  <p className="text-3xl font-bold text-[#384959]">{fmt(report.reduce((s, r) => s + r.totalDiscount, 0))}</p>
                </div>
              </div>

              {/* Report table */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Orders Used</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Total Discount</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Revenue Generated</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Last Used</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.map(r => (
                      <tr key={r.code} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-[#384959] bg-[#f0f4f8] px-2 py-1 rounded-lg text-xs tracking-widest">{r.code}</span>
                          {r.coupon?.description && <p className="text-xs text-gray-400 mt-1">{r.coupon.description}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {r.coupon ? (r.coupon.discountType === "percent" ? `${r.coupon.discountValue}%` : `₹${r.coupon.discountValue}`) : "—"}
                          {r.coupon?.requiredBookId && (
                            <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                              <BookOpen className="w-3 h-3" />
                              {r.coupon.requiredBookId.inventory?.sku
                                ? `SKU: ${r.coupon.requiredBookId.inventory.sku}`
                                : r.coupon.requiredBookId.title?.slice(0, 20)}
                              {r.coupon.minQty > 0 && ` ×${r.coupon.minQty}`}
                            </p>
                          )}
                          {!r.coupon?.requiredBookId && r.coupon?.minQty > 0 && <p className="text-xs text-gray-400">Min {r.coupon.minQty} books</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold text-lg ${r.totalOrders > 0 ? "text-[#384959]" : "text-gray-300"}`}>{r.totalOrders}</span>
                          {r.coupon?.maxUses && <p className="text-xs text-gray-400">/ {r.coupon.maxUses} max</p>}
                        </td>
                        <td className="px-4 py-3 font-bold text-red-500">{r.totalDiscount > 0 ? `-${fmt(r.totalDiscount)}` : "—"}</td>
                        <td className="px-4 py-3 font-bold text-green-700">{r.totalRevenue > 0 ? fmt(r.totalRevenue) : "—"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {r.lastUsed ? new Date(r.lastUsed).toLocaleDateString("en-IN") : <span className="text-gray-300">Never</span>}
                        </td>
                        <td className="px-4 py-3">
                          {r.coupon
                            ? r.coupon.isActive
                              ? <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                              : <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Inactive</span>
                            : <span className="text-xs text-gray-300">Deleted</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Coupon?</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              You are about to delete coupon
            </p>
            <p className="text-center mb-5">
              <span className="font-mono font-bold text-[#384959] bg-[#f0f4f8] px-2 py-1 rounded-lg text-sm tracking-widest">
                {deleteConfirm.code}
              </span>
            </p>
            <p className="text-xs text-gray-400 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
