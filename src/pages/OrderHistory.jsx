// src/pages/OrderHistory.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCustomer } from "../contexts/CustomerAuth";
import { 
    Package, Truck, CheckCircle, Clock, XCircle, 
    ArrowLeft, Search, Copy, ExternalLink, RefreshCw, 
    Calendar, CreditCard, MapPin, ChevronRight, ChevronLeft,
    FileText 
} from "lucide-react";

// Helper to load Razorpay script
function loadRzp() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    document.body.appendChild(s);
  });
}

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();
  const topRef = useRef(null);
  
  const { isCustomer, loading: customerLoading } = useCustomer();
  const bgImage = "url('/images/terms-bg.png')";

  useEffect(() => {
    if (customerLoading) return;
    fetchOrders();
  }, [page, statusFilter, customerLoading, isCustomer]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!isCustomer) {
        navigate("/login", { state: { next: "/profile/orders" } });
        return;
      }
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get("/customer/orders", { meta: { auth: "customer" }, params });
      const data = res?.data || {};
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotalPages(Number(data.pagination?.totalPages || 1));
      setTotalOrders(Number(data.pagination?.total || 0));
      if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("customer_jwt");
        navigate("/login", { state: { next: "/profile/orders" } });
      }
    } finally { setLoading(false); }
  };

  const retryPayment = async (order) => {
    try {
      const amountToPay = order.payment.dueAmount > 0 
        ? order.payment.dueAmount 
        : (order.amount - (order.payment.paidAmount || 0));

      if (amountToPay <= 0) return alert("Order is already paid!");

      const { data } = await api.post("/payments/razorpay/order", {
        amountInRupees: amountToPay,
        orderId: order._id,
        paymentType: order.payment.paymentType,
      });

      if (!data.ok) throw new Error(data.error);

      await loadRzp();
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Kiddos Intellect",
        description: `Retry Order #${String(order._id).slice(-8)}`,
        order_id: data.order.id,
        handler: async function (response) {
          const verifyRes = await api.post("/payments/razorpay/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId: data.paymentId,
          });
          if (verifyRes.data.ok) {
            alert("Payment Successful!");
            fetchOrders();
          }
        },
        theme: { color: "#1A3C34" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment retry failed. Please try again.");
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  const openTracking = (awb) => awb ? window.open('https://bluedart.com/tracking', '_blank') : alert("No tracking number");
  const copyAwb = (awb) => { navigator.clipboard.writeText(awb); alert("AWB Copied!"); };
  const handlePageChange = (n) => { if (n >= 1 && n <= totalPages) setPage(n); };

  const getOrderStatusStyles = (status) => {
    const map = {
      pending: { bg: "bg-[#FFF9F0]", text: "text-[#8A6A4B]", border: "border-[#F5E6D3]", icon: Clock },
      confirmed: { bg: "bg-[#E8F4F8]", text: "text-[#2C5282]", border: "border-[#BEE3F8]", icon: CheckCircle },
      paid: { bg: "bg-[#E8F0EB]", text: "text-[#2F523F]", border: "border-[#DCE4E0]", icon: CreditCard },
      shipped: { bg: "bg-[#F0F5FF]", text: "text-[#4338CA]", border: "border-[#E0E7FF]", icon: Truck },
      delivered: { bg: "bg-[#1A3C34]", text: "text-white", border: "border-[#1A3C34]", icon: Package },
      refunded: { bg: "bg-[#FFF5F5]", text: "text-[#C53030]", border: "border-[#FED7D7]", icon: RefreshCw },
      cancelled: { bg: "bg-[#F4F7F5]", text: "text-[#8BA699]", border: "border-[#E3E8E5]", icon: XCircle },
    };
    return map[status] || map.pending;
  };

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] pb-20">
      <div className="relative w-full pt-20 md:pt-28 pb-12 px-6 border-b border-[#E3E8E5] bg-[#1A3C34] overflow-hidden">
         <div className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-soft-light" style={{ backgroundImage: bgImage, backgroundSize: 'cover', filter: 'grayscale(100%)' }} />
         <div className="relative z-10 max-w-7xl 2xl:max-w-[1600px] mx-auto">
            <button onClick={() => navigate("/profile")} className="flex items-center gap-2 text-[#8BA699] hover:text-white mb-6 transition-colors text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back to Profile</button>
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div><h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">Order History</h1><p className="text-[#8BA699] text-lg font-light">Track, return, or buy things again.</p></div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10"><Package className="w-5 h-5 text-[#4A7C59]" /><span className="text-white font-medium">{totalOrders} Orders</span></div>
            </div>
         </div>
      </div>
      <div ref={topRef} />

      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 -mt-8 relative z-20">
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
                {["", "pending", "confirmed", "shipped", "delivered", "cancelled"].map(status => (
                <button key={status} onClick={() => { setStatusFilter(status); setPage(1); }} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${statusFilter === status ? "bg-[#1A3C34] text-white border-[#1A3C34]" : "bg-white text-[#5C756D] border-[#E3E8E5]"}`}>{status === "" ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1)}</button>
                ))}
            </div>
        </div>

        {loading && <div className="text-center py-20"><div className="w-12 h-12 border-4 border-[#1A3C34] rounded-full animate-spin mx-auto mb-4"></div><p>Loading...</p></div>}
        {!loading && orders.length === 0 && <div className="text-center py-20 bg-white rounded-3xl border border-[#E3E8E5]"><Package className="w-10 h-10 text-[#8BA699] mx-auto mb-4"/><h3 className="text-2xl font-bold text-[#1A3C34]">No orders found</h3><button onClick={() => navigate("/catalog")} className="mt-6 px-8 py-3 bg-[#1A3C34] text-white rounded-xl font-bold">Browse Books</button></div>}

        <div className="space-y-6">
            {orders.map((order) => {
                const statusStyle = getOrderStatusStyles(order.status);
                const StatusIcon = statusStyle.icon;
                return (
                    <div key={order._id} className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-[#FAFBF9] px-6 py-4 border-b border-[#E3E8E5] flex flex-wrap justify-between items-center">
                            <div className="flex gap-10 text-sm">
                                <div><p className="text-[#8BA699] text-xs font-bold mb-1">Order Placed</p><p className="font-medium">{formatDate(order.createdAt)}</p></div>
                                <div><p className="text-[#8BA699] text-xs font-bold mb-1">Total</p><p className="font-bold text-[#1A3C34]">{formatCurrency(order.amount)}</p></div>
                                <div className="hidden sm:block"><p className="text-[#8BA699] text-xs font-bold mb-1">Order ID</p><p className="font-mono text-[#5C756D]">#{String(order._id).slice(-8).toUpperCase()}</p></div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border ${statusStyle.bg} ${statusStyle.border}`}><StatusIcon className={`w-4 h-4 ${statusStyle.text}`} /><span className={`text-xs font-bold uppercase ${statusStyle.text}`}>{order.status}</span></div>
                        </div>
                        <div className="p-6">
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-4">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4"><img src={item.image || "/placeholder.png"} className="w-20 h-24 object-cover rounded-lg border border-[#E3E8E5]" /><div className="flex-1"><h4 className="font-bold text-[#1A3C34]">{item.title}</h4><p className="text-sm text-[#5C756D]">Qty: {item.qty}</p><p className="font-bold text-[#1A3C34]">{formatCurrency(item.unitPrice)}</p></div></div>
                                    ))}
                                </div>
                                <div className="space-y-6 lg:border-l border-[#E3E8E5] lg:pl-8">
                                    {order.shipping?.bd?.awbNumber ? (
                                        <div className="bg-[#F4F7F5] rounded-xl p-4 border border-[#DCE4E0]"><h5 className="font-bold text-[#1A3C34] mb-3 flex gap-2"><Truck className="w-4 h-4"/> Tracking</h5><p className="font-mono bg-white px-2 py-1 rounded border mb-4">{order.shipping.bd.awbNumber}</p><div className="grid grid-cols-2 gap-2"><button onClick={() => openTracking(order.shipping.bd.awbNumber)} className="bg-[#1A3C34] text-white px-3 py-2 rounded-lg text-xs font-bold">Track</button><button onClick={() => copyAwb(order.shipping.bd.awbNumber)} className="bg-white border text-[#5C756D] px-3 py-2 rounded-lg text-xs font-bold">Copy</button></div></div>
                                    ) : (<div className="bg-[#FFF9F0] rounded-xl p-4 border border-[#F5E6D3]"><p className="text-sm text-[#8A6A4B] font-medium flex gap-2"><Clock className="w-4 h-4"/> Preparing Shipment</p></div>)}
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#FAFBF9] px-6 py-3 border-t border-[#E3E8E5] flex justify-end gap-3">
                            <button onClick={() => window.open(`/invoice/${order._id}`, '_blank')} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1A3C34] border border-[#1A3C34] rounded-lg hover:bg-[#E8F0EB]"><FileText className="w-4 h-4"/> Invoice</button>
                            {(order.payment.status === 'pending' || order.payment.status === 'failed') && order.payment.paymentType !== 'full_cod' && (
                                <button onClick={() => retryPayment(order)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#1A3C34] rounded-lg hover:bg-[#2F523F]"><CreditCard className="w-4 h-4"/> Retry Payment</button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
        {totalPages > 1 && <div className="mt-12 flex justify-center items-center gap-4"><button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="w-10 h-10 rounded-full bg-white border flex items-center justify-center"><ChevronLeft/></button><span>Page {page} of {totalPages}</span><button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="w-10 h-10 rounded-full bg-white border flex items-center justify-center"><ChevronRight/></button></div>}
      </div>
    </div>
  );
};

export default OrderHistory;