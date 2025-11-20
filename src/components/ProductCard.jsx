// src/components/ProductCard.jsx
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const items = useCart((s) => s.items);
  const replaceAll = useCart((s) => s.replaceAll);
  const addLocal = useCart((s) => s.add);

  const id = book._id || book.id;
  const inCart = items.some((i) => (i._id || i.id || i.bookId) === id);

  const { isCustomer, token } = useCustomer();


  const addToCart = async () => {
    window.dispatchEvent(new Event("cart:add"));

    // Check if customer is logged in
    if (!isCustomer) {
      console.warn("⚠️ User not logged in, redirecting to login");
      t.info("Please login to add items to your cart");
      navigate("/login", { state: { next: "/cart" } });
      return;
    }

    // ✅ Simple token check (no external function needed)
    try {
      const hasToken = !!localStorage.getItem("customer_jwt");
      if (!hasToken) {
        console.error("❌ No customer token found!");
        t.err("Session expired, please login again");
        navigate("/login", { state: { next: "/cart" } });
        return;
      }

      // Call API with token (interceptor will attach it)
      const res = await CustomerAPI.addToCart(token, { bookId: id, qty: 1 });

      // Update local cart state
      replaceAll(res?.data?.cart?.items || []);

      t.ok("Added to cart");
      navigate("/cart");

    } catch (e) {
      console.error("❌ Add to cart failed:", {
        status: e?.response?.status,
        error: e?.response?.data,
        message: e.message
      });

      // Handle 401 specifically
      if (e?.response?.status === 401) {
        t.err("Session expired, please login again");
        localStorage.removeItem("customer_jwt");
        localStorage.removeItem("customer_profile");
        navigate("/login", { state: { next: "/cart" } });
        return;
      }

      // Fallback: Add locally for better UX
      console.log("ℹ️ Falling back to local cart");
      addLocal({
        ...book,
        price: book.price || book.pric || book.mrp,
        mrp: book.mrp || book.price || book.pric,
        qty: 1
      });

      t.warn("Added to local cart (sync with server failed)");
      navigate("/cart");
    }
  };

  const goToCart = () => {
    t.info("Already in your cart");
    navigate("/cart");
  };

  const cover =
    (Array.isArray(book?.assets?.coverUrl)
      ? book.assets.coverUrl[0]
      : book?.assets?.coverUrl) || "/uploads/placeholder.png";

  return (
    <article className="card card-hover p-4 flex flex-col h-full">
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

      <Link
        to={`/book/${book.slug}`}
        className="mt-3 font-medium text-fg leading-tight line-clamp-2"
      >
        {book.title}
      </Link>
      <div className="text-fg-muted text-sm line-clamp-1">
        {(book.authors || []).join(", ")}
      </div>

      <div className="mt-auto pt-3 flex items-center justify-between gap-3">
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
      flex items-center justify-center
      focus:outline-none focus-visible:outline-none
    "
            title="Add to cart"
            aria-label="Add to cart"
          >
            {/* Cart Icon - Hidden on hover */}
            <span
              className="
        absolute
        flex items-center justify-center
        h-[44px] w-[52px]
        transition-all duration-300
        group-hover:opacity-0 group-hover:scale-75
      "
            >
              <CartIcon className="h-5 w-5" />
            </span>

            {/* Text - Shown on hover */}
            <span
              className="
        text-[0.95rem] font-medium whitespace-nowrap
        opacity-0 scale-75
        transition-all duration-300
        group-hover:opacity-100 group-hover:scale-100
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
    </article>
  );
}