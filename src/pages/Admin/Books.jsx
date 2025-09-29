// src/pages/Admin/Books.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../contexts/Auth";
import { assetUrl } from "../../api/asset";
import FancyButton from "../../components/button/button";

export default function BooksAdmin() {
  const { token } = useAuth();
  const auth = { headers: { Authorization: `Bearer ${token || localStorage.getItem("admin_jwt")}` } };

  const [q, setQ] = useState("");
  const [vis, setVis] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/books", {
        params: { q, limit: 50, sort: "new", visibility: vis },
        headers: auth.headers,
      });
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);   // first load
  useEffect(() => { load(); }, [vis]); // when visibility filter changes

  async function toggleVisibility(b) {
    const next = b.visibility === "public" ? "draft" : "public";

    // Preserve existing images (and sample PDF if you use it)
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
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Books</h1>
        <FancyButton to="/admin/add-book" text="Add book" />
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
          <select
            className="bg-white border border-gray-300 rounded-lg px-3 py-2"
            value={vis}
            onChange={e => setVis(e.target.value)}
          >
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="draft">Draft</option>
          </select>
          <button onClick={load} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
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
                        {lastCover ? (
                          <img
                            src={assetUrl(lastCover)}
                            alt=""
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
