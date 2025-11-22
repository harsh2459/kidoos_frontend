// src/pages/Cart.jsx - FIXED COVER IMAGE LOGIC
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

  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const setQtyLocal = useCart((s) => s.setQty);
  const removeLocal = useCart((s) => s.remove);
  const clearLocal = useCart((s) => s.clear);
  const replaceAll = useCart((s) => s.replaceAll);

  // --- Hydrate from server when logged in ---
  useEffect(() => {
    if (!isCustomer) return;
    (async () => {
      try {
        const res = await CustomerAPI.getCart(token);
        replaceAll(res?.data?.cart?.items || []);
      } catch (e) {
        console.error("Failed to load cart:", e);
      }
    })();
  }, [isCustomer, token, replaceAll]);

  // --- Qty change ---
  const syncQty = async (lineId, nextQty) => {
    if (!isCustomer) return;

    try {
      const res = await CustomerAPI.setCartQty(token, { itemId: lineId, qty: nextQty });
      replaceAll(res?.data?.cart?.items || []);
      t.ok("Quantity updated");
    } catch (e) {
      t.err("Failed to update quantity");
      try {
        const fresh = await CustomerAPI.getCart(token);
        replaceAll(fresh?.data?.cart?.items || []);
      } catch { }
    }
  };

  // --- Remove item ---
  const removeItem = async (idForCurrentMode) => {
    if (!isCustomer) {
      removeLocal(idForCurrentMode);
      t.ok("Item removed");
      return;
    }

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
        } catch { }
        t.info("Item was already removed");
        return;
      }
      t.err("Failed to remove item");
    }
  };

  // --- Clear all ---
  const clearAll = async () => {
    if (!isCustomer) {
      clearLocal();
      t.ok("Cart cleared");
      return;
    }

    try {
      const res = await CustomerAPI.clearCart(token);
      replaceAll(res?.data?.cart?.items || []);
      t.ok("Cart cleared");
    } catch (e) {
      t.err("Failed to clear cart");
    }
  };

  // --- Totals ---
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => {
      const price = Number(it.unitPriceSnapshot ?? it.price ?? it.bookId?.price ?? 0);
      const qty = Number(it.qty ?? 1);
      return sum + price * qty;
    }, 0);
    const shipping = subtotal > 0 ? 0 : 0;
    const grand = subtotal + shipping;
    return { subtotal, shipping, grand };
  }, [items]);

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  // ✅ IMPROVED: Universal cover image resolver
  const getCoverImage = (item) => {
    // Priority 1: Check if bookId is populated (server response)
    if (item?.bookId?.assets?.coverUrl) {
      const covers = item.bookId.assets.coverUrl;
      if (Array.isArray(covers) && covers.length > 0) {
        return assetUrl(covers[0]);
      }
      if (typeof covers === 'string') {
        return assetUrl(covers);
      }
    }

    // Priority 2: Check direct assets on item (local cart)
    if (item?.assets?.coverUrl) {
      const covers = item.assets.coverUrl;
      if (Array.isArray(covers) && covers.length > 0) {
        return assetUrl(covers[0]);
      }
      if (typeof covers === 'string') {
        return assetUrl(covers);
      }
    }

    // Priority 3: Check old coverUrl structure
    if (item?.bookId?.coverUrl) {
      const covers = item.bookId.coverUrl;
      if (Array.isArray(covers) && covers.length > 0) {
        return assetUrl(covers[0]);
      }
      if (typeof covers === 'string') {
        return assetUrl(covers);
      }
    }

    // Priority 4: Check direct coverUrl on item
    if (item?.coverUrl) {
      const covers = item.coverUrl;
      if (Array.isArray(covers) && covers.length > 0) {
        return assetUrl(covers[0]);
      }
      if (typeof covers === 'string') {
        return assetUrl(covers);
      }
    }

    // Fallback: placeholder
    return "https://via.placeholder.com/120x180?text=No+Cover";
  };

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 py-8 xs:py-10 sm:py-12 text-center">
        <div className="max-w-xs xs:max-w-sm sm:max-w-md mx-auto">
          <svg
            className="mx-auto h-14 w-14 xs:h-16 xs:w-16 sm:h-24 sm:w-24 text-fg-subtle mb-2 xs:mb-3 sm:mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-fg mb-1 xs:mb-1.5 sm:mb-2">
            Your cart is empty
          </h2>
          <p className="text-fg-muted mb-4 xs:mb-5 sm:mb-6 text-xs xs:text-sm sm:text-base">
            Looks like you haven't added any books yet.
          </p>
          <Link
            to="/catalog"
            className="btn-primary text-xs xs:text-sm sm:text-base"
          >
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 xs:px-3 sm:px-4 py-6 xs:py-7 sm:py-8">
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-3 xs:mb-5 sm:mb-8 gap-2">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-fg">Your Cart</h1>
        <Link
          to="/catalog"
          className="text-brand hover:text-brand/90 flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm sm:text-base"
        >
          ← Continue shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-2 xs:space-y-3 sm:space-y-4">
          {items.map((it) => {
            const bookData = it.bookId || it;
            const id = it._id || it.id || bookData._id || bookData.id;
            const title = it.title || bookData.title || "Untitled";
            const authors = it.authors || bookData.authors || [];
            const price = Number(it.unitPriceSnapshot ?? it.price ?? bookData.price ?? 0);
            const qty = Number(it.qty ?? 1);
            const coverImage = getCoverImage(it);

            return (
              <div
                key={id}
                className="card flex flex-col xs:flex-row gap-3 xs:gap-4 hover:shadow-md transition-shadow"
              >
                {/* ✅ BOOK COVER IMAGE */}
                <div className="flex-shrink-0">
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-16 h-24 xs:w-20 xs:h-28 sm:w-24 sm:h-32 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/120x180?text=No+Cover";
                    }}
                  />
                </div>

                {/* Book Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs xs:text-sm sm:text-base text-fg mb-1">
                    {title}
                  </h3>
                  {authors && authors.length > 0 && (
                    <p className="text-xs xs:text-sm text-fg-muted mb-1 xs:mb-2 sm:mb-3">
                      {authors.join(", ")}
                    </p>
                  )}

                  {/* Price (mobile) */}
                  <div className="text-xs xs:text-sm text-fg-subtle mb-1 xs:mb-2 sm:mb-3">
                    Subtotal: {fmt(price)}
                  </div>

                  <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 xs:gap-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 xs:gap-2">
                      <button
                        onClick={() => {
                          const next = qty - 1;
                          if (next < 1) return;
                          if (isCustomer) {
                            syncQty(id, next);
                          } else {
                            dec(id);
                          }
                        }}
                        className="w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center border border-border rounded-lg hover:bg-surface-subtle disabled:opacity-50 transition-colors text-xs xs:text-sm"
                        disabled={qty <= 1}
                      >
                        −
                      </button>
                      <span className="w-8 xs:w-10 sm:w-12 text-center font-medium text-xs xs:text-sm text-fg">
                        {qty}
                      </span>
                      <button
                        onClick={() => {
                          const next = qty + 1;
                          if (isCustomer) {
                            syncQty(id, next);
                          } else {
                            inc(id);
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-surface-subtle transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex items-center gap-4">
                      <span className="text-base xs:text-lg font-bold text-fg">
                        {fmt(price * qty)}
                      </span>
                      <button
                        onClick={() => removeItem(id)}
                        className="text-danger hover:text-danger/80 text-xs xs:text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-2 xs:top-3 sm:top-4">
            <h2 className="text-lg xs:text-xl font-bold mb-2 xs:mb-4 text-fg">Order Summary</h2>

            <div className="space-y-2 xs:space-y-3 mb-3 xs:mb-4">
              <div className="flex justify-between text-xs xs:text-sm text-fg-muted">
                <span>Subtotal</span>
                <span className="font-medium text-fg">{fmt(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs xs:text-sm text-fg-muted">
                <span>Shipping</span>
                <span className="font-medium text-success">Free</span>
              </div>
              <div className="border-t border-border pt-2 xs:pt-3 flex justify-between text-base xs:text-lg font-bold">
                <span className="text-fg">Total</span>
                <span className="text-fg">{fmt(totals.grand)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary w-full mb-2 xs:mb-3 text-xs xs:text-sm sm:text-base"
            >
              Checkout
            </button>

            <button
              onClick={clearAll}
              className="btn-secondary w-full text-xs xs:text-sm sm:text-base"
            >
              Clear cart
            </button>

            <Link
              to="/catalog"
              className="block text-center mt-3 xs:mt-4 text-brand hover:text-brand/90 text-xs xs:text-sm sm:text-base"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}