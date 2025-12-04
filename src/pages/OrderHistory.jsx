// src/pages/OrderHistory.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCustomer } from "../contexts/CustomerAuth";
import { 
    Package, Truck, CheckCircle, Clock, XCircle, 
    ArrowLeft, Search, Copy, ExternalLink, RefreshCw, 
    Calendar, CreditCard, MapPin, ChevronRight, ChevronLeft 
} from "lucide-react";

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

  // Consistent background texture
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

      const res = await api.get("/customer/orders", {
        meta: { auth: "customer" },
        params,
      });

      const data = res?.data || {};
      const fetchedOrders = Array.isArray(data.orders) ? data.orders : [];
      
      setOrders(fetchedOrders);
      setTotalPages(Number(data.pagination?.totalPages || 1));
      setTotalOrders(Number(data.pagination?.total || 0));
      
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("customer_jwt");
        localStorage.removeItem("customer_profile");
        navigate("/login", { state: { next: "/profile/orders" } });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
  };

  // --- Theme-consistent Status Styles ---
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const openTracking = (awbNumber) => {
    if (!awbNumber) return alert("❌ No tracking number available");
    window.open('https://bluedart.com/tracking', '_blank');
  };

  const copyAwbToClipboard = (awbNumber) => {
    if (!awbNumber) return alert("❌ No AWB number available");
    navigator.clipboard.writeText(awbNumber).then(() => {
        alert(`📋 Copied: ${awbNumber}`);
    });
  };

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34] pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="relative w-full pt-20 md:pt-28 pb-12 px-6 border-b border-[#E3E8E5] bg-[#1A3C34] overflow-hidden">
         {/* Texture Overlay */}
         <div 
            className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-soft-light" 
            style={{ backgroundImage: bgImage, backgroundSize: 'cover', filter: 'grayscale(100%)' }}
        />
        
        <div className="relative z-10 max-w-7xl 2xl:max-w-[1600px] mx-auto">
            <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 text-[#8BA699] hover:text-white mb-6 transition-colors text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Profile
            </button>
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">Order History</h1>
                    <p className="text-[#8BA699] text-lg font-light">
                        Track, return, or buy things again.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                    <Package className="w-5 h-5 text-[#4A7C59]" />
                    <span className="text-white font-medium">
                        {totalOrders} {totalOrders === 1 ? 'Order' : 'Orders'}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div ref={topRef} />

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 -mt-8 relative z-20">
        
        {/* Filters */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
                {["", "pending", "confirmed", "shipped", "delivered", "cancelled"].map(status => (
                <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setPage(1); }}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                    statusFilter === status
                        ? "bg-[#1A3C34] text-white border-[#1A3C34] shadow-md"
                        : "bg-white text-[#5C756D] border-[#E3E8E5] hover:border-[#8BA699]"
                    }`}
                >
                    {status === "" ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
                ))}
            </div>
        </div>

        {/* Loading State */}
        {loading && (
            <div className="flex flex-col items-center py-20">
                <div className="w-12 h-12 border-4 border-[#E3E8E5] border-t-[#1A3C34] rounded-full animate-spin mb-4"></div>
                <p className="text-[#5C756D]">Loading your orders...</p>
            </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#E3E8E5] shadow-sm">
                <div className="w-20 h-20 bg-[#F4F7F5] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-[#8BA699]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1A3C34] mb-2">No orders found</h3>
                <p className="text-[#5C756D] mb-8 max-w-md mx-auto">
                    {statusFilter ? `You have no ${statusFilter} orders.` : "Looks like you haven't started your reading journey yet."}
                </p>
                <button
                    onClick={() => navigate("/catalog")}
                    className="px-8 py-3 bg-[#1A3C34] text-white rounded-xl font-bold hover:bg-[#2F523F] transition-all shadow-lg active:scale-95"
                >
                    Browse Books
                </button>
            </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
            {orders.map((order) => {
                const statusStyle = getOrderStatusStyles(order.status);
                const StatusIcon = statusStyle.icon;

                return (
                    <div key={order._id} className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        
                        {/* Order Header */}
                        <div className="bg-[#FAFBF9] px-6 py-4 border-b border-[#E3E8E5] flex flex-wrap gap-y-4 justify-between items-center">
                            <div className="flex gap-6 md:gap-10 text-sm">
                                <div>
                                    <p className="text-[#8BA699] uppercase tracking-wider text-xs font-bold mb-1">Order Placed</p>
                                    <p className="font-medium text-[#2C3E38] flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-[#4A7C59]" />
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[#8BA699] uppercase tracking-wider text-xs font-bold mb-1">Total</p>
                                    <p className="font-bold text-[#1A3C34]">{formatCurrency(order.amount)}</p>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-[#8BA699] uppercase tracking-wider text-xs font-bold mb-1">Order ID</p>
                                    <p className="font-mono text-[#5C756D]">#{String(order._id).slice(-8).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border ${statusStyle.bg} ${statusStyle.border}`}>
                                <StatusIcon className={`w-4 h-4 ${statusStyle.text}`} />
                                <span className={`text-xs font-bold uppercase tracking-wider ${statusStyle.text}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        {/* Order Body */}
                        <div className="p-6">
                            <div className="grid lg:grid-cols-3 gap-8">
                                
                                {/* 1. Items List */}
                                <div className="lg:col-span-2 space-y-4">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-start">
                                            <div className="w-20 h-24 bg-[#F4F7F5] rounded-lg border border-[#E3E8E5] overflow-hidden flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#8BA699] text-xs">No Img</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-serif font-bold text-[#1A3C34] text-lg leading-tight mb-1">
                                                    {item.title || "Unknown Book"}
                                                </h4>
                                                <p className="text-sm text-[#5C756D] mb-2">
                                                    Quantity: {item.qty}
                                                </p>
                                                <p className="font-bold text-[#1A3C34]">
                                                    {formatCurrency(item.unitPrice)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 2. Actions & Shipping Info */}
                                <div className="space-y-6 lg:border-l border-[#E3E8E5] lg:pl-8">
                                    
                                    {/* Tracking Card */}
                                    {order.shipping?.bd?.awbNumber ? (
                                        <div className="bg-[#F4F7F5] rounded-xl p-4 border border-[#DCE4E0]">
                                            <h5 className="font-bold text-[#1A3C34] mb-3 flex items-center gap-2">
                                                <Truck className="w-4 h-4" /> Tracking
                                            </h5>
                                            <p className="text-xs text-[#8BA699] mb-1 uppercase tracking-wide">AWB Number</p>
                                            <p className="font-mono font-medium text-[#2C3E38] mb-4 bg-white px-2 py-1 rounded border border-[#E3E8E5] inline-block">
                                                {order.shipping.bd.awbNumber}
                                            </p>
                                            
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => openTracking(order.shipping.bd.awbNumber)}
                                                    className="flex items-center justify-center gap-1.5 bg-[#1A3C34] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#2F523F] transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Track
                                                </button>
                                                <button
                                                    onClick={() => copyAwbToClipboard(order.shipping.bd.awbNumber)}
                                                    className="flex items-center justify-center gap-1.5 bg-white border border-[#DCE4E0] text-[#5C756D] px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#E8F0EB] transition-colors"
                                                >
                                                    <Copy className="w-3 h-3" /> Copy
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-[#FFF9F0] rounded-xl p-4 border border-[#F5E6D3]">
                                            <p className="text-sm text-[#8A6A4B] font-medium flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Preparing Shipment
                                            </p>
                                            <p className="text-xs text-[#8A6A4B]/80 mt-1">
                                                Tracking will be available soon.
                                            </p>
                                        </div>
                                    )}

                                    {/* Shipping Address Summary */}
                                    {order.shipping && (
                                        <div>
                                            <h5 className="font-bold text-[#1A3C34] mb-2 text-sm flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-[#4A7C59]" />
                                                Shipping To
                                            </h5>
                                            <p className="text-sm text-[#5C756D] leading-relaxed">
                                                {order.shipping.name}<br/>
                                                {order.shipping.city}, {order.shipping.state}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Order Footer */}
                        {order.payment && (
                            <div className="bg-[#FAFBF9] px-6 py-3 border-t border-[#E3E8E5] text-xs text-[#8BA699] flex justify-between items-center">
                                <span>Payment: {order.payment.paymentType?.replace(/_/g, ' ').toUpperCase()}</span>
                                <span className={`font-bold px-2 py-0.5 rounded border ${
                                    order.payment.status === 'paid' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>
                                    {order.payment.status?.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-4">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="w-10 h-10 rounded-full bg-white border border-[#E3E8E5] flex items-center justify-center text-[#2C3E38] hover:bg-[#E8F0EB] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-[#5C756D]">
                    Page <span className="font-bold text-[#1A3C34]">{page}</span> of {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="w-10 h-10 rounded-full bg-white border border-[#E3E8E5] flex items-center justify-center text-[#2C3E38] hover:bg-[#E8F0EB] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default OrderHistory;