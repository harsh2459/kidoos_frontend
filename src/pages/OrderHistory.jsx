// src/pages/OrderHistory.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCustomer } from "../contexts/CustomerAuth";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();
  const topRef = useRef(null);
  
  const { isCustomer, token, loading: customerLoading } = useCustomer();

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

      const params = { page, limit: 10 }; // ✅ Changed back to 10 for production
      if (statusFilter) params.status = statusFilter;

      console.log(`📄 Fetching page ${page} with limit 10...`);

      const res = await api.get("/customer/orders", {
        meta: { auth: "customer" },
        params,
      });

      const data = res?.data || {};
      const fetchedOrders = Array.isArray(data.orders) ? data.orders : [];
      
      setOrders(fetchedOrders);
      setTotalPages(Number(data.pagination?.totalPages || 1));
      setTotalOrders(Number(data.pagination?.total || 0));
      
      console.log(`✅ Loaded ${fetchedOrders.length} orders (Page ${page}/${data.pagination?.totalPages || 1})`);
      
      // Scroll to top when page changes
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
      
      const status = err?.response?.status;
      if (status === 401) {
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
    console.log(`📄 Changing from page ${page} to page ${newPage}`);
    setPage(newPage);
  };

  const getOrderStatusClasses = (status) => {
    const map = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      paid: "bg-green-50 text-green-700 border-green-200",
      shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
      delivered: "bg-green-100 text-green-800 border-green-300 font-semibold",
      refunded: "bg-red-50 text-red-700 border-red-200",
      cancelled: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return map[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getPaymentStatusClasses = (status) => {
    const map = {
      pending: "bg-orange-50 text-orange-700 border-orange-200",
      paid: "bg-green-50 text-green-700 border-green-200",
      failed: "bg-red-50 text-red-700 border-red-200",
      partially_paid: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return map[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatPaymentType = (paymentType) => {
    const map = {
      full_online: "Full Payment Online",
      half_online_half_cod: "50% Online + 50% COD",
      half_cod_half_online: "50% Online + 50% COD",
      full_cod: "Cash on Delivery",
    };
    return map[paymentType] || paymentType;
  };

  // ✅ UPDATED: Open BlueDart tracking page
  const openTracking = (awbNumber) => {
    if (!awbNumber) {
      alert("❌ No tracking number available for this order");
      return;
    }
    
    // Open BlueDart tracking page in new tab
    window.open('https://bluedart.com/tracking', '_blank');
  };

  // ✅ NEW: Copy AWB to clipboard
  const copyAwbToClipboard = (awbNumber) => {
    if (!awbNumber) {
      alert("❌ No AWB number available");
      return;
    }

    navigator.clipboard.writeText(awbNumber).then(() => {
      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      message.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>📋 AWB Number copied: ${awbNumber}</span>
        </div>
      `;
      document.body.appendChild(message);
      
      // Remove after 3 seconds
      setTimeout(() => {
        message.remove();
      }, 3000);
    }).catch(() => {
      alert(`📋 AWB Number: ${awbNumber}\n\nCouldn't copy automatically. Please copy manually.`);
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div ref={topRef} />
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center text-black hover:text-black/70 mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Profile
        </button>
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Your Orders</h1>
            <p className="text-gray-600">
              {totalOrders > 0 
                ? `${totalOrders} order${totalOrders !== 1 ? 's' : ''} found` 
                : 'Past purchases and their current statuses'}
            </p>
          </div>
          
          {totalPages > 1 && (
            <div className="text-sm text-gray-600 font-medium">
              Page {page} of {totalPages}
            </div>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {["", "pending", "confirmed", "paid", "shipped", "delivered", "cancelled"].map(status => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              statusFilter === status
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status === "" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Top Pagination */}
      {totalPages > 1 && orders.length > 0 && (
        <div className="mb-6 flex justify-center items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <button
            onClick={() => handlePageChange(1)}
            disabled={page === 1 || loading}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="First page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Page</span>
            <span className="bg-black text-white px-4 py-2 rounded-lg font-bold min-w-[3rem] text-center">
              {page}
            </span>
            <span className="text-gray-700 font-medium">of {totalPages}</span>
          </div>
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
          >
            Next →
          </button>
          
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages || loading}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Last page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-xl text-gray-600 mb-2">
            {statusFilter ? `No ${statusFilter} orders found` : 'No orders found'}
          </p>
          <p className="text-gray-500 mb-6">
            {statusFilter 
              ? 'Try changing the filter or check back later' 
              : 'Start shopping to see your orders here'}
          </p>
          <button
            onClick={() => navigate("/catalog")}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-black/90 transition-colors"
          >
            Shop books
          </button>
        </div>
      ) : (
        <>
          {loading && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-blue-700 font-medium flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading orders...
              </p>
            </div>
          )}

          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-mono text-sm font-medium text-black">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium text-black">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-bold text-black">{formatCurrency(order.amount)}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getOrderStatusClasses(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                      <p className="font-semibold text-black">
                        {formatPaymentType(order.payment?.paymentType)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusClasses(order.payment?.status)}`}>
                        {(order.payment?.status || 'pending').replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">Paid</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(order.payment?.paidAmount || 0)}
                      </p>
                    </div>

                    {order.payment?.dueOnDeliveryAmount > 0 && (
                      <div className="bg-orange-100 border-2 border-orange-300 rounded-lg px-4 py-2">
                        <p className="text-xs text-orange-700 font-semibold mb-1">💰 Cash on Delivery</p>
                        <p className="text-xl font-bold text-orange-800">
                          {formatCurrency(order.payment.dueOnDeliveryAmount)}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          {order.payment.codSettlementStatus === 'settled' 
                            ? '✅ Collected' 
                            : order.payment.codSettlementStatus === 'pending'
                            ? '⏳ To be collected'
                            : 'Pending'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <h3 className="font-semibold text-black mb-3">Items</h3>
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="w-16 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-black truncate">{item.title || "Unknown Item"}</h4>
                          <p className="text-sm text-gray-600">
                            Qty: {item.qty} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-black">
                            {formatCurrency(item.qty * item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Tracking */}
                {order.shipping && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Shipping Address */}
                      <div>
                        <h3 className="font-semibold text-black mb-2">Shipping Address</h3>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p className="font-medium">{order.shipping.name}</p>
                          <p>{order.shipping.address}</p>
                          <p>
                            {order.shipping.city}, {order.shipping.state} {order.shipping.pincode}
                          </p>
                          <p>{order.shipping.country || "India"}</p>
                          <p className="font-medium mt-2">📞 {order.shipping.phone}</p>
                          {order.shipping.email && <p>📧 {order.shipping.email}</p>}
                        </div>
                      </div>

                      {/* Tracking Information */}
                      <div>
                        <h3 className="font-semibold text-black mb-2">Tracking Information</h3>
                        
                        {order.shipping.bd?.awbNumber ? (
                          <div className="space-y-3">
                            {/* AWB Number */}
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <p className="text-xs text-gray-600">AWB Number</p>
                              <p className="font-mono font-semibold text-black">
                                {order.shipping.bd.awbNumber}
                              </p>
                            </div>

                            {/* Shipment Status */}
                            {order.shipping.bd.status && (
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <p className="text-xs text-gray-600">Shipment Status</p>
                                <p className="font-medium text-black capitalize">
                                  {order.shipping.bd.status}
                                </p>
                              </div>
                            )}

                            {/* Last Tracked */}
                            {order.shipping.bd.lastTrackedAt && (
                              <div className="text-xs text-gray-500">
                                Last updated: {formatDate(order.shipping.bd.lastTrackedAt)}
                              </div>
                            )}

                            {/* ✅ UPDATED: Track Shipment & Copy AWB Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => openTracking(order.shipping.bd.awbNumber)}
                                className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Track Shipment
                              </button>
                              
                              <button
                                onClick={() => copyAwbToClipboard(order.shipping.bd.awbNumber)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                title="Copy AWB Number"
                              >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="hidden sm:inline">Copy AWB</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                              🚚 Shipping label not yet generated. Your order will be shipped soon!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bottom Pagination */}
      {totalPages > 1 && orders.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-center items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1 || loading}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="First page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">Page</span>
              <span className="bg-black text-white px-4 py-2 rounded-lg font-bold min-w-[3rem] text-center">
                {page}
              </span>
              <span className="text-gray-700 font-medium">of {totalPages}</span>
            </div>
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
            >
              Next →
            </button>
            
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages || loading}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Last page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Showing {((page - 1) * 10) + 1} - {Math.min(page * 10, totalOrders)} of {totalOrders} orders
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => fetchOrders()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Orders
        </button>
      </div>
    </div>
  );
};

export default OrderHistory;
