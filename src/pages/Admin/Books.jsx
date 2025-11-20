// Complete Books.jsx with Pagination - Replace your entire Books.jsx with this:

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { assetUrl } from "../../api/asset";
import FancyButton from "../../components/button/button";
import { saveAs } from "file-saver";
import { t } from "../../lib/toast";

export default function BooksAdmin() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };
  
  const [q, setQ] = useState("");
  const [vis, setVis] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // ✅ Pagination state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const totalPages = Math.ceil(total / limit);

  async function load() {
    setLoading(true);
    try {
      console.log("🔍 Loading books - page:", page, "visibility:", vis);

      const { data } = await api.get("/books", {
        params: {
          q,
          limit,
          page, // ✅ Send page number
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
  }, []); // First load

  useEffect(() => { 
    setPage(1); // ✅ Reset to page 1 when filters change
    load(); 
  }, [vis, q]); // When visibility or search changes

  useEffect(() => { 
    load(); // ✅ Load when page changes
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
    setTotal(prev => prev - 1); // ✅ Update total count
  }

  async function bulkUpdateVisibility(status) {
    for (const bookId of selectedBooks) {
      await api.patch(`/books/${bookId}`, { visibility: status }, auth);
    }
    load();
  }

  const handleImport = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) {
      t.err("Please select a file to import.");
      return;
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv"
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      t.err("Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/books/import", formData);
      t.ok(`Books imported successfully: ${response.data.count || 0} books`);
      await load();
      setShowDropdown(false);
    } catch (error) {
      const errorMsg = error?.response?.data?.error || error?.message || "Error importing books";
      t.err(errorMsg);
    }
  };

  const handleExport = () => {
    api.get("/books/export", { headers: auth.headers })
      .then(response => {
        const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
        saveAs(blob, 'books_export.xlsx');
      })
      .catch(error => {
        t.err("Error exporting books");
      });
  };

  // ✅ Pagination controls
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
    }
  };

  // ✅ Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Show max 5 page numbers

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      // Add ellipsis if needed
      if (start > 2) pages.push('...');

      // Add pages around current
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) pages.push('...');

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Books</h1>
        <div className="flex gap-2">
          <FancyButton to="/admin/add-book" text="Add Book" />
          <div className="relative pt-4">
            <button onClick={() => setShowDropdown(!showDropdown)} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
              ⋮
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <label htmlFor="import-books" className="block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer">
                  Import Books
                  <input
                    id="import-books"
                    type="file"
                    style={{ display: 'none' }}
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImport}
                  />
                </label>
                <button onClick={handleExport} className="w-full px-4 py-2 text-left hover:bg-gray-100">
                  Export Books
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 mb-4">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Search title, author, tag…"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
          />
          <button
            onClick={() => setVis("all")}
            className={`px-4 py-2 rounded-lg ${vis === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            All
          </button>
          <button
            onClick={() => setVis("public")}
            className={`px-4 py-2 rounded-lg ${vis === "public" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700"} hover:bg-emerald-600`}
          >
            Public
          </button>
          <button
            onClick={() => setVis("draft")}
            className={`px-4 py-2 rounded-lg ${vis === "draft" ? "bg-gray-500 text-white" : "bg-gray-200 text-gray-700"} hover:bg-gray-600`}
          >
            Draft
          </button>
        </div>
      </div>

      {/* ✅ Pagination Info & Bulk Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{items.length}</span> of <span className="font-semibold">{total}</span> books
          {totalPages > 1 && <span className="ml-2">• Page {page} of {totalPages}</span>}
        </div>
        
        {selectedBooks.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => bulkUpdateVisibility("public")}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
            >
              Make Selected Public ({selectedBooks.length})
            </button>
            <button
              onClick={() => bulkUpdateVisibility("draft")}
              className="px-4 py-2 text-sm rounded-lg bg-gray-500 text-white hover:bg-gray-600"
            >
              Make Selected Draft ({selectedBooks.length})
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading books...</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="py-3 px-4">
                      <input
                        type="checkbox"
                        onChange={() => setSelectedBooks(selectedBooks.length === items.length ? [] : items.map(b => b._id))}
                        checked={selectedBooks.length === items.length && items.length > 0}
                      />
                    </th>
                    <th className="py-3 px-4">Cover</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Authors</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 w-56">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((b, i) => {
                    const lastCover = b?.assets?.coverUrl?.length ? b.assets.coverUrl[0] : undefined;
                    return (
                      <tr key={b._id} className={i % 2 ? "bg-gray-50/40" : "bg-white"}>
                        <td className="py-2 px-4">
                          <input
                            type="checkbox"
                            checked={selectedBooks.includes(b._id)}
                            onChange={() => toggleSelection(b._id)}
                          />
                        </td>
                        <td className="py-2 px-4">
                          {lastCover ? (
                            <img
                              src={assetUrl(lastCover)}
                              alt="Cover"
                              className="h-12 w-9 object-cover rounded-md"
                            />
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-2 px-4">{b.title}</td>
                        <td className="py-2 px-4">{(b.authors || []).join(", ")}</td>
                        <td className="py-2 px-4">₹{b.price}</td>
                        <td className="py-2 px-4">{b.inventory?.stock ?? 0}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs border ${
                              b.visibility === "public"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {b.visibility || "draft"}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/admin/books/${b.slug}/edit`}
                              className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => toggleVisibility(b)}
                              className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50"
                            >
                              {b.visibility === "public" ? "Unpublish" : "Publish"}
                            </button>
                            <button
                              onClick={() => remove(b)}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        No books found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ✅ Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg border ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                ← Previous
              </button>

              <div className="flex gap-2">
                {getPageNumbers().map((pageNum, idx) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-4 py-2 rounded-lg border ${
                        page === pageNum
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg border ${
                  page === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}