import { useEffect, useState } from "react";
import {
  Users, BookOpen, ShoppingBag, TrendingUp, Download, MapPin,
  Loader2, AlertTriangle, ShoppingCart, Shield, Database,
  LayoutDashboard, UserCircle2, ServerCog
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";

const COLORS = ["#384959", "#88BDF2", "#6A89A7", "#BDDDFC"];

// ─── Utility: convert raw bytes → human-readable string ───────────────────────
function fmtBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ─── Category filter config ────────────────────────────────────────────────────
// Each view controls which dashboard sections are visible:
//   "all"       → everything
//   "business"  → sales/orders/books/revenue/admins + charts
//   "customers" → users/carts/payments/locations
//   "storage"   → MongoDB storage metrics
const VIEW_TABS = [
  { id: "all",       label: "All",       icon: LayoutDashboard, color: "from-[#222831] to-[#393E46]"  },
  { id: "business",  label: "Business",  icon: TrendingUp,      color: "from-blue-600 to-cyan-600"    },
  { id: "customers", label: "Customers", icon: UserCircle2,     color: "from-emerald-600 to-teal-600" },
  { id: "storage",   label: "Storage",   icon: ServerCog,       color: "from-slate-600 to-slate-800"  },
];

export default function Dashboard() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState("all");
  // view = active category filter (controls which sections render)
  const [view,    setView]    = useState("all");

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
    } catch (e) {
      t.error("Download failed");
    }
  }

  useEffect(() => { loadStats(); }, [period]);

  if (loading && !data) return (
    <div className="p-10 flex justify-center">
      <Loader2 className="animate-spin text-[#222831]" />
    </div>
  );

  // ── Destructure API response ───────────────────────────────────────────────
  const counts     = data?.counts      || {};
  const analytics  = data?.analytics   || {};
  const financials = data?.financials  || {};
  const storage    = data?.storage     || {};

  // MongoDB Atlas M0 free tier cap = 512 MB → show % used
  const ATLAS_FREE_BYTES = 512 * 1024 * 1024;
  const usedPct = storage.totalSizeBytes
    ? Math.min(100, Math.round((storage.totalSizeBytes / ATLAS_FREE_BYTES) * 100))
    : 0;

  const paymentData = (analytics.paymentModes || []).map(m => ({
    name:  m._id === "full" ? "Prepaid" : "COD",
    value: m.count,
  }));

  // Helper: returns true when current view should render this category's section
  // "all" always returns true; otherwise must match exactly
  const show = (cat) => view === "all" || view === cat;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10 bg-gradient-to-br from-gray-50 to-cyan-50/20 min-h-screen">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#384959] mb-1">Dashboard Overview</h1>
          <p className="text-[#5C756D] text-base">Track your business performance at a glance</p>
        </div>
        {/* Time-period filter — only relevant to order/revenue data */}
        <div className="flex gap-2 bg-white p-1.5 rounded-xl border-2 border-[#E3E8E5] shadow-sm">
          {["today", "week", "month", "all"].map(p => (
            <button
              key={p} onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${
                period === p
                  ? "bg-gradient-to-r from-[#222831] to-[#393E46] text-white shadow-md"
                  : "text-[#5C756D] hover:bg-gray-50"
              }`}
            >
              {p === "all" ? "All Time" : p}
            </button>
          ))}
        </div>
      </div>

      {/* ── CATEGORY FILTER BAR ─────────────────────────────────────────────────
          Lets the admin focus on one category at a time:
          • All       — full dashboard (default)
          • Business  — revenue, orders, books, sales charts
          • Customers — users, carts, payment breakdown, locations
          • Storage   — MongoDB Atlas + Cloudflare R2 infrastructure metrics
          ────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {VIEW_TABS.map(tab => {
          const Icon = tab.icon;
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 shadow-sm ${
                active
                  ? `bg-gradient-to-r ${tab.color} text-white border-transparent shadow-md scale-105`
                  : "bg-white text-[#5C756D] border-[#E3E8E5] hover:border-[#88BDF2] hover:text-[#222831]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
        {/* Active view label pill */}
        {view !== "all" && (
          <span className="ml-auto self-center text-xs text-[#5C756D] bg-white border border-[#E3E8E5] px-3 py-1.5 rounded-full">
            Showing: <b className="text-[#222831] capitalize">{view}</b> data only
          </span>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BUSINESS SECTION
          Covers: Revenue · Orders · Books · Admins · Sales chart · Top books · Low stock
          ══════════════════════════════════════════════════════════════════════ */}
      {show("business") && (
        <>
          {/* Section label when not in "all" view */}
          {view === "business" && <SectionLabel>Business Metrics</SectionLabel>}

          {/* 1. KEY METRICS — 4 wide cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Total revenue earned (filtered by period) */}
            <StatCard
              title="Total Revenue"
              value={`₹${financials.revenue?.toLocaleString() || 0}`}
              icon={TrendingUp}
              gradient="from-blue-500 to-blue-600"
              bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
            />
            {/* Number of orders placed in this period */}
            <StatCard
              title="Total Orders"
              value={counts.orders}
              icon={ShoppingBag}
              gradient="from-blue-500 to-cyan-600"
              bgColor="bg-gradient-to-br from-blue-50 to-cyan-50"
            />
            {/* Total book catalogue size (all-time, not period-filtered) */}
            <StatCard
              title="Total Books"
              value={counts.books}
              icon={BookOpen}
              gradient="from-purple-500 to-pink-600"
              bgColor="bg-gradient-to-br from-purple-50 to-pink-50"
            />
            {/* Active admin / editor accounts */}
            <StatCard
              title="Active Admins"
              value={counts.activeAdmins ?? "—"}
              icon={Shield}
              gradient="from-violet-500 to-indigo-600"
              bgColor="bg-gradient-to-br from-violet-50 to-indigo-50"
              sub="Admin & editor accounts"
            />
          </div>

          {/* 2. SALES CHART + LOW STOCK — 2/3 + 1/3 layout */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">

            {/* Revenue bar chart — daily trend for selected period */}
            <div className="lg:col-span-2 bg-gradient-to-br from-white to-cyan-50/30 p-8 rounded-3xl border border-[#E3E8E5] shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#222831]">Sales Trend</h3>
                <div className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold">
                  Revenue Analytics
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E8E5" vertical={false} />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false}
                      tick={{ fill: "#5C756D", fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fill: "#5C756D", fontSize: 12, fontWeight: 500 }} dx={-10} />
                    <Tooltip
                      cursor={{ fill: "#88BDF2", opacity: 0.1 }}
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #E3E8E5",
                        borderRadius: "12px", color: "#222831", fontSize: "12px",
                        fontWeight: "bold", padding: "8px 12px" }}
                    />
                    <Bar dataKey="revenue" fill="url(#blueGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#88BDF2" stopOpacity={1} />
                        <stop offset="100%" stopColor="#222831" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low stock alerts — books whose stock <= lowStockAlert threshold */}
            <div className="bg-gradient-to-br from-white to-red-50/30 p-7 rounded-3xl border-2 border-red-100 shadow-lg flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-red-700">Low Stock Alerts</h3>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[240px] pr-2 custom-scrollbar">
                {(analytics.lowStock || []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <span className="text-3xl">✓</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">All stock levels are healthy!</p>
                  </div>
                ) : (
                  analytics.lowStock.map((book, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex-1">
                        <p className="font-bold text-[#222831] text-sm font-mono">{book.inventory?.sku || "NO-SKU"}</p>
                        <p className="text-xs text-[#5C756D] truncate max-w-[140px] mt-0.5">{book.title}</p>
                      </div>
                      <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-xs font-bold shadow-sm">
                        {book.inventory?.stock} Left
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 3. BEST SELLING BOOKS TABLE */}
          <div className={`mb-8 ${show("customers") ? "grid lg:grid-cols-2 gap-6" : ""}`}>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-[#E3E8E5] rounded-3xl shadow-lg p-7">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#222831]">Best Selling Books</h3>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  Top {(analytics.topBooks || []).length}
                </div>
              </div>
              <div className="space-y-3">
                {(analytics.topBooks || []).map((book, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gradient-to-r hover:from-white hover:to-cyan-50/50 transition-all duration-200 shadow-sm hover:shadow-md border border-[#E3E8E5]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#222831] to-[#393E46] text-white font-bold rounded-xl text-sm shadow-md">{i + 1}</div>
                      <div>
                        <p className="font-bold text-[#222831] text-sm font-mono">{book.sku || "UNKNOWN"}</p>
                        <p className="text-xs text-[#5C756D] truncate max-w-[200px] mt-0.5">{book.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-[#222831] text-base">₹{book.revenue.toLocaleString()}</span>
                      <span className="text-xs text-[#5C756D] font-medium">{book.sold} sold</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Only show payment+locations here when both business+customers are visible (i.e. "all" view)
                so the grid fills nicely; in business-only view, customers section below handles it */}
            {show("customers") && (
              <CustomerDetailsCard analytics={analytics} paymentData={paymentData} />
            )}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CUSTOMERS SECTION
          Covers: Total users · Active carts · Payment methods · Top locations
          ══════════════════════════════════════════════════════════════════════ */}
      {show("customers") && (
        <>
          {view === "customers" && <SectionLabel>Customer Metrics</SectionLabel>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Total registered customers */}
            <div className="p-6 bg-gradient-to-br from-white to-orange-50 border-2 border-[#E3E8E5] rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-[#5C756D] uppercase tracking-wide">Total Users</p>
                <h3 className="text-3xl font-bold text-[#222831] mt-2">{counts.users}</h3>
                {/* CSV export of all registered customer records */}
                <button onClick={downloadUsers} className="mt-3 text-xs font-bold text-[#222831] flex items-center gap-1.5 hover:gap-2 transition-all duration-200 hover:text-orange-700">
                  <Download className="w-3.5 h-3.5" /> Download CSV
                </button>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl shadow-md">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Customers who currently have at least one item in their cart */}
            <StatCard
              title="Active Carts"
              value={counts.cartsActive ?? "—"}
              icon={ShoppingCart}
              gradient="from-emerald-500 to-teal-600"
              bgColor="bg-gradient-to-br from-emerald-50 to-teal-50"
              sub="Customers with items in cart"
            />
          </div>

          {/* Payment methods + top locations — only render standalone when
              business section is NOT visible (otherwise it renders inside the grid above) */}
          {!show("business") && (
            <div className="mb-8">
              <CustomerDetailsCard analytics={analytics} paymentData={paymentData} />
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STORAGE SECTION — MongoDB Atlas stats
          ══════════════════════════════════════════════════════════════════════ */}
      {show("storage") && (
        <>
          {view === "storage" && <SectionLabel>Storage</SectionLabel>}

          <div className="mb-8 max-w-lg">
            {/* ── MongoDB Atlas Storage Card ─────────────────────────────────
                Shows total DB size, data size, index size, and % of free-tier
                Atlas M0 512 MB cap consumed. Green → amber → red as usage grows.
                ────────────────────────────────────────────────────────────── */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-[#E3E8E5] rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-bold text-[#5C756D] uppercase tracking-wide">MongoDB Storage</p>
                  {/* Total = storageSize (disk) + indexSize */}
                  <h3 className="text-2xl font-bold text-[#222831] mt-1">{fmtBytes(storage.totalSizeBytes)}</h3>
                  <p className="text-xs text-[#5C756D] mt-0.5">
                    {/* dataSize = uncompressed document bytes; indexSize = B-tree index bytes */}
                    Data: {fmtBytes(storage.dataSizeBytes)} · Index: {fmtBytes(storage.indexSizeBytes)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-xl shadow-md">
                  <Database className="w-6 h-6" />
                </div>
              </div>
              {/* Progress bar showing % of 512 MB Atlas M0 free tier used */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-[#5C756D] font-medium mb-1">
                  <span>{usedPct}% used</span>
                  <span>512 MB free tier</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usedPct > 85 ? "bg-red-500" : usedPct > 60 ? "bg-amber-400" : "bg-emerald-500"
                    }`}
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
                <p className="text-xs text-[#5C756D] mt-1.5">
                  {storage.collections} collections · {(storage.objects || 0).toLocaleString()} documents
                </p>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

// ─── Shared section heading ────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-xl font-bold text-[#222831]">{children}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-[#E3E8E5] to-transparent" />
    </div>
  );
}

// ─── Payment methods pie + top locations card ──────────────────────────────────
// Extracted so it can be reused in both "all" and "customers" views without duplication
function CustomerDetailsCard({ analytics, paymentData }) {
  return (
    <div className="bg-gradient-to-br from-white to-purple-50/20 border-2 border-[#E3E8E5] rounded-3xl shadow-lg p-7 flex flex-col gap-6">

      {/* Pie chart breaking down Prepaid vs COD orders */}
      <div>
        <h3 className="text-lg font-bold text-[#222831] mb-4">Payment Methods</h3>
        <div className="flex items-center gap-4 bg-blue-50 px-4 py-3 rounded-2xl border border-blue-200">
          <div className="h-[110px] w-[110px] shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={paymentData} innerRadius={32} outerRadius={50} paddingAngle={3} dataKey="value">
                  {paymentData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-sm">
            {paymentData.map((d, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: COLORS[i] }} />
                <span className="text-[#5C756D] font-medium">{d.name}: <b className="text-[#222831]">{d.value}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 states by revenue — shows where most orders ship to */}
      <div className="border-t-2 border-[#F4F7F5] pt-5">
        <h3 className="text-lg font-bold text-[#222831] mb-4">Top Locations</h3>
        <div className="space-y-3">
          {(analytics.locations || []).slice(0, 3).map((loc, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl border border-[#E3E8E5] hover:shadow-md transition-shadow duration-200">
              <span className="flex items-center gap-2 text-[#222831] font-semibold text-sm">
                <div className="p-1.5 bg-cyan-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-cyan-700" />
                </div>
                {loc._id}
              </span>
              <span className="font-bold text-[#222831] text-base">₹{loc.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Generic stat card ─────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, gradient, bgColor, sub }) {
  return (
    <div className={`p-6 ${bgColor} border-2 border-[#E3E8E5] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex justify-between items-start group`}>
      <div>
        <p className="text-xs font-bold text-[#5C756D] uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold text-[#222831] mt-2 group-hover:scale-105 transition-transform duration-200">{value}</h3>
        {sub && <p className="text-xs text-[#5C756D] mt-1">{sub}</p>}
      </div>
      <div className={`p-3 bg-gradient-to-br ${gradient} text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
