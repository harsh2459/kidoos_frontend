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
  const [showConfirm, setShowConfirm] = useState(null); // FIXED: Replace confirm dialog
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const hasSelection = selected.size > 0;

  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "today": {
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        return {
          startDate: today.toISOString(),
          endDate: endOfDay.toISOString()
        };
      }

      case "yesterday": {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
        return {
          startDate: yesterday.toISOString(),
          endDate: endOfYesterday.toISOString()
        };
      }

      case "tomorrow": {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setHours(23, 59, 59, 999);
        return {
          startDate: tomorrow.toISOString(),
          endDate: endOfTomorrow.toISOString()
        };
      }

      case "custom": {
        if (!customDate) return null;
        const selectedDate = new Date(customDate);
        selectedDate.setHours(0, 0, 0, 0);
        const endOfSelected = new Date(selectedDate);
        endOfSelected.setHours(23, 59, 59, 999);
        return {
          startDate: selectedDate.toISOString(),
          endDate: endOfSelected.toISOString()
        };
      }

      default:
        return null;
    }
  };

  async function load() {
    setLoading(true);
    try {
      const params = {
        q,
        status,
        page,
        limit: 20
      };

      // Add date range if filter is active
      const dateRange = getDateRange();
      if (dateRange) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }

      const { data } = await api.get("/orders", {
        params,
        ...auth
      });

      setItems(data.items || data.orders || []);
      setTotal(data.total || 0);
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

      // Don't show error toast for profiles as it's not critical
    }
  }
  async function handlePrintLabel(order) {
    // 1. Check if label is already generated
    const existingLabelUrl = order?.shipping?.bd?.labelUrl;
    if (existingLabelUrl) {
      // If we already have it, just open it
      window.open(`${BASE_URL}${existingLabelUrl}`, '_blank');
      return;
    }

    // 2. If not, generate it from BlueDart
    const awb = order?.shipping?.bd?.awbNumber;
    if (!awb) return t.warn("No AWB found");

    t.info("Generating Label...");
    try {
      const { data } = await BlueDartAPI.generateLabel(order._id, auth);
      

      if (data.ok && data.data?.url) {
        t.success("Label Generated");
        // Open the new label URL
        // We prepend BASE_URL if it's a relative path like '/uploads/...'
        const fullUrl = `${BASE_URL}${data.data.downloadUrl}`;
        window.open(fullUrl, '_blank');

        // Reload orders to save the label URL in local state
        load();
      } else {
        t.err("Failed to generate label");
      }
    } catch (e) {
      
      t.err(e.message || "Error printing label");
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

  const stats = useMemo(() => {
    const s = { total: items.length, bd: 0, awb: 0, ready: 0 };
    for (const o of items) {
      const bd = o?.shipping?.bd || {};
      if (bd.awbNumber) s.bd++;
      if (bd.awbNumber) s.awb++;

      // ✅ NEW: Include partially paid orders as ready to ship
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

  async function createBlueDartShipments() {
    const ids = ensureSome();
    if (!ids) return;

    // ✅ CRITICAL: Validate profile selection
    if (!selectedProfile) {
      t.err("Please select a BlueDart profile first");
      return;
    }

    setActionLoading(true);
    try {
      console.log('📦 Creating shipments for orders:', ids);
      console.log('📦 Using profile:', selectedProfile);

      // ✅ FIXED: Use correct API method
      const { data } = await BlueDartAPI.createShipments(ids, selectedProfile, auth);

      console.log('📦 Response:', data);

      // ✅ FIXED: Handle correct response structure
      if (data.ok) {
        const results = data.data || {};
        const successCount = results.success?.length || 0;
        const failedCount = results.failed?.length || 0;

        if (successCount > 0) {
          t.success(`✅ Created ${successCount} shipment${successCount > 1 ? 's' : ''}`);
          console.log('✅ Success:', results.success);
        }

        if (failedCount > 0) {
          t.warn(`⚠️ Failed: ${failedCount} shipment${failedCount > 1 ? 's' : ''}`);
          console.error('❌ Failed:', results.failed);
        }

        if (successCount === 0 && failedCount === 0) {
          t.info("No shipments were created");
        }
      } else {
        t.err(data.error || "Failed to create shipments");
      }

      await load();
      setSelected(new Set());
    } catch (error) {
      console.error('❌ Shipment creation error:', error);
      t.err(error?.message || "Failed to create shipments. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function trackOrder(order) {
    const awb = order?.shipping?.bd?.awbNumber;
    if (!awb) {
      t.info("No AWB number found for this order");
      return;
    }

    try {
      const { data } = await BlueDartAPI.trackAwb(awb, auth);
      t.success("Tracking information updated");
      console.log("Tracking data:", data);
      await load();
    } catch (error) {

      t.err("Failed to update tracking information");
    }
  }

  async function schedulePickup() {
    const ids = ensureSome();
    if (!ids) return;

    // ✅ CRITICAL: Validate profile selection
    if (!selectedProfile) {
      t.err("Please select a BlueDart profile first");
      return;
    }

    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 1); // Tomorrow
    const formattedDate = pickupDate.toISOString().split('T')[0];

    setActionLoading(true);
    try {
      console.log('📦 Scheduling pickup for orders:', ids);

      const { data } = await BlueDartAPI.schedulePickup(
        {
          orderIds: ids,
          profileId: selectedProfile,
          pickupDate: formattedDate,
          pickupTime: "1400", // 2:00 PM
          mode: "SURFACE",
          numberOfPieces: ids.length,
          weight: ids.length * 0.5 // Estimate
        },
        auth
      );

      if (data.ok) {
        const ordersCount = data.data?.ordersCount || ids.length;
        const confirmationNumber = data.data?.confirmationNumber;

        t.success(`Pickup scheduled for ${ordersCount} order${ordersCount > 1 ? 's' : ''}`);

        if (confirmationNumber) {
          t.info(`Confirmation: ${confirmationNumber}`);
        }

        await load();
        setSelected(new Set());
      } else {
        t.err(data.error || "Failed to schedule pickup");
      }
    } catch (error) {
      console.error('❌ Schedule pickup error:', error);
      t.err("Failed to schedule pickup");
    } finally {
      setActionLoading(false);
    }
  }


  // FIXED: Replace confirm with state-managed dialog
  function handleCancelShipments() {
    const ids = ensureSome();
    if (!ids) return;
    setShowConfirm('cancel');
  }

  async function confirmCancelShipments() {
    const ids = ensureSome();
    if (!ids) return;

    setShowConfirm(null);
    setActionLoading(true);

    try {
      console.log('❌ Cancelling shipments for orders:', ids);

      // Get orders to cancel
      const ordersToCancel = items.filter(o => ids.includes(String(o._id)));

      let successCount = 0;
      let failedCount = 0;
      const failedOrders = [];

      for (const order of ordersToCancel) {
        const awb = order?.shipping?.bd?.awbNumber;

        if (!awb) {
          console.warn('⚠️ No AWB for order:', order._id);
          failedCount++;
          failedOrders.push({ orderId: order._id, reason: 'No AWB number' });
          continue;
        }

        try {
          const { data } = await BlueDartAPI.cancelShipment(
            awb,
            "User requested cancellation",
            order._id,
            auth
          );

          if (data.ok) {
            console.log('✅ Cancelled AWB:', awb);
            successCount++;
          } else {
            console.error('❌ Failed to cancel AWB:', awb, data.error);
            failedCount++;
            failedOrders.push({ orderId: order._id, awb, reason: data.error });
          }
        } catch (error) {
          console.error('❌ Cancel error for AWB:', awb, error);
          failedCount++;
          failedOrders.push({ orderId: order._id, awb, reason: error.message });
        }
      }

      // Show results
      if (successCount > 0) {
        t.success(`Cancelled ${successCount} shipment${successCount > 1 ? 's' : ''}`);
      }

      if (failedCount > 0) {
        t.warn(`Failed to cancel ${failedCount} shipment${failedCount > 1 ? 's' : ''}`);
        console.error('Failed cancellations:', failedOrders);
      }

      await load();
      setSelected(new Set());
    } catch (error) {
      console.error('❌ Cancel shipments error:', error);
      t.err("Failed to cancel shipments");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="p-6 bg-surface-subtle min-h-screen">
      <AdminTabs />
      {/* FIXED: Custom confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {showConfirm === 'cancel' ? 'Cancel Shipments?' : 'Confirm Action'}
            </h3>
            <p className="text-gray-600 mb-6">
              {showConfirm === 'cancel'
                ? 'Are you sure you want to cancel these shipments? This action cannot be undone.'
                : 'Are you sure you want to proceed?'
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={showConfirm === 'cancel' ? confirmCancelShipments : () => setShowConfirm(null)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {showConfirm === 'cancel' ? 'Yes, Cancel Shipments' : 'Confirm'}
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
            {/* Row 1: Search and Status */}
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search orders by ID, customer, email..."
                className="flex-1 min-w-64"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <select
                className="min-w-32"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                className="min-w-40"
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
              >
                <option value="">Default Profile</option>
                {profiles.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.label} {p.isDefault ? "(Default)" : ""}
                  </option>
                ))}
              </select>

              <button
                onClick={() => load()}
                disabled={loading}
                className="btn-secondary"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {/* Row 2: Date Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Filter by date:</span>

              <button
                onClick={() => {
                  setDateFilter("all");
                  setCustomDate("");
                }}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${dateFilter === "all"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                All Dates
              </button>

              <button
                onClick={() => {
                  setDateFilter("today");
                  setCustomDate("");
                }}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${dateFilter === "today"
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Today
              </button>

              <button
                onClick={() => {
                  setDateFilter("yesterday");
                  setCustomDate("");
                }}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${dateFilter === "yesterday"
                  ? "bg-yellow-500 text-white border-yellow-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Yesterday
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Custom:</span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setDateFilter("custom");
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${dateFilter === "custom"
                    ? "border-orange-500 ring-2 ring-orange-200"
                    : "border-gray-300"
                    }`}
                />
                {customDate && (
                  <button
                    onClick={() => {
                      setCustomDate("");
                      setDateFilter("all");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    title="Clear date"
                  >
                    ✕
                  </button>
                )}
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
                <button
                  onClick={createBlueDartShipments}
                  disabled={actionLoading}
                  className="btn-primary text-sm"
                >
                  {actionLoading ? "Creating..." : "Create BD Shipments"}
                </button>
                <button
                  onClick={schedulePickup}
                  disabled={actionLoading}
                  className="btn-secondary text-sm"
                >
                  {actionLoading ? "Scheduling..." : "Schedule Pickup"}
                </button>
                <button
                  onClick={handleCancelShipments} // FIXED: Use handler function
                  disabled={actionLoading}
                  className="btn-danger text-sm"
                >
                  {actionLoading ? "Cancelling..." : "Cancel Shipments"}
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="btn-ghost text-sm"
                >
                  Clear Selection
                </button>
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
                  <input
                    type="checkbox"
                    checked={selected.size > 0 && allOnPageIds.every(id => selected.has(id))}
                    onChange={toggleAll}
                    className="rounded"
                  />
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
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-fg-muted">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="empty">
                      <div className="text-fg-muted">No orders found</div>
                      {q || status ? (
                        <button onClick={() => { setQ(""); setStatus(""); }} className="btn-link text-sm mt-2">
                          Clear filters
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : (
                items.map(o => {
                  const id = String(o._id);
                  const dt = o.createdAt ? new Date(o.createdAt) : null;
                  const rupees = (o.totals?.grandTotal || o.amount || 0);
                  const bd = o?.shipping?.bd || {};
                  const isSelected = selected.has(id);

                  return (
                    <tr key={id} className={isSelected ? "bg-accent/10" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(id)}
                          className="rounded"
                        />
                      </td>
                      <td className="text-sm">
                        {dt ? dt.toLocaleString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : "—"}
                      </td>
                      <td className="font-mono text-sm">
                        {id.slice(-8)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-3">
                          {o.items?.map((item, i) => {
                            // 1. Image Logic
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

                            // Handle URL pathing
                            const isAbsolute = finalImage.startsWith("http");
                            const cleanBase = BASE_URL.replace(/\/api\/?$/, "");
                            const imgUrl = isAbsolute ? finalImage : `${cleanBase}${finalImage.startsWith('/') ? '' : '/'}${finalImage}`;

                            // 2. Title Logic
                            const displayTitle = item.title || item.bookId?.title || "Unknown Title";

                            return (
                              <div key={i} className="flex items-start gap-4">
                                {/* ✅ BIG IMAGE: w-20 h-28 */}
                                <img
                                  src={imgUrl}
                                  alt="cover"
                                  className="w-20 h-28 object-cover rounded-md border border-border-subtle bg-surface-subtle flex-shrink-0 shadow-sm"
                                  onError={(e) => e.target.style.display = 'none'}
                                />

                                <div className="flex flex-col min-w-0 py-1 relative">
                                  {/* ✅ INSTANT HOVER LOGIC */}
                                  {/* We use 'group' and 'group-hover' to show the tooltip div instantly */}
                                  <div className="relative group cursor-help">

                                    {/* The Truncated Title (Visible by default) */}
                                    <span className="text-sm font-medium text-fg line-clamp-3 leading-snug">
                                      {displayTitle}
                                    </span>

                                    {/* The Custom Tooltip (Hidden by default, appears INSTANTLY on hover) */}
                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs p-2 rounded shadow-xl z-[50]">
                                      {displayTitle}
                                      {/* Little arrow pointing down */}
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
                        <div className="text-sm font-medium text-fg">
                          {o?.shipping?.name || o?.customer?.name || o?.email || "—"}
                        </div>
                        <div className="text-xs text-fg-subtle">
                          {o?.shipping?.phone || o?.customer?.phone || o?.phone || ""}
                        </div>
                      </td>
                      <td className="font-medium">
                        ₹{rupees?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {/* ✅ FIXED: Added 'flex flex-col' to force vertical stacking */}
                        <div className="flex flex-col items-start gap-2">

                          {/* 1. Order Status Badge */}
                          <div className={cx(
                            "inline-flex px-2.5 py-1 text-xs rounded-full font-medium border",
                            o.status === 'confirmed' && "bg-green-50 text-green-700 border-green-200",
                            o.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                            o.status === 'shipped' && "bg-blue-50 text-blue-700 border-blue-200",
                            o.status === 'delivered' && "bg-purple-50 text-purple-700 border-purple-200",
                            o.status === 'cancelled' && "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {o.status}
                          </div>

                          {/* 2. Payment Status Badge (Now stacked below) */}
                          <div className={cx(
                            "inline-flex px-2.5 py-1 text-xs rounded-full font-medium border", // Removed ml-1
                            o.payment?.status === 'paid' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                            o.payment?.status === 'partially_paid' && "bg-orange-50 text-orange-800 border-orange-200",
                            o.payment?.status === 'pending' && "bg-gray-50 text-gray-700 border-gray-200"
                          )}>
                            {o.payment?.status === 'partially_paid' ?
                              `Half Paid (₹${o.payment?.paidAmount || 0} / ₹${o.amount})` :
                              `Payment: ${o.payment?.status || '—'}`
                            }
                          </div>

                          {/* 3. COD Amount (Stacked at bottom) */}
                          {o.payment?.dueOnDeliveryAmount > 0 && (
                            <div className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                              COD: ₹{o.payment.dueOnDeliveryAmount}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="text-sm font-mono">
                            AWB: {bd.awbNumber || "—"}
                          </div>
                          {bd.status && (
                            <span className="badge badge-soft text-xs">
                              {bd.status}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {bd.awbNumber && (
                            <button
                              onClick={() => trackOrder(o)}
                              className="btn-ghost text-xs px-2 py-1"
                            >
                              Track
                            </button>
                          )}
                          {bd.awbNumber && (
                            <button
                              onClick={() => handlePrintLabel(o)}
                              className="btn-secondary text-xs px-2 py-1 flex items-center gap-1"
                              title="Print Shipping Label"
                            >
                              <span>🖨️</span> Label
                            </button>
                          )}
                          {o.status === 'confirmed' && !bd.awbNumber && (
                            <button
                              onClick={() => {
                                setSelected(new Set([id]));
                                createBlueDartShipments();
                              }}
                              disabled={actionLoading}
                              className="btn-primary text-xs px-2 py-1"
                            >
                              Ship
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
          <div className="text-sm text-fg-subtle">
            Showing {items.length} of {total} orders
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="btn-secondary text-sm"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {page}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 20 >= total || loading}
              className="btn-secondary text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}