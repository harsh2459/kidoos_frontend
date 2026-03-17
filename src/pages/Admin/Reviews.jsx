// src/pages/Admin/Reviews.jsx
import { useEffect, useState, useCallback } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { t } from "../../lib/toast";
import { Star, Eye, EyeOff, Trash2, RefreshCw, MessageSquarePlus, Mail, Phone, BookOpen } from "lucide-react";

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const { token } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter === "public") params.isPublic = "true";
      if (filter === "private") params.isPublic = "false";
      const { data } = await api.get("/reviews/admin", { params, meta: { auth: "admin" } });
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch {
      t.error({ title: "Failed to load reviews" });
    } finally {
      setLoading(false);
    }
  }, [page, filter, token]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function toggleVisibility(review) {
    try {
      await api.patch(`/reviews/admin/${review._id}`, { isPublic: !review.isPublic }, { meta: { auth: "admin" } });
      setReviews(prev => prev.map(r => r._id === review._id ? { ...r, isPublic: !r.isPublic } : r));
      t.success({ title: review.isPublic ? "Hidden from public." : "Published publicly." });
    } catch {
      t.error({ title: "Failed to update." });
    }
  }

  async function deleteReview(id) {
    try {
      await api.delete(`/reviews/admin/${id}`, { meta: { auth: "admin" } });
      setReviews(prev => prev.filter(r => r._id !== id));
      setTotal(prev => prev - 1);
      setDeleteConfirm(null);
      t.success({ title: "Review deleted." });
    } catch {
      t.error({ title: "Failed to delete." });
    }
  }

  const TABS = [
    { label: "All", value: "all" },
    { label: "Public (4.5★+)", value: "public" },
    { label: "Private (below 4.5★)", value: "private" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-1">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-amber-500" />
            Customer Reviews
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {total} review{total !== 1 ? "s" : ""} · 4.5+ stars shown publicly, lower ratings are admin-only
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 bg-white rounded-lg px-3 py-2 shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-5 bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-fit">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setFilter(tab.value); setPage(1); }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === tab.value
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
          <MessageSquarePlus className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No reviews found</p>
          <p className="text-xs text-gray-400 mt-1">
            {filter === "public" ? "No publicly visible reviews yet." : filter === "private" ? "No private reviews." : "No reviews have been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map(review => {
            const sku = review.bookId?.inventory?.sku;
            const bookTitle = review.bookId?.title;
            const customer = review.customerId;

            return (
              <div
                key={review._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start gap-4">

                  {/* Left: avatar */}
                  <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
                    {review.customerName?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* Middle: content */}
                  <div className="flex-1 min-w-0">

                    {/* Row 1: customer name + badge + date */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-gray-800">{review.customerName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide ${
                        review.isPublic
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {review.isPublic ? "Public" : "Private"}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-auto">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    {/* Row 2: stars + rating number */}
                    <div className="flex items-center gap-2 mb-2">
                      <StarDisplay rating={review.rating} />
                      <span className="text-xs font-bold text-gray-700">{review.rating}.0</span>
                    </div>

                    {/* Row 3: review text */}
                    <p className="text-sm text-gray-600 italic leading-relaxed mb-3">"{review.text}"</p>

                    {/* Row 4: book SKU + customer details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-400">

                      {/* Book SKU */}
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-gray-300" />
                        {sku
                          ? <span className="font-mono font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{sku}</span>
                          : <span className="text-gray-400 italic">{bookTitle || "Unknown book"}</span>
                        }
                        {sku && bookTitle && <span className="text-gray-300">· {bookTitle}</span>}
                      </div>

                      {/* Customer email */}
                      {customer?.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-300" />
                          <span className="text-gray-500">{customer.email}</span>
                        </div>
                      )}

                      {/* Customer phone */}
                      {customer?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-300" />
                          <span className="text-gray-500">{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleVisibility(review)}
                      title={review.isPublic ? "Hide from public" : "Make public"}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        review.isPublic
                          ? "border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {review.isPublic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(review._id)}
                      className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white disabled:opacity-40 hover:bg-gray-50 transition-all"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white disabled:opacity-40 hover:bg-gray-50 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete this review?</h3>
            <p className="text-sm text-gray-400 mb-5">This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => deleteReview(deleteConfirm)}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all"
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
