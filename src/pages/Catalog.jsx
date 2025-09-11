import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import FilterBar from "../components/FilterBar";
import { assetUrl } from "../api/asset";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartStore";
import ProductCard from "../components/ProductCard";
// Custom ProductCard for white theme and showcase-fit images

export default function Catalog() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [rawItems, setRawItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/books", { params: { q, page: 1, limit: 20 } });
      setRawItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]);

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

  return (
    <div
      id="top"
      className="mx-auto max-w-screen-xl px-2 md:px-8 py-8 bg-surface"
      style={{
        minHeight: "100vh",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-fg tracking-tight">
            Catalog <span className="text-fg-subtle text-lg font-medium">({total})</span>
          </h1>
          <div className="text-sm text-fg-subtle mt-1">
            Showing <span className="font-semibold text-fg">{items.length}</span> of {total}
          </div>
        </div>
        <div className="w-full md:w-auto">
          <FilterBar q={q} setQ={setQ} sort={sort} setSort={setSort} />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-fg-subtle text-lg font-medium">Loading…</div>
      ) : (
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
      )}
    </div>
  );
}
