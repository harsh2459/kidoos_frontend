// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useSite } from "../contexts/SiteConfig";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { assetUrl } from "../api/asset";
import '../styles/style-button.css';
import FancyButton from "../components/button/button";
import ScrollToTopButton from "../components/ScrollToTopButton";

/* ----------------------------- Page ------------------------------ */
export default function Home() {
  const { homepage } = useSite();
  return (
    <div className="mx-auto max-w-screen-xl px-4 space-y-10 mt-6">
      {(homepage.blocks || []).map((b, i) => <Block key={i} block={b} />)}
    </div>
  );
}

/* ----------------------------- Blocks ---------------------------- */
function Block({ block }) {
  if (block.type === "hero") {
    return (
      <section className="hero rounded-theme overflow-hidden grid md:grid-cols-2">
        <div className="p-8">
          <h2 className="text-3xl font-bold">{block.title}</h2>
          <p className="text-fg-muted mt-2">{block.subtitle}</p>
          {block.ctaText && (
            <FancyButton to={block.ctaHref || "/catalog"} text={block.ctaText} />
          )}
        </div>
        {block.image && (
          <img src={assetUrl(block.image)} alt="" className="w-full h-72 md:h-full object-cover" />
        )}
      </section>
    );
  }

  if (block.type === "banner") {
    return (
      <a href={block.href || "#"} className="block rounded-theme overflow-hidden shadow-theme">
        <img src={assetUrl(block.image)} alt={block.alt || ""} className="w-full object-cover" />
      </a>
    );
  }

  if (block.type === "grid") {
    return <GridSection title={block.title} query={block.query} />;
  }

  if (block.type === "html") {
    return (
      <section className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.html }} />
    );
  }

  return null;
}

/* ------------------------- Showcase Grid ------------------------- */
/**
 * Static grid (no scrolling):
 * - 2 cols on small, 3 on md, 4 on lg
 * - `layout === "classic"` -> ProductCard (includes Add to Cart)
 * - otherwise -> compact card without Add
 */
function GridSection({ title, query }) {
  const [items, setItems] = useState([]);

  const layout = query?.layout || "classic";
  const limit = Number(query?.limit || 12);
  const q = query?.q || "";
  const sort = query?.sort || "new";

  // normalize "Category" field (CSV -> array, lowercase)
  const categories = (query?.category || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toLowerCase());

  useEffect(() => {
    (async () => {
      // send only the fields the API should use
      const params = { q, sort, limit };
      if (categories.length) params.categories = categories; // preferred key for backend

      const { data } = await api.get("/books", { params });
      let list = Array.isArray(data.items) ? data.items : [];

      // client-side guard: keep only books that match ANY of the chosen categories
      if (categories.length) {
        list = list.filter(b => {
          const bookCats = (b?.categories || []).map(c => String(c).toLowerCase().trim());
          return categories.some(c => bookCats.includes(c));
        });
      }

      setItems(list.slice(0, limit));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sort, limit, JSON.stringify(categories)]);

  return (
    <section>
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}

      {!items.length ? (
        <div className="rounded-2xl border border-border-subtle bg-surface p-6 text-fg-subtle">
          No items found.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((b) =>
            layout === "classic" ? (
              <div key={b._id || b.id} className="h-full">
                <ProductCard book={b} />
              </div>
            ) : (
              <SimpleShowcaseCard key={b._id || b.id} book={b} />
            )
          )}
        </div>
      )}
    </section>
  );
}

/* --------------------- Simple (no Add) card ---------------------- */
function SimpleShowcaseCard({ book }) {
  const mrp = Number(book.mrp) || 0;
  const price = Number(book.price) || 0;
  const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <article
      className="
        h-full bg-white rounded-2xl border border-gray-200 p-3
        shadow-sm hover:shadow-md hover:-translate-y-0.5 transition
        flex flex-col
      "
    >
      <Link
        to={`/book/${book.slug}`}
        className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 grid place-items-center p-4"
      >
        <img
          src={assetUrl(book.assets?.coverUrl)}
          alt={book.title}
          className="max-h-[88%] max-w-[88%] object-contain"
          loading="lazy"
        />
      </Link>

      <Link to={`/book/${book.slug}`} className="mt-3 font-medium leading-snug line-clamp-2">
        {book.title}
      </Link>

      <div className="mt-1 flex items-center gap-2">
        <div className="font-semibold">₹{price}</div>
        {off > 0 && (
          <>
            <div className="line-through text-xs text-fg-subtle">₹{mrp}</div>
            <span className="text-[10px] text-green-700 bg-green-100 rounded-full px-2 py-0.5 border">
              -{off}%
            </span>
          </>
        )}
      </div>
      <ScrollToTopButton />
    </article>
  );
}
