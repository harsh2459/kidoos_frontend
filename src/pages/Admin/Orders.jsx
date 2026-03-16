// src/pages/admin/Orders.jsx
import { useEffect, useMemo, useState } from "react";
import { api, BASE_URL } from "../../api/client";
import { BlueDartAPI } from "../../api/bluedart";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";
import { Truck, Printer, Rocket, MapPin } from "lucide-react";
import { ShipAPI } from "../../api/shiprocket";

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
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [providerOrderId, setProviderOrderId] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  // Shiprocket dimensions modal (shown before Phase 1)
  const [srDimensionsModal, setSrDimensionsModal] = useState(false);
  const [srPendingOrderIds, setSrPendingOrderIds] = useState([]);
  const [srDimensions, setSrDimensions] = useState({ weight: 0.5, length: 20, breadth: 15, height: 5 });
  // Shiprocket courier selection modal
  const [srCourierModal, setSrCourierModal] = useState(false);
  const [srCourierData, setSrCourierData] = useState([]); // [{ id, shipmentId, couriers, recommendedCourierId }]
  const [srSelections, setSrSelections] = useState({});  // { orderId: courierId }
  const [refundForm, setRefundForm] = useState({
    orderId: '',
    orderDetails: null,
    amount: '',
    reason: '',
    speed: 'normal'
  });

  // Order Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  // Offline Order Modal States
  const [showOfflineOrderModal, setShowOfflineOrderModal] = useState(false);
  const [offlineForm, setOfflineForm] = useState({
    customer: { name: '', email: '', phone: '' },
    items: [],
    shipping: { address: '', city: '', state: '', pincode: '', country: 'India' },
    payment: { method: 'cash', paidAmount: '', status: '' },
    shippingFee: '',
    serviceFee: '',
    taxAmount: '',
    couponCode: '',
    status: 'confirmed',
    adminNotes: ''
  });
  const [bookSearch, setBookSearch] = useState('');
  const [bookResults, setBookResults] = useState([]);
  const [bookSearchLoading, setBookSearchLoading] = useState(false);
  const [offlineOrderSaving, setOfflineOrderSaving] = useState(false);
  const [offlinePaymentLink, setOfflinePaymentLink] = useState(null); // { url, orderId, orderRef }

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
        profileId: selectedProfile
      };

      const { data } = await BlueDartAPI.createShipments(
        payload.orderIds,
        payload.profileId,
        {},
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
            }, idx * 500);
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
      t.warn("No BlueDart shipments found in selection. Create Shipments first.");
      return;
    }

    const orderIds = ordersWithAwb.map(o => String(o._id));
    t.info(`Generating ${orderIds.length} label(s)...`);
    setActionLoading(true);

    try {
      const { data } = await BlueDartAPI.bulkGenerateLabels(orderIds, auth);
      if (data.ok) {
        const labels = data.data?.success || [];
        const failed = data.data?.failed || [];

        for (const label of labels) {
          if (label.pdf) {
            openBase64Pdf(label.pdf);
            await new Promise(r => setTimeout(r, 300));
          }
        }

        if (labels.length > 0) t.success(`Opened ${labels.length} label(s)`);
        if (failed.length > 0) t.warn(`${failed.length} label(s) failed`);
      } else {
        t.err(data.error || "Bulk label generation failed");
      }
    } catch (e) {
      t.err(e.message || "Failed to generate labels");
    } finally {
      setActionLoading(false);
    }
  }

  // ==================== DATA LOADING ====================
  async function load() {
    setLoading(true);
    try {
      const params = { q, status, page, limit: 20, excludeSr: "1" };
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
      const profileList = data.data || data.profiles || [];
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

  // Opens a base64 PDF in a new tab
  function openBase64Pdf(base64) {
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  // Smart label handler: Detects provider and prints accordingly
  async function handlePrintLabel(order) {
    const bd = order?.shipping?.bd || {};
    const sr = order?.shipping?.shiprocket || {};

    // 1. SHIPROCKET LABEL
    if (sr.awb) {
      if (sr.labelUrl) {
        window.open(sr.labelUrl, '_blank');
      } else {
        t.info("Fetching Shiprocket Label...");
        try {
          const { data } = await ShipAPI.label([order._id], auth);
          if (data.ok && data.data?.label_url) {
            window.open(data.data.label_url, '_blank');
          } else {
            t.err("Label not found");
          }
        } catch (e) {
          t.err("Failed to fetch Shiprocket label");
        }
      }
      return;
    }

    // 2. BLUEDART LABEL - Generate on demand
    if (bd.awbNumber) {
      t.info("Generating BlueDart Label...");
      try {
        const { data } = await BlueDartAPI.generateLabelOnDemand(order._id, auth);
        if (data.ok && data.data?.pdf) {
          openBase64Pdf(data.data.pdf);
        } else {
          t.err("Failed to generate label");
        }
      } catch (e) {
        t.err(e.message || "Error printing label");
      }
    }
  }

  async function trackOrder(order) {
    const bd = order?.shipping?.bd || {};
    const sr = order?.shipping?.shiprocket || {};

    // 1. Shiprocket Tracking
    if (sr.awb) {
      try {
        // Calls the new ShipAPI.track function
        const { data } = await ShipAPI.track(sr.awb, auth);
        t.success(`Status: ${data?.data?.tracking_data?.shipment_status_current || "Updated"}`);
        await load(); // Refresh to show new status in table
      } catch (error) {
        t.err("Failed to update Shiprocket tracking");
      }
      return;
    }

    // 2. BlueDart Tracking
    const awb = bd.awbNumber;
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

    const orderStatusConfig = {
      'pending': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' },
      'confirmed': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
      'paid': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Paid' },
      'shipped': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Shipped' },
      'delivered': { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Delivered' },
      'refunded': { bg: 'bg-red-100', text: 'text-red-700', label: 'Refunded' },
      'cancelled': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelled' },
    };

    const paymentStatusConfig = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Payment Pending' },
      'paid': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Paid' },
      'partially_paid': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Partial Payment' },
      'failed': { bg: 'bg-red-100', text: 'text-red-700', label: 'Payment Failed' },
      'partially_refunded': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Partial Refund' },
      'refunded': { bg: 'bg-red-100', text: 'text-red-700', label: 'Refunded' },
    };

    if (orderStatus && orderStatusConfig[orderStatus]) {
      badges.push(
        <span key="order" className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${orderStatusConfig[orderStatus].bg} ${orderStatusConfig[orderStatus].text}`}>
          {orderStatusConfig[orderStatus].label}
        </span>
      );
    }

    if (paymentStatus && paymentStatusConfig[paymentStatus]) {
      badges.push(
        <span key="payment" className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${paymentStatusConfig[paymentStatus].bg} ${paymentStatusConfig[paymentStatus].text}`}>
          {paymentStatusConfig[paymentStatus].label}
        </span>
      );
    }

    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  const canCreateShipment = (order) => {
    const paymentStatus = order.payment?.status;
    const hasAwb = order.shipping?.bd?.awbNumber || order.shipping?.shiprocket?.awb;
    const isPaymentComplete = paymentStatus === 'paid' ||
      (paymentStatus === 'partially_paid' && order.payment?.mode === 'half');

    return order.status === 'confirmed' && !hasAwb && isPaymentComplete;
  };

  // Opens the provider choice modal for a single order
  function openProviderChoice(orderId) {
    setProviderOrderId(orderId);
    setShowProviderModal(true);
  }

  // Handle provider selection from the modal
  async function handleProviderSelect(provider) {
    const id = providerOrderId;
    setShowProviderModal(false);
    setProviderOrderId(null);

    if (provider === 'bluedart') {
      setSelected(new Set([id]));
      setTimeout(() => openShipmentModal(), 100);
    } else if (provider === 'shiprocket') {
      openSrWithDimensions([id]);
    }
  }

  // Open the dimensions modal before Phase 1
  function openSrWithDimensions(orderIds) {
    setSrPendingOrderIds(orderIds);
    setSrDimensionsModal(true);
  }

  // Phase 1: create Shiprocket shipments with given dimensions, then open courier selection modal
  async function startShiprocketPhase1(orderIds, dimensions) {
    setSrDimensionsModal(false);
    setActionLoading(true);
    try {
      const { data } = await ShipAPI.create(orderIds, dimensions, auth);
      if (!data.ok) {
        t.error(data.error || "Shiprocket creation failed");
        return;
      }
      const results = data.data;
      if (results.failed?.length > 0) {
        results.failed.forEach(f => t.error(`Order ${String(f.id).slice(-6)}: ${f.error}`));
      }
      if (results.noCourierAvailable?.length > 0) {
        results.noCourierAvailable.forEach(f => t.warn(`No couriers: ${String(f.id).slice(-6)}`));
      }
      if (results.ready?.length > 0) {
        // Pre-select recommended courier for each order
        const defaultSelections = {};
        results.ready.forEach(r => {
          defaultSelections[r.id] = r.recommendedCourierId;
        });
        setSrSelections(defaultSelections);
        setSrCourierData(results.ready);
        setSrCourierModal(true);
        await load(); // refresh orders (they now disappear from Orders page)
      }
    } catch (e) {
      t.error(e.response?.data?.error || "Shiprocket creation failed");
    } finally {
      setActionLoading(false);
    }
  }

  // Phase 2: admin confirmed courier selections → assign AWB + pickup
  async function confirmSrCouriers() {
    const selections = Object.entries(srSelections)
      .filter(([, courierId]) => courierId)
      .map(([orderId, courierId]) => ({ orderId, courierId: Number(courierId) }));

    if (selections.length === 0) {
      t.warn("Please select a courier for each order");
      return;
    }

    setActionLoading(true);
    try {
      const { data } = await ShipAPI.assignCourier(selections, auth);
      if (data.ok) {
        const { success = [], failed = [] } = data.data;
        if (success.length > 0) t.success(`${success.length} shipment(s) dispatched!`);
        if (failed.length > 0) failed.forEach(f => t.error(`Order ${String(f.id).slice(-6)}: ${f.error}`));
        setSrCourierModal(false);
        setSrCourierData([]);
        setSrSelections({});
        setSelected(new Set());
      } else {
        t.error(data.error || "Courier assignment failed");
      }
    } catch (e) {
      t.error(e.response?.data?.error || "Courier assignment failed");
    } finally {
      setActionLoading(false);
    }
  }

  const canRefund = (order) => {
    const paymentStatus = order.payment?.status;
    const paidAmount = order.payment?.paidAmount || 0;

    return (paymentStatus === 'paid' || paymentStatus === 'partially_paid') &&
      paidAmount > 0 &&
      order.status !== 'refunded';
  };

  async function generatePaymentLink(order) {
    const dueAmount = Math.max(0, (order.amount || 0) - (order.payment?.paidAmount || 0));
    if (dueAmount <= 0) { t.warn('No due amount to generate a link for'); return; }
    try {
      const { data } = await api.post('/payments/razorpay/payment-link', {
        orderId: order._id,
        amountInRupees: dueAmount,
        customer: {
          name: order.customer?.name || '',
          email: order.customer?.email || '',
          phone: order.customer?.phone || ''
        }
      }, auth);
      if (data.ok) {
        t.success('Payment link generated! Customer can now pay online.');
        await load();
      } else {
        t.err(data.error || 'Failed to generate payment link');
      }
    } catch (e) {
      t.err(e?.response?.data?.error || 'Failed to generate payment link');
    }
  }

  // ==================== OFFLINE ORDER ====================
  function resetOfflineForm() {
    setOfflineForm({
      customer: { name: '', email: '', phone: '' },
      items: [],
      shipping: { address: '', city: '', state: '', pincode: '', country: 'India' },
      payment: { method: 'cash', paidAmount: '', status: '' },
      shippingFee: '',
      serviceFee: '',
      taxAmount: '',
      couponCode: '',
      status: 'confirmed',
      adminNotes: ''
    });
    setBookSearch('');
    setBookResults([]);
    setOfflinePaymentLink(null);
  }

  async function searchBooks(q) {
    if (!q.trim()) { setBookResults([]); return; }
    setBookSearchLoading(true);
    try {
      const { data } = await api.get('/books', { params: { q, limit: 10 }, ...auth });
      setBookResults(data.books || data.items || []);
    } catch (e) {
      // silent
    } finally {
      setBookSearchLoading(false);
    }
  }

  function addBookToOrder(book) {
    const existing = offlineForm.items.find(i => i.bookId === String(book._id));
    if (existing) {
      setOfflineForm(prev => ({
        ...prev,
        items: prev.items.map(i =>
          i.bookId === String(book._id) ? { ...i, qty: i.qty + 1 } : i
        )
      }));
    } else {
      setOfflineForm(prev => ({
        ...prev,
        items: [...prev.items, {
          bookId: String(book._id),
          title: book.title,
          qty: 1,
          unitPrice: book.price || 0
        }]
      }));
    }
    setBookSearch('');
    setBookResults([]);
  }

  function removeBookFromOrder(bookId) {
    setOfflineForm(prev => ({ ...prev, items: prev.items.filter(i => i.bookId !== bookId) }));
  }

  function updateItemField(bookId, field, value) {
    setOfflineForm(prev => ({
      ...prev,
      items: prev.items.map(i => i.bookId === bookId ? { ...i, [field]: value } : i)
    }));
  }

  const offlineSubtotal = offlineForm.items.reduce((s, i) => s + (Number(i.unitPrice) || 0) * (Number(i.qty) || 0), 0);
  const offlineGrandTotal = offlineSubtotal +
    (Number(offlineForm.shippingFee) || 0) +
    (Number(offlineForm.serviceFee) || 0) +
    (Number(offlineForm.taxAmount) || 0);

  async function submitOfflineOrder() {
    const { customer, items, shipping, payment, shippingFee, serviceFee, taxAmount, couponCode, status, adminNotes } = offlineForm;
    if (!customer.email && !customer.phone) {
      t.warn('Customer email or phone is required');
      return;
    }
    if (!items.length) {
      t.warn('Add at least one item');
      return;
    }

    const isOnline = payment.method === 'online';

    setOfflineOrderSaving(true);
    try {
      const payload = {
        customer,
        items: items.map(i => ({ bookId: i.bookId, qty: Number(i.qty) || 1, unitPrice: Number(i.unitPrice) || 0 })),
        shipping,
        payment: {
          method: payment.method,
          paidAmount: isOnline ? 0 : (payment.paidAmount !== '' ? Number(payment.paidAmount) : 0),
          ...((!isOnline && payment.status) && { status: payment.status })
        },
        shippingFee: shippingFee !== '' ? Number(shippingFee) : 0,
        serviceFee: serviceFee !== '' ? Number(serviceFee) : 0,
        taxAmount: taxAmount !== '' ? Number(taxAmount) : 0,
        status: isOnline ? 'pending' : status,
        adminNotes,
        ...(couponCode.trim() && { couponCode: couponCode.trim().toUpperCase() }),
      };

      const { data } = await api.post('/orders/admin', payload, auth);
      if (!data.ok) {
        t.err(data.error || 'Failed to create order');
        return;
      }

      const orderId = data.order._id;
      const orderRef = String(orderId).slice(-8).toUpperCase();

      // For online payment: generate Razorpay payment link
      if (isOnline) {
        const linkRes = await api.post('/payments/razorpay/payment-link', {
          orderId,
          amountInRupees: offlineGrandTotal,
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone
          }
        }, auth);

        if (linkRes.data.ok) {
          setOfflinePaymentLink({
            url: linkRes.data.paymentLink,
            orderId,
            orderRef
          });
          t.success(`Order #${orderRef} created! Payment link ready.`);
          await load();
        } else {
          t.warn(`Order #${orderRef} created but payment link failed: ${linkRes.data.error}`);
          setShowOfflineOrderModal(false);
          resetOfflineForm();
          await load();
        }
      } else {
        t.success(`Offline order created! #${orderRef}`);
        setShowOfflineOrderModal(false);
        resetOfflineForm();
        await load();
      }
    } catch (e) {
      t.err(e?.response?.data?.error || e?.message || 'Failed to create order');
    } finally {
      setOfflineOrderSaving(false);
    }
  }

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => { resetOfflineForm(); setShowOfflineOrderModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Offline Order
            </button>
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
          <div className="bg-gradient-to-br from-blue-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-100 mb-1">Ready to Ship</p>
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
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-100 mb-1">Selected</p>
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
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Phone, AWB..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cx(
              "flex items-center gap-2 px-5 py-3 border rounded-xl text-sm font-medium transition-colors shadow-sm",
              showFilters
                ? "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            <svg className={cx("w-4 h-4 transition-transform", showFilters && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
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
                    <span className="ml-2 text-xs text-blue-600">({profiles.length} available)</span>
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

          </div>
        )}

        {/* Bulk Actions Bar - Always visible when orders are selected */}
        {hasSelection && (
          <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-4 mb-6 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {selected.size} selected
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            {/* BlueDart Actions */}
            <button
              onClick={openShipmentModal}
              disabled={actionLoading || !selectedProfile}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Truck className="w-4 h-4" />
              BlueDart ({selected.size})
            </button>
            <button
              onClick={bulkPrintLabels}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Labels
            </button>

            {/* Shiprocket Phase 1 bulk */}
            <button
              onClick={() => openSrWithDimensions(Array.from(selected))}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#384959] text-white text-sm font-medium rounded-lg hover:bg-[#6A89A7] transition-colors disabled:opacity-50"
            >
              <Rocket className="w-4 h-4" />
              Shiprocket ({selected.size})
            </button>

            <button
              onClick={() => setSelected(new Set())}
              className="ml-auto px-4 py-2 border border-gray-300 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left w-12">
                    <input
                      type="checkbox"
                      checked={allOnPageIds.length > 0 && allOnPageIds.every(id => selected.has(id))}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Shipping</th>
                  <th scope="col" className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan="9" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600"></div>
                        <span className="text-sm text-gray-500">Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">No orders found</p>
                        <p className="text-xs text-gray-400">Try adjusting your filters or search</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && items.map((o) => {
                  const id = String(o._id);
                  const dt = o.createdAt ? new Date(o.createdAt) : null;
                  const rupees = Number(o.amount || 0).toFixed(2);
                  const bd = o?.shipping?.bd || {};
                  const sr = o?.shipping?.shiprocket || {};
                  const activeShipment = sr.awb ? { provider: 'shiprocket', awb: sr.awb, status: sr.status, courier: sr.courierName }
                    : bd.awbNumber ? { provider: 'bluedart', awb: bd.awbNumber, status: bd.status, courier: 'BlueDart' }
                      : null;

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
                        {o.source === 'offline' && (
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Offline
                          </span>
                        )}
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

                          // ✅ GET SKU FROM POPULATED BOOK ID
                          const sku = item.bookId?.inventory?.sku || "N/A";

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

                                {/* ✅ DISPLAY SKU HERE */}
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                  SKU: <span className="text-gray-600 text-[15px]">{sku}</span>
                                </p>
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

                      {/* ✅ UPDATED SHIPPING COLUMN */}
                      <td className="px-6 py-4">
                        {activeShipment ? (
                          <div className="space-y-1">
                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${activeShipment.provider === 'shiprocket' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {activeShipment.provider === 'shiprocket' ? <Rocket size={10} /> : <Truck size={10} />}
                              {activeShipment.provider}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-mono text-gray-900 font-medium">{activeShipment.awb}</span>
                            </div>
                            {activeShipment.courier && <div className="text-[10px] text-gray-500">{activeShipment.courier}</div>}
                            {activeShipment.status && <span className="text-xs text-blue-600 font-medium">{activeShipment.status}</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No AWB</span>
                        )}
                      </td>

                      {/* ✅ UPDATED ACTIONS COLUMN */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {/* View Details */}
                          <button
                            onClick={() => { setDetailOrder(o); setShowDetailModal(true); }}
                            title="View Order Details"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {activeShipment ? (
                            <>
                              <button onClick={() => handlePrintLabel(o)} title="Print Label" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Printer className="w-4 h-4 text-gray-600" />
                              </button>

                              <button onClick={() => trackOrder(o)} title="Track Order" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <MapPin className="w-4 h-4 text-gray-600" />
                              </button>

                            </>
                          ) : canCreateShipment(o) ? (
                            <button
                              onClick={() => openProviderChoice(id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
                            >
                              Create Shipment
                            </button>
                          ) : null}

                          {/* Generate Payment Link for pending/partial orders without a link */}
                          {['pending', 'partially_paid'].includes(o.payment?.status) && !o.payment?.paymentLinkId && (
                            <button
                              onClick={() => generatePaymentLink(o)}
                              title="Generate a Razorpay payment link to share with the customer"
                              className="px-3 py-1.5 bg-indigo-50 border border-indigo-300 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100"
                            >
                              Generate Link
                            </button>
                          )}

                          {/* Check Payment button for orders with a pending payment link */}
                          {o.payment?.status === 'pending' && o.payment?.paymentLinkId && (
                            <button
                              onClick={async () => {
                                try {
                                  const { data } = await api.post(`/payments/razorpay/check-payment/${o._id}`, {}, auth);
                                  if (data.ok && data.updated) {
                                    t.success('Payment confirmed! Order updated.');
                                    await load();
                                  } else {
                                    t.warn(`Payment not received yet (status: ${data.status})`);
                                  }
                                } catch (e) {
                                  t.err(e?.response?.data?.error || 'Failed to check payment');
                                }
                              }}
                              title="Check if customer has paid"
                              className="px-3 py-1.5 bg-blue-50 border border-blue-300 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100"
                            >
                              Check Payment
                            </button>
                          )}

                          {canRefund(o) && (
                            <button onClick={() => openRefundModal(o)} title="Refund" className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50">Refund</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && items.length > 0 && (
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing <span className="font-medium text-gray-700">{items.length}</span> of <span className="font-medium text-gray-700">{total}</span> orders
              </p>
              {total > 20 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-600 font-medium px-2">Page {page}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={items.length < 20}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Shipment Modal */}
      {showShipmentModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={() => !actionLoading && setShowShipmentModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-5 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-blue-100">
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

      {/* Shiprocket — Package Dimensions Modal (Phase 0, shown before Phase 1) */}
      {srDimensionsModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-60" onClick={() => setSrDimensionsModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Package Dimensions</h3>
                    <p className="text-sm text-gray-500">{srPendingOrderIds.length} order(s) — applied to all</p>
                  </div>
                </div>
                <button onClick={() => setSrDimensionsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Weight (kg)</label>
                  <input
                    type="number" min="0.1" step="0.1"
                    value={srDimensions.weight}
                    onChange={e => setSrDimensions(p => ({ ...p, weight: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Length (cm)</label>
                  <input
                    type="number" min="1" step="1"
                    value={srDimensions.length}
                    onChange={e => setSrDimensions(p => ({ ...p, length: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Breadth (cm)</label>
                  <input
                    type="number" min="1" step="1"
                    value={srDimensions.breadth}
                    onChange={e => setSrDimensions(p => ({ ...p, breadth: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Height (cm)</label>
                  <input
                    type="number" min="1" step="1"
                    value={srDimensions.height}
                    onChange={e => setSrDimensions(p => ({ ...p, height: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSrDimensionsModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => startShiprocketPhase1(srPendingOrderIds, {
                    weight: Number(srDimensions.weight) || 0.5,
                    length: Number(srDimensions.length) || 20,
                    breadth: Number(srDimensions.breadth) || 15,
                    height: Number(srDimensions.height) || 5,
                  })}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700"
                >
                  Get Couriers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shiprocket Courier Selection Modal */}
      {srCourierModal && srCourierData.length > 0 && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-60" onClick={() => !actionLoading && setSrCourierModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Select Courier</h3>
                    <p className="text-sm text-gray-500">Choose a courier for each order, then confirm</p>
                  </div>
                </div>
                <button onClick={() => setSrCourierModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                {srCourierData.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-mono text-gray-500 mb-3">Order #{String(order.id).slice(-8)}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {order.couriers.map(c => (
                        <label
                          key={c.courier_company_id}
                          className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${String(srSelections[order.id]) === String(c.courier_company_id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`courier-${order.id}`}
                              value={c.courier_company_id}
                              checked={String(srSelections[order.id]) === String(c.courier_company_id)}
                              onChange={() => setSrSelections(prev => ({ ...prev, [order.id]: c.courier_company_id }))}
                              className="accent-purple-600"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{c.courier_name}</p>
                              <p className="text-xs text-gray-500">Delivery: {c.etd}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">₹{c.rate}</p>
                            {c.is_recommended && (
                              <span className="text-[10px] text-purple-600 font-medium bg-purple-100 px-1.5 py-0.5 rounded">Recommended</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSrCourierModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSrCouriers}
                  disabled={actionLoading || srCourierData.some(o => !srSelections[o.id])}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Confirm & Dispatch"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ORDER DETAIL MODAL ==================== */}
      {showDetailModal && detailOrder && (() => {
        const o = detailOrder;
        const payMethodLabels = { cash: "Cash", upi: "UPI", card: "Card / POS", bank_transfer: "Bank Transfer", cheque: "Cheque", cod: "Cash on Delivery", online: "Online (Payment Link)", other: "Other" };
        const subtotal = (o.items || []).reduce((s, i) => s + (i.unitPrice || 0) * (i.qty || 0), 0);
        return (
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-start justify-center min-h-screen pt-6 px-4 pb-20">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-60" onClick={() => setShowDetailModal(false)}></div>
              <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl z-10">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">Order #{String(o._id).slice(-8).toUpperCase()}</h3>
                        {o.source === 'offline' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Offline</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : ''}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">

                  {/* Customer */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</h4>
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">{o.shipping?.name || o.userId?.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-gray-900 break-all">{o.email || o.shipping?.email || o.userId?.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{o.phone || o.shipping?.phone || o.userId?.phone || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items</h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-16">Qty</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-24">Price</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-24">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(o.items || []).map((item, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-gray-900">{item.bookId?.inventory?.sku || '—'}</td>
                              <td className="px-3 py-2 text-center text-gray-700">{item.qty}</td>
                              <td className="px-3 py-2 text-right text-gray-700">₹{(item.unitPrice || 0).toFixed(2)}</td>
                              <td className="px-3 py-2 text-right font-medium text-gray-900">₹{((item.unitPrice || 0) * (item.qty || 0)).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="bg-gray-50 px-3 py-2.5 flex flex-col items-end gap-0.5 text-xs text-gray-600 border-t border-gray-200">
                        <span>Subtotal: ₹{subtotal.toFixed(2)}</span>
                        {(o.shippingAmount > 0) && <span>Shipping: ₹{(o.shippingAmount).toFixed(2)}</span>}
                        {(o.serviceFee > 0) && <span>Service Fee: ₹{(o.serviceFee).toFixed(2)}</span>}
                        {(o.taxAmount > 0) && <span>Tax: ₹{(o.taxAmount).toFixed(2)}</span>}
                        <span className="text-base font-bold text-gray-900 mt-1">Grand Total: ₹{(o.amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h4>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800">
                      {[o.shipping?.address, o.shipping?.city, o.shipping?.state, o.shipping?.pincode, o.shipping?.country]
                        .filter(Boolean).join(', ') || '—'}
                    </div>
                  </div>

                  {/* Payment */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment</h4>
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Method</p>
                        <p className="font-medium text-gray-900">
                          {o.source === 'offline'
                            ? (payMethodLabels[o.offlinePaymentMethod] || o.offlinePaymentMethod || 'Offline')
                            : (o.payment?.provider || 'Razorpay')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-medium text-gray-900 capitalize">{o.payment?.status || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Paid</p>
                        <p className="font-semibold text-green-700">₹{(o.payment?.paidAmount || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Due</p>
                        {(() => {
                          const due = Math.max(0, (o.amount || 0) - (o.payment?.paidAmount || 0));
                          return <p className={`font-semibold ${due > 0 ? 'text-red-600' : 'text-gray-400'}`}>₹{due.toFixed(2)}</p>;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Payment Link */}
                  {o.payment?.paymentLinkUrl ? (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Link</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-blue-700 font-mono truncate">{o.payment.paymentLinkUrl}</p>
                          <p className="text-xs text-blue-500 mt-0.5">
                            {o.payment.status === 'paid' ? '✓ Payment completed' : 'Awaiting customer payment'}
                          </p>
                        </div>
                        <button
                          onClick={() => { navigator.clipboard.writeText(o.payment.paymentLinkUrl); t.success('Link copied!'); }}
                          className="flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                        >
                          Copy
                        </button>
                        {o.payment.status !== 'paid' && (
                          <button
                            onClick={() => generatePaymentLink(o)}
                            title="Generate a new payment link (old one will be replaced)"
                            className="flex-shrink-0 px-3 py-1.5 bg-white border border-blue-300 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-50"
                          >
                            Regenerate
                          </button>
                        )}
                      </div>
                    </div>
                  ) : ['pending', 'partially_paid'].includes(o.payment?.status) ? (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Link</h4>
                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-500">No payment link generated yet. Click to create one for the customer.</p>
                        <button
                          onClick={() => generatePaymentLink(o)}
                          className="flex-shrink-0 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
                        >
                          Generate Link
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Admin Notes */}
                  {o.adminNotes && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Admin Notes</h4>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 whitespace-pre-wrap">
                        {o.adminNotes}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                  <button onClick={() => setShowDetailModal(false)} className="px-5 py-2 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-900">
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* Offline Order Modal */}
      {showOfflineOrderModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen pt-6 px-4 pb-20">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-60 transition-opacity" onClick={() => !offlineOrderSaving && setShowOfflineOrderModal(false)}></div>

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl z-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">New Offline Order</h3>
                    <p className="text-sm text-gray-500">Walk-in / Phone / WhatsApp order</p>
                  </div>
                </div>
                <button onClick={() => !offlineOrderSaving && setShowOfflineOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto">

                {/* Customer Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Customer
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={offlineForm.customer.name}
                        onChange={e => setOfflineForm(prev => ({ ...prev, customer: { ...prev.customer, name: e.target.value } }))}
                        placeholder="Customer name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={offlineForm.customer.email}
                        onChange={e => setOfflineForm(prev => ({ ...prev, customer: { ...prev.customer, email: e.target.value } }))}
                        placeholder="email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={offlineForm.customer.phone}
                        onChange={e => setOfflineForm(prev => ({ ...prev, customer: { ...prev.customer, phone: e.target.value } }))}
                        placeholder="10-digit phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    Items *
                  </h4>
                  {/* Book Search */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={bookSearch}
                      onChange={e => { setBookSearch(e.target.value); searchBooks(e.target.value); }}
                      placeholder="Search books by title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {bookSearchLoading && (
                      <div className="absolute right-3 top-2.5">
                        <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full"></div>
                      </div>
                    )}
                    {bookResults.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {bookResults.map(book => (
                          <button
                            key={book._id}
                            type="button"
                            onClick={() => addBookToOrder(book)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-green-50 text-left border-b border-gray-100 last:border-0"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                              <p className="text-xs text-gray-500">₹{book.price || 0} · {book.inventory?.sku || 'No SKU'}</p>
                            </div>
                            <span className="text-xs text-green-600 font-medium">+ Add</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Items */}
                  {offlineForm.items.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Book</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-20">Qty</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-28">Price (₹)</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-24">Total</th>
                            <th className="w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {offlineForm.items.map(item => (
                            <tr key={item.bookId}>
                              <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-[200px]">{item.title}</td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={e => updateItemField(item.bookId, 'qty', e.target.value)}
                                  className="w-full text-center border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unitPrice}
                                  onChange={e => updateItemField(item.bookId, 'unitPrice', e.target.value)}
                                  className="w-full text-center border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                                ₹{((Number(item.unitPrice) || 0) * (Number(item.qty) || 0)).toFixed(2)}
                              </td>
                              <td className="px-2 py-2">
                                <button onClick={() => removeBookFromOrder(item.bookId)} className="text-gray-400 hover:text-red-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-400">Search and add books above</p>
                    </div>
                  )}
                </div>

                {/* Shipping Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Shipping Address
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={offlineForm.shipping.address}
                      onChange={e => setOfflineForm(prev => ({ ...prev, shipping: { ...prev.shipping, address: e.target.value } }))}
                      placeholder="Street address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={offlineForm.shipping.city}
                        onChange={e => setOfflineForm(prev => ({ ...prev, shipping: { ...prev.shipping, city: e.target.value } }))}
                        placeholder="City"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={offlineForm.shipping.state}
                        onChange={e => setOfflineForm(prev => ({ ...prev, shipping: { ...prev.shipping, state: e.target.value } }))}
                        placeholder="State"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={offlineForm.shipping.pincode}
                        onChange={e => setOfflineForm(prev => ({ ...prev, shipping: { ...prev.shipping, pincode: e.target.value } }))}
                        placeholder="Pincode"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={offlineForm.shipping.country}
                        onChange={e => setOfflineForm(prev => ({ ...prev, shipping: { ...prev.shipping, country: e.target.value } }))}
                        placeholder="Country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment & Pricing Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Payment & Pricing
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
                      <select
                        value={offlineForm.payment.method}
                        onChange={e => setOfflineForm(prev => ({ ...prev, payment: { ...prev.payment, method: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="cash">Cash</option>
                        <option value="online">Online (Payment Link)</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card / POS</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cod">Cash on Delivery</option>
                        <option value="other">Other</option>
                      </select>
                      {offlineForm.payment.method === 'online' && (
                        <p className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          A Razorpay payment link will be generated to share with the customer
                        </p>
                      )}
                    </div>
                    {offlineForm.payment.method !== 'online' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Amount Paid (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={offlineForm.payment.paidAmount}
                          onChange={e => setOfflineForm(prev => ({ ...prev, payment: { ...prev.payment, paidAmount: e.target.value } }))}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    )}
                    {offlineForm.payment.method !== 'online' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status <span className="text-gray-400">(auto if blank)</span></label>
                        <select
                          value={offlineForm.payment.status}
                          onChange={e => setOfflineForm(prev => ({ ...prev, payment: { ...prev.payment, status: e.target.value } }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Auto (based on paid amount)</option>
                          <option value="paid">Paid</option>
                          <option value="partially_paid">Partially Paid</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Order Status</label>
                      <select
                        value={offlineForm.status}
                        onChange={e => setOfflineForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Coupon Code <span className="text-gray-400">(optional)</span></label>
                    <input
                      type="text"
                      value={offlineForm.couponCode}
                      onChange={e => setOfflineForm(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                      placeholder="e.g. SAVE20 — applied by server"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono tracking-widest uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Shipping Fee (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={offlineForm.shippingFee}
                        onChange={e => setOfflineForm(prev => ({ ...prev, shippingFee: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Service Fee (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={offlineForm.serviceFee}
                        onChange={e => setOfflineForm(prev => ({ ...prev, serviceFee: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Grand Total Preview */}
                  {offlineForm.items.length > 0 && (
                    <div className="mt-3 bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div>Subtotal: ₹{offlineSubtotal.toFixed(2)}</div>
                        {(Number(offlineForm.shippingFee) > 0) && <div>Shipping: ₹{Number(offlineForm.shippingFee).toFixed(2)}</div>}
                        {(Number(offlineForm.serviceFee) > 0) && <div>Service Fee: ₹{Number(offlineForm.serviceFee).toFixed(2)}</div>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Grand Total</p>
                        <p className="text-xl font-bold text-gray-900">₹{offlineGrandTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Admin Notes <span className="text-xs font-normal text-gray-400">(included in confirmation email)</span></label>
                  <textarea
                    rows={2}
                    value={offlineForm.adminNotes}
                    onChange={e => setOfflineForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                    placeholder="e.g. Customer called, address confirmed, special instructions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Payment Link Success Panel */}
              {offlinePaymentLink && (
                <div className="mx-6 mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Order #{offlinePaymentLink.orderRef} created — Payment link ready
                      </p>
                      <p className="text-xs text-blue-700 mb-2">Share this link with the customer. Order will auto-confirm once payment is done.</p>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={offlinePaymentLink.url}
                          className="flex-1 px-2 py-1.5 text-xs bg-white border border-blue-300 rounded-lg font-mono text-blue-800 truncate"
                        />
                        <button
                          onClick={() => { navigator.clipboard.writeText(offlinePaymentLink.url); t.success('Link copied!'); }}
                          className="flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => { setShowOfflineOrderModal(false); resetOfflineForm(); }}
                  disabled={offlineOrderSaving}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  {offlinePaymentLink ? 'Done' : 'Cancel'}
                </button>
                {!offlinePaymentLink && (
                  <button
                    onClick={submitOfflineOrder}
                    disabled={offlineOrderSaving || !offlineForm.items.length || (!offlineForm.customer.email && !offlineForm.customer.phone)}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {offlineOrderSaving
                      ? (offlineForm.payment.method === 'online' ? 'Generating link...' : 'Creating...')
                      : (offlineForm.payment.method === 'online' ? 'Create & Generate Link' : 'Create Order')
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Choice Modal */}
      {showProviderModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={() => setShowProviderModal(false)}></div>

            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-3">
                  <Truck className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Choose Shipping Provider</h3>
                <p className="text-sm text-gray-500 mt-1">Select a provider to create the shipment</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleProviderSelect('bluedart')}
                  disabled={!selectedProfile}
                  className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">BlueDart</p>
                    <p className="text-xs text-gray-500 mt-0.5">Express Delivery</p>
                  </div>
                  {!selectedProfile && (
                    <p className="text-[10px] text-red-500">No profile selected</p>
                  )}
                </button>

                <button
                  onClick={() => handleProviderSelect('shiprocket')}
                  className="flex flex-col items-center gap-3 p-5 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Rocket className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Shiprocket</p>
                    <p className="text-xs text-gray-500 mt-0.5">Multi-Courier</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowProviderModal(false)}
                className="w-full mt-4 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
