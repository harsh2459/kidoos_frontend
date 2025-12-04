// src/pages/Catalog.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import FilterBar from "../components/FilterBar";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ProductCard from "../components/ProductCard";
import { Loader, SearchX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/books", {
        params: {
          q,
          page,
          limit,
          sort,
          visibility: "public"
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
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [q, sort, page]);

  const items = useMemo(() => {
    const arr = [...rawItems];
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

  // Pagination Controls
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);
      
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34] pb-20">
      
      {/* --- HERO HEADER --- */}
      <div className="relative w-full pt-20 md:pt-28 pb-12 px-6 border-b border-[#E3E8E5] bg-[#1A3C34] overflow-hidden">
        <div 
            className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-soft-light" 
            style={{ backgroundImage: "url('/images/terms-bg.png')", backgroundSize: 'cover', filter: 'grayscale(100%)' }}
        />
        <div className="relative z-10 max-w-7xl 2xl:max-w-[1800px] mx-auto flex flex-col md:flex-row items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
              Catalog
            </h1>
            <p className="text-[#8BA699] text-lg font-light">
              Explore our collection of {total} curated books.
            </p>
          </div>
          
          {/* Filter Bar Container */}
          <div className="w-full md:w-auto">
            <FilterBar q={q} setQ={setQ} sort={sort} setSort={setSort} />
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#5C756D]">
            <div className="w-12 h-12 border-4 border-[#E3E8E5] border-t-[#1A3C34] rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium">Loading library...</p>
          </div>
        ) : (
          <>
            {/* Items Grid */}
            {items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
                {items.map(b => (
                  <ProductCard key={b._id} book={b} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#E3E8E5]">
                  <SearchX className="w-10 h-10 text-[#8BA699]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1A3C34] mb-2">No books found</h3>
                <p className="text-[#5C756D] max-w-md mx-auto">
                  We couldn't find any books matching your search. Try adjusting your filters or search terms.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex flex-col items-center gap-6">
                <div className="flex items-center justify-center gap-2">
                  {/* First Page */}
                  <button
                    onClick={() => goToPage(1)}
                    disabled={page === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E3E8E5] text-[#5C756D] hover:bg-[#E8F0EB] hover:text-[#1A3C34] hover:border-[#4A7C59] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-5 h-5" />
                  </button>

                  {/* Previous */}
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E3E8E5] text-[#5C756D] hover:bg-[#E8F0EB] hover:text-[#1A3C34] hover:border-[#4A7C59] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2 mx-2">
                    {getPageNumbers().map((pageNum, idx) => (
                      pageNum === '...' ? (
                        <span key={`ellipsis-${idx}`} className="text-[#8BA699] px-2">...</span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm ${
                            page === pageNum
                              ? "bg-[#1A3C34] text-white shadow-md scale-105"
                              : "bg-white border border-[#E3E8E5] text-[#5C756D] hover:bg-[#E8F0EB] hover:text-[#1A3C34] hover:border-[#4A7C59]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E3E8E5] text-[#5C756D] hover:bg-[#E8F0EB] hover:text-[#1A3C34] hover:border-[#4A7C59] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="Next Page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={page === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E3E8E5] text-[#5C756D] hover:bg-[#E8F0EB] hover:text-[#1A3C34] hover:border-[#4A7C59] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-[#8BA699]">
                  Page <span className="font-bold text-[#1A3C34]">{page}</span> of {totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <ScrollToTopButton />
    </div>
  );
}