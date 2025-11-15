// src/pages/BookDetail.jsx - FIXED COVER IMAGE LOGIC
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { deal } from "../lib/Price";
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

export default function BookDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ IMPROVED: Get all possible cover images
  const images = useMemo(() => {
    if (!book) return [];
    
    // Try assets.coverUrl first (preferred structure)
    if (book.assets?.coverUrl) {
      if (Array.isArray(book.assets.coverUrl)) {
        return book.assets.coverUrl.filter(Boolean);
      }
      if (typeof book.assets.coverUrl === 'string') {
        return [book.assets.coverUrl];
      }
    }
    
    // Fallback to old coverUrl structure
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

  // Fetch book
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/books/${slug}`);
        setBook(data.book);
      } catch (error) {
        console.error("Failed to load book:", error);
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
  const d = deal(book);
  const mainSrc = images.length ? assetUrl(images[active]) : "";

  async function handleAddToCart() {
    if (!isCustomer) {
      t.info("Please login to add to cart");
      navigate("/login");
      return;
    }

    try {
      // Add locally first for immediate feedback
      add({ ...book, id, assets: { ...book.assets } }, 1);
      
      // Then sync with server
      const res = await CustomerAPI.addToCart(token, { bookId: id, qty: 1 });
      
      // Update cart with server response
      replaceAll(res?.data?.cart?.items || []);
      
      t.ok("Added to cart");
    } catch (e) {
      console.error("Add to cart error:", e);
      t.err("Could not sync with server, but added locally");
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
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
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
          <div className="self-start">
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
              <div className="mt-4 grid grid-cols-6 gap-2">
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
          </div>

          {/* RIGHT: DETAILS */}
          <div>
            {/* Title & Author */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
                {book.title}
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

            {/* Add to Cart */}
            <div className="mb-8">
              {!inCart ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-xl bg-black text-white font-semibold text-lg hover:bg-gray-800 transition-all hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 bg-gray-100 rounded-xl p-2 flex-1">
                    <button
                      onClick={() => dec(id)}
                      className="w-10 h-10 rounded-lg bg-white hover:bg-gray-200 font-bold transition-all hover:scale-110 shadow-sm"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center text-xl font-bold">{inCart.qty}</span>
                    <button
                      onClick={() => inc(id)}
                      className="w-10 h-10 rounded-lg bg-white hover:bg-gray-200 font-bold transition-all hover:scale-110 shadow-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => navigate("/cart")}
                    className="px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition-all whitespace-nowrap"
                  >
                    Go to Cart
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
            {/* Additional Info */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              {book.language && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Language</p>
                  <p className="font-semibold text-gray-900">{book.language}</p>
                </div>
              )}
              {book.printType && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Format</p>
                  <p className="font-semibold text-gray-900 capitalize">{book.printType}</p>
                </div>
              )}
              {book.pages > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Pages</p>
                  <p className="font-semibold text-gray-900">{book.pages}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}