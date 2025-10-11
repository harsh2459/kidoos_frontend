import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { assetUrl } from "../../api/asset";
import FancyButton from "../../components/button/button";
import { saveAs } from "file-saver"; // Import file-saver for exporting
import { t } from "../../lib/toast"; // Import toast utility

export default function BooksAdmin() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };
  const [q, setQ] = useState(""); // Search query
  const [vis, setVis] = useState("all"); // Visibility filter
  const [items, setItems] = useState([]); // Books list
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedBooks, setSelectedBooks] = useState([]); // Selected books for bulk actions
  const [showDropdown, setShowDropdown] = useState(false); // For the three-dot menu
  const [fileName, setFileName] = useState(""); // Store selected file name

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/books", {
        params: { q, limit: 50, sort: "new", visibility: vis }, // Get books based on search and visibility
        headers: auth.headers,
      });
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);   // first load
  useEffect(() => { load(); }, [vis, q]); // when visibility filter or search term changes

  // Toggle selected book for bulk actions
  const toggleSelection = (bookId) => {
    setSelectedBooks(prevSelected => {
      if (prevSelected.includes(bookId)) {
        return prevSelected.filter(id => id !== bookId);
      } else {
        return [...prevSelected, bookId];
      }
    });
  };

  // Select all books
  const selectAllBooks = () => {
    const allBookIds = items.map(book => book._id);
    setSelectedBooks(allBookIds);
  };

  // Toggle visibility (publish/draft) for a book
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

  // Delete a book
  async function remove(b) {
    if (!window.confirm(`Delete "${b.title}"?`)) return;
    await api.delete(`/books/${b._id}`, auth);
    setItems(arr => arr.filter(x => x._id !== b._id));
  }

  // Bulk actions for selected books
  async function bulkUpdateVisibility(status) {
    for (const bookId of selectedBooks) {
      await api.patch(`/books/${bookId}`, { visibility: status }, auth);
    }
    load(); // Reload the books
  }

  const handleImport = (e) => {
    const file = e.target.files ? e.target.files[0] : null;

    // Log the file to see if it's being selected correctly
    console.log(file);

    // If no file was selected, show an error message
    if (!file) {
    
      t.err("Please select a file to import.");
      return;
    }

    setFileName(file.name); // Set the file name to show to the user

    const formData = new FormData();
    formData.append("file", file);

    // Log FormData to verify the contents
    console.log("FormData:", formData);

    api.post("/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        'Authorization': `Bearer ${auth.token}`, // Add authorization if needed
      },
    })
      .then(response => {
        t.ok("Books imported successfully");
        load(); // Reload books (optional, if you want to refresh the list after import)
      })
      .catch(error => {
        t.err("Error importing books");
        
      });
  };

  const handleExport = () => {
    // API request to fetch books data
    api.get("/export", { headers: auth.headers })
      .then(response => {
        const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
        saveAs(blob, 'books_export.xlsx'); // Use file-saver to export the file
      })
      .catch(error => {
        t.err("Error exporting books");
      
      });
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
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
                <label htmlFor="import-books" className="w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer">
                  Import Books
                  <input
                    id="import-books"
                    type="file"
                    style={{ display: 'none' }}
                    accept=".xlsx,.xls,.csv"  // Accept only Excel or CSV files
                    onChange={handleImport}   // Trigger the import handler
                  />
                </label>
                <button onClick={handleExport} className="w-full px-4 py-2 text-left hover:bg-gray-100">Export Books</button>
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
          <div className="flex gap-2">
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
      </div>

      {/* Bulk Actions Buttons - Moved to top */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => bulkUpdateVisibility("public")}
          className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
        >
          Make Selected Public
        </button>
        <button
          onClick={() => bulkUpdateVisibility("draft")}
          className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
        >
          Make Selected Draft
        </button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-3 px-4">
                    <input
                      type="checkbox"
                      onChange={() => setSelectedBooks(selectedBooks.length === items.length ? [] : items.map(b => b._id))}
                      checked={selectedBooks.length === items.length}
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
                          className={`px-2 py-0.5 rounded-full text-xs border
                          ${b.visibility === "public"
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
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No books found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
