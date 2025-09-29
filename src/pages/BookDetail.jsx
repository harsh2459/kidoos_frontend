// src/pages/BookDetail.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
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
/** If text has 3+ non-empty lines, render as a bullet list */
const textToBulletHtml = (raw = "") => {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;
  const lis = lines.map((ln) => `<li>${addEmojiSpaces(escapeHtml(ln))}</li>`).join("");
  return `<ul>${lis}</ul>`;
};

export default function BookDetail() {
  const { slug } = useParams();

  // ---------------- State ----------------
  const [book, setBook] = useState(null);

  // Gallery images derived from book (safe even when book is null)
  const images = useMemo(
    () => (Array.isArray(book?.assets?.coverUrl) ? book.assets.coverUrl.filter(Boolean) : []),
    [book]
  );
  const [active, setActive] = useState(0); // index in images

  // Cart hooks
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);

  const { isCustomer, token } = useCustomer();

  // ---------------- Effects ----------------
  // Fetch book
  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/books/${slug}`);
      setBook(data.book);
    })();
  }, [slug]);

  // Default the active image to the LAST image whenever images change
  useEffect(() => {
    if (images.length) {
      setActive(Math.max(0, images.length - 1));
    } else {
      setActive(0);
    }
  }, [images.length]);

  // Keyboard navigation (←/→)
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

  // ---------------- Early loading UI (after hooks) ----------------
  if (!book) {
    return <div className="mx-auto max-w-screen-xl px-4 py-10">Loading…</div>;
  }

  // ---------------- Derived values ----------------
  const id = book._id || book.id; // bookId
  const inCart = items.find((i) => (i.bookId || i.book?._id || i.id) === id);
  const d = deal(book); // { mrp, price, off, save }

  // Build safe main image src
  const mainSrc = images.length ? assetUrl(images[active]) : "";

  async function handleAddToCart() {
    try {
      add({ ...book, id, assets: { ...book.assets } }, 1); // local first
      if (isCustomer) {
        await CustomerAPI.addToCart(token, { bookId: id, qty: 1 });
      }
      t.ok("Added to cart");
    } catch (e) {
      console.error("addToCart error:", e);
      t.err("Could not add to cart");
    }
  }

  /* ---- choose description source (whichever has content) ---- */
  const primary = (book.descriptionHtml ?? "").trim();
  const fallback = (book.description ?? "").trim();
  const rawDesc = primary || fallback;

  let finalHtml = null;
  if (rawDesc && looksLikeHtml(rawDesc)) {
    finalHtml = rawDesc; // assume sanitized by backend
  } else if (rawDesc) {
    finalHtml = textToBulletHtml(rawDesc);
  }
  const fallbackPlain = addEmojiSpaces(rawDesc);

  // ---------------- Render ----------------
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-6 grid md:grid-cols-2 gap-6 lg:gap-8">
      {/* GALLERY */}
      <div className="w-full max-w-[520px] mx-auto md:mx-0 md:sticky md:top-20">
        <div className="relative rounded-theme overflow-hidden bg-surface aspect-[3/4] max-h-[78vh] border border-border-subtle">
          {mainSrc ? (
            <img
              src={mainSrc}
              alt={book.title}
              className="absolute inset-0 h-full w-full object-contain"
              onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
              draggable={false}
              loading="lazy"
            />
          ) : (
            <img
              src="/placeholder.png" // frontend /public/placeholder.png
              alt={book.title}
              className="absolute inset-0 h-full w-full object-contain opacity-80"
              draggable={false}
            />
          )}

          {d.off > 0 && (
            <span className="absolute -top-2 -left-2 px-2 py-1 rounded-theme bg-success text-success-foreground text-xs font-semibold shadow">
              -{d.off}% OFF
            </span>
          )}

          {images.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow p-2"
              >
                ‹
              </button>
              <button
                aria-label="Next image"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow p-2"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Thumbnails (reversed order) */}
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
            {([...images].reverse()).map((p, idx) => {
              // map back to the original index
              const origIndex = images.length - 1 - idx;
              const src = assetUrl(p);
              const isActive = origIndex === active;

              return (
                <button
                  key={`${p}-${idx}`}
                  onClick={() => setActive(origIndex)}
                  className={[
                    "relative border rounded-md overflow-hidden h-16 bg-white",
                    isActive ? "ring-2 ring-primary border-primary" : "border-border-subtle",
                  ].join(" ")}
                  aria-label={`Image ${origIndex + 1}`}
                >
                  {src ? (
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                      draggable={false}
                      loading="lazy"
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

      {/* DETAILS */}
      <div>
        <h1 className="text-3xl font-bold">{book.title}</h1>
        <p className="text-fg-muted mt-1.5">{(book.authors || []).join(", ")}</p>

        {(book.categories?.length || book.tags?.length) ? (
          <div className="mt-2 space-y-1.5">
            {book.categories?.length ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-fg-muted text-sm">Categories:</span>
                {book.categories.map((c) => (
                  <span key={c} className="badge">{c}</span>
                ))}
              </div>
            ) : null}
            {book.tags?.length ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-fg-muted text-sm">Tags:</span>
                {book.tags.map((tg) => (
                  <span key={tg} className="badge-soft">#{tg}</span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Pricing */}
        <div className="flex items-baseline gap-2.5 mt-3">
          <span className="text-2xl font-bold">₹{d.price}</span>
          {d.mrp > d.price && (
            <span className="text-sm line-through text-fg-subtle">₹{d.mrp}</span>
          )}
          {d.off > 0 && (
            <span className="px-2 py-0.5 rounded-theme bg-success-soft text-success text-[11px] font-semibold">
              -{d.off}%
            </span>
          )}
        </div>
        {d.save > 0 && (
          <div className="text-success text-sm mt-0.5">You save ₹{d.save}</div>
        )}

        {/* CTA */}
        <div className="mt-3">
          {!inCart ? (
            <button
              onClick={handleAddToCart}
              className="px-4 py-2.5 rounded-theme btn-primary transition"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <button onClick={() => dec(id)} className="px-3 py-2 rounded-theme btn-secondary">–</button>
              <div className="w-9 text-center">{inCart.qty}</div>
              <button onClick={() => inc(id)} className="px-3 py-2 rounded-theme btn-muted">+</button>
            </div>
          )}
        </div>

        {/* Description */}
        {finalHtml ? (
          <div
            className={[
              "prose mt-4 max-w-none",
              "[&_p]:my-2 [&_ul]:my-3 [&_li]:my-1",
              "[&_p]:leading-relaxed [&_li]:leading-relaxed",
              "[&_ul]:pl-5",
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: finalHtml }}
          />
        ) : (
          <div
            className={[
              "prose mt-4 max-w-none whitespace-pre-line",
              "[&_p]:my-2 [&_ul]:my-3 [&_li]:my-1",
              "[&_p]:leading-relaxed [&_li]:leading-relaxed",
              "[&_ul]:pl-5",
            ].join(" ")}
          >
            {fallbackPlain}
          </div>
        )}
      </div>
    </div>
  );
}
