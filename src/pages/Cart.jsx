import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { Link } from "react-router-dom";
import { useMemo, useCallback } from "react";

export default function Cart() {
  const items  = useCart(s => s.items);
  const inc    = useCart(s => s.inc);
  const dec    = useCart(s => s.dec);
  const remove = useCart(s => s.remove);
  const clear  = useCart(s => s.clear);

  const setQty = useCart(s => s.setQty);
  const totalFn = useCart(s => s.total);

  const total = useMemo(() => {
    if (typeof totalFn === "function") return Number(totalFn()) || 0;
    return items.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.qty || 1), 0);
  }, [items, totalFn]);

  const handleQtyChange = useCallback((id, value, prevQty = 1) => {
    const next = Math.max(1, Number(value) || 1);
    if (typeof setQty === "function") { setQty(id, next); return; }
    const diff = next - prevQty;
    if (diff > 0) for (let k = 0; k < diff; k++) inc(id);
    if (diff < 0) for (let k = 0; k < -diff; k++) dec(id);
  }, [setQty, inc, dec]);

  const fmt = (n) => `₹${(Number(n) || 0).toLocaleString("en-IN")}`;

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      <div className="space-y-3">
        {items.map(i => {
          const id = i._id || i.id;
          const qty = i.qty || 1;
          const price = Number(i.price) || 0;
          const line = price * qty;

          return (
            <div key={id} className="card p-4 flex items-center gap-4 bg-surface-subtle">
              <img src={assetUrl(i.assets?.coverUrl)} alt={i.title} className="h-14 w-10 object-cover rounded-md" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{i.title}</div>
                <div className="text-fg-muted text-sm">Price: {fmt(price)}</div>
              </div>

              {/* qty controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dec(id)}
                  className="px-2 py-1 btn-secondary rounded-theme" aria-label="decrease quantity"
                  disabled={qty <= 1}
                  title="Decrease"
                >
                  –
                </button>

                <input
                  type="number"
                  min={1}
                  step={1}
                  value={qty}
                  onChange={(e) => handleQtyChange(id, e.target.value, qty)}
                  className="w-14 text-center rounded-theme py-1" 
                />

                <button
                  onClick={() => inc(id)}
                  className="px-2 py-1 btn-secondary rounded-theme"
                  aria-label="increase quantity"
                  title="Increase"
                >
                  +
                </button>
              </div>

              <div className="w-28 text-right font-medium">{fmt(line)}</div>

              <button
                onClick={() => remove(id)}
                className="text-danger hover:text-danger/90 underline underline-offset-2"
                title="Remove item"
              >
                Remove
              </button>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="text-fg-muted">Your cart is empty.</div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-lg font-semibold">Total: {fmt(total)}</div>
          <div className="flex gap-3">
            <button onClick={clear} className="px-4 py-2 rounded-theme btn">Clear</button>
            <Link to="/checkout" className="px-5 py-3 rounded-theme btn-primary">Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}
