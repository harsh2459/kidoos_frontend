import { useEffect, useState } from "react";
import {
  Users, BookOpen, ShoppingBag, TrendingUp, Download, MapPin,
  Loader2, AlertTriangle, ShoppingCart, Shield, Database,
  LayoutDashboard, UserCircle2, ServerCog, X, Trash2, Ban, CheckCircle, ChevronDown
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";

// ── Calm, professional colour palette ──────────────────────────────────────────
// All charts use the same 4-step slate/blue scale for consistency
const CHART_COLORS = ["#1E3A5F", "#2E5B9A", "#5B8FC9", "#A8C8EE"];

function fmtBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const VIEW_TABS = [
  { id: "all",       label: "Overview",  icon: LayoutDashboard },
  { id: "business",  label: "Business",  icon: TrendingUp      },
  { id: "customers", label: "Customers", icon: UserCircle2     },
  { id: "storage",   label: "Storage",   icon: ServerCog       },
];

export default function Dashboard() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState("all");
  const [view,    setView]    = useState("all");

  const [showAdmins,    setShowAdmins]    = useState(false);
  const [admins,        setAdmins]        = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [disableDays,   setDisableDays]   = useState({});

  const [showCarts,    setShowCarts]    = useState(false);
  const [carts,        setCarts]        = useState([]);
  const [cartsLoading, setCartsLoading] = useState(false);

  // ── Confirm modal state ────────────────────────────────────────────────────
  const [confirm, setConfirm] = useState(null);
  // confirm = { title, message, onOk } | null
  function askConfirm(title, message, onOk) {
    setConfirm({ title, message, onOk });
  }
  function resolveConfirm(ok) {
    if (ok && confirm?.onOk) confirm.onOk();
    setConfirm(null);
  }

  async function loadAdmins() {
    setAdminsLoading(true);
    try {
      const res = await api.get("/auth/admins", auth);
      if (res.data.ok) setAdmins(res.data.admins);
    } catch { t.error("Failed to load admins"); }
    finally { setAdminsLoading(false); }
  }

  async function handleDisable(id) {
    const days = Number(disableDays[id] || 7);
    try {
      await api.patch(`/auth/admins/${id}`, { disableDays: days }, auth);
      t.success(`Admin disabled for ${days} day(s)`);
      await loadAdmins();
    } catch (e) { t.error(e?.response?.data?.error || "Failed"); }
  }

  async function handleEnable(id) {
    try {
      await api.patch(`/auth/admins/${id}`, { enableNow: true }, auth);
      t.success("Admin enabled");
      await loadAdmins();
    } catch (e) { t.error(e?.response?.data?.error || "Failed"); }
  }

  function handleDelete(id, name) {
    askConfirm(
      "Delete admin",
      `Remove "${name || "this admin"}" permanently? This cannot be undone.`,
      async () => {
        try {
          await api.delete(`/auth/admins/${id}`, auth);
          t.success("Admin deleted");
          setAdmins(prev => prev.filter(a => a._id !== id));
          loadStats();
        } catch (e) { t.error(e?.response?.data?.error || "Failed"); }
      }
    );
  }

  async function loadCarts() {
    setCartsLoading(true);
    try {
      const res = await api.get("/auth/dashboard/carts", auth);
      if (res.data.ok) setCarts(res.data.customers);
    } catch { t.error("Failed to load carts"); }
    finally { setCartsLoading(false); }
  }

  function handlePurgeGuests() {
    askConfirm(
      "Purge guest accounts",
      "Delete all accounts with no email, even those with items in their cart? This cannot be undone.",
      async () => {
        try {
          const res = await api.delete("/auth/customers/guests/empty", auth);
          t.success(`Deleted ${res.data.deleted} guest account(s)`);
          loadStats();
        } catch (e) { t.error(e?.response?.data?.error || "Failed"); }
      }
    );
  }

  function handlePurgeExpiredOTPs() {
    askConfirm(
      "Clear expired OTPs",
      "Delete all Email OTP records older than 5 hours? This cannot be undone.",
      async () => {
        try {
          const res = await api.delete("/auth/email-otps/expired", auth);
          t.success(`Deleted ${res.data.deleted} expired OTP record(s)`);
          loadStats();
        } catch (e) { t.error(e?.response?.data?.error || "Failed"); }
      }
    );
  }

  async function loadStats() {
    setLoading(true);
    try {
      const res = await api.get(`/auth/dashboard/stats?period=${period}`, auth);
      if (res.data.success) setData(res.data);
    } catch (e) {
      console.error(e);
      t.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function downloadUsers() {
    try {
      const response = await api.get("/auth/users/download", { ...auth, responseType: "blob" });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", "customers.csv");
      document.body.appendChild(link);
      link.click();
      t.success("User data downloaded!");
    } catch { t.error("Download failed"); }
  }

  async function downloadOrders() {
    try {
      const response = await api.get("/auth/orders/download", { ...auth, responseType: "blob" });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", "orders.csv");
      document.body.appendChild(link);
      link.click();
      t.success("Orders downloaded!");
    } catch { t.error("Orders download failed"); }
  }

  async function downloadPayments() {
    try {
      const response = await api.get("/auth/payments/download", { ...auth, responseType: "blob" });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", "payments.csv");
      document.body.appendChild(link);
      link.click();
      t.success("Payments downloaded!");
    } catch { t.error("Payments download failed"); }
  }

  function handleDeleteAllOrders() {
    askConfirm(
      "Delete old orders",
      "Permanently delete all orders older than 7 days? This cannot be undone.",
      async () => {
        try {
          const res = await api.delete("/auth/orders/all", auth);
          t.success(`Deleted ${res.data.deleted} order(s) older than 7 days`);
          loadStats();
        } catch (e) { t.error(e?.response?.data?.error || "Failed to delete orders"); }
      }
    );
  }

  function handleDeleteAllPayments() {
    askConfirm(
      "Delete old payments",
      "Permanently delete all payment records older than 7 days? This cannot be undone.",
      async () => {
        try {
          const res = await api.delete("/auth/payments/all", auth);
          t.success(`Deleted ${res.data.deleted} payment record(s) older than 7 days`);
          loadStats();
        } catch (e) { t.error(e?.response?.data?.error || "Failed to delete payments"); }
      }
    );
  }

  useEffect(() => { loadStats(); }, [period]);

  if (loading && !data) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
    </div>
  );

  const counts     = data?.counts      || {};
  const analytics  = data?.analytics   || {};
  const financials = data?.financials  || {};
  const storage    = data?.storage     || {};

  const ATLAS_FREE_BYTES = 512 * 1024 * 1024;
  const usedPct = storage.totalSizeBytes
    ? Math.min(100, Math.round((storage.totalSizeBytes / ATLAS_FREE_BYTES) * 100))
    : 0;

  const paymentData = (analytics.paymentModes || []).map(m => ({
    name:  m._id === "full" ? "Prepaid" : "COD",
    value: m.count,
  }));

  const show = (cat) => view === "all" || view === cat;

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-8 bg-gray-50 min-h-screen">

      {/* ── HEADER ── */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Business overview and management tools</p>
      </div>

      {/* ── VIEW TABS ── */}
      <div className="flex gap-1 mb-7 bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-fit">
        {VIEW_TABS.map(tab => {
          const Icon = tab.icon;
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                active
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════
          BUSINESS SECTION
          ══════════════════════════════════════════════ */}
      {show("business") && (
        <>
          {view === "business" && <SectionLabel>Business</SectionLabel>}

          {/* Key metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Revenue"
              value={`₹${(financials.revenue || 0).toLocaleString()}`}
              icon={TrendingUp}
              iconClass="bg-blue-50 text-blue-600"
              periodLabel={period === "all" ? "All time" : period}
            />
            <StatCard
              label="Total Orders"
              value={counts.orders ?? 0}
              icon={ShoppingBag}
              iconClass="bg-indigo-50 text-indigo-600"
              periodLabel={period === "all" ? "All time" : period}
            />
            <StatCard
              label="Total Books"
              value={counts.books ?? 0}
              icon={BookOpen}
              iconClass="bg-violet-50 text-violet-600"
            />
            <div onClick={() => { setShowAdmins(true); loadAdmins(); }} className="cursor-pointer">
              <StatCard
                label="Active Admins"
                value={counts.activeAdmins ?? "—"}
                icon={Shield}
                iconClass="bg-slate-100 text-slate-600"
                sub="Tap to manage"
              />
            </div>
          </div>

          {/* Sales trend + Low stock */}
          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Revenue Trend</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Also filters: Revenue &amp; Orders cards above</p>
                </div>
                {/* Period filter lives here — it only affects Revenue Trend, Total Revenue, Total Orders */}
                <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                  {["today", "week", "month", "all"].map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                        period === p
                          ? "bg-gray-900 text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-700 hover:bg-white"
                      }`}
                    >
                      {p === "all" ? "All" : p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.trend} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 11 }} dx={-6} />
                    <Tooltip
                      cursor={{ fill: "#F3F4F6" }}
                      contentStyle={{
                        backgroundColor: "#fff", border: "1px solid #E5E7EB",
                        borderRadius: "8px", fontSize: "12px",
                        color: "#111827", padding: "6px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                      }}
                    />
                    <Bar dataKey="revenue" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low stock alerts */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-700">Low Stock</h3>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[220px]">
                {(analytics.lowStock || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
                    <p className="text-xs text-gray-400 font-medium">All stock levels healthy</p>
                  </div>
                ) : analytics.lowStock.map((book, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-800 font-mono truncate">{book.inventory?.sku || "NO-SKU"}</p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{book.title}</p>
                    </div>
                    <span className={`ml-2 px-2 py-1 rounded text-[10px] font-bold shrink-0 ${
                      (book.inventory?.stock || 0) <= 2 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {book.inventory?.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Best selling + Payment/Locations */}
          <div className={`mb-6 ${show("customers") ? "grid lg:grid-cols-2 gap-4" : ""}`}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Best Selling Books</h3>
                <span className="text-xs text-gray-400">Top {(analytics.topBooks || []).length}</span>
              </div>
              <div className="space-y-2">
                {(analytics.topBooks || []).length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No sales data</p>
                ) : (analytics.topBooks || []).map((book, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-900 text-white text-[10px] font-bold rounded shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 font-mono">{book.sku || "—"}</p>
                        <p className="text-[11px] text-gray-400 truncate max-w-[200px]">{book.title}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-gray-900">₹{book.revenue.toLocaleString()}</p>
                      <p className="text-[11px] text-gray-400">{book.sold} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {show("customers") && (
              <CustomerDetailsCard analytics={analytics} paymentData={paymentData} />
            )}
          </div>

          {/* Recent Orders table */}
          <div className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Recent Orders</h3>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">Last 10</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Order ID", "Date", "Customer", "Books", "Amount", "Order Status", "Payment"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(analytics.recentOrders || []).length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-xs">No orders found</td></tr>
                  ) : (analytics.recentOrders || []).map(o => {
                    const osBadge = {
                      pending:   "bg-amber-50 text-amber-700 border-amber-200",
                      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
                      paid:      "bg-teal-50 text-teal-700 border-teal-200",
                      shipped:   "bg-indigo-50 text-indigo-700 border-indigo-200",
                      delivered: "bg-green-50 text-green-700 border-green-200",
                      cancelled: "bg-red-50 text-red-600 border-red-200",
                      refunded:  "bg-gray-100 text-gray-500 border-gray-200",
                    }[o.status] || "bg-gray-100 text-gray-500 border-gray-200";
                    const pyBadge = {
                      paid:           "bg-green-50 text-green-700 border-green-200",
                      pending:        "bg-amber-50 text-amber-700 border-amber-200",
                      partially_paid: "bg-blue-50 text-blue-700 border-blue-200",
                      failed:         "bg-red-50 text-red-600 border-red-200",
                      refunded:       "bg-gray-100 text-gray-500 border-gray-200",
                    }[o.paymentStatus] || "bg-gray-100 text-gray-500 border-gray-200";
                    return (
                      <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-600">{String(o._id).slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(o.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">{o.customerName}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{o.customerEmail || o.customerPhone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600 truncate max-w-[160px]">{o.books}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{o.itemCount} item{o.itemCount !== 1 ? "s" : ""}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">₹{(o.amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${osBadge}`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${pyBadge}`}>{o.paymentStatus || "—"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════
          CUSTOMERS SECTION
          ══════════════════════════════════════════════ */}
      {show("customers") && (
        <>
          {view === "customers" && <SectionLabel>Customers</SectionLabel>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Total users card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1.5">{counts.users ?? 0}</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <button onClick={downloadUsers} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
                <button onClick={handlePurgeGuests} className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Purge guests
                </button>
              </div>
            </div>

            {/* Active carts card */}
            <div onClick={() => { setShowCarts(true); loadCarts(); }} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 cursor-pointer hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active Carts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1.5">{counts.cartsActive ?? "—"}</p>
                </div>
                <div className="p-2 bg-teal-50 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              <p className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">Tap to view cart contents →</p>
            </div>
          </div>

          {!show("business") && (
            <div className="mb-6">
              <CustomerDetailsCard analytics={analytics} paymentData={paymentData} />
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════
          STORAGE SECTION
          ══════════════════════════════════════════════ */}
      {show("storage") && (
        <>
          {view === "storage" && <SectionLabel>Storage & Data</SectionLabel>}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

            {/* MongoDB storage */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">MongoDB Storage</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{fmtBytes(storage.totalSizeBytes)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Data {fmtBytes(storage.dataSizeBytes)} · Index {fmtBytes(storage.indexSizeBytes)}</p>
                </div>
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Database className="w-5 h-5 text-slate-500" />
                </div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usedPct > 85 ? "bg-red-500" : usedPct > 60 ? "bg-amber-400" : "bg-green-500"
                  }`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 mt-1.5">
                <span>{usedPct}% used</span>
                <span>512 MB cap</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">{storage.collections} collections · {(storage.objects || 0).toLocaleString()} documents</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="text-[11px] text-gray-400 leading-relaxed">
                  <span>OTP records: </span>
                  <span className="font-semibold text-gray-700">{storage.otpTotal ?? "—"}</span>
                  {storage.otpExpired > 0 && (
                    <span className="ml-1.5 font-semibold text-amber-600">({storage.otpExpired} expired)</span>
                  )}
                </div>
                <button onClick={handlePurgeExpiredOTPs} className="flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors whitespace-nowrap shrink-0">
                  <Trash2 className="w-3 h-3" /> Clear &gt;5h
                </button>
              </div>
            </div>

            {/* Orders data */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Orders Data</p>
                  <p className="text-sm text-gray-600 mt-1">Customer · Items · Payment · Shipping</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                <button onClick={downloadOrders} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download orders CSV
                </button>
                <button onClick={handleDeleteAllOrders} className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete orders &gt;7 days
                </button>
              </div>
            </div>

            {/* Payments data */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Payments Data</p>
                  <p className="text-sm text-gray-600 mt-1">Provider · Order · Customer · Books</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                <button onClick={downloadPayments} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download payments CSV
                </button>
                <button onClick={handleDeleteAllPayments} className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete payments &gt;7 days
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Active Carts Modal ── */}
      {showCarts && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={() => setShowCarts(false)}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[85vh] flex flex-col" onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-teal-50 rounded-lg">
                  <ShoppingCart className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Active Carts</h3>
                  <p className="text-xs text-gray-400">{carts.length} customer{carts.length !== 1 ? "s" : ""} with items</p>
                </div>
              </div>
              <button onClick={() => setShowCarts(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              {cartsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : carts.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No active carts</p>
              ) : carts.map(c => {
                const isGuest = !c.email;
                const cartTotal = (c.cart?.items || []).reduce((sum, it) => sum + (it.unitPriceSnapshot * it.qty), 0);
                return (
                  <div key={c._id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">{c.name || "(no name)"}</span>
                          {isGuest && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 uppercase">Guest</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{c.email || "No email"}{c.phone ? ` · ${c.phone}` : ""}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-semibold text-gray-900 text-sm">₹{cartTotal.toLocaleString()}</span>
                        <p className="text-[11px] text-gray-400">{c.cart.items.length} item{c.cart.items.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {(c.cart?.items || []).map((item, idx) => {
                        const book = item.bookId || {};
                        return (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono font-semibold text-gray-700 shrink-0">{book.inventory?.sku || "—"}</span>
                              <span className="text-gray-400 truncate max-w-[180px]">{book.title || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-gray-400">×{item.qty}</span>
                              <span className="font-medium text-gray-800">₹{(item.unitPriceSnapshot * item.qty).toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3.5 border-t border-gray-100 shrink-0 flex justify-end">
              <button onClick={() => setShowCarts(false)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admins Management Modal ── */}
      {showAdmins && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={() => setShowAdmins(false)}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[85vh] flex flex-col" onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                  <Shield className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Admin Accounts</h3>
                  <p className="text-xs text-gray-400">{admins.length} account{admins.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => setShowAdmins(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-2">
              {adminsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : admins.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No admins found</p>
              ) : admins.map(a => {
                const isDisabled = a.disabledUntil && new Date(a.disabledUntil) > new Date();
                const disabledUntilStr = isDisabled ? new Date(a.disabledUntil).toLocaleDateString("en-IN") : null;
                return (
                  <div key={a._id} className={`rounded-xl border p-4 ${isDisabled ? "border-red-200 bg-red-50/30" : !a.isActive ? "border-gray-200 bg-gray-50" : "border-gray-200 bg-white"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">{a.name || "(no name)"}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${a.role === "admin" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>{a.role}</span>
                          {isDisabled && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-red-50 text-red-600 border-red-200 uppercase">Disabled · {disabledUntilStr}</span>}
                          {!a.isActive && !isDisabled && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-gray-100 text-gray-500 border-gray-200 uppercase">Inactive</span>}
                        </div>
                        <p className="text-xs text-gray-400 break-all">{a.email}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Created {new Date(a.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {isDisabled || !a.isActive ? (
                          <button onClick={() => handleEnable(a._id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                            <CheckCircle className="w-3 h-3" /> Enable
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="relative">
                              <select
                                value={disableDays[a._id] || 7}
                                onChange={e => setDisableDays(prev => ({ ...prev, [a._id]: Number(e.target.value) }))}
                                className="appearance-none pl-2 pr-6 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 font-medium focus:outline-none cursor-pointer"
                              >
                                {[1, 3, 7, 14, 30, 90].map(d => <option key={d} value={d}>{d}d</option>)}
                              </select>
                              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>
                            <button onClick={() => handleDisable(a._id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
                              <Ban className="w-3 h-3" /> Disable
                            </button>
                          </div>
                        )}
                        <button onClick={() => handleDelete(a._id, a.name)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3.5 border-t border-gray-100 shrink-0 flex justify-end">
              <button onClick={() => setShowAdmins(false)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm modal ── */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg shrink-0 mt-0.5">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{confirm.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{confirm.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => resolveConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => resolveConfirm(true)}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Confirm delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Section label ──────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">{children}</p>
  );
}

// ── Payment methods + Top locations ───────────────────────────────────────────
function CustomerDetailsCard({ analytics, paymentData }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Methods</h3>
        <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg">
          <div className="h-[100px] w-[100px] shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={paymentData} innerRadius={28} outerRadius={46} paddingAngle={3} dataKey="value">
                  {paymentData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {paymentData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i] }} />
                <span className="text-xs text-gray-500">{d.name}: <b className="text-gray-800 font-semibold">{d.value}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Locations</h3>
        <div className="space-y-2">
          {(analytics.locations || []).slice(0, 3).map((loc, i) => (
            <div key={i} className="flex justify-between items-center px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {loc._id}
              </span>
              <span className="text-sm font-semibold text-gray-900">₹{loc.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Generic stat card ──────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconClass, sub, periodLabel }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <div className={`p-2 rounded-lg ${iconClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      {periodLabel && (
        <span className="inline-block mt-2 text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded capitalize">
          {periodLabel}
        </span>
      )}
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
