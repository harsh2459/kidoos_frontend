import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import FilterBar from "../components/FilterBar";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { assetUrl } from "../api/asset";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartStore";
import ProductCard from "../components/ProductCard";

export default function Catalog() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [rawItems, setRawItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const totalPages = Math.ceil(total / limit);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/books", {
        params: {
          q,
          page,
          limit,
          sort,
          visibility: "public" // Only show public books
        }
      });
      setRawItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    load();
  }, []);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [q, sort]);

  // Load when page changes (or search/sort after reset)
  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0); // Debounce search, instant for pagination
    return () => clearTimeout(t);
  }, [q, sort, page]);

  const items = useMemo(() => {
    const arr = [...rawItems];
    // Client-side sorting (can be removed if backend handles it)
    if (sort === "priceAsc" || sort === "priceDesc") {
      arr.sort((a, b) => {
        const pa = Number(a.price ?? a.mrp ?? 0);
        const pb = Number(b.price ?? b.mrp ?? 0);
        return sort === "priceAsc" ? pa - pb : pb - pa;
      });
    } else {
      arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return arr;
  }, [rawItems, sort]);

  // ✅ Pagination controls
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ✅ Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7; // Show max 7 page numbers

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, page - 2);
      let end = Math.min(totalPages - 1, page + 2);

      // Adjust if we're near the start
      if (page <= 3) {
        end = Math.min(totalPages - 1, 5);
      }
      // Adjust if we're near the end
      if (page >= totalPages - 2) {
        start = Math.max(2, totalPages - 4);
      }

      // Add ellipsis if needed
      if (start > 2) pages.push('...');

      // Add pages around current
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) pages.push('...');

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div
      id="top"
      className="mx-auto max-w-screen-xl px-2 md:px-8 py-8 bg-surface"
      style={{
        minHeight: "100vh",
      }}
    >
      <ScrollToTopButton />
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-fg tracking-tight">
            Catalog <span className="text-fg-subtle text-lg font-medium">({total})</span>
          </h1>
          <div className="text-sm text-fg-subtle mt-1">
            Showing <span className="font-semibold text-fg">{items.length}</span> of {total}
            {totalPages > 1 && (
              <span className="ml-2">• Page {page} of {totalPages}</span>
            )}
          </div>
        </div>
        <div className="w-full md:w-auto">
          <FilterBar q={q} setQ={setQ} sort={sort} setSort={setSort} />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-fg-subtle text-lg font-medium">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-current mb-4"></div>
          <div>Loading…</div>
        </div>
      ) : (
        <>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 bg-surface"
          >
            {items.map(b => <ProductCard key={b._id} book={b} />)}
            {items.length === 0 && (
              <div className="col-span-full py-16 text-center text-fg-subtle text-lg">
                No books found.
              </div>
            )}
          </div>

          {/* ✅ Pagination Controls - Customer-Friendly Design */}
          {totalPages > 1 && (
            <div className="mt-12 mb-8">
              <div className="flex flex-col items-center gap-4">
                {/* Page info */}
                <div className="text-sm text-fg-subtle">
                  Page <span className="font-semibold text-fg">{page}</span> of{" "}
                  <span className="font-semibold text-fg">{totalPages}</span>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* Previous button */}
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className={`
                      px-4 py-2 rounded-lg border text-sm font-medium
                      transition-all duration-200
                      ${page === 1
                        ? "bg-surface-subtle text-fg-muted border-border-subtle cursor-not-allowed opacity-50"
                        : "bg-surface text-fg border-border hover:bg-surface-subtle hover:border-fg-muted"
                      }
                    `}
                    aria-label="Previous page"
                  >
                    ← Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {getPageNumbers().map((pageNum, idx) => (
                      pageNum === '...' ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-3 py-2 text-fg-subtle"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`
                            min-w-[40px] px-3 py-2 rounded-lg border text-sm font-medium
                            transition-all duration-200
                            ${page === pageNum
                              ? "bg-black text-white border-black shadow-sm"
                              : "bg-surface text-fg border-border hover:bg-surface-subtle hover:border-fg-muted"
                            }
                          `}
                          aria-label={`Go to page ${pageNum}`}
                          aria-current={page === pageNum ? "page" : undefined}
                        >
                          {pageNum}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className={`
                      px-4 py-2 rounded-lg border text-sm font-medium
                      transition-all duration-200
                      ${page === totalPages
                        ? "bg-surface-subtle text-fg-muted border-border-subtle cursor-not-allowed opacity-50"
                        : "bg-surface text-fg border-border hover:bg-surface-subtle hover:border-fg-muted"
                      }
                    `}
                    aria-label="Next page"
                  >
                    Next →
                  </button>
                </div>

                {/* Quick jump to first/last (for many pages) */}
                {totalPages > 10 && (
                  <div className="flex gap-2 text-sm">
                    {page > 3 && (
                      <button
                        onClick={() => goToPage(1)}
                        className="text-fg-muted hover:text-fg underline"
                      >
                        « First
                      </button>
                    )}
                    {page < totalPages - 2 && (
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="text-fg-muted hover:text-fg underline"
                      >
                        Last »
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}