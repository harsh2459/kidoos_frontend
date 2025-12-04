// src/components/ProductCard.jsx
import { Link, useNavigate } from "react-router-dom";
import { assetUrl } from "../api/asset";
import { useCart } from "../contexts/CartStore";
import { deal as dealFn } from "../lib/Price";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerAPI } from "../api/customer";
import { t } from "../lib/toast";
import { ShoppingCart, Check } from "lucide-react"; // Using Lucide icons for consistency

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

    if (!isCustomer) {
      t.info("Please login to add items to your cart");
      navigate("/login", { state: { next: "/cart" } });
      return;
    }

    try {
      const hasToken = !!localStorage.getItem("customer_jwt");
      if (!hasToken) {
        t.err("Session expired, please login again");
        navigate("/login", { state: { next: "/cart" } });
        return;
      }

      const res = await CustomerAPI.addToCart(token, { bookId: id, qty: 1 });
      replaceAll(res?.data?.cart?.items || []);
      t.ok("Added to cart");
      navigate("/cart");

    } catch (e) {
      if (e?.response?.status === 401) {
        t.err("Session expired, please login again");
        localStorage.removeItem("customer_jwt");
        localStorage.removeItem("customer_profile");
        navigate("/login", { state: { next: "/cart" } });
        return;
      }

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
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-[#E3E8E5] overflow-hidden hover:border-[#4A7C59] hover:shadow-lg transition-all duration-300">
      
      {/* 1. IMAGE CONTAINER */}
      <Link
        to={`/book/${book.slug}`}
        title={book.title}
        className="relative block w-full aspect-[3/4] overflow-hidden bg-[#F4F7F5]"
      >
        <div className="w-full h-full p-6 flex items-center justify-center">
          <img
            src={assetUrl(cover)}
            alt={book.title}
            loading="lazy"
            draggable={false}
            className="
              max-h-full max-w-full object-contain drop-shadow-sm
              transition-transform duration-500 ease-out
              group-hover:scale-110
            "
          />
        </div>
        {/* Discount Badge */}
        {d.off > 0 && (
          <span className="absolute top-3 left-3 bg-[#E8F0EB] text-[#1A3C34] text-xs font-bold px-2 py-1 rounded-md border border-[#DCE4E0]">
            -{d.off}%
          </span>
        )}
      </Link>

      {/* 2. TEXT CONTENT */}
      <div className="p-4 flex flex-col flex-grow">
        <Link
          to={`/book/${book.slug}`}
          className="font-serif font-bold text-[#1A3C34] text-lg leading-tight line-clamp-2 mb-1 hover:text-[#4A7C59] transition-colors"
        >
          {book.title}
        </Link>
        
        <div className="text-[#5C756D] text-sm line-clamp-1 mb-4">
          {(book.authors || []).join(", ")}
        </div>

        {/* 3. PRICE & ACTION FOOTER */}
        <div className="mt-auto flex items-center justify-between gap-3">
          
          {/* Price Block */}
          <div className="flex flex-col">
            <div className="font-bold text-[#1A3C34] text-lg">₹{d.price}</div>
            {d.mrp > d.price && (
              <span className="line-through text-xs text-[#8BA699]">₹{d.mrp}</span>
            )}
          </div>

          {/* Action Button - Responsive & Stable */}
          {!inCart ? (
            <button
              onClick={addToCart}
              className="
                bg-[#1A3C34] text-white hover:bg-[#2F523F]
                transition-all duration-300 shadow-md hover:shadow-lg active:scale-95
                flex items-center justify-center
                
                /* Mobile: Circle Icon Only */
                w-10 h-10 rounded-full
                
                /* Desktop: Pill Shape with Text */
                md:w-auto md:h-10 md:px-4 md:rounded-xl
              "
              title="Add to cart"
            >
              <ShoppingCart className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline font-medium text-sm">Add</span>
            </button>
          ) : (
            <button
              onClick={goToCart}
              className="
                bg-[#E8F0EB] text-[#1A3C34] border border-[#DCE4E0]
                transition-all duration-300 hover:bg-[#DCE4E0] active:scale-95
                flex items-center justify-center
                
                /* Mobile: Circle Icon Only */
                w-10 h-10 rounded-full
                
                /* Desktop: Pill Shape with Text */
                md:w-auto md:h-10 md:px-4 md:rounded-xl
              "
              title="Go to cart"
            >
              <Check className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline font-medium text-sm">Added</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}