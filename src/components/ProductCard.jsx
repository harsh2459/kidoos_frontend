// src/components/ProductCard.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { assetUrl } from "../api/asset";
import { useCart } from "../contexts/CartStore";
import { deal as dealFn } from "../lib/Price";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerAPI } from "../api/customer";
import { t } from "../lib/toast";

function CartIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default function ProductCard({ book }) {
  const d = dealFn(book);

  const location = useLocation();
  const navigate = useNavigate();

  const items = useCart((s) => s.items);
  const replaceAll = useCart((s) => s.replaceAll);
  const addLocal = useCart((s) => s.add);

  const id = book._id || book.id;
  const inCart = items.some((i) => (i._id || i.id || i.bookId) === id);

  const { isCustomer, token } = useCustomer();
  const [pop, setPop] = useState(false);

  const addToCart = async () => {
    setPop(true);
    setTimeout(() => setPop(false), 600);
    window.dispatchEvent(new Event("cart:add"));

    if (!isCustomer) {
      t.info("Please login to add items to your cart");
      navigate("/login", { state: { next: "/cart" } });
      return;
    }

    try {
      const res = await CustomerAPI.addToCart(token, { bookId: id, qty: 1 });
      replaceAll(res?.data?.cart?.items || []);
      t.ok("Added to cart");
      navigate("/cart");
    } catch (e) {
      
      // Fallback: still add locally so UX is smooth
      addLocal({
        ...book,
        price: book.price || book.pric || book.mrp, // ensure price is set
        mrp: book.mrp || book.price || book.pric,   // ensure mrp is set (for discount display)
        qty: 1
      });
      t.ok("Added to cart");
      navigate("/cart");
    }
  };

  const goToCart = () => {
    t.info("Already in your cart");
    navigate("/cart");
  };

  // Prefer first image as cover (your current rule)
  const cover =
    (Array.isArray(book?.assets?.coverUrl)
      ? book.assets.coverUrl[0]
      : book?.assets?.coverUrl) || "/uploads/placeholder.png";

  return (
    <article className="card card-hover p-4 flex flex-col h-full">
      {/* Image */}
      <Link
        to={`/book/${book.slug}`}
        title={book.title}
        className="
          group relative block rounded-xl overflow-hidden bg-white border border-slate-100
          transition-all duration-300 ease-out focus:outline-none focus-visible:outline-none
        "
      >
        <div className="aspect-[3/4] w-full grid place-items-center p-4 bg-white overflow-hidden">
          <img
            src={assetUrl(cover)}
            alt={book.title}
            loading="lazy"
            draggable={false}
            className="
              max-h-[88%] max-w-[88%] object-contain
              transition-transform duration-300 ease-out
              group-hover:scale-[1.05]
            "
          />
        </div>
        <div
          className="
            pointer-events-none absolute inset-0
            bg-white/0 group-hover:bg-primary/5
            transition-colors duration-300
          "
        />
      </Link>

      {/* Title & authors */}
      <Link
        to={`/book/${book.slug}`}
        className="mt-3 font-medium text-fg leading-tight line-clamp-2"
      >
        {book.title}
      </Link>
      <div className="text-fg-muted text-sm line-clamp-1">
        {(book.authors || []).join(", ")}
      </div>

      {/* Pricing + CTA */}
      <div className="mt-auto pt-3 flex items-center justify-between gap-3">
        {/* Pricing block: Price, MRP (struck), Discount badge */}
        <div className="flex items-baseline gap-2">
          <div className="font-semibold">₹{d.price}</div>
          {d.mrp > d.price && (
            <>
              <div className="line-through text-sm text-fg-subtle">₹{d.mrp}</div>
              {d.off > 0 && (
                <span className="text-[10px] text-green-700 bg-green-100 rounded-full px-2 py-0.5 border">
                  -{d.off}%
                </span>
              )}
            </>
          )}
        </div>

        {/* CTA */}
        {!inCart ? (
          <button
            onClick={addToCart}
            className="
              group relative
              h-[44px] w-[52px]
              hover:w-40
              -mr-1
              rounded-full bg-slate-900 text-white
              shadow-sm hover:shadow-md
              transition-all duration-300
              overflow-hidden
              flex items-center
              focus:outline-none focus-visible:outline-none
            "
            title="Add to cart"
            aria-label="Add to cart"
          >
            <span
              className="
                flex items-center justify-center
                h-[44px] w-[52px] shrink-0
                transition-transform duration-300
                group-hover:-translate-x-1
              "
            >
              <CartIcon className="h-5 w-5" />
            </span>
            <span
              className="
                pr-4
                text-[0.95rem] whitespace-nowrap
                opacity-0 translate-x-2
                transition-all duration-300
                group-hover:opacity-100 group-hover:translate-x-0
              "
            >
              Add to Cart
            </span>
          </button>
        ) : (
          <button
            onClick={goToCart}
            className="
              inline-flex items-center justify-center gap-2
              h-[44px] w-40
              -mr-1
              rounded-full bg-slate-900 text-white
              shadow-sm hover:shadow-md transition-all duration-300
              focus:outline-none focus-visible:outline-none
            "
            title="Go to cart"
          >
            <CartIcon className="h-5 w-5" />
            <span className="text-[0.95rem]">Go to Cart</span>
          </button>
        )}
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .group:hover img { transform: none !important; }
        }
      `}</style>
    </article>
  );
}
