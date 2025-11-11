import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
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

  const hasSelection = selected.size > 0;

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/orders", {
        params: { q, status, page, limit: 20 },
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

  useEffect(() => {
    load();
    loadProfiles();
  }, [status, page]);

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
      if (o.status === 'confirmed' && !bd.awbNumber) s.ready++;
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
                  {p.name} {p.isDefault ? "(Default)" : ""}
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
                      <td>
                        <div className="space-y-1">
                          <span className={cx(
                            "badge",
                            o.status === 'confirmed' && "badge-green",
                            o.status === 'pending' && "bg-yellow-100 text-yellow-800"
                          )}>
                            {o.status}
                          </span>
                          <div className="text-xs text-fg-subtle">
                            Payment: {o.payment?.status || "—"}
                          </div>
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
