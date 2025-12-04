// src/pages/Cart.jsx
import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assetUrl } from "../api/asset";
import { useCart } from "../contexts/CartStore";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerAPI } from "../api/customer";
import { t } from "../lib/toast";
import { 
    ShoppingCart, Trash2, Plus, Minus, ArrowLeft, 
    ArrowRight, PackageOpen, Check, ShieldCheck 
} from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const { isCustomer, token } = useCustomer();

  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const removeLocal = useCart((s) => s.remove);
  const clearLocal = useCart((s) => s.clear);
  const replaceAll = useCart((s) => s.replaceAll);

  // Background texture
  const bgImage = "url('/images/terms-bg.png')";

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
      await CustomerAPI.removeCartItem(token, idForCurrentMode);
      // Optimistic update or fetch fresh
      const res = await CustomerAPI.getCart(token);
      replaceAll(res?.data?.cart?.items || []);
      t.ok("Item removed");
    } catch (e) {
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
      await CustomerAPI.clearCart(token);
      replaceAll([]);
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
    // Free shipping logic could go here
    const shipping = 0; 
    const grand = subtotal + shipping;
    return { subtotal, shipping, grand };
  }, [items]);

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  // Universal cover image resolver
  const getCoverImage = (item) => {
    const candidates = [
        item?.bookId?.assets?.coverUrl,
        item?.assets?.coverUrl,
        item?.bookId?.coverUrl,
        item?.coverUrl
    ];

    for (const c of candidates) {
        if (Array.isArray(c) && c.length > 0) return assetUrl(c[0]);
        if (typeof c === 'string' && c) return assetUrl(c);
    }
    return "/uploads/placeholder.png";
  };

  // --- EMPTY STATE ---
  if (!items || items.length === 0) {
    return (
      <div className="bg-[#F4F7F5] min-h-screen flex flex-col font-sans text-[#2C3E38]">
        {/* Header Background */}
        <div className="relative h-48 md:h-64 bg-[#1A3C34] overflow-hidden">
             <div 
                className="absolute inset-0 opacity-20 mix-blend-soft-light" 
                style={{ backgroundImage: bgImage, backgroundSize: 'cover', filter: 'grayscale(100%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F4F7F5]"></div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center -mt-20 px-4 pb-20 relative z-10">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-[#E3E8E5] text-center max-w-lg w-full">
                <div className="w-20 h-20 mx-auto bg-[#F4F7F5] rounded-full flex items-center justify-center mb-6">
                    <PackageOpen className="w-10 h-10 text-[#8BA699]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1A3C34] mb-3">
                    Your cart is empty
                </h2>
                <p className="text-[#5C756D] mb-8 text-lg">
                    Looks like you haven't added any books yet.
                </p>
                <Link
                    to="/catalog"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A3C34] text-white rounded-xl font-bold hover:bg-[#2F523F] transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Browse Books
                </Link>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F7F5] min-h-screen font-sans text-[#2C3E38] selection:bg-[#D4E2D4] selection:text-[#1A3C34]">
        
        {/* --- HEADER SECTION --- */}
        <div className="relative w-full pt-20 md:pt-28 pb-12 px-6 border-b border-[#E3E8E5] bg-[#1A3C34] overflow-hidden">
            <div 
                className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-soft-light" 
                style={{ backgroundImage: bgImage, backgroundSize: 'cover', filter: 'grayscale(100%)' }}
            />
            <div className="relative z-10 max-w-7xl 2xl:max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">Your Cart</h1>
                    <p className="text-[#8BA699] text-lg font-light">
                        Review your selection before checkout.
                    </p>
                </div>
                <Link 
                    to="/catalog"
                    className="flex items-center gap-2 text-[#8BA699] hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Continue Shopping
                </Link>
            </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* --- LEFT: CART ITEMS --- */}
                <div className="lg:col-span-8 space-y-4">
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
                                className="group flex flex-col sm:flex-row gap-4 p-4 bg-white border border-[#E3E8E5] rounded-2xl hover:border-[#4A7C59] transition-all shadow-sm hover:shadow-md"
                            >
                                {/* Image */}
                                <div className="w-full sm:w-28 h-40 sm:h-36 bg-[#F4F7F5] rounded-xl overflow-hidden flex-shrink-0 border border-[#E3E8E5]">
                                    <img 
                                        src={coverImage} 
                                        alt={title} 
                                        className="w-full h-full object-contain p-2"
                                        onError={(e) => { e.target.src = "/placeholder.png"; }}
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="font-serif font-bold text-lg md:text-xl text-[#1A3C34] line-clamp-2">
                                                <Link to={`/book/${bookData.slug}`} className="hover:text-[#4A7C59] transition-colors">
                                                    {title}
                                                </Link>
                                            </h3>
                                            <button 
                                                onClick={() => removeItem(id)}
                                                className="text-[#8BA699] hover:text-red-500 transition-colors p-1"
                                                title="Remove Item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-[#5C756D] text-sm mt-1 mb-2">
                                            {authors.join(", ")}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-end justify-between gap-4 mt-auto">
                                        <div className="flex items-center gap-3 bg-[#F4F7F5] rounded-lg p-1">
                                            <button
                                                onClick={() => {
                                                    const next = qty - 1;
                                                    if (next < 1) return;
                                                    isCustomer ? syncQty(id, next) : dec(id);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-[#1A3C34] hover:bg-[#E8F0EB] disabled:opacity-50 transition-colors"
                                                disabled={qty <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-6 text-center font-bold text-[#1A3C34]">{qty}</span>
                                            <button
                                                onClick={() => {
                                                    const next = qty + 1;
                                                    isCustomer ? syncQty(id, next) : inc(id);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-[#1A3C34] hover:bg-[#E8F0EB] transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="text-right">
                                            <p className="text-xs text-[#8BA699] mb-0.5">Subtotal</p>
                                            <p className="text-xl font-bold text-[#1A3C34]">
                                                {fmt(price * qty)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    <button 
                        onClick={clearAll}
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 mt-4 ml-2"
                    >
                        <Trash2 className="w-4 h-4" /> Clear Cart
                    </button>
                </div>

                {/* --- RIGHT: ORDER SUMMARY --- */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl border border-[#E3E8E5] shadow-sm p-6 lg:p-8 sticky top-24">
                        <h2 className="text-xl font-serif font-bold text-[#1A3C34] mb-6">Order Summary</h2>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-[#5C756D]">
                                <span>Subtotal</span>
                                <span className="font-medium text-[#2C3E38]">{fmt(totals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-[#5C756D]">
                                <span>Shipping</span>
                                <span className="font-medium text-[#4A7C59]">Free</span>
                            </div>
                            <div className="pt-4 border-t border-[#E3E8E5] flex justify-between items-center">
                                <span className="text-lg font-bold text-[#1A3C34]">Total</span>
                                <span className="text-2xl font-bold text-[#1A3C34]">{fmt(totals.grand)}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-[#5C756D] bg-[#E8F0EB] p-3 rounded-xl border border-[#DCE4E0]">
                                <ShieldCheck className="w-5 h-5 text-[#4A7C59]" />
                                <span>Secure Checkout guaranteed</span>
                            </div>

                            <button
                                onClick={() => navigate("/checkout")}
                                className="w-full py-4 bg-[#1A3C34] text-white rounded-xl font-bold hover:bg-[#2F523F] transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            
                            <p className="text-center text-xs text-[#8BA699] mt-4">
                                Taxes calculated at checkout.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}