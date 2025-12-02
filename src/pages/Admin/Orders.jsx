import { useEffect, useMemo, useState } from "react";
import { api, BASE_URL } from "../../api/client";
import { BlueDartAPI } from "../../api/bluedart";
import { useAuth } from "../../contexts/Auth";
import AdminTabs from "../../components/AdminTabs";
import { t } from "../../lib/toast";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

export default function AdminOrders() {
  const { token } = useAuth();
  const auth = {
    headers: {
      Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}`
    }
  };

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(() => new Set());
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Date Filters
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  
  const hasSelection = selected.size > 0;
  
  // Shipment Modal State
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({
    weight: 0.5,
    pieces: 1,
    length: 20,  // cm
    breadth: 15, // cm
    height: 5    // cm
  });

  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "today": {
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        return { startDate: today.toISOString(), endDate: endOfDay.toISOString() };
      }
      case "yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
        return { startDate: yesterday.toISOString(), endDate: endOfYesterday.toISOString() };
      }
      case "tomorrow": {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setHours(23, 59, 59, 999);
        return { startDate: tomorrow.toISOString(), endDate: endOfTomorrow.toISOString() };
      }
      case "custom": {
        if (!customDate) return null;
        const selectedDate = new Date(customDate);
        selectedDate.setHours(0, 0, 0, 0);
        const endOfSelected = new Date(selectedDate);
        endOfSelected.setHours(23, 59, 59, 999);
        return { startDate: selectedDate.toISOString(), endDate: endOfSelected.toISOString() };
      }
      default: return null;
    }
  };

  // ------------------------------------------------------------------
  // ✅ 1. CREATE SHIPMENT LOGIC (AWB + Label)
  // ------------------------------------------------------------------
  function openShipmentModal() {
    const ids = ensureSome();
    if (!ids) return;

    // Check if any selected order already has an AWB
    const selectedOrders = items.filter(o => ids.includes(String(o._id)));
    const alreadyHasAwb = selectedOrders.some(o => o.shipping?.bd?.awbNumber);

    if (alreadyHasAwb) {
      t.warn("Some selected orders already have shipments created.");
      return;
    }

    if (!selectedProfile) {
      t.err("Please select a BlueDart profile first");
      return;
    }

    // Set defaults (No Date needed anymore)
    setShipmentForm({
      weight: ids.length * 0.5,
      pieces: ids.length,
      length: 20,
      breadth: 15,
      height: 5
    });

    setShowShipmentModal(true); 
  }

  async function createBlueDartShipments() {
    const ids = ensureSome();
    if (!ids) return;

    if (!selectedProfile) {
      t.err("Please select a BlueDart profile first");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        orderIds: ids,
        profileId: selectedProfile,
        // Custom Details for AWB generation (Date removed)
        weight: Number(shipmentForm.weight),
        length: Number(shipmentForm.length),
        breadth: Number(shipmentForm.breadth),
        height: Number(shipmentForm.height)
      };

      // Call API
      const { data } = await BlueDartAPI.createShipments(
        payload.orderIds,
        payload.profileId,
        payload, 
        auth     
      );

      if (data.ok) {
        setShowShipmentModal(false);
        await load();
        setSelected(new Set());

        const results = data.data || {};
        const successCount = results.success?.length || 0;
        const failedCount = results.failed?.length || 0;

        if (successCount > 0) {
          t.success(`✅ Created ${successCount} shipment${successCount > 1 ? 's' : ''}`);
        }
        
        if (failedCount > 0) {
          const firstError = results.failed[0]?.error || "Unknown error";
          if (firstError.toLowerCase().includes("wallet")) {
             t.err(`⚠️ ${firstError}`); 
          } else {
             t.warn(`⚠️ Failed: ${firstError}`);
          }
        }
      } else {
        t.err(data.error || "Failed to create shipments");
      }

    } catch (error) {
      console.error('❌ Shipment creation error:', error);
      t.err(error?.message || "Failed to create shipments. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  // ------------------------------------------------------------------
  // ✅ 2. BULK PRINT LABELS LOGIC
  // ------------------------------------------------------------------
  async function bulkPrintLabels() {
    const ids = ensureSome();
    if (!ids) return;

    const ordersWithAwb = items.filter(o => ids.includes(String(o._id)) && o.shipping?.bd?.awbNumber);

    if (ordersWithAwb.length === 0) {
      t.warn("No shipments found in selection. Create Shipments first.");
      return;
    }

    t.info(`Opening ${ordersWithAwb.length} labels... (Please allow popups)`);

    // Loop through and open each label
    for (const order of ordersWithAwb) {
      let url = order.shipping?.bd?.labelUrl;

      // If URL exists, open it
      if (url) {
        const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
        window.open(fullUrl, '_blank');
      } else {
        // Fallback: If AWB exists but no URL (rare), try to generate on fly
        try {
          const { data } = await BlueDartAPI.generateLabel(order._id, auth);
          if (data.ok && data.data?.downloadUrl) {
            window.open(data.data.downloadUrl, '_blank');
          }
        } catch (e) {
          console.error("Could not fetch label for", order._id);
        }
      }
      // Small delay to prevent browser blocking all popups
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // ------------------------------------------------------------------
  // ✅ DATA LOADING & UTILS
  // ------------------------------------------------------------------
  async function load() {
    setLoading(true);
    try {
      const params = { q, status, page, limit: 20 };
      const dateRange = getDateRange();
      if (dateRange) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }

      const { data } = await api.get("/orders", { params, ...auth });

      setItems(data.items || data.orders || []);
      setTotal(data.total || 0);
      
      // Preserve selection if items still exist
      setSelected(prev => {
        const keep = new Set();
        const currentItems = data.items || data.orders || [];
        for (const id of prev) {
          if (currentItems.some(o => String(o._id) === String(id))) {
            keep.add(id);
          }
        }
        return keep;
      });
    } catch (error) {
      console.error("Load error:", error);
      t.err("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function loadProfiles() {
    try {
      const { data } = await BlueDartAPI.listProfiles(auth);
      setProfiles(data.profiles || []);
      const defaultProfile = data.profiles?.find(p => p.isDefault);
      if (defaultProfile && !selectedProfile) {
        setSelectedProfile(defaultProfile._id);
      }
    } catch (error) {
       // Silent fail
    }
  }

  async function handlePrintLabel(order) {
    const existingLabelUrl = order?.shipping?.bd?.labelUrl;
    if (existingLabelUrl) {
      const url = existingLabelUrl.startsWith('http') ? existingLabelUrl : `${BASE_URL}${existingLabelUrl}`;
      window.open(url, '_blank');
      return;
    }

    const awb = order?.shipping?.bd?.awbNumber;
    if (!awb) return t.warn("No AWB found");

    t.info("Generating Label...");
    try {
      const { data } = await BlueDartAPI.generateLabel(order._id, auth);
      if (data.ok && data.data?.downloadUrl) {
        t.success("Label Generated");
        const newLabelUrl = data.data.downloadUrl;
        const fullUrl = newLabelUrl.startsWith('http') ? newLabelUrl : `${BASE_URL}${newLabelUrl}`;
        window.open(fullUrl, '_blank');
        load();
      } else {
        t.err("Failed to generate label");
      }
    } catch (e) {
      t.err(e.message || "Error printing label");
    }
  }

  async function trackOrder(order) {
    const awb = order?.shipping?.bd?.awbNumber;
    if (!awb) {
      t.info("No AWB number found");
      return;
    }
    try {
      const { data } = await BlueDartAPI.trackAwb(awb, auth);
      t.success("Tracking information updated");
      await load();
    } catch (error) {
      t.err("Failed to update tracking information");
    }
  }

  useEffect(() => {
    load();
    loadProfiles();
  }, [status, page, dateFilter, customDate]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [q]);

  // ------------------------------------------------------------------
  // ✅ TABLE LOGIC
  // ------------------------------------------------------------------
  const stats = useMemo(() => {
    const s = { total: items.length, bd: 0, awb: 0, ready: 0 };
    for (const o of items) {
      const bd = o?.shipping?.bd || {};
      if (bd.awbNumber) s.bd++;
      if (bd.awbNumber) s.awb++;

      const paymentStatus = o.payment?.status;
      const isReadyPayment = paymentStatus === 'paid' ||
        (paymentStatus === 'partially_paid' && o.payment?.mode === 'half');

      if (o.status === 'confirmed' && !bd.awbNumber && isReadyPayment) {
        s.ready++;
      }
    }
    return s;
  }, [items]);

  const allOnPageIds = useMemo(() => items.map(o => String(o._id)), [items]);

  const toggleAll = () => {
    const next = new Set(selected);
    const allSelected = allOnPageIds.every(id => next.has(id));
    (allSelected ? allOnPageIds : []).forEach(id => next.delete(id));
    (!allSelected ? allOnPageIds : []).forEach(id => next.add(id));
    setSelected(next);
  };

  const toggleOne = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const ensureSome = () => {
    if (!selected.size) {
      t.info("Select at least one order");
      return null;
    }
    return Array.from(selected);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AdminTabs />
      
      {/* 🔹 CREATE SHIPMENT MODAL */}
      {showShipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Create BD Shipment (Generate AWB)
            </h3>
            <div className="space-y-4">
              
              {/* WEIGHT INPUT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full border rounded p-2"
                  value={shipmentForm.weight}
                  onChange={e => setShipmentForm({ ...shipmentForm, weight: e.target.value })}
                />
              </div>

              {/* DIMENSIONS */}
              <div className="border-t pt-3 mt-2">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Package Dimensions (cm)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Length</label>
                    <input
                      type="number"
                      className="w-full border rounded p-1.5"
                      value={shipmentForm.length}
                      onChange={e => setShipmentForm({ ...shipmentForm, length: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Breadth</label>
                    <input
                      type="number"
                      className="w-full border rounded p-1.5"
                      value={shipmentForm.breadth}
                      onChange={e => setShipmentForm({ ...shipmentForm, breadth: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Height</label>
                    <input
                      type="number"
                      className="w-full border rounded p-1.5"
                      value={shipmentForm.height}
                      onChange={e => setShipmentForm({ ...shipmentForm, height: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowShipmentModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button
                onClick={createBlueDartShipments}
                disabled={actionLoading || !shipmentForm.length || !shipmentForm.breadth || !shipmentForm.height}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {actionLoading ? "Processing..." : "Create AWB & Label"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-fg">Orders Management</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-blue-50 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-800">Total Orders</div>
          </div>
          <div className="card bg-green-50 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
            <div className="text-sm text-green-800">Ready to Ship</div>
          </div>
          <div className="card bg-purple-50 border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{stats.bd}</div>
            <div className="text-sm text-purple-800">BlueDart Shipments</div>
          </div>
          <div className="card bg-orange-50 border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{stats.awb}</div>
            <div className="text-sm text-orange-800">With AWB Numbers</div>
          </div>
        </div>

        {/* Controls */}
        <div className="card mb-4">
          <div className="space-y-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search orders..."
                className="flex-1 min-w-64"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <select className="min-w-32" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select className="min-w-40" value={selectedProfile} onChange={(e) => setSelectedProfile(e.target.value)}>
                <option value="">Default Profile</option>
                {profiles.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.label} {p.isDefault ? "(Default)" : ""}
                  </option>
                ))}
              </select>

              <button onClick={() => load()} disabled={loading} className="btn-secondary">
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Filter by date:</span>
              <button onClick={() => { setDateFilter("all"); setCustomDate(""); }} className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${dateFilter === "all" ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300"}`}>All Dates</button>
              <button onClick={() => { setDateFilter("today"); setCustomDate(""); }} className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${dateFilter === "today" ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-700 border-gray-300"}`}>Today</button>
              <button onClick={() => { setDateFilter("yesterday"); setCustomDate(""); }} className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${dateFilter === "yesterday" ? "bg-yellow-500 text-white border-yellow-500" : "bg-white text-gray-700 border-gray-300"}`}>Yesterday</button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Custom:</span>
                <input type="date" value={customDate} onChange={(e) => { setCustomDate(e.target.value); setDateFilter("custom"); }} className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${dateFilter === "custom" ? "border-orange-500 ring-2 ring-orange-200" : "border-gray-300"}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {hasSelection && (
          <div className="card bg-accent/5 border-accent/20 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-fg">
                {selected.size} order{selected.size > 1 ? 's' : ''} selected
              </span>

              <div className="flex flex-wrap gap-2">
                {(() => {
                  const selectedOrders = items.filter(o => selected.has(String(o._id)));
                  const hasExistingAwb = selectedOrders.some(o => o.shipping?.bd?.awbNumber);
                  
                  // Check if any selected order has an AWB (to enable print button)
                  const canPrint = hasExistingAwb;

                  return (
                    <>
                      {/* ACTION 1: CREATE SHIPMENT */}
                      <button
                        onClick={openShipmentModal}
                        disabled={actionLoading || hasExistingAwb}
                        className={`btn-primary text-sm ${hasExistingAwb ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={hasExistingAwb ? "Some selected orders already have shipments" : "Generate AWB & Label"}
                      >
                        {actionLoading ? "Creating..." : "Create BD Shipments"}
                      </button>

                      {/* ✅ ACTION 2: PRINT LABELS */}
                      <button
                        onClick={bulkPrintLabels}
                        disabled={!canPrint}
                        className={`btn-secondary text-sm ${!canPrint ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Download/Print Labels for selected orders"
                      >
                        Print Labels
                      </button>

                      <button onClick={() => setSelected(new Set())} className="btn-ghost text-sm">
                        Clear Selection
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-12">
                  <input type="checkbox" checked={selected.size > 0 && allOnPageIds.every(id => selected.has(id))} onChange={toggleAll} className="rounded" />
                </th>
                <th>Date</th>
                <th>Order ID</th>
                <th>Items</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>BlueDart</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-8">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8">No orders found</td></tr>
              ) : (
                items.map(o => {
                  const id = String(o._id);
                  const dt = o.createdAt ? new Date(o.createdAt) : null;
                  const rupees = (o.totals?.grandTotal || o.amount || 0);
                  const bd = o?.shipping?.bd || {};
                  const isSelected = selected.has(id);

                  return (
                    <tr key={id} className={isSelected ? "bg-accent/10" : ""}>
                      <td><input type="checkbox" checked={isSelected} onChange={() => toggleOne(id)} className="rounded" /></td>
                      <td className="text-sm">{dt ? dt.toLocaleDateString() : "—"}</td>
                      <td className="font-mono text-sm">{id.slice(-8)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-3">
                          {o.items?.map((item, i) => {
                            let finalImage = item.image;
                            if (!finalImage) {
                              const liveBook = item.bookId || {};
                              const assets = liveBook.assets || {};
                              if (Array.isArray(assets.coverUrl) && assets.coverUrl.length > 0) {
                                finalImage = assets.coverUrl[0];
                              } else if (typeof assets.coverUrl === "string") {
                                finalImage = assets.coverUrl;
                              }
                            }
                            if (!finalImage) finalImage = "/placeholder.png";

                            const isAbsolute = finalImage.startsWith("http");
                            const cleanBase = BASE_URL.replace(/\/api\/?$/, "");
                            const imgUrl = isAbsolute ? finalImage : `${cleanBase}${finalImage.startsWith('/') ? '' : '/'}${finalImage}`;

                            const displayTitle = item.title || item.bookId?.title || "Unknown Title";

                            return (
                              <div key={i} className="flex items-start gap-4">
                                <img
                                  src={imgUrl}
                                  alt="cover"
                                  className="w-20 h-28 object-cover rounded-md border border-border-subtle bg-surface-subtle flex-shrink-0 shadow-sm"
                                  onError={(e) => e.target.style.display = 'none'}
                                />

                                <div className="flex flex-col min-w-0 py-1 relative">
                                  <div className="relative group cursor-help">
                                    <span className="text-sm font-medium text-fg line-clamp-3 leading-snug">
                                      {displayTitle}
                                    </span>
                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs p-2 rounded shadow-xl z-[50]">
                                      {displayTitle}
                                      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>

                                  <span className="text-xs text-fg-muted mt-1.5 font-medium">
                                    Qty: {item.qty}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm font-medium">{o?.shipping?.name || o?.customer?.name || "—"}</div>
                        <div className="text-xs text-gray-500">{o?.shipping?.phone || o?.customer?.phone}</div>
                      </td>
                      <td className="font-medium">₹{rupees}</td>
                      <td className="px-4 py-4">
                         <div className="flex flex-col gap-1">
                           <span className={`text-xs px-2 py-0.5 rounded border inline-block w-fit ${o.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50'}`}>{o.status}</span>
                           <span className="text-xs text-gray-500">{o.payment?.status}</span>
                         </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-mono">AWB: {bd.awbNumber || "—"}</div>
                          {bd.status && <span className="text-xs text-blue-600">{bd.status}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2"> {/* Increased gap for better spacing */}
                          {bd.awbNumber && (
                            <>
                            <button 
                              onClick={() => trackOrder(o)} 
                              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              Track
                            </button>
                            <button 
                              onClick={() => handlePrintLabel(o)} 
                              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              Label
                            </button>
                            </>
                          )}
                          {o.status === 'confirmed' && !bd.awbNumber && (
                            <button
                              onClick={() => { setSelected(new Set([id])); openShipmentModal(); }}
                              className="px-4 py-1.5 text-sm font-medium text-white btn-primary shadow-sm transition-colors"
                            >
                              Ship Now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border-subtle">
          <div className="text-sm text-gray-500">Page {page}</div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={items.length < 20} className="btn-secondary text-sm">Next</button>
          </div>
        </div>
      </div>
    </div >
  );
}