export default function FilterBar({ q, setQ, sort, setSort }) {
  return (
    <div className="bg-card rounded-theme p-4 flex flex-wrap items-center gap-3">
      {/* search */}
      <div className="with-icon flex-1 min-w-[240px] bg-surface-subtle">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search books, authors, tags…"
          className="w-full bg-transparent outline-none border-border-subtle px-3 py-2 rounded-lg"
        />
      </div>

      {/* sort */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="min-w-[180px] rounded-theme bg-surface border border-border px-3 py-2"
      >
        <option value="new">Newest</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
      </select>
    </div>
  );
}