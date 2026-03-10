// src/pages/Admin/ShiprocketPage.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "../../api/client";
import { ShipAPI } from "../../api/shiprocket";
import { BlueDartAPI } from "../../api/bluedart";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";
import {
  Rocket, Printer, RefreshCw, Clock, Search, User, X,
  ChevronLeft, ChevronRight, Phone, Mail, MapPin, Truck,
  AlertCircle, Eye, Navigation, Package, Zap,
} from "lucide-react";

function cx(...arr) { return arr.filter(Boolean).join(" "); }

const PAGE_SIZE = 25;

const STATUS_COLORS = {
  READY_TO_SHIP:   "bg-emerald-100 text-emerald-700",
  AWB_ASSIGNED:    "bg-blue-100 text-blue-700",
  LABEL_GENERATED: "bg-teal-100 text-teal-700",
  SHIPPED:         "bg-violet-100 text-violet-700",
  DELIVERED:       "bg-green-100 text-green-700",
};

// ── Tiny helpers ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const label = (status || "UNKNOWN").replace(/_/g, " ");
  return (
    <span className={cx(
      "inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase",
      STATUS_COLORS[status] || "bg-gray-100 text-[#5C756D]"
    )}>
      {label}
    </span>
  );
}

function Pager({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-5">
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
        className="p-2 rounded-lg border-2 border-[#E3E8E5] bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm">
        <ChevronLeft className="w-4 h-4 text-[#222831]" />
      </button>
      <span className="text-sm text-[#5C756D] min-w-[100px] text-center font-medium">
        Page {page} of {pages}
      </span>
      <button onClick={() => onPage(Math.min(pages, page + 1))} disabled={page === pages}
        className="p-2 rounded-lg border-2 border-[#E3E8E5] bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm">
        <ChevronRight className="w-4 h-4 text-[#222831]" />
      </button>
    </div>
  );
}

// Show SKU if available, else truncated title
function ItemChips({ items }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => {
        const label = item.sku || item.isbn || item.title?.slice(0, 18) || "Item";
        return (
          <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-[#F4F7F5] text-[#5C756D] px-2 py-0.5 rounded-md font-mono font-medium border border-[#E3E8E5]">
            {label}
            <span className="text-[#88BDF2]">×{item.qty}</span>
          </span>
        );
      })}
    </div>
  );
}

function SectionDivider({ icon, title, count, badge, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-bold text-[#222831]">{title}</h2>
        </div>
        <span className={cx("text-xs font-bold px-2.5 py-1 rounded-full", badge)}>
          {count}
        </span>
      </div>
      {action}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function ShiprocketPage() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [loading, setLoading]                   = useState(true);
  const [orders, setOrders]                     = useState([]);
  const [bdPending, setBdPending]               = useState([]);    // orders awaiting BlueDart shipment
  const [defaultProfile, setDefaultProfile]     = useState(null); // BlueDart default profile
  const [actionLoading, setActionLoading]       = useState(false);
  const [bdShipping, setBdShipping]             = useState({});   // per-order loading state
  const [fetchingCouriers, setFetchingCouriers] = useState({});
  const [selections, setSelections]             = useState({});

  // Filter tabs
  const [activeTab, setActiveTab] = useState("all");

  // Search & pagination
  const [search, setSearch]           = useState("");
  const [srPendingPage, setSrPendingPage] = useState(1);
  const [bdPendingPage, setBdPendingPage] = useState(1);
  const [srShippedPage, setSrShippedPage] = useState(1);
  const [bdShippedPage, setBdShippedPage] = useState(1);

  // Modals
  const [customerModal, setCustomerModal] = useState(null);
  const [trackingModal, setTrackingModal] = useState(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [srRes, shippedRes, bdPendRes, profilesRes] = await Promise.allSettled([
        api.get("/orders", { params: { srOnly: "1", limit: 500 }, ...auth }),
        api.get("/orders", { params: { status: "shipped", limit: 500 }, ...auth }),
        BlueDartAPI.getOrdersForShipment(auth),
        BlueDartAPI.listProfiles(auth),
      ]);

      // Merge SR + shipped orders (dedup by _id)
      const srOrders      = srRes.status === "fulfilled" ? (srRes.value.data?.items || srRes.value.data?.orders || []) : [];
      const shippedOrders = shippedRes.status === "fulfilled" ? (shippedRes.value.data?.items || shippedRes.value.data?.orders || []) : [];
      const map = new Map();
      [...srOrders, ...shippedOrders].forEach(o => map.set(String(o._id), o));
      setOrders([...map.values()]);

      // BlueDart pending orders
      if (bdPendRes.status === "fulfilled") {
        const raw = bdPendRes.value.data;
        setBdPending(raw?.orders || raw?.items || (Array.isArray(raw) ? raw : []));
      }

      // BlueDart default profile
      if (profilesRes.status === "fulfilled") {
        const profiles = profilesRes.value.data?.profiles || profilesRes.value.data || [];
        setDefaultProfile(profiles.find(p => p.isDefault) || profiles[0] || null);
      }
    } catch {
      t.error("Failed to load shipping orders");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, []);

  // ── Derived lists ─────────────────────────────────────────────────────────
  const srPendingAll = orders.filter(o =>
    o.shipping?.shiprocket?.shipmentId && !o.shipping?.shiprocket?.awb
  );
  const srShippedAll = orders.filter(o => !!o.shipping?.shiprocket?.awb);
  const bdShippedAll = orders.filter(o => !!o.shipping?.bd?.awbNumber);

  // Pre-select recommended couriers
  useEffect(() => {
    const defaults = {};
    srPendingAll.forEach(o => {
      const rec = o.shipping?.shiprocket?.recommendedCourierId;
      if (rec) defaults[String(o._id)] = rec;
    });
    setSelections(prev => ({ ...defaults, ...prev }));
  }, [orders]); // eslint-disable-line

  // Reset pages when search / tab changes
  useEffect(() => {
    setSrPendingPage(1); setBdPendingPage(1);
    setSrShippedPage(1); setBdShippedPage(1);
  }, [search, activeTab]);

  // ── Search ─────────────────────────────────────────────────────────────────
  function matchesSearch(o) {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(o._id).toLowerCase().includes(q) ||
      (o.shipping?.name    || "").toLowerCase().includes(q) ||
      (o.shipping?.email   || "").toLowerCase().includes(q) ||
      (o.shipping?.phone   || "").includes(q) ||
      (o.shipping?.city    || "").toLowerCase().includes(q) ||
      (o.shipping?.pincode || "").includes(q) ||
      (o.shipping?.shiprocket?.awb || "").toLowerCase().includes(q) ||
      (o.shipping?.bd?.awbNumber   || "").toLowerCase().includes(q) ||
      (o.shipping?.shiprocket?.courierName || "").toLowerCase().includes(q) ||
      (o.items || []).some(i =>
        (i.sku || "").toLowerCase().includes(q) ||
        (i.isbn || "").toLowerCase().includes(q) ||
        (i.title || "").toLowerCase().includes(q)
      )
    );
  }

  const srPending = useMemo(() => srPendingAll.filter(matchesSearch), [srPendingAll, search]); // eslint-disable-line
  const srShipped = useMemo(() => srShippedAll.filter(matchesSearch), [srShippedAll, search]); // eslint-disable-line
  const bdShipped = useMemo(() => bdShippedAll.filter(matchesSearch), [bdShippedAll, search]); // eslint-disable-line
  const bdPendingFiltered = useMemo(() => bdPending.filter(matchesSearch), [bdPending, search]); // eslint-disable-line

  // Pagination
  const srPendingPages = Math.max(1, Math.ceil(srPending.length / PAGE_SIZE));
  const bdPendingPages = Math.max(1, Math.ceil(bdPendingFiltered.length / PAGE_SIZE));
  const srShippedPages = Math.max(1, Math.ceil(srShipped.length / PAGE_SIZE));
  const bdShippedPages = Math.max(1, Math.ceil(bdShipped.length / PAGE_SIZE));

  const pagedSrPending = srPending.slice((srPendingPage - 1) * PAGE_SIZE, srPendingPage * PAGE_SIZE);
  const pagedBdPending = bdPendingFiltered.slice((bdPendingPage - 1) * PAGE_SIZE, bdPendingPage * PAGE_SIZE);
  const pagedSrShipped = srShipped.slice((srShippedPage - 1) * PAGE_SIZE, srShippedPage * PAGE_SIZE);
  const pagedBdShipped = bdShipped.slice((bdShippedPage - 1) * PAGE_SIZE, bdShippedPage * PAGE_SIZE);

  // ── Tab visibility ─────────────────────────────────────────────────────────
  const showSrPending  = activeTab === "all" || activeTab === "sr-pending";
  const showBdPending  = activeTab === "all" || activeTab === "bd-pending";
  const showSrShipped  = activeTab === "all" || activeTab === "sr-shipped";
  const showBdShipped  = activeTab === "all" || activeTab === "bd-shipped";

  // ── Shiprocket actions ─────────────────────────────────────────────────────
  async function confirmCouriers(orderIds) {
    const sel = orderIds
      .filter(id => selections[id])
      .map(id => ({ orderId: id, courierId: Number(selections[id]) }));
    if (!sel.length) { t.warn("Please select a courier first"); return; }
    setActionLoading(true);
    try {
      const { data } = await ShipAPI.assignCourier(sel, auth);
      if (data.ok) {
        const { success = [], failed = [] } = data.data;
        if (success.length) t.success(`${success.length} shipment(s) dispatched!`);
        failed.forEach(f => t.error(`Order ${String(f.id).slice(-6)}: ${f.error}`));
        await load();
      } else {
        t.error(data.error || "Assignment failed");
      }
    } catch (e) {
      t.error(e.response?.data?.error || "Assignment failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePrintLabel(order) {
    const labelUrl = order.shipping?.shiprocket?.labelUrl;
    if (labelUrl) { window.open(labelUrl, "_blank"); return; }
    t.info("Fetching label…");
    try {
      const { data } = await ShipAPI.label([order._id], auth);
      if (data.ok && data.data?.label_url) {
        window.open(data.data.label_url, "_blank");
      } else {
        t.error(data.error || "Label not available yet");
      }
    } catch (e) {
      t.error(e.response?.data?.error || "Failed to fetch label");
    }
  }

  async function fetchCouriersForOrder(orderId) {
    setFetchingCouriers(prev => ({ ...prev, [orderId]: true }));
    try {
      const { data } = await ShipAPI.fetchCouriers(orderId, auth);
      if (data.ok) {
        setOrders(prev => prev.map(o => {
          if (String(o._id) !== String(orderId)) return o;
          return {
            ...o,
            shipping: {
              ...o.shipping,
              shiprocket: {
                ...o.shipping?.shiprocket,
                availableCouriers: data.couriers,
                recommendedCourierId: data.recommendedCourierId,
              },
            },
          };
        }));
        if (data.recommendedCourierId) {
          setSelections(prev => ({ ...prev, [orderId]: data.recommendedCourierId }));
        }
        t.success("Courier options loaded");
      } else {
        t.error(data.error || "Could not fetch couriers");
      }
    } catch (e) {
      t.error(e.response?.data?.error || "Failed to fetch couriers");
    } finally {
      setFetchingCouriers(prev => ({ ...prev, [orderId]: false }));
    }
  }

  function handleTrack(order) {
    const awb = order.shipping?.shiprocket?.awb;
    if (!awb) return;
    window.open(`https://shiprocket.co/tracking/${awb}`, "_blank", "noopener,noreferrer");
  }

  // ── BlueDart one-click ship ────────────────────────────────────────────────
  async function handleBlueDartShip(orderId) {
    if (!defaultProfile?._id) {
      t.error("No BlueDart profile configured. Please set up a BlueDart profile first.");
      return;
    }
    setBdShipping(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await BlueDartAPI.createShipment(orderId, defaultProfile._id, auth);
      const data = res?.data;
      if (data?.ok) {
        t.success(`Shipment created! AWB: ${data.data?.awbNumber || "assigned"}`);
        await load();
      } else {
        t.error(data?.error || "BlueDart shipment failed");
      }
    } catch (e) {
      t.error(e.message || "BlueDart shipment failed");
    } finally {
      setBdShipping(prev => ({ ...prev, [orderId]: false }));
    }
  }

  async function handleBlueDartShipAll() {
    if (!defaultProfile?._id) {
      t.error("No BlueDart profile configured.");
      return;
    }
    const ids = bdPendingFiltered.map(o => String(o._id));
    if (!ids.length) return;
    setActionLoading(true);
    try {
      const res = await BlueDartAPI.createShipments(ids, defaultProfile._id, {}, auth);
      const data = res?.data;
      if (data?.ok) {
        const { success = [], failed = [] } = data.data || {};
        if (success.length) t.success(`${success.length} BlueDart shipment(s) created!`);
        failed.forEach(f => t.error(`Order ${String(f.orderId).slice(-6)}: ${f.error}`));
        await load();
      } else {
        t.error(data?.error || "Bulk BlueDart failed");
      }
    } catch (e) {
      t.error(e.message || "Bulk BlueDart failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBlueDartTrack(order) {
    const awb = order.shipping?.bd?.awbNumber;
    if (!awb) return;
    t.info("Fetching tracking…");
    try {
      const res = await BlueDartAPI.trackAwb(awb, auth);
      const data = res?.data;
      if (data?.ok || data?.tracking) {
        setTrackingModal({ order, data: data?.tracking || data?.data || data, carrier: "bluedart" });
      } else {
        t.error(data?.error || "Failed to fetch tracking");
      }
    } catch (e) {
      t.error(e.message || "Failed to fetch tracking");
    }
  }

  async function handleBlueDartLabel(order) {
    const stored = order.shipping?.bd?.labelUrl;
    if (stored) { window.open(stored, "_blank"); return; }
    t.info("Generating label…");
    try {
      const res = await BlueDartAPI.generateLabelOnDemand(order._id, auth);
      const data = res?.data;
      if (data?.pdf || data?.url || data?.labelUrl) {
        const url = data.url || data.labelUrl;
        if (url) { window.open(url, "_blank"); return; }
        // base64 PDF
        if (data.pdf) {
          const blob = new Blob([Uint8Array.from(atob(data.pdf), c => c.charCodeAt(0))], { type: "application/pdf" });
          window.open(URL.createObjectURL(blob), "_blank");
        }
      } else {
        t.error(data?.error || "Label not available");
      }
    } catch (e) {
      t.error(e.message || "Failed to generate label");
    }
  }

  function openCustomer(e, order) {
    e.stopPropagation();
    setCustomerModal(order);
  }

  // ── Tab config ─────────────────────────────────────────────────────────────
  const TABS = [
    { id: "all",        label: "All",              count: srPendingAll.length + bdPending.length + srShippedAll.length + bdShippedAll.length },
    { id: "sr-pending", label: "Awaiting Courier",  count: srPendingAll.length, dot: "bg-orange-400" },
    { id: "bd-pending", label: "Awaiting BlueDart", count: bdPending.length,    dot: "bg-blue-500" },
    { id: "sr-shipped", label: "Shiprocket Shipped",count: srShippedAll.length, dot: "bg-purple-500" },
    { id: "bd-shipped", label: "BlueDart Shipped",  count: bdShippedAll.length, dot: "bg-teal-500" },
  ];

  const totalShipping = srPendingAll.length + bdPending.length + srShippedAll.length + bdShippedAll.length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50/20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap gap-3 items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#222831] to-[#393E46] flex items-center justify-center shadow-md">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-[#384959]">Shipping</h1>
              <p className="text-xs text-[#5C756D] mt-0.5">
                {srPendingAll.length} awaiting courier · {bdPending.length} awaiting BD · {srShippedAll.length + bdShippedAll.length} shipped
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C756D] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Name, SKU, AWB, city…"
                className="pl-9 pr-8 py-2 border-2 border-[#E3E8E5] rounded-xl text-sm w-56 sm:w-64 bg-white focus:outline-none focus:ring-2 focus:ring-[#88BDF2] focus:border-transparent shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5C756D] hover:text-[#222831]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button onClick={load} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 border-2 border-[#E3E8E5] rounded-xl text-sm text-[#222831] bg-white hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-all duration-200">
              <RefreshCw className={cx("w-4 h-4", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        {!loading && totalShipping > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatCard value={srPendingAll.length} label="Awaiting Courier" color="orange" />
            <StatCard value={bdPending.length}    label="Awaiting BlueDart" color="blue" />
            <StatCard value={srShippedAll.length} label="Shiprocket Shipped" color="purple" />
            <StatCard value={bdShippedAll.length} label="BlueDart Shipped" color="teal" />
          </div>
        )}

        {/* ── Filter tabs ── */}
        {!loading && totalShipping > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-6 bg-white border-2 border-[#E3E8E5] rounded-xl p-1.5 shadow-md">
            {TABS.map(tab => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#222831] to-[#393E46] text-white shadow-md"
                    : "text-[#5C756D] hover:bg-gray-50"
                )}
              >
                {tab.dot && <span className={cx("w-2 h-2 rounded-full", tab.dot)} />}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                <span className={cx(
                  "text-xs px-1.5 py-0.5 rounded-md font-bold",
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#F4F7F5] text-[#5C756D]"
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#E3E8E5] border-t-[#222831]" />
            <p className="text-sm text-[#5C756D]">Loading shipping orders…</p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && totalShipping === 0 && (
          <div className="bg-white rounded-3xl border-2 border-[#E3E8E5] p-16 text-center shadow-lg">
            <Rocket className="w-12 h-12 text-[#E3E8E5] mx-auto mb-3" />
            <p className="text-[#222831] font-semibold">No shipping orders yet</p>
            <p className="text-sm text-[#5C756D] mt-1">Create shipments from the Orders page first</p>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            SECTION 1 — SHIPROCKET: AWAITING COURIER SELECTION
        ════════════════════════════════════════════════════ */}
        {!loading && showSrPending && srPending.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-3xl overflow-hidden shadow-lg">
              {/* Section top bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-orange-200 bg-orange-100/50">
                <SectionDivider
                  icon={<Clock className="w-4 h-4 text-orange-600" />}
                  title="Awaiting Courier Selection"
                  count={srPending.length}
                  badge="bg-orange-200 text-orange-800"
                  action={
                    <button
                      onClick={() => confirmCouriers(srPending.map(o => String(o._id)))}
                      disabled={actionLoading || srPending.some(o => !selections[String(o._id)])}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-md"
                    >
                      {actionLoading
                        ? <RefreshCw className="w-4 h-4 animate-spin" />
                        : <Rocket className="w-4 h-4" />}
                      Confirm All
                    </button>
                  }
                />
              </div>

              <div className="p-4 space-y-4">
                {pagedSrPending.map(o => {
                  const id       = String(o._id);
                  const sr       = o.shipping?.shiprocket || {};
                  const couriers = sr.availableCouriers || [];
                  const dt       = o.createdAt ? new Date(o.createdAt) : null;

                  return (
                    <div key={id} className="bg-white rounded-2xl border-2 border-[#E3E8E5] p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-xs font-mono text-[#5C756D]">#{id.slice(-8)}</span>
                            {dt && <span className="text-xs text-[#5C756D]">{dt.toLocaleDateString('en-IN')}</span>}
                            <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full uppercase tracking-wide">
                              Pick Courier
                            </span>
                          </div>
                          <p className="font-bold text-[#222831]">{o.shipping?.name || "Customer"}</p>
                          <p className="text-xs text-[#5C756D] mt-0.5">
                            {[o.shipping?.city, o.shipping?.state, o.shipping?.pincode].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold text-[#222831]">
                            ₹{Number(o.amount || 0).toFixed(0)}
                          </p>
                          <p className="text-xs text-[#5C756D] capitalize">{o.payment?.status || ""}</p>
                          <button onClick={e => openCustomer(e, o)}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-[#384959] hover:text-[#222831] font-medium">
                            <Eye className="w-3 h-3" />Info
                          </button>
                        </div>
                      </div>

                      {/* Items with SKU */}
                      <div className="mb-4">
                        <ItemChips items={o.items} />
                      </div>

                      {/* Courier picker */}
                      {couriers.length === 0 ? (
                        <div className="flex items-center gap-3 p-3 border-2 border-dashed border-[#E3E8E5] rounded-xl bg-[#F4F7F5]">
                          <p className="text-sm text-[#5C756D] flex-1">Courier options not loaded yet.</p>
                          <button
                            onClick={() => fetchCouriersForOrder(id)}
                            disabled={fetchingCouriers[id]}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#384959] border-2 border-[#E3E8E5] rounded-lg hover:bg-white disabled:opacity-50 whitespace-nowrap transition-colors"
                          >
                            <RefreshCw className={cx("w-3 h-3", fetchingCouriers[id] && "animate-spin")} />
                            {fetchingCouriers[id] ? "Loading…" : "Load Couriers"}
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                          {couriers.map(c => {
                            const selected = String(selections[id]) === String(c.courier_company_id);
                            return (
                              <label key={c.courier_company_id} className={cx(
                                "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                selected
                                  ? "border-orange-500 bg-orange-50 shadow-md"
                                  : "border-[#E3E8E5] hover:border-[#88BDF2] bg-white hover:shadow-sm"
                              )}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <input type="radio" name={`courier-${id}`}
                                    value={c.courier_company_id}
                                    checked={selected}
                                    onChange={() => setSelections(prev => ({ ...prev, [id]: c.courier_company_id }))}
                                    className="accent-orange-600 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#222831] leading-tight truncate">
                                      {c.courier_name}
                                    </p>
                                    <p className="text-[11px] text-[#5C756D] truncate">{c.etd}</p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                  <p className="text-sm font-bold text-[#222831]">₹{c.rate}</p>
                                  {c.is_recommended && (
                                    <span className="block text-[10px] text-orange-600 font-bold">★ Best</span>
                                  )}
                                  {c.cod === 1 && (
                                    <span className="block text-[10px] text-green-600 font-semibold">COD</span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => confirmCouriers([id])}
                          disabled={actionLoading || !selections[id]}
                          className="px-5 py-2 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-md"
                        >
                          {actionLoading ? "Processing…" : "Confirm & Dispatch"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <Pager page={srPendingPage} pages={srPendingPages} onPage={setSrPendingPage} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            SECTION 2 — BLUEDART: AWAITING SHIPMENT (ONE-CLICK)
        ════════════════════════════════════════════════════ */}
        {!loading && showBdPending && bdPendingFiltered.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50/40 border-2 border-blue-200 rounded-3xl overflow-hidden shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-blue-200 bg-blue-100/50">
                <SectionDivider
                  icon={<Truck className="w-4 h-4 text-blue-600" />}
                  title="Ready to Ship via BlueDart"
                  count={bdPendingFiltered.length}
                  badge="bg-blue-200 text-blue-800"
                  action={
                    <div className="flex items-center gap-2">
                      {!defaultProfile && (
                        <span className="text-xs text-red-500 font-medium">⚠ No BD profile set</span>
                      )}
                      <button
                        onClick={handleBlueDartShipAll}
                        disabled={actionLoading || !defaultProfile}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                      >
                        {actionLoading
                          ? <RefreshCw className="w-4 h-4 animate-spin" />
                          : <Zap className="w-4 h-4" />}
                        Ship All
                      </button>
                    </div>
                  }
                />
              </div>

              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pagedBdPending.map(o => {
                  const id = String(o._id);
                  const dt = o.createdAt ? new Date(o.createdAt) : null;
                  const isShipping = bdShipping[id];

                  return (
                    <div key={id} className="bg-white rounded-2xl border-2 border-[#E3E8E5] p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-xs font-mono text-[#5C756D]">#{id.slice(-8)}</span>
                            {dt && <span className="text-xs text-[#5C756D]">{dt.toLocaleDateString('en-IN')}</span>}
                          </div>
                          <p className="font-bold text-[#222831]">{o.shipping?.name || "Customer"}</p>
                          <p className="text-xs text-[#5C756D] mt-0.5">
                            {[o.shipping?.city, o.shipping?.state, o.shipping?.pincode].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold text-[#222831]">₹{Number(o.amount || 0).toFixed(0)}</p>
                          <button onClick={e => openCustomer(e, o)}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-[#384959] hover:text-[#222831] font-medium">
                            <Eye className="w-3 h-3" />Info
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <ItemChips items={o.items} />
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#E3E8E5]">
                        <div className="text-xs text-[#5C756D]">
                          {defaultProfile
                            ? <span>Profile: <span className="font-medium text-[#222831]">{defaultProfile.name || defaultProfile.clientId || "Default"}</span></span>
                            : <span className="text-red-400">No profile configured</span>
                          }
                        </div>
                        <button
                          onClick={() => handleBlueDartShip(id)}
                          disabled={isShipping || !defaultProfile}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                        >
                          {isShipping
                            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Shipping…</>
                            : <><Zap className="w-3.5 h-3.5" />Ship Now</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <Pager page={bdPendingPage} pages={bdPendingPages} onPage={setBdPendingPage} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            SECTION 3 — SHIPROCKET: SHIPPED
        ════════════════════════════════════════════════════ */}
        {!loading && showSrShipped && srShipped.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/40 border-2 border-purple-200 rounded-3xl overflow-hidden shadow-lg">
              <div className="px-5 py-4 border-b border-purple-200 bg-purple-100/50">
                <SectionDivider
                  icon={<Rocket className="w-4 h-4 text-purple-600" />}
                  title="Shipped via Shiprocket"
                  count={srShipped.length}
                  badge="bg-purple-200 text-purple-800"
                />
              </div>
              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                {pagedSrShipped.map(o => (
                  <ShippedCard
                    key={String(o._id)}
                    order={o}
                    awb={o.shipping?.shiprocket?.awb}
                    courier={o.shipping?.shiprocket?.courierName}
                    rate={o.shipping?.shiprocket?.courierRate}
                    etd={o.shipping?.shiprocket?.courierETD}
                    status={o.shipping?.shiprocket?.status || o.status}
                    pickup={o.shipping?.shiprocket?.pickupScheduledAt}
                    onCustomer={openCustomer}
                    onLabel={handlePrintLabel}
                    onTrack={handleTrack}
                    showTrack
                    accentClass="border-[#E3E8E5]"
                    trackBtnClass="text-purple-600 border-purple-200 hover:bg-purple-50"
                  />
                ))}
              </div>
            </div>
            <Pager page={srShippedPage} pages={srShippedPages} onPage={setSrShippedPage} />
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            SECTION 4 — BLUEDART: SHIPPED
        ════════════════════════════════════════════════════ */}
        {!loading && showBdShipped && bdShipped.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50/40 border-2 border-teal-200 rounded-3xl overflow-hidden shadow-lg">
              <div className="px-5 py-4 border-b border-teal-200 bg-teal-100/50">
                <SectionDivider
                  icon={<Truck className="w-4 h-4 text-teal-600" />}
                  title="Shipped via BlueDart"
                  count={bdShipped.length}
                  badge="bg-teal-200 text-teal-800"
                />
              </div>
              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                {pagedBdShipped.map(o => (
                  <ShippedCard
                    key={String(o._id)}
                    order={o}
                    awb={o.shipping?.bd?.awbNumber}
                    courier="BlueDart"
                    rate={null}
                    etd={o.shipping?.bd?.etd || o.shipping?.bd?.expectedDelivery}
                    status={o.shipping?.bd?.status || o.status}
                    pickup={o.shipping?.bd?.pickupDate}
                    onCustomer={openCustomer}
                    onLabel={handleBlueDartLabel}
                    onTrack={handleBlueDartTrack}
                    showTrack
                    accentClass="border-[#E3E8E5]"
                    trackBtnClass="text-teal-600 border-teal-200 hover:bg-teal-50"
                  />
                ))}
              </div>
            </div>
            <Pager page={bdShippedPage} pages={bdShippedPages} onPage={setBdShippedPage} />
          </div>
        )}

        {/* No search results */}
        {!loading && search && totalShipping > 0 &&
          srPending.length === 0 && bdPendingFiltered.length === 0 &&
          srShipped.length === 0 && bdShipped.length === 0 && (
          <div className="bg-white rounded-3xl border-2 border-[#E3E8E5] p-12 text-center shadow-lg">
            <Search className="w-10 h-10 text-[#E3E8E5] mx-auto mb-3" />
            <p className="text-[#222831] font-semibold">No results for "{search}"</p>
            <p className="text-sm text-[#5C756D] mt-1">Try a different name, SKU, AWB, or order number</p>
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════
          CUSTOMER INFO MODAL
      ══════════════════════════════════════════════════════ */}
      {customerModal && (() => {
        const o = customerModal;
        const payMethodLabels = { cash: "Cash", upi: "UPI", card: "Card / POS", bank_transfer: "Bank Transfer", cheque: "Cheque", cod: "Cash on Delivery", other: "Other" };
        const subtotal = (o.items || []).reduce((s, i) => s + (i.unitPrice || 0) * (i.qty || 0), 0);
        const due = Math.max(0, (o.amount || 0) - (o.payment?.paidAmount || 0));
        return (
          <Modal onClose={() => setCustomerModal(null)} maxW="max-w-2xl">
            {/* Header — children[0] */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#E3E8E5]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#222831] to-[#393E46] flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <h3 className="font-bold text-[#222831]">Order #{String(o._id).slice(-8).toUpperCase()}</h3>
                {o.source === 'offline' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Offline</span>
                )}
                <span className="text-xs text-[#5C756D] ml-1">
                  {o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : ''}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[70vh]">

              {/* Customer */}
              <div>
                <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-2">Customer</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-cyan-50/20 rounded-xl border border-[#E3E8E5]">
                    <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-0.5">Name</p>
                    <p className="text-sm font-medium text-[#222831]">{o.shipping?.name || o.userId?.name || '—'}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-cyan-50/20 rounded-xl border border-[#E3E8E5]">
                    <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-0.5">Email</p>
                    <p className="text-sm font-medium text-[#222831] break-all">{o.email || o.shipping?.email || o.userId?.email || '—'}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-cyan-50/20 rounded-xl border border-[#E3E8E5]">
                    <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-0.5">Phone</p>
                    <p className="text-sm font-medium text-[#222831]">{o.phone || o.shipping?.phone || o.userId?.phone || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-2">Items</p>
                <div className="rounded-xl border border-[#E3E8E5] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F4F7F5]">
                      <tr>
                        <th className="px-3 py-2 text-left text-[10px] font-bold text-[#5C756D] uppercase">Title</th>
                        <th className="px-3 py-2 text-center text-[10px] font-bold text-[#5C756D] uppercase w-14">Qty</th>
                        <th className="px-3 py-2 text-right text-[10px] font-bold text-[#5C756D] uppercase w-24">Price</th>
                        <th className="px-3 py-2 text-right text-[10px] font-bold text-[#5C756D] uppercase w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E8E5]">
                      {(o.items || []).map((item, i) => (
                        <tr key={i} className="bg-white">
                          <td className="px-3 py-2 text-[#222831]">{item.title || item.bookId?.title || '—'}</td>
                          <td className="px-3 py-2 text-center text-[#5C756D]">{item.qty}</td>
                          <td className="px-3 py-2 text-right text-[#5C756D]">₹{(item.unitPrice || 0).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-semibold text-[#222831]">₹{((item.unitPrice || 0) * (item.qty || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-[#F4F7F5] px-3 py-2.5 flex flex-col items-end gap-0.5 text-xs text-[#5C756D] border-t border-[#E3E8E5]">
                    <span>Subtotal: ₹{subtotal.toFixed(2)}</span>
                    {(o.shippingAmount > 0) && <span>Shipping: ₹{Number(o.shippingAmount).toFixed(2)}</span>}
                    {(o.serviceFee > 0) && <span>Service Fee: ₹{Number(o.serviceFee).toFixed(2)}</span>}
                    {(o.taxAmount > 0) && <span>Tax: ₹{Number(o.taxAmount).toFixed(2)}</span>}
                    <span className="text-base font-bold text-[#222831] mt-1">Grand Total: ₹{Number(o.amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-2">Shipping Address</p>
                <div className="p-3 bg-gradient-to-br from-gray-50 to-cyan-50/20 rounded-xl border border-[#E3E8E5] text-sm text-[#222831]">
                  {[o.shipping?.address, o.shipping?.city, o.shipping?.state, o.shipping?.pincode, o.shipping?.country]
                    .filter(Boolean).join(', ') || '—'}
                </div>
              </div>

              {/* Payment */}
              <div>
                <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-2">Payment</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-cyan-50/20 rounded-xl border border-[#E3E8E5]">
                    <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-0.5">Method</p>
                    <p className="text-sm font-medium text-[#222831]">
                      {o.source === 'offline'
                        ? (payMethodLabels[o.offlinePaymentMethod] || o.offlinePaymentMethod || 'Offline')
                        : (o.payment?.provider || 'Razorpay')}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-cyan-50/20 rounded-xl border border-[#E3E8E5]">
                    <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-0.5">Status</p>
                    <p className="text-sm font-medium text-[#222831] capitalize">{o.payment?.status || '—'}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-cyan-50/20 rounded-xl border border-[#E3E8E5]">
                    <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-0.5">Paid</p>
                    <p className="text-sm font-semibold text-emerald-700">₹{(o.payment?.paidAmount || 0).toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-cyan-50/20 rounded-xl border border-[#E3E8E5]">
                    <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-0.5">Due</p>
                    <p className={`text-sm font-semibold ${due > 0 ? 'text-red-600' : 'text-[#5C756D]'}`}>₹{due.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {o.adminNotes && (
                <div>
                  <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-2">Admin Notes</p>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 whitespace-pre-wrap">
                    {o.adminNotes}
                  </div>
                </div>
              )}

            </div>
          </Modal>
        );
      })()}

      {/* ══════════════════════════════════════════════════════
          TRACKING MODAL
      ══════════════════════════════════════════════════════ */}
      {trackingModal && (
        <Modal onClose={() => setTrackingModal(null)} maxW="max-w-lg">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#E3E8E5] shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#222831] to-[#393E46] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[#222831]">Shipment Tracking</h3>
              <p className="text-xs text-[#5C756D] font-mono">
                {trackingModal.order.shipping?.shiprocket?.awb ||
                 trackingModal.order.shipping?.bd?.awbNumber}
              </p>
            </div>
          </div>

          <div className="overflow-y-auto px-5 py-4 space-y-4">
            {trackingModal.data?.tracking_data || trackingModal.data ? (
              <>
                {/* Status banner */}
                <div className="flex items-center justify-between bg-gradient-to-br from-blue-50 to-cyan-50/40 border border-[#E3E8E5] rounded-xl p-4">
                  <div>
                    <p className="text-[10px] text-[#5C756D] font-bold uppercase mb-0.5">Current Status</p>
                    <p className="font-bold text-[#222831]">
                      {trackingModal.data?.tracking_data?.shipment_status_current ||
                       trackingModal.data?.status || "In Transit"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#5C756D]">
                      {trackingModal.order.shipping?.shiprocket?.courierName || "BlueDart"}
                    </p>
                    {(trackingModal.data?.tracking_data?.etd || trackingModal.data?.etd) && (
                      <p className="text-xs text-[#5C756D] mt-0.5">
                        ETA: {trackingModal.data?.tracking_data?.etd || trackingModal.data?.etd}
                      </p>
                    )}
                  </div>
                </div>

                {/* Destination */}
                <div className="flex items-center gap-2 text-sm text-[#5C756D]">
                  <MapPin className="w-4 h-4 text-[#5C756D] shrink-0" />
                  <span>
                    {trackingModal.order.shipping?.name} · {trackingModal.order.shipping?.city}, {trackingModal.order.shipping?.pincode}
                  </span>
                </div>

                {/* Activity timeline */}
                {(() => {
                  const activities =
                    trackingModal.data?.tracking_data?.shipment_track_activities ||
                    trackingModal.data?.activities ||
                    trackingModal.data?.Shipment?.Scans || [];
                  return activities.length > 0 ? (
                    <div>
                      <p className="text-[10px] font-bold text-[#5C756D] uppercase tracking-wide mb-3">Activity Log</p>
                      {activities.map((act, i, arr) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center w-5 shrink-0">
                            <div className={cx(
                              "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 z-10",
                              i === 0 ? "bg-[#384959] ring-2 ring-[#88BDF2]" : "bg-[#E3E8E5]"
                            )} />
                            {i < arr.length - 1 && <div className="w-px flex-1 bg-[#E3E8E5] my-1" />}
                          </div>
                          <div className={cx("pb-3 flex-1", i === arr.length - 1 && "pb-0")}>
                            <p className={cx("text-sm font-semibold", i === 0 ? "text-[#384959]" : "text-[#222831]")}>
                              {act["sr-status"] || act.activity || act.ScanDetail?.Scan || act.status || "Update"}
                            </p>
                            {(act.location || act.ScanDetail?.ScannedLocation) && (
                              <p className="text-xs text-[#5C756D] mt-0.5">
                                📍 {act.location || act.ScanDetail?.ScannedLocation}
                              </p>
                            )}
                            {(act.date || act.ScanDetail?.ScanDateTime) && (
                              <p className="text-xs text-[#5C756D] mt-0.5">
                                {act.date || act.ScanDetail?.ScanDateTime}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#5C756D] text-center py-4">No activity events yet</p>
                  );
                })()}
              </>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-[#E3E8E5] mx-auto mb-3" />
                <p className="text-[#222831] font-semibold">No tracking data available</p>
                <p className="text-sm text-[#5C756D] mt-1">The shipment may not have been picked up yet</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ value, label, color }) {
  const styles = {
    orange: { card: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200", text: "text-orange-700", num: "text-orange-800" },
    blue:   { card: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200",        text: "text-blue-700",   num: "text-blue-800"   },
    purple: { card: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200", text: "text-purple-700", num: "text-purple-800" },
    teal:   { card: "bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200",        text: "text-teal-700",   num: "text-teal-800"   },
  };
  const s = styles[color] || styles.blue;
  return (
    <div className={cx("rounded-2xl border-2 p-4 text-center shadow-lg hover:shadow-xl transition-shadow duration-300", s.card)}>
      <p className={cx("text-2xl font-black", s.num)}>{value}</p>
      <p className={cx("text-xs font-medium mt-0.5 opacity-80", s.text)}>{label}</p>
    </div>
  );
}

function Modal({ children, onClose, maxW = "max-w-md" }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onMouseDown={onClose}>
      <div
        className={cx("bg-gradient-to-br from-white to-cyan-50/20 rounded-3xl shadow-2xl border-2 border-[#E3E8E5] w-full max-h-[90vh] flex flex-col", maxW)}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between shrink-0 pr-4">
          <div className="flex-1">{children[0]}</div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F4F7F5] rounded-lg shrink-0 transition-colors">
            <X className="w-4 h-4 text-[#5C756D]" />
          </button>
        </div>
        {children.slice(1)}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-gray-50 to-cyan-50/20 rounded-xl border border-[#E3E8E5]">
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] text-[#5C756D] uppercase font-bold mb-0.5">{label}</p>
        <div className="text-[#222831] font-medium text-sm">{children}</div>
      </div>
    </div>
  );
}

function ShippedCard({
  order, awb, courier, rate, etd, status, pickup,
  onCustomer, onLabel, onTrack, showTrack,
  accentClass, trackBtnClass,
}) {
  const id = String(order._id);
  const dt = order.createdAt ? new Date(order.createdAt) : null;

  return (
    <div className={cx("bg-white rounded-2xl border-2 p-4 shadow-lg hover:shadow-xl transition-shadow duration-300", accentClass || "border-[#E3E8E5]")}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-xs font-mono text-[#5C756D]">#{id.slice(-8)}</span>
            {dt && <span className="text-xs text-[#5C756D]">{dt.toLocaleDateString('en-IN')}</span>}
            <StatusBadge status={status} />
          </div>
          <p className="font-bold text-[#222831] text-sm">{order.shipping?.name || "—"}</p>
          <p className="text-xs text-[#5C756D]">{[order.shipping?.city, order.shipping?.pincode].filter(Boolean).join(", ")}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-[#222831]">₹{Number(order.amount || 0).toFixed(0)}</p>
          {rate && <p className="text-xs text-[#5C756D]">Ship ₹{rate}</p>}
          <button onClick={e => onCustomer(e, order)}
            className="mt-1 inline-flex items-center gap-1 text-xs text-[#5C756D] hover:text-[#222831] font-medium transition-colors">
            <Eye className="w-3 h-3" />Info
          </button>
        </div>
      </div>

      {/* Items SKU chips */}
      <div className="mb-3">
        <ItemChips items={order.items} />
      </div>

      {/* Courier + AWB row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5C756D] mb-3 py-2 border-t border-[#E3E8E5]">
        {courier && (
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-[#88BDF2]" />
            <span className="font-medium text-[#222831]">{courier}</span>
          </span>
        )}
        {awb && (
          <span className="flex items-center gap-1 font-mono bg-[#F4F7F5] border border-[#E3E8E5] px-2 py-0.5 rounded">
            <Package className="w-3 h-3 text-[#5C756D]" />
            {awb}
          </span>
        )}
        {etd && <span className="text-[#5C756D]">ETA: {etd}</span>}
        {pickup && <span className="text-[#5C756D]">Pickup: {new Date(pickup).toLocaleDateString('en-IN')}</span>}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {onLabel && (
          <button onClick={() => onLabel(order)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#222831] border-2 border-[#E3E8E5] rounded-lg hover:bg-[#F4F7F5] transition-colors">
            <Printer className="w-3.5 h-3.5" />Label
          </button>
        )}
        {showTrack && onTrack && (
          <button onClick={() => onTrack(order)}
            className={cx("flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-2 rounded-lg transition-colors", trackBtnClass || "text-[#384959] border-[#E3E8E5] hover:bg-[#F4F7F5]")}>
            <Navigation className="w-3.5 h-3.5" />Track
          </button>
        )}
      </div>
    </div>
  );
}
