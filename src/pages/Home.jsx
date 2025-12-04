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
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { homepage } = useSite();

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34] pb-20">
      <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12 lg:space-y-16">
        {(homepage.blocks || []).map((b, i) => <Block key={i} block={b} />)}
      </div>
      <ScrollToTopButton />
    </div>
  );
}

/* ----------------------------- Blocks ---------------------------- */
function Block({ block }) {
  if (block.type === "hero") {
    return (
      <section className="relative rounded-3xl overflow-hidden bg-[#1A3C34] text-white shadow-xl group min-h-[400px] md:min-h-[500px] grid grid-cols-1 md:grid-cols-2 items-center">
        {/* Content Side */}
        <div className="p-8 md:p-12 lg:p-16 z-10 relative">
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#4A7C59]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 md:mb-6 leading-tight drop-shadow-sm">
            {block.title}
          </h2>
          <p className="text-[#8BA699] text-lg md:text-xl mb-8 leading-relaxed max-w-lg font-light">
            {block.subtitle}
          </p>
          
          {block.ctaText && (
            <Link 
              to={block.ctaHref || "/catalog"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1A3C34] rounded-xl font-bold text-lg hover:bg-[#E8F0EB] transition-all shadow-lg hover:shadow-xl active:scale-95 group-hover:translate-x-1 duration-300"
            >
              {block.ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Image Side */}
        {block.image && (
          <div className="relative w-full h-64 md:h-full overflow-hidden">
            <img
              src={assetUrl(block.image)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A3C34]/80 to-transparent md:bg-gradient-to-l"></div>
          </div>
        )}
      </section>
    );
  }

  if (block.type === "banner") {
    return (
      <a
        href={block.ctaLink || "/"}
        className="block rounded-theme overflow-hidden shadow-theme group relative"
      >
        <img
          src={assetUrl(block.image)}
          alt={block.alt || ""}
          className="w-full object-cover transition-all duration-500 group-hover:brightness-110 group-hover:saturate-150"
        />
        {/* Optional: Sliding overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </a>
    );
  }

  if (block.type === "grid") {
    return <GridSection title={block.title} query={block.query} />;
  }

  if (block.type === "html") {
    return (
      <section 
        className="prose prose-stone prose-lg max-w-none text-[#4A5D56] bg-white p-8 rounded-2xl shadow-sm border border-[#E3E8E5]" 
        dangerouslySetInnerHTML={{ __html: block.html }} 
      />
    );
  }

  return null;
}

/* ------------------------- Showcase Grid ------------------------- */
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
      const params = { q, sort, limit };
      if (categories.length) params.categories = categories;

      const { data } = await api.get("/books", { params });
      let list = Array.isArray(data.items) ? data.items : [];

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
      {title && (
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#1A3C34] flex items-center gap-3">
            <span className="w-2 h-8 bg-[#4A7C59] rounded-full"></span>
            {title}
          </h3>
          <Link 
            to="/catalog" 
            className="text-[#4A7C59] hover:text-[#1A3C34] font-medium text-sm flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {!items.length ? (
        <div className="rounded-2xl border border-[#E3E8E5] bg-white p-8 text-center text-[#8BA699] italic">
          No items found in this collection.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
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
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-[#E3E8E5] overflow-hidden hover:border-[#4A7C59] hover:shadow-lg transition-all duration-300">
      
      {/* Image Container */}
      <Link
        to={`/book/${book.slug}`}
        className="relative block w-full aspect-[3/4] bg-[#F4F7F5] overflow-hidden"
      >
        <div className="w-full h-full p-4 flex items-center justify-center">
          <img
            src={assetUrl(book.assets?.coverUrl)}
            alt={book.title}
            className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-110"
            loading="lazy"
          />
        </div>
        {/* Discount Badge */}
        {off > 0 && (
          <span className="absolute top-3 left-3 bg-[#E8F0EB] text-[#1A3C34] text-[10px] font-bold px-2 py-1 rounded border border-[#DCE4E0]">
            -{off}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <Link 
          to={`/book/${book.slug}`} 
          className="font-serif font-bold text-[#1A3C34] text-base leading-tight line-clamp-2 mb-1 group-hover:text-[#4A7C59] transition-colors"
        >
          {book.title}
        </Link>

        <div className="mt-auto pt-3 flex items-center gap-2">
          <span className="font-bold text-[#1A3C34] text-lg">₹{price}</span>
          {off > 0 && (
            <span className="text-xs line-through text-[#8BA699]">₹{mrp}</span>
          )}
        </div>
      </div>
    </article>
  );
}