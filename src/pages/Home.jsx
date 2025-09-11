import { useEffect, useState } from "react";
import { useSite } from "../contexts/SiteConfig";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";

export default function Home() {
  const { homepage } = useSite();
  return (
    <div className="mx-auto max-w-screen-xl px-4 space-y-10 mt-6">
      {(homepage.blocks || []).map((b, i) => <Block key={i} block={b} />)}
    </div>
  );
}

function Block({ block }) {
  if (block.type === "hero") {
    return (
      <section className="hero rounded-theme overflow-hidden grid md:grid-cols-2">
        <div className="p-8">
          <h2 className="text-3xl font-bold">{block.title}</h2>
          <p className="text-fg-muted mt-2">{block.subtitle}</p>
          {block.ctaText && (
            <Link
              to={block.ctaHref || "/catalog"}
              className="inline-block mt-4 px-5 py-3 rounded-theme btn-primary"
            >
              {block.ctaText}
            </Link>
          )}
        </div>
        {block.image && <img src={block.image} alt="" className="w-full h-72 md:h-full object-cover" />}
      </section>
    );
  }
  if (block.type === "banner") {
    return (
      <a href={block.href || "#"} className="block rounded-theme overflow-hidden shadow-theme">
        <img src={block.image} alt={block.alt || ""} className="w-full object-cover" />
      </a>
    );
  }
  if (block.type === "grid") return <GridSection title={block.title} query={block.query} />;
  if (block.type === "html") return <section className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.html }} />;
  return null;
}

function GridSection({ title, query }) {
  const [items, setItems] = useState([]);
  const layout = query?.layout || "classic";
  const cols = Number(query?.cols || 4);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/books", { params: query || { limit: 8 } });
      setItems(data.items || []);
    })();
  }, [JSON.stringify(query)]);

  const gridClass =
    cols === 2 ? "grid-cols-2" :
      cols === 3 ? "grid-cols-2 md:grid-cols-3" :
        cols === 5 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5" :
          cols === 6 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" :
            "grid-cols-2 md:grid-cols-4";

  return (
    <section>
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      <div className={`grid ${gridClass} gap-5`}>
        {items.map(b =>
          layout === "white"
            ? <WhiteMiniCard key={b._id} book={b} />
            : <ProductCard key={b._id} book={b} />
        )}
      </div>
    </section>
  );
}

/* compact white variant for homepage only */
function WhiteMiniCard({ book }) {
  const { items, add, inc, dec } = useCart.getState();
  const inCart = (items || []).find(i => (i._id || i.id) === (book._id || book.id));
  const d = { mrp: Number(book.mrp) || 0, price: Number(book.price) || 0 };

  return (
    <article className="bg-white rounded-xl shadow-md border border-gray-100 p-3 flex flex-col">
      <Link
        to={`/book/${book.slug}`}
        className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 grid place-items-center p-4"
      >
        <img
          src={assetUrl(book.assets?.coverUrl)}
          alt={book.title}
          className="max-h-[88%] max-w-[88%] object-contain"
        />
      </Link>
      <Link to={`/book/${book.slug}`} className="mt-3 font-medium line-clamp-2">{book.title}</Link>
      <div className="text-gray-500 text-sm">{(book.authors || []).join(", ")}</div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <div className="font-semibold">₹{d.price}</div>
          {d.mrp > d.price && <div className="line-through text-sm text-gray-400">₹{d.mrp}</div>}
        </div>

        {!inCart ? (
          <button onClick={() => add(book, 1)} className="btn-secondary px-3 py-1.5 rounded-theme">Add</button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => dec(book._id || book.id)} className="btn-secondary px-2 py-1 rounded-theme">–</button>
            <div className="w-8 text-center">{inCart.qty}</div>
            <button onClick={() => inc(book._id || book.id)} className="btn-secondary px-2 py-1 rounded-theme">+</button>
          </div>
        )}
      </div>
    </article>
  );
}

