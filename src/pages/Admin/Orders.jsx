// src/pages/admin/Orders.jsx
import { useEffect, useMemo, useState } from "react";
import { api, BASE_URL } from "../../api/client";
import { BlueDartAPI } from "../../api/bluedart";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

export default function AdminOrders() {
  const { token } = useAuth();
  const auth = {
    headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` }
  };

  // State Management
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
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modal States
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  // ✅ REMOVED: shipmentForm (No longer needed for manual inputs)

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({
    orderId: '',
    orderDetails: null,
    amount: '',
    reason: '',
    speed: 'normal'
  });

  const hasSelection = selected.size > 0;

  // ==================== DATE FUNCTIONS ====================
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
      default:
        return null;
    }
  };

  // ==================== REFUND FUNCTIONS ====================
  function openRefundModal(order) {
    const maxRefundable = order.payment?.paidAmount || 0;
    if (maxRefundable <= 0) {
      t.warn("No refundable amount available");
      return;
    }
    if (order.payment?.status !== 'paid' && order.payment?.status !== 'partially_paid') {
      t.warn("Only paid orders can be refunded");
      return;
    }

    setRefundForm({
      orderId: order._id,
      orderDetails: order,
      amount: maxRefundable.toFixed(2),
      reason: '',
      speed: 'normal'
    });
    setShowRefundModal(true);
  }

  async function processRefund() {
    if (!refundForm.orderId || !refundForm.amount) {
      t.warn("Order ID and amount required");
      return;
    }
    if (!refundForm.reason || refundForm.reason.trim() === '') {
      t.warn("Please provide refund reason");
      return;
    }

    const refundAmount = parseFloat(refundForm.amount);
    if (refundAmount <= 0) {
      t.warn("Amount must be greater than 0");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        orderId: refundForm.orderId,
        amount: refundAmount,
        reason: refundForm.reason,
        speed: refundForm.speed
      };

      const { data } = await api.post("/payments/refund", payload, auth);

      if (data.ok) {
        t.success(`Refund of ₹${refundAmount} processed!`);
        setShowRefundModal(false);
        await load();
        setRefundForm({ orderId: '', orderDetails: null, amount: '', reason: '', speed: 'normal' });
      } else {
        t.err(data.error || "Refund failed");
        if (data.suggestion) t.info(data.suggestion);
      }
    } catch (error) {
      console.error('Refund error:', error);
      const errorMsg = error?.response?.data?.error || error?.message || "Refund failed";
      t.err(errorMsg);
      const suggestion = error?.response?.data?.suggestion;
      if (suggestion) setTimeout(() => t.info(suggestion), 1000);
    } finally {
      setActionLoading(false);
    }
  }

  // ==================== SHIPMENT FUNCTIONS ====================
  function openShipmentModal() {
    const ids = ensureSome();
    if (!ids) return;

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

    // ✅ NO FORM RESET NEEDED (Auto-calc happens on backend)
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
      // ✅ SIMPLIFIED PAYLOAD: Just IDs and Profile. Backend handles Dimensions.
      const payload = {
        orderIds: ids,
        profileId: selectedProfile
      };

      const { data } = await BlueDartAPI.createShipments(
        payload.orderIds,
        payload.profileId,
        {}, // Empty options object (Backend defaults used)
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
          results.failed.forEach((f, idx) => {
            setTimeout(() => {
              t.err(`Order ${f.orderId?.slice(-6)}: ${f.error}`);
            }, idx * 500); // Stagger toasts
          });
        }
      } else {
        t.err(data.error || "Failed to create shipments");
      }
    } catch (error) {
      console.error('❌ Shipment creation error:', error);
      const apiError = error?.response?.data?.error;
      const suggestion = error?.response?.data?.suggestion;

      t.err(apiError || error?.message || "Failed to create shipments");
      if (suggestion) setTimeout(() => t.info(suggestion), 800);
    } finally {
      setActionLoading(false);
    }
  } 

  async function bulkPrintLabels() {
    const ids = ensureSome();
    if (!ids) return;

    const ordersWithAwb = items.filter(o =>
      ids.includes(String(o._id)) && o.shipping?.bd?.awbNumber
    );

    if (ordersWithAwb.length === 0) {
      t.warn("No shipments found in selection. Create Shipments first.");
      return;
    }

    t.info(`Opening ${ordersWithAwb.length} labels...`);

    for (const order of ordersWithAwb) {
      let url = order.shipping?.bd?.labelUrl;
      if (url) {
        const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
        window.open(fullUrl, '_blank');
      } else {
        try {
          const { data } = await BlueDartAPI.generateLabel(order._id, auth);
          if (data.ok && data.data?.downloadUrl) {
            window.open(data.data.downloadUrl, '_blank');
          }
        } catch (e) {
          console.error("Could not fetch label for", order._id);
        }
      }
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // ==================== DATA LOADING ====================
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
      // console.log("📦 BlueDart API Response:", data); 

      const profileList = data.data || data.profiles || [];
      // console.log("📋 Profile List:", profileList); 

      setProfiles(profileList);

      const defaultProfile = profileList.find(p => p.isDefault);
      if (defaultProfile && !selectedProfile) {
        setSelectedProfile(defaultProfile._id);
      } else if (profileList.length > 0 && !selectedProfile) {
        setSelectedProfile(profileList[0]._id);
      }
    } catch (error) {
      console.error("❌ Failed to load profiles:", error);
      t.warn("Could not load BlueDart profiles");
    }
  }

  async function handlePrintLabel(order) {
    const existingLabelUrl = order?.shipping?.bd?.labelUrl;
    if (existingLabelUrl) {
      const url = existingLabelUrl.startsWith('http')
        ? existingLabelUrl
        : `${BASE_URL}${existingLabelUrl}`;
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
        const fullUrl = newLabelUrl.startsWith('http')
          ? newLabelUrl
          : `${BASE_URL}${newLabelUrl}`;
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
      await BlueDartAPI.trackAwb(awb, auth);
      t.success("Tracking information updated");
      await load();
    } catch (error) {
      t.err("Failed to update tracking information");
    }
  }

  // ==================== EFFECTS ====================
  useEffect(() => {
    load();
    loadProfiles();
  }, [status, page, dateFilter, customDate]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [q]);

  // ==================== TABLE LOGIC ====================
  const stats = useMemo(() => {
    const s = { total: items.length, bd: 0, awb: 0, ready: 0, shipped: 0 };
    for (const o of items) {
      const bd = o?.shipping?.bd || {};
      if (bd.awbNumber) s.bd++;
      if (bd.awbNumber) s.awb++;
      if (o.status === 'shipped' || o.status === 'delivered') s.shipped++;

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

  // ==================== HELPER FUNCTIONS ====================
  const getStatusBadge = (orderStatus, paymentStatus) => {
    const badges = [];

    // Order Status Badge
    const orderStatusConfig = {
      'pending': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' },
      'confirmed': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
      'paid': { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
      'shipped': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Shipped' },
      'delivered': { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Delivered' },
      'refunded': { bg: 'bg-red-100', text: 'text-red-700', label: 'Refunded' },
      'cancelled': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelled' },
    };

    // Payment Status Badge
    const paymentStatusConfig = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Payment Pending' },
      'paid': { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
      'partially_paid': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Partial Payment' },
      'failed': { bg: 'bg-red-100', text: 'text-red-700', label: 'Payment Failed' },
      'partially_refunded': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Partial Refund' },
      'refunded': { bg: 'bg-red-100', text: 'text-red-700', label: 'Refunded' },
    };

    if (orderStatus && orderStatusConfig[orderStatus]) {
      badges.push(
        <span key="order" className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${orderStatusConfig[orderStatus].bg} ${orderStatusConfig[orderStatus].text}`}>
          {orderStatusConfig[orderStatus].label}
        </span>
      );
    }

    if (paymentStatus && paymentStatusConfig[paymentStatus]) {
      badges.push(
        <span key="payment" className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusConfig[paymentStatus].bg} ${paymentStatusConfig[paymentStatus].text}`}>
          {paymentStatusConfig[paymentStatus].label}
        </span>
      );
    }

    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  const canCreateShipment = (order) => {
    const paymentStatus = order.payment?.status;
    const hasAwb = order.shipping?.bd?.awbNumber;
    const isPaymentComplete = paymentStatus === 'paid' ||
      (paymentStatus === 'partially_paid' && order.payment?.mode === 'half');

    return order.status === 'confirmed' && !hasAwb && isPaymentComplete;
  };

  const canRefund = (order) => {
    const paymentStatus = order.payment?.status;
    const paidAmount = order.payment?.paidAmount || 0;

    return (paymentStatus === 'paid' || paymentStatus === 'partially_paid') &&
      paidAmount > 0 &&
      order.status !== 'refunded';
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
            </div>
            <p className="text-sm text-gray-600">Manage your orders, create shipments, and track deliveries</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className={cx("w-4 h-4", loading && "animate-spin")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-100 mb-1">Total Orders</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Ready to Ship */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-green-100 mb-1">Ready to Ship</p>
                <p className="text-4xl font-bold">{stats.ready}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Shipped */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-purple-100 mb-1">Shipped</p>
                <p className="text-4xl font-bold">{stats.shipped}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Selected */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-cyan-100 mb-1">Selected</p>
                <p className="text-4xl font-bold">{selected.size}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Phone, AWB..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-[16px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {showFilters && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Date Filter</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="custom">Custom Date</option>
                  <option value="">All Time</option>
                </select>
              </div>

              {dateFilter === "custom" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* BlueDart Profile Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  BlueDart Profile
                  {profiles.length > 0 && (
                    <span className="ml-2 text-xs text-green-600">({profiles.length} available)</span>
                  )}
                </label>
                <select
                  value={selectedProfile}
                  onChange={(e) => {
                    setSelectedProfile(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Profile</option>
                  {profiles.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name || p.profileName || 'Unnamed Profile'}{p.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
                {profiles.length === 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    ⚠️ No profiles found. Please create one first.
                  </p>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            {hasSelection && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <button
                  onClick={openShipmentModal}
                  disabled={actionLoading || !selectedProfile}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Shipments ({selected.size})
                </button>
                <button
                  onClick={bulkPrintLabels}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Print Labels ({selected.size})
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left w-12">
                    <input
                      type="checkbox"
                      checked={allOnPageIds.length > 0 && allOnPageIds.every(id => selected.has(id))}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">DATE</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ORDER ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ITEMS</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CUSTOMER</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">AMOUNT</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SHIPPING</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}

                {!loading && items.map((o) => {
                  const id = String(o._id);
                  const dt = o.createdAt ? new Date(o.createdAt) : null;
                  const bd = o?.shipping?.bd || {};
                  const rupees = Number(o.amount || 0).toFixed(2);

                  return (
                    <tr key={id} className={cx(
                      "hover:bg-gray-50 transition-colors",
                      selected.has(id) && "bg-blue-50"
                    )}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selected.has(id)}
                          onChange={() => toggleOne(id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {dt ? dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dt ? dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ""}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-medium text-gray-900">#{id.slice(-8)}</div>
                      </td>

                      {/* ITEMS COLUMN WITH IMAGE */}
                      <td className="px-4 py-3">
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
                          const maxTitleLength = 40;
                          const shortTitle = displayTitle.length > maxTitleLength
                            ? displayTitle.substring(0, maxTitleLength) + "..."
                            : displayTitle;

                          return (
                            <div key={i} className="flex items-center gap-3 mb-2 group relative">
                              <img
                                src={imgUrl}
                                alt={displayTitle}
                                className="w-16 h-[6rem] object-cover rounded border border-gray-200 shadow-sm"
                                onError={(e) => e.target.src = '/placeholder.png'}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 cursor-help font-medium" title={displayTitle}>
                                  {shortTitle} 🌱
                                </p>
                                <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                              </div>
                            </div>
                          );
                        })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{o?.shipping?.name || o?.customer?.name || "—"}</div>
                        <div className="text-xs text-gray-500">{o?.shipping?.phone || o?.customer?.phone}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">₹{rupees}</div>
                        {o.payment?.mode === 'half' && (
                          <div className="text-xs text-gray-500">Paid: ₹{(o.payment?.paidAmount || 0).toFixed(2)}</div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(o.status, o.payment?.status)}
                      </td>

                      <td className="px-6 py-4">
                        {bd.awbNumber ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-mono text-green-600">● {bd.awbNumber}</span>
                            </div>
                            {bd.status && (
                              <span className="text-xs text-purple-600 font-medium">{bd.status}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No AWB</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {bd.awbNumber ? (
                            <>
                              <button
                                onClick={() => handlePrintLabel(o)}
                                title="Print Label"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => trackOrder(o)}
                                title="Track"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </button>
                            </>
                          ) : canCreateShipment(o) ? (
                            <button
                              onClick={() => {
                                setSelected(new Set([id]));
                                setTimeout(() => openShipmentModal(), 100);
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                            >
                              Create Shipment
                            </button>
                          ) : null}

                          {canRefund(o) && (
                            <button
                              onClick={() => openRefundModal(o)}
                              title="Refund"
                              className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shipment Modal - UPDATED (Removed Manual Inputs) */}
      {showShipmentModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={() => !actionLoading && setShowShipmentModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-5 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Create BlueDart Shipments</h3>
                      <p className="text-sm text-gray-500">Processing {selected.size} order(s)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !actionLoading && setShowShipmentModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* ✅ INFO BOX instead of Input Fields */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Smart Calculation Enabled
                  </p>
                  <p className="mt-2 pl-7">
                    Package dimensions and weight will be <strong>automatically calculated</strong> based on the number of books in each order.
                  </p>
                </div>

              </div>
              <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={() => setShowShipmentModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createBlueDartShipments}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? "Creating..." : "Confirm & Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && refundForm.orderDetails && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={() => !actionLoading && setShowRefundModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-5 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Process Refund</h3>
                      <p className="text-sm text-gray-500">Order #{refundForm.orderId.slice(-8)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !actionLoading && setShowRefundModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Paid Amount: <span className="font-semibold text-gray-900">₹{refundForm.orderDetails.payment?.paidAmount?.toFixed(2)}</span></p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      max={refundForm.orderDetails.payment?.paidAmount}
                      value={refundForm.amount}
                      onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                    <textarea
                      value={refundForm.reason}
                      onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                      rows={3}
                      placeholder="Enter refund reason..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refund Speed</label>
                    <select
                      value={refundForm.speed}
                      onChange={(e) => setRefundForm({ ...refundForm, speed: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="normal">Normal (5-7 days)</option>
                      <option value="optimum">Instant (if available)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={() => setShowRefundModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={processRefund}
                  disabled={actionLoading || !refundForm.reason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Process Refund"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}