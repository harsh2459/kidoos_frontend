// src/pages/OrderHistory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCustomer } from "../contexts/CustomerAuth";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  // consistent with other pages: use customer context
  const { isCustomer, token, loading: customerLoading } = useCustomer();

  useEffect(() => {
    if (customerLoading) return;
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, customerLoading, isCustomer]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // follow existing app flow: redirect to /login if not authenticated
      if (!isCustomer) {
        navigate("/login", { state: { next: "/profile/orders" } });
        return;
      }

      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      // shared axios client; interceptor attaches token from localStorage (customer_jwt)
      const res = await api.get("/customer/orders", {
        meta: { auth: "customer" },
        params,
      });

      const data = res?.data || {};
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotalPages(Number(data.pagination?.totalPages || 1));
    } catch (err) {
      console.error("Orders fetch error:", err);

      // mimic global behaviour for auth failure
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

  const getStatusClasses = (status) => {
    // primary-themed statuses use black as the dominant color (for your theme)
    const map = {
      pending: "bg-black/5 text-black",
      paid: "bg-black/10 text-black",
      shipped: "bg-black/10 text-black",
      delivered: "bg-black/5 text-black",
      refunded: "bg-red-50 text-red-700",
    };
    return map[status] || "bg-gray-50 text-black";
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 text-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: "black" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Profile
            </button>
            <h1 className="text-2xl font-bold mt-2">Your Orders</h1>
            <p className="text-sm text-black/60 mt-1">Past purchases and their current statuses</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status filter (keeps markup small & consistent) */}
            <select
              value={statusFilter}
              onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
              className="px-3 py-2 rounded-md border border-gray-200 text-sm bg-white"
              style={{ color: "black" }}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="refunded">Refunded</option>
            </select>

            <button
              onClick={() => fetchOrders()}
              className="px-4 py-2 rounded-md text-sm font-medium"
              style={{
                backgroundColor: "black",
                color: "white",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
              <p className="text-black/70">No orders found.</p>
              <div className="mt-4">
                <button
                  onClick={() => navigate("/catalog")}
                  className="px-4 py-2 rounded-md text-sm font-semibold"
                  style={{ backgroundColor: "black", color: "white" }}
                >
                  Shop books
                </button>
              </div>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o._id || o.id}
                className="bg-white p-4 rounded-lg border border-gray-100"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-black">
                      Order #{o.orderNumber ?? (o._id ? o._id.slice(-6) : "—")}
                    </div>
                    <div className="text-sm text-black/60">
                      Placed on {o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-sm ${getStatusClasses(o.status)}`}>
                    {o.status || "unknown"}
                  </div>
                </div>

                {Array.isArray(o.items) && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {o.items.map((it) => (
                      <div key={it._id || it.id || it.bookId} className="flex items-center gap-3">
                        <div className="w-14 h-20 bg-gray-50 rounded-md flex-shrink-0 overflow-hidden border border-gray-100">
                          {/* small thumbnail if available */}
                          {it.image ? (
                            <img src={it.image} alt={it.title || "book"} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-black/40 text-xs">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-black">{it.title ?? (it.book?.title ?? "Untitled")}</div>
                          <div className="text-sm text-black/60">Qty: {it.qty ?? it.quantity ?? 1}</div>
                          <div className="text-sm text-black/70 mt-1">₹{it.unitPriceSnapshot ?? it.price ?? 0}</div>
                        </div>

                        <div>
                          <button
                            onClick={() => navigate(`/book/${it.bookId ?? it._id ?? it.id}`)}
                            className="px-3 py-1 rounded-md text-sm"
                            style={{ border: "1px solid rgba(0,0,0,0.06)", background: "white", color: "black" }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* footer with total */}
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="text-black/70">Items: {Array.isArray(o.items) ? o.items.length : 0}</div>
                  <div className="font-semibold text-black">Total: ₹{o.total ?? o.grandTotal ?? 0}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* simple pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-md text-sm"
              style={{ border: "1px solid rgba(0,0,0,0.06)", background: "white", color: "black" }}
            >
              Prev
            </button>
            <div className="text-sm text-black/70">Page {page} of {totalPages}</div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-md text-sm"
              style={{ border: "1px solid rgba(0,0,0,0.06)", background: "black", color: "white" }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
