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

  // --- VRINDAVAN THEME ASSETS ---
  const parchmentBg = "url('/images/homepage/parchment-bg.png')";
  const mandalaBg = "url('/images/homepage/mandala-bg.png')";

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
        theme: { color: "#3E2723" },
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

  // --- THEMED STATUS BADGES ---
  const getOrderStatusStyles = (status) => {
    const map = {
      pending:   { bg: "bg-[#FFF9E6]", text: "text-[#8A7A5E]", border: "border-[#D4AF37]/30", icon: Clock },
      confirmed: { bg: "bg-[#E3F2FD]", text: "text-[#1565C0]", border: "border-[#90CAF9]", icon: CheckCircle }, // Keep blue for confirmation
      paid:      { bg: "bg-[#F1F8E9]", text: "text-[#33691E]", border: "border-[#C5E1A5]", icon: CreditCard },
      shipped:   { bg: "bg-[#F3E5AB]", text: "text-[#3E2723]", border: "border-[#D4AF37]", icon: Truck },
      delivered: { bg: "bg-[#3E2723]", text: "text-[#F3E5AB]", border: "border-[#3E2723]", icon: Package },
      refunded:  { bg: "bg-[#FFEBEE]", text: "text-[#C62828]", border: "border-[#FFCDD2]", icon: RefreshCw },
      cancelled: { bg: "bg-[#F5F5F5]", text: "text-[#757575]", border: "border-[#E0E0E0]", icon: XCircle },
    };
    return map[status] || map.pending;
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen font-['Lato'] text-[#5C4A2E] pb-20 selection:bg-[#F3E5AB] selection:text-[#3E2723]">
      
      {/* Background Texture */}
      <div 
          className="fixed inset-0 pointer-events-none opacity-100 z-0" 
          style={{ backgroundImage: parchmentBg, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
      />

      {/* --- HERO HEADER --- */}
      <div className="relative w-full pt-28 md:pt-36 pb-16 px-6 border-b border-[#D4AF37]/30 bg-[#3E2723] overflow-hidden">
         <div className="absolute inset-0 z-0 pointer-events-none opacity-10 mix-blend-overlay" style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }} />
         <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#3E2723] to-transparent z-0"></div>

         <div className="relative z-10 max-w-7xl 2xl:max-w-[1800px] mx-auto">
            <button onClick={() => navigate("/profile")} className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F3E5AB] mb-6 transition-colors text-sm font-bold font-['Cinzel'] tracking-wide">
                <ArrowLeft className="w-4 h-4" /> Back to Profile
            </button>
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-['Playfair_Display'] font-bold text-[#F3E5AB] mb-2 tracking-tight">Order History</h1>
                    <p className="text-[#D4AF37] text-lg font-light tracking-wide">Track your journey through our sacred collection.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-[#D4AF37]/30">
                    <Package className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-[#F3E5AB] font-bold font-['Cinzel']">{totalOrders} Orders</span>
                </div>
            </div>
         </div>
      </div>
      <div ref={topRef} />

      <div className="relative z-20 max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 -mt-8">
        
        {/* --- FILTER BAR --- */}
        <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-3 min-w-max px-1">
                {["", "pending", "confirmed", "shipped", "delivered", "cancelled"].map(status => (
                <button 
                    key={status} 
                    onClick={() => { setStatusFilter(status); setPage(1); }} 
                    className={`
                        px-6 py-2.5 rounded-full text-sm font-bold transition-all border font-['Cinzel'] tracking-wide shadow-sm
                        ${statusFilter === status 
                            ? "bg-[#3E2723] text-[#F3E5AB] border-[#3E2723] shadow-md transform -translate-y-0.5" 
                            : "bg-white text-[#5C4A2E] border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-[#3E2723]"}
                    `}
                >
                    {status === "" ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
                ))}
            </div>
        </div>

        {loading && (
            <div className="text-center py-20">
                <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-6"></div>
                <p className="font-['Cinzel'] text-[#3E2723] animate-pulse font-bold tracking-widest">Retrieving Records...</p>
            </div>
        )}

        {!loading && orders.length === 0 && (
            <div className="text-center py-24 bg-white/60 backdrop-blur-sm rounded-[2rem] border border-[#D4AF37]/20 shadow-sm">
                <div className="w-20 h-20 bg-[#FFF9E6] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/20">
                    <Package className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-2xl font-bold text-[#3E2723] font-['Cinzel'] mb-2">No orders found</h3>
                <p className="text-[#8A7A5E] mb-8">Your history is currently empty.</p>
                <button onClick={() => navigate("/catalog")} className="px-10 py-3.5 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-full font-bold font-['Cinzel'] tracking-widest shadow-lg hover:shadow-xl active:scale-95 transition-all border border-[#D4AF37]">
                    Start Exploring
                </button>
            </div>
        )}

        <div className="space-y-8">
            {orders.map((order) => {
                const statusStyle = getOrderStatusStyles(order.status);
                const StatusIcon = statusStyle.icon;
                
                return (
                    <div key={order._id} className="bg-white/80 backdrop-blur-sm border border-[#D4AF37]/20 rounded-2xl shadow-[0_5px_15px_rgba(62,39,35,0.05)] overflow-hidden hover:border-[#D4AF37]/50 transition-all hover:shadow-md">
                        
                        {/* Order Header */}
                        <div className="bg-[#FAF7F2] px-6 py-5 border-b border-[#D4AF37]/10 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex gap-8 md:gap-12 text-sm">
                                <div>
                                    <p className="text-[#8A7A5E] text-[10px] font-bold uppercase tracking-wider mb-1">Order Placed</p>
                                    <p className="font-bold text-[#3E2723] font-['Cinzel']">{formatDate(order.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-[#8A7A5E] text-[10px] font-bold uppercase tracking-wider mb-1">Total</p>
                                    <p className="font-bold text-[#3E2723] font-['Playfair_Display'] text-lg">{formatCurrency(order.amount)}</p>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-[#8A7A5E] text-[10px] font-bold uppercase tracking-wider mb-1">Order ID</p>
                                    <p className="font-mono text-[#5C4A2E]">#{String(order._id).slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            
                            <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border ${statusStyle.bg} ${statusStyle.border} shadow-sm`}>
                                <StatusIcon className={`w-4 h-4 ${statusStyle.text}`} />
                                <span className={`text-xs font-bold uppercase font-['Cinzel'] tracking-wide ${statusStyle.text}`}>{order.status}</span>
                            </div>
                        </div>

                        {/* Order Body */}
                        <div className="p-6 md:p-8">
                            <div className="grid lg:grid-cols-3 gap-10">
                                {/* Items List */}
                                <div className="lg:col-span-2 space-y-6">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-5 items-center">
                                            <div className="w-20 h-28 bg-[#FAF7F2] rounded-lg border border-[#D4AF37]/20 overflow-hidden flex-shrink-0 shadow-inner">
                                                <img src={item.image || "/placeholder.png"} className="w-full h-full object-contain p-1" alt={item.title} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-[#3E2723] font-['Cinzel'] text-lg mb-1">{item.title}</h4>
                                                <p className="text-xs text-[#8A7A5E] font-bold uppercase tracking-wide mb-2">Qty: {item.qty}</p>
                                                <p className="font-bold text-[#3E2723] font-['Playfair_Display']">{formatCurrency(item.unitPrice)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping / Tracking Info */}
                                <div className="space-y-6 lg:border-l border-[#D4AF37]/10 lg:pl-10">
                                    {order.shipping?.bd?.awbNumber ? (
                                        <div className="bg-[#FFF9E6] rounded-xl p-5 border border-[#D4AF37]/30 shadow-sm">
                                            <h5 className="font-bold text-[#3E2723] mb-4 flex gap-2 items-center font-['Cinzel']">
                                                <Truck className="w-4 h-4 text-[#D4AF37]"/> Shipment Tracking
                                            </h5>
                                            <p className="font-mono bg-white px-3 py-1.5 rounded border border-[#D4AF37]/20 mb-4 text-[#5C4A2E] text-center tracking-wider">
                                                {order.shipping.bd.awbNumber}
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button onClick={() => openTracking(order.shipping.bd.awbNumber)} className="bg-[#3E2723] text-[#F3E5AB] px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#5D4037] transition-colors">
                                                    Track
                                                </button>
                                                <button onClick={() => copyAwb(order.shipping.bd.awbNumber)} className="bg-white border border-[#D4AF37]/30 text-[#8A7A5E] px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:border-[#D4AF37] hover:text-[#3E2723] transition-colors">
                                                    Copy
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-[#FAF7F2] rounded-xl p-5 border border-[#E3E8E5] text-center">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-[#D4AF37]/10">
                                                <Clock className="w-5 h-5 text-[#8A7A5E]" />
                                            </div>
                                            <p className="text-sm text-[#8A7A5E] font-medium font-['Cinzel']">Preparing for Shipment</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Actions Footer */}
                        <div className="bg-[#FAF7F2]/50 px-6 py-4 border-t border-[#D4AF37]/10 flex flex-wrap justify-end gap-4">
                            <button 
                                onClick={() => window.open(`/invoice/${order._id}`, '_blank')} 
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#3E2723] border border-[#D4AF37]/40 rounded-full hover:bg-[#D4AF37] hover:text-white transition-all font-['Cinzel'] tracking-wide"
                            >
                                <FileText className="w-4 h-4"/> Invoice
                            </button>
                            
                            {(order.payment.status === 'pending' || order.payment.status === 'failed') && order.payment.paymentType !== 'full_cod' && (
                                <button 
                                    onClick={() => retryPayment(order)} 
                                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#C59D5F] to-[#B0894C] rounded-full hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all font-['Cinzel'] tracking-widest border border-[#D4AF37]"
                                >
                                    <CreditCard className="w-4 h-4"/> Retry Payment
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-6">
                <button 
                    onClick={() => handlePageChange(page - 1)} 
                    disabled={page === 1} 
                    className="w-12 h-12 rounded-full bg-white border border-[#D4AF37]/30 flex items-center justify-center text-[#3E2723] hover:bg-[#D4AF37] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform"/>
                </button>
                
                <span className="text-[#3E2723] font-['Cinzel'] font-bold text-sm bg-white px-6 py-2 rounded-full border border-[#D4AF37]/20 shadow-sm">
                    Page {page} of {totalPages}
                </span>
                
                <button 
                    onClick={() => handlePageChange(page + 1)} 
                    disabled={page === totalPages} 
                    className="w-12 h-12 rounded-full bg-white border border-[#D4AF37]/30 flex items-center justify-center text-[#3E2723] hover:bg-[#D4AF37] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm group"
                >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"/>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;