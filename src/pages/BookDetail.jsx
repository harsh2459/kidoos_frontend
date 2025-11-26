// src/pages/BookDetail.jsx - MATCHING PRODUCTCARD UI WITH SUGGESTIONS
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { deal as dealFn } from "../lib/Price";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerAPI } from "../api/customer";
import { t } from "../lib/toast";

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
        // Fallback to regular endpoint if suggestions endpoint fails
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
      <div className="mx-auto max-w-screen-xl px-4 py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
          <p className="text-fg-muted">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-20 text-center">
        <p className="text-fg-muted text-lg">Book not found</p>
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
      console.warn("⚠️ User not logged in, redirecting to login");
      t.info("Please login to add items to your cart");
      navigate("/login", { state: { next: "/cart" } });
      return;
    }

    try {
      const hasToken = !!localStorage.getItem("customer_jwt");
      if (!hasToken) {
        console.error("❌ No customer token found!");
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
    // 1. Check Login
    if (!isCustomer) {
      t.info("Please login to continue");
      navigate("/login", {
        state: {
          next: "/checkout",
          // PASS PENDING ITEM DETAILS
          pendingItem: { bookId: id, qty: 1 }
        }
      });
      return;
    }

    try {
      // 2. If not in cart, add it first
      if (!inCart) {
        const res = await CustomerAPI.addToCart(token, { bookId: id, qty: 1 });
        if (res?.data?.cart?.items) {
          replaceAll(res.data.cart.items);
        }
      }
      // 3. Go directly to checkout
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
    <div className="from-gray-50 to-white min-h-screen">
      <div className="mx-auto max-w-screen-xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-fg-muted mb-6">
          <button onClick={() => navigate("/catalog")} className="hover:text-fg transition-colors">
            Catalog
          </button>
          <span>›</span>
          <span className="text-fg">{book.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: GALLERY */}
          <div className="self-start space-y-6">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-100 aspect-[3/4]">
              {mainSrc ? (
                <img
                  src={mainSrc}
                  alt={book.title}
                  className="absolute inset-0 h-full w-full object-contain p-6"
                  onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                  draggable={false}
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No image</span>
                </div>
              )}

              {/* Discount Badge */}
              {d.off > 0 && (
                <div className="absolute top-4 left-4 px-3 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold shadow-lg">
                  {d.off}% OFF
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Previous"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Next"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium">
                  {active + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {images.map((p, idx) => {
                  const src = assetUrl(p);
                  const isActive = idx === active;
                  return (
                    <button
                      key={`${p}-${idx}`}
                      onClick={() => setActive(idx)}
                      className={`
                        relative rounded-lg overflow-hidden aspect-square bg-white border-2 transition-all
                        ${isActive
                          ? "border-black shadow-lg scale-105"
                          : "border-gray-200 hover:border-gray-400 hover:scale-105"
                        }
                      `}
                    >
                      {src ? (
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                          draggable={false}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-100" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* WHY CHOOSE THIS BOOK */}
            {book.whyChooseThis && book.whyChooseThis.length > 0 && (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  Why Choose This Book?
                </h3>
                <ul className="space-y-3">
                  {book.whyChooseThis.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="text-green-600 font-bold text-lg mt-0.5 flex-shrink-0">✓</span>
                      <span className="leading-relaxed break-words flex-1 overflow-hidden">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}


          </div>

          {/* RIGHT: DETAILS */}
          <div>
            {/* Title & Author */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
                {book.title}
                {book.subtitle && (
                  <span className="block text-2xl font-normal text-gray-600 mt-2">
                    {book.subtitle}
                  </span>
                )}
              </h1>
              <p className="text-lg text-gray-600 flex items-center gap-2">
                <span className="text-sm text-gray-500">by</span>
                <span className="font-medium">{(book.authors || []).join(", ")}</span>
              </p>
            </div>

            {/* Categories & Tags */}
            {(book.categories?.length || book.tags?.length) ? (
              <div className="mb-6 space-y-3">
                {book.categories?.length ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Categories:</span>
                    {book.categories.map((c) => (
                      <span key={c} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : null}
                {book.tags?.length ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Tags:</span>
                    {book.tags.map((tg) => (
                      <span key={tg} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                        #{tg}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">₹{d.price}</span>
                {d.mrp > d.price && (
                  <>
                    <span className="text-xl line-through text-gray-400 mb-1">₹{d.mrp}</span>
                    <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-sm font-bold mb-1">
                      Save ₹{d.save}
                    </span>
                  </>
                )}
              </div>
              {d.save > 0 && (
                <p className="text-green-600 font-medium">You save ₹{d.save} ({d.off}% off)</p>
              )}

              {/* Stock Status */}
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">In Stock</span>
              </div>
            </div>

            {/* Add to Cart - Matching ProductCard Style */}
            <div className="mb-8">
              {!inCart ? (
                <div className="flex items-center gap-3 w-full">
                  {/* Add to Cart - Secondary Style (Outline) */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-[52px] rounded-full bg-white text-slate-900 border-2 border-slate-900 font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
                  >
                    <CartIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Buy Now - Primary Style (Solid) */}
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 h-[52px] rounded-full bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <span>Buy Now</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Existing Quantity Controls */}
                  <div className="flex items-center gap-4 bg-gray-100 rounded-full p-2 flex-1">
                    <button
                      onClick={dec}
                      id={id}
                      className="w-10 h-10 rounded-full bg-white hover:bg-gray-200 font-bold transition-all hover:scale-110 shadow-sm"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-xl font-bold">
                      {inCart.qty}
                    </span>
                    <button
                      onClick={inc}
                      id={id}
                      className="w-10 h-10 rounded-full bg-white hover:bg-gray-200 font-bold transition-all hover:scale-110 shadow-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Buy Now (when already in cart) */}
                  <button
                    onClick={() => navigate("/checkout")}
                    className="h-[52px] px-6 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all whitespace-nowrap flex items-center gap-2"
                  >
                    Buy Now
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">About this book</h2>
              {finalHtml ? (
                <div
                  className="prose prose-gray max-w-none [&_p]:my-3 [&_ul]:my-4 [&_li]:my-2 [&_p]:leading-relaxed [&_li]:leading-relaxed [&_ul]:pl-5 [&_li]:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: finalHtml }}
                />
              ) : (
                <div className="prose prose-gray max-w-none whitespace-pre-line text-gray-700 leading-relaxed">
                  {fallbackPlain || "No description available."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ SUGGESTIONS SECTION - Matching ProductCard Style */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">You Might Also Like</h2>
              <span className="text-sm text-gray-600">
                {suggestions.length} {suggestions.length === 1 ? "book" : "books"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

/* ✅ Suggestion Card - Matching ProductCard Component Style */
/* Replace the old SuggestionCard with this fixed version */

function SuggestionCard({ book }) {
  const navigate = useNavigate();
  const d = dealFn(book); // or dealFn(book) if using that import

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

  return (
    <article className="flex flex-col h-full rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => {
          navigate(`/book/${book.slug}`);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="block group text-left"
        aria-label={`Open ${book.title}`}
      >
        <div className="aspect-[3/4] w-full grid place-items-center p-4 bg-white overflow-hidden">
          <img
            src={assetUrl(cover)}
            alt={book.title}
            loading="lazy"
            draggable={false}
            className="max-h-[88%] max-w-[88%] object-contain transition-transform duration-300 ease-out group-hover:scale-[1.05]"
            onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
          />
        </div>
      </button>

      <div className="p-3 flex-1 flex flex-col">
        <button
          onClick={() => {
            navigate(`/book/${book.slug}`);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="mt-1 font-medium text-fg leading-tight line-clamp-2 text-left hover:text-primary transition-colors"
        >
          {book.title}
        </button>

        <div className="text-fg-muted text-sm line-clamp-1 mt-1">
          {(book.authors || []).join(", ")}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <div className="font-semibold text-lg">₹{d.price}</div>
            {d.mrp > d.price && (
              <>
                <div className="line-through text-sm text-fg-subtle">₹{d.mrp}</div>
                {d.off > 0 && (
                  <span className="text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                    -{d.off}%
                  </span>
                )}
              </>
            )}
          </div>

          {/* Fixed-size add-to-cart button (no negative margins/expansion) */}
          {!inCart ? (
            <button
              onClick={addToCart}
              className="h-11 w-11 rounded-full bg-slate-900 text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center"
              title="Add to cart"
              aria-label="Add to cart"
            >
              <CartIcon className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={goToCart}
              className="h-11 px-3 rounded-full bg-slate-900 text-white shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2"
              title="Go to cart"
            >
              <CartIcon className="h-4 w-4" />
              <span className="text-sm">Cart</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}