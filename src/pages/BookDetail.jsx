// src/pages/BookDetail.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { deal as dealFn } from "../lib/Price";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerAPI } from "../api/customer";
import { t } from "../lib/toast";
import { ShoppingCart, Check, ChevronRight, ChevronLeft, Star, Tag, Info, Truck, Sparkles } from "lucide-react";

/* ---- description helpers ---- */
const addEmojiSpaces = (s = "") =>
  s.replace(/([\u{1F300}-\u{1FAFF}\u2600-\u27BF])(?=\S)/gu, "$1 ");
const looksLikeHtml = (s = "") => /<\/?[a-z][\s\S]*>/i.test(s);
const escapeHtml = (s = "") =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const textToBulletHtml = (raw = "") => {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;
  const lis = lines.map((ln) => `<li>${addEmojiSpaces(escapeHtml(ln))}</li>`).join("");
  return `<ul>${lis}</ul>`;
};

export default function BookDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Get all possible cover images
  const images = useMemo(() => {
    if (!book) return [];

    if (book.assets?.coverUrl) {
      if (Array.isArray(book.assets.coverUrl)) {
        return book.assets.coverUrl.filter(Boolean);
      }
      if (typeof book.assets.coverUrl === 'string') {
        return [book.assets.coverUrl];
      }
    }

    if (book.coverUrl) {
      if (Array.isArray(book.coverUrl)) {
        return book.coverUrl.filter(Boolean);
      }
      if (typeof book.coverUrl === 'string') {
        return [book.coverUrl];
      }
    }

    return [];
  }, [book]);

  const [active, setActive] = useState(0);

  // Cart
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const replaceAll = useCart((s) => s.replaceAll);
  const { isCustomer, token } = useCustomer();

  // ✅ Fetch book with suggestions
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/books/${slug}/suggestions?limit=8`);
        const b = data?.book || null;
        const sugg = data?.suggestions || [];

        if (!b) {
          t.err("Book not found");
          setBook(null);
          setSuggestions([]);
          return;
        }

        setBook(b);
        setSuggestions(sugg);
      } catch (error) {
        console.error("Failed to load book:", error);
        try {
          const { data } = await api.get(`/books/${slug}`);
          setBook(data.book);
          setSuggestions([]);
        } catch (fallbackError) {
          console.error("Fallback failed:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    setActive(0);
  }, [images.length]);

  // Keyboard navigation
  const next = useCallback(() => {
    if (!images.length) return;
    setActive((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    if (!images.length) return;
    setActive((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (loading) {
    return (
      <div className="bg-[#F4F7F5] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E3E8E5] border-t-[#1A3C34] rounded-full animate-spin"></div>
          <p className="text-[#5C756D]">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-[#F4F7F5] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-[#1A3C34] mb-2">Book Not Found</h2>
          <button onClick={() => navigate("/catalog")} className="text-[#4A7C59] hover:underline">
            Return to Catalog
          </button>
        </div>
      </div>
    );
  }

  const id = book._id || book.id;
  const inCart = items.find((i) => (i.bookId || i.book?._id || i.id) === id);
  const d = dealFn(book);
  const mainSrc = images.length ? assetUrl(images[active]) : "";

  async function handleAddToCart() {
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
    } catch (e) {
      console.error("❌ Add to cart failed:", e);

      if (e?.response?.status === 401) {
        t.err("Session expired, please login again");
        localStorage.removeItem("customer_jwt");
        localStorage.removeItem("customer_profile");
        navigate("/login", { state: { next: "/cart" } });
        return;
      }

      console.log("ℹ️ Falling back to local cart");
      add({
        ...book,
        price: book.price || book.pric || book.mrp,
        mrp: book.mrp || book.price || book.pric,
        qty: 1
      }, 1);

      t.warn("Added to local cart (sync with server failed)");
    }
  }

  async function handleBuyNow() {
    if (!isCustomer) {
      t.info("Please login to continue");
      navigate("/login", {
        state: {
          next: "/checkout",
          pendingItem: { bookId: id, qty: 1 }
        }
      });
      return;
    }

    try {
      if (!inCart) {
        const res = await CustomerAPI.addToCart(token, { bookId: id, qty: 1 });
        if (res?.data?.cart?.items) {
          replaceAll(res.data.cart.items);
        }
      }
      navigate("/checkout");
    } catch (e) {
      console.error("Buy Now Error", e);
      t.err("Failed to process buy now");
    }
  }

  const primary = (book.descriptionHtml ?? "").trim();
  const fallback = (book.description ?? "").trim();
  const rawDesc = primary || fallback;

  let finalHtml = null;
  if (rawDesc && looksLikeHtml(rawDesc)) {
    finalHtml = rawDesc;
  } else if (rawDesc) {
    finalHtml = textToBulletHtml(rawDesc);
  }
  const fallbackPlain = addEmojiSpaces(rawDesc);

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34]">
      
      {/* Responsive Container 
        - max-w-7xl for standard desktops
        - 2xl:max-w-[1800px] for large screens
        - 3xl:max-w-[2200px] for ultra-wide screens
      */}
      <div className="max-w-7xl 2xl:max-w-[1800px] 3xl:max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8BA699] mb-6 sm:mb-8 font-medium">
          <button onClick={() => navigate("/catalog")} className="hover:text-[#1A3C34] transition-colors">
            Catalog
          </button>
          <span>/</span>
          <span className="text-[#1A3C34] truncate max-w-[150px] sm:max-w-[300px] md:max-w-none">{book.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 2xl:gap-24 items-start">
          
          {/* LEFT: GALLERY */}
          {/* Sticky positioning on Large screens to follow content */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-[#E3E8E5] aspect-[3/4] group w-full max-w-lg mx-auto lg:max-w-none">
              {mainSrc ? (
                <img
                  src={mainSrc}
                  alt={book.title}
                  className="absolute inset-0 h-full w-full object-contain p-4 sm:p-6 transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                  draggable={false}
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#F4F7F5]">
                  <span className="text-[#8BA699]">No image</span>
                </div>
              )}

              {/* Discount Badge */}
              {d.off > 0 && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#E8F0EB] text-[#1A3C34] text-xs sm:text-sm font-bold border border-[#DCE4E0] shadow-sm">
                  -{d.off}% OFF
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-[#1A3C34] hover:text-white shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-[#1A3C34] hover:text-white shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-3 max-w-lg mx-auto lg:max-w-none w-full">
                {images.map((p, idx) => {
                  const src = assetUrl(p);
                  const isActive = idx === active;
                  return (
                    <button
                      key={`${p}-${idx}`}
                      onClick={() => setActive(idx)}
                      className={`
                        relative rounded-lg overflow-hidden aspect-square bg-white border-2 transition-all duration-300
                        ${isActive
                          ? "border-[#1A3C34] shadow-md scale-105"
                          : "border-[#E3E8E5] hover:border-[#8BA699] opacity-70 hover:opacity-100"
                        }
                      `}
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                        draggable={false}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* WHY CHOOSE THIS BOOK */}
            {book.whyChooseThis && book.whyChooseThis.length > 0 && (
              <div className="p-5 sm:p-6 bg-[#E8F0EB] rounded-2xl border border-[#DCE4E0] shadow-sm max-w-lg mx-auto lg:max-w-none w-full">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1A3C34] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#4A7C59] fill-current" />
                  Why Choose This Book?
                </h3>
                <ul className="space-y-3">
                  {book.whyChooseThis.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#2C3E38] text-sm sm:text-base leading-relaxed">
                      <Check className="w-5 h-5 text-[#4A7C59] mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS */}
          <div className="flex flex-col">
            {/* Title & Author */}
            <div className="mb-6 border-b border-[#E3E8E5] pb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#1A3C34] leading-tight mb-3">
                {book.title}
                {book.subtitle && (
                  <span className="block text-lg sm:text-xl md:text-2xl font-sans font-normal text-[#5C756D] mt-2">
                    {book.subtitle}
                  </span>
                )}
              </h1>
              <p className="text-base sm:text-lg text-[#5C756D] flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm uppercase tracking-wide">By</span>
                <span className="font-medium text-[#2C3E38]">{(book.authors || []).join(", ")}</span>
              </p>
            </div>

            {/* Categories & Tags */}
            {(book.categories?.length || book.tags?.length) ? (
              <div className="mb-8 space-y-4">
                {book.categories?.length ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-[#8BA699] flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Categories:
                    </span>
                    {book.categories.map((c) => (
                      <span key={c} className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#E8F0EB] text-[#1A3C34] text-[10px] sm:text-xs font-bold uppercase tracking-wide border border-[#DCE4E0]">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Pricing Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-[#E3E8E5] shadow-sm mb-8">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A3C34]">₹{d.price}</span>
                {d.mrp > d.price && (
                  <span className="text-lg sm:text-xl line-through text-[#8BA699]">₹{d.mrp}</span>
                )}
              </div>
              
              {d.save > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8F0EB] text-[#2F523F] rounded-lg text-sm font-medium mb-4">
                  <Check className="w-3 h-3" />
                  You save ₹{d.save}
                </div>
              )}

              {/* Delivery Info */}
              <div className="flex items-center gap-2 text-[#5C756D] text-sm mt-2">
                <Truck className="w-4 h-4" />
                <span>Free delivery on all orders</span>
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className="mb-10">
              {!inCart ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-12 sm:h-14 rounded-xl bg-transparent border-2 border-[#1A3C34] text-[#1A3C34] font-bold text-base sm:text-lg hover:bg-[#F4F7F5] transition-all flex items-center justify-center gap-3 group active:scale-95"
                  >
                    <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Buy Now */}
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 h-12 sm:h-14 rounded-xl bg-[#1A3C34] text-white font-bold text-base sm:text-lg hover:bg-[#2F523F] transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
                  >
                    <span>Buy Now</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 sm:gap-4 bg-white p-2 rounded-2xl border border-[#E3E8E5] shadow-sm max-w-md">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 sm:gap-4 bg-[#F4F7F5] rounded-xl p-1.5 flex-1">
                    <button
                      onClick={dec}
                      id={id}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white text-[#1A3C34] font-bold hover:bg-[#E8F0EB] transition-colors shadow-sm flex items-center justify-center text-lg sm:text-xl"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-base sm:text-lg font-bold text-[#1A3C34]">
                      {inCart.qty}
                    </span>
                    <button
                      onClick={inc}
                      id={id}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white text-[#1A3C34] font-bold hover:bg-[#E8F0EB] transition-colors shadow-sm flex items-center justify-center text-lg sm:text-xl"
                    >
                      +
                    </button>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => navigate("/checkout")}
                    className="h-10 sm:h-12 px-6 sm:px-8 rounded-xl bg-[#1A3C34] text-white font-bold hover:bg-[#2F523F] transition-all flex items-center gap-2 shadow-md text-sm sm:text-base"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-stone prose-lg max-w-none text-[#4A5D56] leading-relaxed">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A3C34] mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                About this Book
              </h3>
              {finalHtml ? (
                <div
                  className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-[#E3E8E5] shadow-sm [&_ul]:pl-5 [&_li]:mb-2 text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: finalHtml }}
                />
              ) : (
                <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-[#E3E8E5] shadow-sm whitespace-pre-line text-sm sm:text-base">
                  {fallbackPlain || "No description available."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ SUGGESTIONS SECTION */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-20 border-t border-[#E3E8E5] pt-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1A3C34] mb-2">You Might Also Like</h2>
                <p className="text-[#5C756D] text-sm sm:text-base">Curated recommendations based on your selection</p>
              </div>
              <span className="hidden sm:block px-4 py-1 rounded-full bg-[#E8F0EB] text-[#2F523F] text-sm font-bold">
                {suggestions.length} Books
              </span>
            </div>

            {/* Responsive Grid: 2 cols on mobile -> 6 cols on Ultra-Wide */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {suggestions.map((suggestedBook) => (
                <SuggestionCard
                  key={suggestedBook._id}
                  book={suggestedBook}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ✅ Suggestion Card - Matched to ProductCard Style */
function SuggestionCard({ book }) {
  const navigate = useNavigate();
  const d = dealFn(book);

  const items = useCart((s) => s.items);
  const replaceAll = useCart((s) => s.replaceAll);
  const addLocal = useCart((s) => s.add);
  const { isCustomer, token } = useCustomer();

  const id = book._id || book.id;
  const inCartItem = items.find((i) => (i.bookId || i.book?._id || i.id) === id);
  const inCart = !!inCartItem;

  const cover =
    (Array.isArray(book?.assets?.coverUrl) ? book.assets.coverUrl[0] : book?.assets?.coverUrl) ||
    "/uploads/placeholder.png";

  const addToCart = async (e) => {
    e.stopPropagation(); // Prevent opening book detail
    window.dispatchEvent(new Event("cart:add"));

    if (!isCustomer) {
      t.info("Please login to add");
      navigate("/login", { state: { next: "/cart" } });
      return;
    }

    try {
      const hasToken = !!localStorage.getItem("customer_jwt");
      if (!hasToken) {
        t.err("Session expired");
        navigate("/login", { state: { next: "/cart" } });
        return;
      }

      const res = await CustomerAPI.addToCart(token, { bookId: id, qty: 1 });
      replaceAll(res?.data?.cart?.items || []);
      t.ok("Added to cart");
    } catch (e) {
      if (e?.response?.status === 401) {
        t.err("Session expired");
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
      t.warn("Added to local cart");
    }
  };

  const goToCart = (e) => {
    e.stopPropagation();
    navigate("/cart");
  };

  return (
    <article 
        onClick={() => {
            navigate(`/book/${book.slug}`);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="group flex flex-col h-full bg-white rounded-xl border border-[#E3E8E5] overflow-hidden hover:border-[#4A7C59] hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-full aspect-[3/4] bg-[#F4F7F5] overflow-hidden">
        <div className="w-full h-full p-4 flex items-center justify-center">
            <img
                src={assetUrl(cover)}
                alt={book.title}
                loading="lazy"
                draggable={false}
                className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-110"
            />
        </div>
        {d.off > 0 && (
            <span className="absolute top-2 left-2 bg-[#E8F0EB] text-[#1A3C34] text-[10px] font-bold px-2 py-0.5 rounded border border-[#DCE4E0]">
                -{d.off}%
            </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-serif font-bold text-[#1A3C34] text-sm sm:text-base leading-tight line-clamp-2 mb-1 group-hover:text-[#4A7C59] transition-colors">
          {book.title}
        </h3>
        
        <div className="text-[#8BA699] text-xs line-clamp-1 mb-3">
          {(book.authors || []).join(", ")}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-bold text-[#1A3C34] text-sm sm:text-base">₹{d.price}</span>
            {d.mrp > d.price && (
                <span className="text-[10px] line-through text-[#8BA699]">₹{d.mrp}</span>
            )}
          </div>

          {!inCart ? (
            <button
              onClick={addToCart}
              className="w-8 h-8 rounded-full bg-[#1A3C34] text-white flex items-center justify-center hover:bg-[#2F523F] transition-colors shadow-sm"
              title="Add to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={goToCart}
              className="w-8 h-8 rounded-full bg-[#E8F0EB] text-[#1A3C34] flex items-center justify-center border border-[#DCE4E0] hover:bg-[#DCE4E0] transition-colors"
              title="Go to Cart"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}