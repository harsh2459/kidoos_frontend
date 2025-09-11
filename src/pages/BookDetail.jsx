// src/pages/BookDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { deal } from "../lib/Price";

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState(null);

  const items = useCart((s) => s.items);
  const add   = useCart((s) => s.add);
  const inc   = useCart((s) => s.inc);
  const dec   = useCart((s) => s.dec);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/books/${slug}`);
      setBook(data.book);
    })();
  }, [slug]);

  if (!book) {
    return <div className="mx-auto max-w-screen-xl px-4 py-10">Loading…</div>;
  }

  const id = book._id || book.id;
  const inCart = items.find((i) => (i._id || i.id) === id);
  const d = deal(book); // { mrp, price, off, save }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 grid md:grid-cols-2 gap-8">
      {/* Cover */}
      <div className="w-full max-w-[480px] mx-auto md:mx-0 md:sticky md:top-24">
        <div className="relative rounded-theme overflow-hidden bg-surface aspect-[3/4] max-h-[80vh] border border-border-subtle">
          <img src={assetUrl(book.assets?.coverUrl)} alt={book.title} className="absolute inset-0 h-full w-full object-contain" />
          {d.off > 0 && (
            <span className="absolute -top-2 -left-2 px-2 py-1 rounded-theme bg-success text-success-foreground text-xs font-semibold shadow">
              -{d.off}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div>
        <h1 className="text-3xl font-bold">{book.title}</h1>
        <p className="text-fg-muted mt-2">{(book.authors || []).join(", ")}</p>

        {(book.categories?.length || book.tags?.length) ? (
          <div className="mt-3 space-y-2">
            {book.categories?.length ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-fg-muted text-sm">Categories:</span>
                {book.categories.map((c) => (
                  <span key={c} className="badge">
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
            {book.tags?.length ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-fg-muted text-sm">Tags:</span>
                {book.tags.map((t) => (
                  <span key={t} className="badge-soft">
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Pricing */}
        <div className="flex items-baseline gap-3 mt-4">
          <span className="text-2xl font-bold">₹{d.price}</span>
          {d.mrp > d.price && (
            <span className="text-sm line-through text-fg-subtle">₹{d.mrp}</span>
          )}
          {d.off > 0 && (
            <span className="px-2 py-1 rounded-theme bg-success-soft text-success text-xs font-semibold">
              -{d.off}%
            </span>
          )}
        </div>
        {d.save > 0 && (
          <div className="text-success text-sm mt-1">You save ₹{d.save}</div>
        )}

        {/* Description */}
        <div className="prose mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: book.descriptionHtml || "" }} />

        {/* Add / qty stepper */}
        <div className="mt-6">
          {!inCart ? (
            <button
              onClick={() => add({ ...book, id, assets: { ...book.assets } }, 1)}
              className="px-5 py-3 rounded-theme btn-primary transition"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => dec(id)} className="px-3 py-2 rounded-theme btn-secondary">–</button>
              <div className="w-10 text-center">{inCart.qty}</div>
              <button onClick={() => inc(id)} className="px-3 py-2 rounded-theme btn-muted">+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
