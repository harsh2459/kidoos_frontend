// src/pages/Cart.jsx
import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assetUrl } from "../api/asset";
import { useCart } from "../contexts/CartStore";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerAPI } from "../api/customer";
import { t } from "../lib/toast";

export default function Cart() {
  const navigate = useNavigate();
  const { isCustomer, token } = useCustomer();

  const items       = useCart((s) => s.items);
  const inc         = useCart((s) => s.inc);
  const dec         = useCart((s) => s.dec);
  const setQtyLocal = useCart((s) => s.setQty);
  const removeLocal = useCart((s) => s.remove);
  const clearLocal  = useCart((s) => s.clear);
  const replaceAll  = useCart((s) => s.replaceAll);

  // --- Hydrate from server when logged in (server is source of truth) ---
  useEffect(() => {
    if (!isCustomer) return;
    (async () => {
      try {
        const res = await CustomerAPI.getCart(token); // axios response
        replaceAll(res?.data?.cart?.items || []);
      } catch (e) {
        console.error("getCart failed:", e);
      }
    })();
  }, [isCustomer, token, replaceAll]);

  // --- Qty change (server-first when logged in; local-only for guest) ---
  const syncQty = async (lineId, nextQty) => {
    if (!isCustomer) {
      // handled per-item with setQtyLocal(bookId, nextQty)
      return;
    }
    try {
      const res = await CustomerAPI.setCartQty(token, { itemId: lineId, qty: nextQty });
      replaceAll(res?.data?.cart?.items || []);
      t.ok("Quantity updated");
    } catch (e) {
      console.error("setCartQty failed:", e);
      t.err("Failed to update quantity");
      // Best effort re-sync
      try {
        const fresh = await CustomerAPI.getCart(token);
        replaceAll(fresh?.data?.cart?.items || []);
      } catch {}
    }
  };

  // --- Remove line (server-first; 404 treated as success) ---
  const removeItem = async (idForCurrentMode) => {
    if (!isCustomer) {
      // In guest mode, this id is the bookId
      removeLocal(idForCurrentMode);
      t.ok("Item removed");
      return;
    }
    // In logged-in mode, this id is the server lineId
    try {
      const res = await CustomerAPI.removeCartItem(token, idForCurrentMode);
      replaceAll(res?.data?.cart?.items || []);
      t.ok("Item removed");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404) {
        try {
          const fresh = await CustomerAPI.getCart(token);
          replaceAll(fresh?.data?.cart?.items || []);
        } catch {}
        t.info("Item was already removed");
        return;
      }
      console.error("removeCartItem failed:", e);
      t.err("Failed to remove item");
    }
  };

  // --- Clear all (server-first for logged in) ---
  const clearAll = async () => {
    if (!isCustomer) {
      clearLocal();
      t.ok("Cart cleared");
      return;
    }
    try {
      const res = await CustomerAPI.clearCart(token);
      replaceAll(res?.data?.cart?.items || []); // may be []
      t.ok("Cart cleared");
    } catch (e) {
      console.error("clearCart failed:", e);
      t.err("Failed to clear cart");
    }
  };

  // --- Totals ---
  const totals = useMemo(() => {
    const subtotal = (items || []).reduce((sum, it) => {
      const price = Number(it.price ?? it.pric ?? 0);
      const qty   = Number(it.qty ?? 1);
      return sum + price * qty;
    }, 0);
    const shipping = subtotal > 0 ? 0 : 0; // placeholder for future rule
    const grand = subtotal + shipping;
    return { subtotal, shipping, grand };
  }, [items]);

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  if (!items || items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto my-12 px-4">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <div className="rounded-2xl border bg-surface p-8 text-fg-muted text-center shadow-sm">
          Your cart is empty.
          <Link to="/catalog" className="text-primary font-medium ml-2">
            Continue shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <Link to="/catalog" className="text-sm text-primary hover:underline">
          ← Continue shopping
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT: Items */}
        <section className="md:col-span-2 space-y-4">
          {items.map((it) => {
            // Server cart item id (line id) vs product id (book id)
            const lineId = it._id || it.lineId || it.itemId;                 // server line id
            const bookId = it.bookId || it.book?._id || it.id;               // product id (guest/local)

            const price    = Number(it.price ?? it.pric ?? 0);
            const mrp      = Number(it.mrp   ?? it.mrpPrice ?? price);
            const off      = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
            const qty      = Number(it.qty ?? 1);
            const subtotal = price * qty;

            return (
              <article
                key={lineId || bookId}
                className="bg-surface border rounded-2xl p-4 flex items-start gap-4 shadow-sm"
              >
                <div className="relative">
                  <img
                    src={assetUrl(it.assets?.coverUrl || it.book?.assets?.coverUrl)}
                    alt={it.title || it.book?.title}
                    className="w-[72px] h-[96px] object-contain rounded-lg border bg-white"
                  />
                  {off > 0 && (
                    <span className="absolute -top-2 -left-2 bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border">
                      -{off}% OFF
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-snug line-clamp-2">
                        {it.title}
                      </h3>
                      {!!(it.authors && it.authors.length) && (
                        <p className="text-xs text-fg-subtle line-clamp-1">
                          {(it.authors || []).join(", ")}
                        </p>
                      )}
                      {/* price (mobile) */}
                      <div className="mt-1 flex items-baseline gap-2 md:hidden">
                        <div className="font-semibold">{fmt(price)}</div>
                        {mrp > price && (
                          <>
                            <div className="line-through text-xs text-fg-subtle">{fmt(mrp)}</div>
                            <span className="text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5 border">
                              -{off}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* price (desktop) */}
                    <div className="hidden md:flex items-baseline gap-2">
                      <div className="font-semibold">{fmt(price)}</div>
                      {mrp > price && (
                        <>
                          <div className="line-through text-sm text-fg-subtle">{fmt(mrp)}</div>
                          <span className="text-[11px] text-green-700 bg-green-100 rounded-full px-2 py-0.5 border">
                            -{off}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* controls */}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="h-9 w-9 rounded-full border hover:bg-muted"
                        onClick={() => {
                          const next = Math.max(1, qty - 1);
                          if (isCustomer && lineId) {
                            syncQty(lineId, next);      // server
                          }
                          setQtyLocal?.(bookId, next);  // guest/local (no-op if store ignores when logged-in)
                          dec?.(bookId);                // keep local UI optimistic for guests
                        }}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <input
                        className="w-16 h-9 text-center border rounded-full"
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => {
                          const next = Math.max(1, Number(e.target.value) || 1);
                          if (isCustomer && lineId) {
                            syncQty(lineId, next);      // server
                          }
                          setQtyLocal?.(bookId, next);  // guest/local
                        }}
                      />
                      <button
                        className="h-9 w-9 rounded-full border hover:bg-muted"
                        onClick={() => {
                          const next = qty + 1;
                          if (isCustomer && lineId) {
                            syncQty(lineId, next);      // server
                          }
                          setQtyLocal?.(bookId, next);  // guest/local
                          inc?.(bookId);                // guest optimistic
                        }}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(isCustomer ? lineId : bookId)}
                      className="text-sm text-danger hover:underline"
                    >
                      Remove
                    </button>

                    {/* per-item subtotal (mobile) */}
                    <div className="md:hidden ml-auto font-medium">{fmt(subtotal)}</div>
                  </div>
                </div>

                {/* per-item subtotal (desktop) */}
                <div className="hidden md:flex flex-col items-end">
                  <div className="text-xs text-fg-subtle">Subtotal</div>
                  <div className="font-semibold">{fmt(subtotal)}</div>
                </div>
              </article>
            );
          })}
        </section>

        {/* RIGHT: Summary */}
        <aside className="md:col-span-1">
          <div className="md:sticky md:top-24 bg-surface border rounded-2xl p-5 shadow-md">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-fg-subtle">Subtotal</span>
                <span className="font-medium">{fmt(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg-subtle">Shipping</span>
                <span className="font-medium">
                  {totals.shipping === 0 ? "Free" : fmt(totals.shipping)}
                </span>
              </div>
              <div className="h-px bg-border my-3" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-primary">
                  {fmt(totals.grand)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isCustomer)
                  navigate("/login", { state: { next: "/checkout" } });
                else navigate("/checkout");
              }}
              className="btn-primary w-full mt-5 py-3 rounded-xl shadow-sm"
            >
              Checkout
            </button>

            <button
              onClick={clearAll}
              className="btn w-full mt-2 py-3 rounded-xl"
            >
              Clear cart
            </button>

            <Link
              to="/catalog"
              className="block text-center mt-3 text-sm text-primary hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
