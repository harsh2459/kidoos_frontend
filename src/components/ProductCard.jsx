import { Link, useNavigate } from "react-router-dom";
import { assetUrl } from "../api/asset";
import { useCart } from "../contexts/CartStore";
import { deal as dealFn } from "../lib/Price";

export default function ProductCard({ book }) {
  const d = dealFn(book);

  const items = useCart((s) => s.items);
  const add   = useCart((s) => s.add);

  const id = book._id || book.id;
  const inCart = items.some((i) => (i._id || i.id) === id);

  const navigate = useNavigate();
  const handleClick = () => {
    if (inCart) navigate("/cart");
    else add(book, 1);
  };

  return (
    <article className="card card-hover p-4 flex flex-col h-full relative">
      {/* Cover: fixed aspect, fits any size */}
      <Link
  to={`/book/${book.slug}`}
  className="relative block rounded-lg overflow-hidden bg-white border border-slate-100"
  title={book.title}
>
  {/* more padding so the image appears smaller */}
  <div className="aspect-[3/4] w-full grid place-items-center p-4 bg-white">
    <img
      src={assetUrl(book.assets?.coverUrl)}
      alt={book.title}
      loading="lazy"
      // cap the image so it doesn't touch edges
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

      {/* Price + Button pinned to bottom */}
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
          title={inCart ? "Go to cart" : "Add to cart"}
        >
          {inCart ? "Go to Cart" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
