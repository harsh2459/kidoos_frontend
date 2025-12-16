// src/pages/admin/Books.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { assetUrl } from "../../api/asset";
import FancyButton from "../../components/button/button";
import { saveAs } from "file-saver";
import { t } from "../../lib/toast";

import {
  Search,
  Upload,
  Download,
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  BookOpen,
  Filter
} from "lucide-react";

export default function BooksAdmin() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [q, setQ] = useState("");
  const [vis, setVis] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooks, setSelectedBooks] = useState([]);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const totalPages = Math.ceil(total / limit);
  const fileInputRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/books", {
        params: {
          q,
          limit,
          page,
          sort: "new",
          visibility: vis,
          _t: Date.now()
        },
        headers: {
          ...auth.headers,
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });

      setItems(data.items || []);
      setTotal(data.total || data.items?.length || 0);
    } catch (error) {
      console.error("❌ Load error:", error);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
    load();
  }, [vis, q]);

  useEffect(() => {
    load();
  }, [page]);

  const toggleSelection = (bookId) => {
    setSelectedBooks(prevSelected => {
      if (prevSelected.includes(bookId)) {
        return prevSelected.filter(id => id !== bookId);
      } else {
        return [...prevSelected, bookId];
      }
    });
  };

  async function toggleVisibility(b) {
    const next = b.visibility === "public" ? "draft" : "public";
    const body = {
      visibility: next,
      assets: {
        coverUrl: Array.isArray(b?.assets?.coverUrl) ? b.assets.coverUrl : [],
        samplePdfUrl: b?.assets?.samplePdfUrl || undefined,
      },
    };
    await api.patch(`/books/${b._id}`, body, auth);
    setItems(arr => arr.map(x => x._id === b._id ? { ...x, visibility: next } : x));
  }

  async function remove(b) {
    if (!window.confirm(`Delete "${b.title}"?`)) return;
    await api.delete(`/books/${b._id}`, auth);
    setItems(arr => arr.filter(x => x._id !== b._id));
    setTotal(prev => prev - 1);
  }

  async function bulkUpdateVisibility(status) {
    for (const bookId of selectedBooks) {
      await api.patch(`/books/${bookId}`, { visibility: status }, auth);
    }
    load();
    setSelectedBooks([]);
  }

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleImport = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv"
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      t.err("Invalid file type. Please upload Excel or CSV.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const toastId = t.loading("Importing books...");

    try {
      const response = await api.post("/books/import", formData);
      t.dismiss(toastId);
      t.ok(`Success! ${response.data.count || 0} books imported.`);
      await load();
    } catch (error) {
      t.dismiss(toastId);
      t.err(error?.response?.data?.error || "Error importing books");
    } finally {
      e.target.value = null;
    }
  };

  // ✅ FIXED: Export Handler
  const handleExport = async () => {
    const toastId = t.loading("Preparing export...");

    try {
      const response = await api.get("/books/export", {
        headers: auth.headers,
        responseType: 'blob'
      });

      t.dismiss(toastId);
      saveAs(response.data, `books_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
      t.ok("Export downloaded successfully!");
    } catch (error) {
      t.dismiss(toastId);
      console.error("Export error:", error);
      t.err(error?.response?.data?.error || "Failed to export books");
    }
  };

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

  // Helper styles
  const secondaryBtnClass = "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E3E8E5] text-[#5C756D] font-bold text-sm bg-white hover:border-[#1A3C34] hover:text-[#1A3C34] transition-all shadow-sm active:scale-95";

  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">


      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3C34] tracking-tight">Books Inventory</h1>
          <p className="text-[#5C756D] mt-1 text-sm">Manage your catalog, pricing, and visibility.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
          />
          <button onClick={handleImportClick} className={secondaryBtnClass}>
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={handleExport} className={secondaryBtnClass}>
            <Download className="w-4 h-4" /> Export
          </button>
          <FancyButton to="/admin/add-book" text="Add Book" />
        </div>
      </div>

      {/* --- CONTROL PANEL (Search & Filters) --- */}
      <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">

          {/* SEARCH BAR - IMPROVED */}
          <div className="relative w-full lg:max-w-xl group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8BA699] group-focus-within:text-[#1A3C34] transition-colors">

            </div>
            <input
              className="w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl pl-12 pr-4 py-3 text-base text-[#1A3C34] placeholder:text-[#8BA699] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 focus:border-[#1A3C34] transition-all shadow-inner"
              placeholder="Search by title, SKU, author..."
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && load()}
            />
          </div>

          {/* FILTER TABS - SEGMENTED STYLE */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            {/* Label (Optional, good for clarity) */}
            <div className="hidden sm:flex items-center gap-2 text-[#5C756D] text-sm font-bold uppercase tracking-wider">
              <Filter className="w-4 h-4" /> Status
            </div>

            <div className="flex bg-[#F4F7F5] p-1.5 rounded-xl border border-[#E3E8E5]">
              {[
                { id: 'all', label: 'All Books' },
                { id: 'public', label: 'Public' },
                { id: 'draft', label: 'Drafts' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setVis(tab.id)}
                  className={`
                            px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200
                            ${vis === tab.id
                      ? "bg-white text-[#1A3C34] shadow-sm ring-1 ring-[#E3E8E5] scale-[1.02]"
                      : "text-[#5C756D] hover:text-[#1A3C34] hover:bg-white/50"
                    }
                        `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- INFO & BULK ACTIONS --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 px-1 min-h-[40px]">
        <div className="text-sm text-[#5C756D] font-medium">
          Showing <span className="text-[#1A3C34] font-bold">{items.length}</span> of <span className="text-[#1A3C34] font-bold">{total}</span> results
        </div>

        {/* IMPROVED BULK ACTION BUTTONS */}
        {selectedBooks.length > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A3C34] mr-2">
              Selected ({selectedBooks.length})
            </span>
            <button
              onClick={() => bulkUpdateVisibility("public")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-[#1A3C34] text-white hover:bg-[#2F523F] transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Eye className="w-4 h-4" /> Publish
            </button>
            <button
              onClick={() => bulkUpdateVisibility("draft")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-white border border-[#E3E8E5] text-[#5C756D] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm active:scale-95"
            >
              <EyeOff className="w-4 h-4" /> Set as Draft
            </button>
          </div>
        )}
      </div>

      {/* --- TABLE --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E3E8E5]">
          <div className="w-10 h-10 border-4 border-[#1A3C34] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#5C756D] font-medium">Loading catalog...</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left align-middle">
                <thead className="bg-[#FAFBF9] text-[#5C756D] font-bold uppercase text-xs tracking-wider border-b border-[#E3E8E5]">
                  <tr>
                    <th className="py-4 px-6 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-[#E3E8E5] text-[#1A3C34] focus:ring-[#1A3C34] w-4 h-4 cursor-pointer"
                        onChange={() => setSelectedBooks(selectedBooks.length === items.length ? [] : items.map(b => b._id))}
                        checked={selectedBooks.length === items.length && items.length > 0}
                      />
                    </th>
                    <th className="py-4 px-4 w-20">Cover</th>
                    <th className="py-4 px-4">Book Details</th>
                    <th className="py-4 px-4">SKU</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4">Stock</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right min-w-[150px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F7F5]">
                  {items.map((b) => {
                    const lastCover = b?.assets?.coverUrl?.length ? b.assets.coverUrl[0] : undefined;
                    const sku = b?.inventory?.sku || "—";
                    const isSelected = selectedBooks.includes(b._id);

                    return (
                      <tr
                        key={b._id}
                        className={`
                            group transition-colors duration-150
                            ${isSelected ? "bg-[#F0F7F4]" : "hover:bg-[#FAFBF9]"}
                        `}
                      >
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            className="rounded border-[#E3E8E5] text-[#1A3C34] focus:ring-[#1A3C34] w-4 h-4 cursor-pointer"
                            checked={isSelected}
                            onChange={() => toggleSelection(b._id)}
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-14 w-10 bg-[#F4F7F5] rounded-lg overflow-hidden border border-[#E3E8E5] shadow-sm flex items-center justify-center">
                            {lastCover ? (
                              <img
                                src={assetUrl(lastCover)}
                                alt={b.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 max-w-[250px]">
                          <div
                            className="font-bold text-[#1A3C34] truncate"
                            title={b.title}
                          >
                            {b.title}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono text-xs font-medium text-[#5C756D] bg-[#F4F7F5] border border-[#E3E8E5] px-2 py-1 rounded-md">
                            {sku}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-[#1A3C34]">₹{b.price}</td>
                        <td className="py-4 px-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.inventory?.stock > 10 ? "bg-[#E8F5E9] text-[#1A3C34]" : b.inventory?.stock > 0 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"}`}>
                            {b.inventory?.stock ?? 0}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {b.visibility === "public" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#1A3C34] border border-[#C8E6C9]">
                              <CheckCircle2 className="w-3 h-3" /> Public
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F5F5F5] text-[#757575] border border-[#E0E0E0]">
                              <XCircle className="w-3 h-3" /> Draft
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/books/${b.slug}/edit`}
                              className="p-2 rounded-lg text-[#5C756D] border border-transparent hover:border-[#E3E8E5] hover:bg-white hover:text-[#1A3C34] hover:shadow-sm transition-all"
                              title="Edit Book"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => toggleVisibility(b)}
                              className={`p-2 rounded-lg border border-transparent transition-all ${b.visibility === "public"
                                  ? "text-[#5C756D] hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                  : "text-[#5C756D] hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                }`}
                              title={b.visibility === "public" ? "Unpublish" : "Publish"}
                            >
                              {b.visibility === "public" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => remove(b)}
                              className="p-2 rounded-lg text-[#5C756D] border border-transparent hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all"
                              title="Delete Book"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-[#5C756D]">
                          <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                          <p className="text-lg font-bold text-[#1A3C34]">No books found</p>
                          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- PAGINATION --- */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className={`p-2 rounded-lg border transition-all ${page === 1
                    ? "bg-[#F4F7F5] text-[#8BA699] border-transparent cursor-not-allowed"
                    : "bg-white text-[#1A3C34] border-[#E3E8E5] hover:bg-[#F4F7F5] shadow-sm"
                  }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E3E8E5] p-1 shadow-sm">
                {getPageNumbers().map((pageNum, idx) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-3 py-2 text-[#8BA699] text-sm font-medium">...</span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`
                        w-8 h-8 rounded-lg text-sm font-bold transition-all flex items-center justify-center
                        ${page === pageNum
                          ? "bg-[#1A3C34] text-white shadow-md"
                          : "text-[#5C756D] hover:bg-[#F4F7F5] hover:text-[#1A3C34]"
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className={`p-2 rounded-lg border transition-all ${page === totalPages
                    ? "bg-[#F4F7F5] text-[#8BA699] border-transparent cursor-not-allowed"
                    : "bg-white text-[#1A3C34] border-[#E3E8E5] hover:bg-[#F4F7F5] shadow-sm"
                  }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}