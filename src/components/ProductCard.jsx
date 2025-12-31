import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Check, Star } from "lucide-react";
import { assetUrl } from "../api/asset";
import { useCart } from "../contexts/CartStore";
import { useCustomer } from "../contexts/CustomerAuth";
import { deal as dealFn } from "../lib/Price";
import { CustomerAPI } from "../api/customer";
import { t } from "../lib/toast";

export default function ProductCard({ book }) {
  // --- 1. HOOKS (MUST BE AT THE VERY TOP) ---
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const replaceAll = useCart((s) => s.replaceAll);
  const addLocal = useCart((s) => s.add);
  const { isCustomer, token } = useCustomer();
  const [imgError, setImgError] = useState(false);

  // --- 2. SAFETY CHECK (After hooks are declared) ---
  if (!book) return null;

  // --- 3. LOGIC & DATA PREP ---
  const d = dealFn(book);
  const id = book._id || book.id;
  const inCart = items.some((i) => (i._id || i.id || i.bookId) === id);

  // Handle Cover Image
  const coverPath = Array.isArray(book?.assets?.coverUrl)
    ? book.assets.coverUrl[0]
    : book?.assets?.coverUrl;

  const finalCover = !imgError && coverPath 
    ? assetUrl(coverPath) 
    : "https://placehold.co/600x800/F4F7F5/A08C5B?text=Book+Cover";

  const addToCart = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); // Stop clicking through to book details
    
    if (!isCustomer) {
      t.info("Please login to shop");
      navigate("/login", { state: { next: "/cart" } });
      return;
    }

    try {
      if (!token) throw new Error("No token");
      const res = await CustomerAPI.addToCart(token, { bookId: id, qty: 1 });
      replaceAll(res?.data?.cart?.items || []);
      t.ok("Added to cart");
    } catch (err) {
      if (err?.response?.status === 401) {
        t.err("Please login again");
        navigate("/login");
        return;
      }
      // Offline/Local fallback
      addLocal({ ...book, price: d.price, mrp: d.mrp, qty: 1 });
      t.warn("Added to local cart");
    }
  };

  const goToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/cart");
  };

  // --- 4. RENDER (Premium Style) ---
  return (
    <div className="group relative flex flex-col h-full bg-white rounded-xl shadow-sm border border-[#EBE5D9] hover:shadow-xl hover:border-[#D4AF37] transition-all duration-500 ease-out overflow-hidden">
      
      {/* --- IMAGE SECTION --- */}
      <Link to={`/book/${book.slug}`} className="relative block w-full pt-[10%] pb-4 bg-gradient-to-b from-[#FAF9F6] to-white px-8">
        {/* Discount Badge (Elegant) */}
        {d.off > 0 && (
          <span className="absolute top-3 right-3 z-10 bg-[#D4AF37] text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded shadow-sm">
            {d.off}% Off
          </span>
        )}
        
        <div className="relative w-full aspect-[2/3] flex items-end justify-center">
          <img
            src={finalCover}
            alt={book.title}
            onError={() => setImgError(true)}
            loading="lazy"
            className="
              max-h-full max-w-full object-contain 
              drop-shadow-xl transform transition-transform duration-500 
              group-hover:-translate-y-2 group-hover:scale-105 will-change-transform
            "
            style={{ filter: "drop-shadow(0 15px 15px rgba(0,0,0,0.15))" }} 
          />
        </div>
      </Link>

      {/* --- DETAILS SECTION --- */}
      <div className="flex flex-col flex-grow px-5 pb-6 text-center">
        
        {/* Title (Serif Font like reference) */}
        <Link 
          to={`/book/${book.slug}`}
          className="font-serif text-[#3E2723] text-xl font-medium leading-tight mb-2 hover:text-[#D4AF37] transition-colors line-clamp-2"
        >
          {book.title}
        </Link>

        {/* Subtitle / Author */}
        <div className="text-[#8D7F71] text-xs uppercase tracking-widest font-semibold mb-4 line-clamp-1">
          {book.authors?.length > 0 ? book.authors.join(", ") : "Premium Collection"}
        </div>

        {/* Price & Action */}
        <div className="mt-auto w-full">
          <div className="flex items-center justify-center gap-2 mb-4">
             <span className="font-serif text-2xl text-[#3E2723]">₹{d.price}</span>
             {d.mrp > d.price && (
               <span className="text-sm text-[#A89F91] line-through decoration-[0.5px]">₹{d.mrp}</span>
             )}
          </div>

          {/* Gold Button (Reference Style) */}
          <button
            onClick={inCart ? goToCart : addToCart}
            className={`
              w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-300 shadow-md
              flex items-center justify-center gap-2
              ${inCart 
                ? "bg-[#F5F5F0] text-[#3E2723] border border-[#D4AF37]" 
                : "bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white hover:from-[#D4AF37] hover:to-[#C59D5F] hover:shadow-lg active:scale-95"
              }
            `}
          >
            {inCart ? (
              <>
                <Check className="w-4 h-4" />
                <span>In Cart</span>
              </>
            ) : (
              <>
                <span>Shop Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}