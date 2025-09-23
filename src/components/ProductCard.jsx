// src/components/ProductCard.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { assetUrl } from "../api/asset";
import { useCart } from "../contexts/CartStore";
import { deal as dealFn } from "../lib/Price";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerAPI } from "../api/customer";

export default function ProductCard({ book }) {
  const d = dealFn(book);

  // cart state
  const items = useCart((s) => s.items);
  const add   = useCart((s) => s.add);

  // auth + routing
  const navigate = useNavigate();
  const location = useLocation();
  const { isCustomer, token } = useCustomer();

  const id = book._id || book.id;
  const inCart = Array.isArray(items) && items.some((i) => (i._id || i.id) === id);

  const handleClick = async () => {
    // Guest: go login, then land in cart
    if (!isCustomer) {
      navigate("/login", { state: { next: "/cart" } });
      return;
    }

    // Already in cart: just open cart
    if (inCart) {
      navigate("/cart");
      return;
    }

    // Logged in + not in cart: try server add, always mirror locally, go to cart
    try {
      await CustomerAPI.addToCart(token, { bookId: id, qty: 1 });
    } catch (e) {
      console.error("addToCart failed; falling back to local:", e);
      // proceed anyway; UI should still update via local cart
    } finally {
      add(book, 1);
      navigate("/cart");
    }
  };

  return (
    <article className="card card-hover p-4 flex flex-col h-full relative">
      {/* Cover */}
      <Link
        to={`/book/${book.slug}`}
        className="relative block rounded-lg overflow-hidden bg-white border border-slate-100"
        title={book.title}
      >
        <div className="aspect-[3/4] w-full grid place-items-center p-4 bg-white">
          <img
            src={assetUrl(book.assets?.coverUrl)}
            alt={book.title}
            loading="lazy"
            className="max-h-[88%] max-w-[88%] object-contain"
            draggable={false}
          />
        </div>
        {d.off > 0 && (
          <span className="badge-green absolute top-2 left-2">-{d.off}% OFF</span>
        )}
      </Link>

      {/* Text block */}
      <Link
        to={`/book/${book.slug}`}
        className="mt-3 font-medium text-fg leading-tight line-clamp-2"
      >
        {book.title}
      </Link>
      <div className="text-fg-muted text-sm line-clamp-1">
        {(book.authors || []).join(", ")}
      </div>

      {/* Price + Button */}
      <div className="mt-auto pt-3 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <div className="font-semibold">₹{d.price}</div>
          {d.mrp > d.price && (
            <div className="line-through text-sm text-fg-subtle">₹{d.mrp}</div>
          )}
        </div>

        <button
          onClick={handleClick}
          className="btn-primary px-4 py-2 rounded-theme"
          title={inCart ? "Go to cart" : (isCustomer ? "Add to cart" : "Login to add")}
        >
          {inCart ? "Go to Cart" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
