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
    ArrowRight, PackageOpen, ShieldCheck, Sparkles
} from "lucide-react";
import SEO from "../components/SEO";

export default function Cart() {
    const navigate = useNavigate();
    const { isCustomer, token } = useCustomer();

    const items = useCart((s) => s.items);
    const inc = useCart((s) => s.inc);
    const dec = useCart((s) => s.dec);
    const removeLocal = useCart((s) => s.remove);
    const clearLocal = useCart((s) => s.clear);
    const replaceAll = useCart((s) => s.replaceAll);

    // --- VRINDAVAN THEME ASSETS ---
    // Ensure these 2 images exist in your /public/images/homepage/ folder!
    const parchmentBg = "url('/images-webp/homepage/parchment-bg.webp')";
    const mandalaBg = "url('/images-webp/homepage/mandala-bg.webp')";

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
        const shipping = 0; // Free shipping logic
        const grand = subtotal + shipping;
        return { subtotal, shipping, grand };
    }, [items]);

    const fmt = (n) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(n);

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
            <div className="bg-[#FAF7F2] min-h-screen flex flex-col font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723]">

                {/* Empty Header - REMOVED BORDER TO FIX LINE ISSUE */}
                <div className="relative h-64 bg-[#3E2723] overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
                        style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723]/80 to-[#FAF7F2]"></div>
                </div>

                <div className="flex-grow flex flex-col items-center justify-center -mt-32 px-4 pb-20 relative z-10">
                    <div className="bg-white/90 backdrop-blur-sm p-10 md:p-14 rounded-[2rem] shadow-[0_20px_50px_rgba(62,39,35,0.1)] border border-[#D4AF37]/20 text-center max-w-lg w-full">
                        <div className="w-24 h-24 mx-auto bg-[#FFF9E6] rounded-full flex items-center justify-center mb-6 border border-[#D4AF37]/30 shadow-inner">
                            <PackageOpen className="w-12 h-12 text-[#D4AF37]" />
                        </div>
                        <h2 className="text-3xl font-['Cinzel'] font-bold text-[#3E2723] mb-4">
                            Your Treasury is Empty
                        </h2>
                        <p className="text-[#8A7A5E] mb-10 text-lg font-light leading-relaxed">
                            It looks like you haven't selected any sacred books yet. The library awaits you.
                        </p>
                        <Link
                            to="/catalog"
                            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-full font-bold font-['Cinzel'] hover:from-[#D4AF37] hover:to-[#C59D5F] transition-all shadow-[0_10px_20px_rgba(176,137,76,0.3)] hover:shadow-xl hover:-translate-y-1 active:scale-95 border border-[#D4AF37]"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Browse The Collection
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // --- FILLED CART STATE ---
    return (
        <div className="bg-[#FAF7F2] min-h-screen font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723]">
            <SEO
                title="Shopping Cart | Kiddos Intellect"
                description="Review your selected items before checkout"
                noindex={true}
            />

            {/* Global Texture */}
            <div
                className="fixed inset-0 pointer-events-none opacity-100 z-0"
                style={{ backgroundImage: parchmentBg, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
            />

            {/* --- HEADER SECTION --- */}
            <div className="relative w-full pt-28 md:pt-36 pb-16 px-6 border-b border-[#D4AF37]/30 bg-[#3E2723] overflow-hidden">
                <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-10 mix-blend-overlay"
                    style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }}
                />
                <div className="relative z-10 max-w-7xl 2xl:max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-[#D4AF37]">
                            <ShoppingCart className="w-6 h-6" />
                            <span className="font-['Cinzel'] font-bold text-sm tracking-widest uppercase">Shopping Bag</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-['Playfair_Display'] font-bold text-[#F3E5AB]">Your Selection</h1>
                    </div>
                    <Link
                        to="/catalog"
                        className="flex items-center gap-2 text-[#D4AF37] hover:text-[#F3E5AB] transition-colors text-sm font-bold font-['Cinzel'] tracking-wide border-b border-transparent hover:border-[#F3E5AB] pb-1"
                    >
                        <ArrowLeft className="w-4 h-4" /> Continue Shopping
                    </Link>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10 max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

                    {/* --- LEFT: CART ITEMS --- */}
                    <div className="lg:col-span-8 space-y-6">
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
                                    className="group flex flex-col sm:flex-row gap-6 p-5 bg-white/80 backdrop-blur-sm border border-[#D4AF37]/20 rounded-2xl hover:border-[#D4AF37] transition-all shadow-[0_5px_15px_rgba(62,39,35,0.05)] hover:shadow-[0_15px_30px_rgba(62,39,35,0.1)] relative overflow-hidden"
                                >
                                    {/* Image */}
                                    <div className="w-full sm:w-32 h-48 sm:h-40 bg-[#FAF7F2] rounded-xl overflow-hidden flex-shrink-0 border border-[#D4AF37]/20 relative shadow-inner">
                                        <img
                                            src={coverImage}
                                            alt={title}
                                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { e.target.src = "/placeholder.png"; }}
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-4">
                                                <h3 className="font-['Cinzel'] font-bold text-lg md:text-xl text-[#3E2723] line-clamp-2 leading-tight">
                                                    <Link to={`/book/${bookData.slug}`} className="hover:text-[#D4AF37] transition-colors">
                                                        {title}
                                                    </Link>
                                                </h3>
                                                <button
                                                    onClick={() => removeItem(id)}
                                                    className="text-[#8A7A5E] hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                                    title="Remove Item"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <p className="text-[#8A7A5E] text-xs uppercase tracking-wider font-bold mt-2 mb-4">
                                                {authors.join(", ")}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-end justify-between gap-6 mt-auto border-t border-[#D4AF37]/10 pt-4">

                                            {/* Qty Controls */}
                                            <div className="flex items-center gap-4 bg-[#FFF9E6] rounded-full px-2 py-1.5 border border-[#D4AF37]/30 shadow-sm">
                                                <button
                                                    onClick={() => {
                                                        const next = qty - 1;
                                                        if (next < 1) return;
                                                        isCustomer ? syncQty(id, next) : dec(id);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-[#3E2723] hover:text-[#D4AF37] disabled:opacity-50 transition-colors"
                                                    disabled={qty <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-6 text-center font-bold text-[#3E2723] font-['Cinzel'] text-lg">{qty}</span>
                                                <button
                                                    onClick={() => {
                                                        const next = qty + 1;
                                                        isCustomer ? syncQty(id, next) : inc(id);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-[#3E2723] hover:text-[#D4AF37] transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-[10px] text-[#8A7A5E] uppercase tracking-wider font-bold mb-0.5">Subtotal</p>
                                                <p className="text-2xl font-bold text-[#3E2723] font-['Playfair_Display']">
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
                            className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-2 mt-6 ml-2 uppercase tracking-wide transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Empty Cart
                        </button>
                    </div>

                    {/* --- RIGHT: ORDER SUMMARY (Royal Ledger) --- */}
                    <div className="lg:col-span-4">
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 shadow-[0_10px_40px_rgba(62,39,35,0.08)] p-8 sticky top-28 relative overflow-hidden">

                            {/* Decorative Top Border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C59D5F] to-[#B0894C]"></div>

                            <h2 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723] mb-8 flex items-center gap-2">
                                Order Summary
                            </h2>

                            <div className="space-y-5 mb-8 text-[#5C4A2E]">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Subtotal</span>
                                    <span className="font-bold text-[#3E2723] text-lg">{fmt(totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Shipping</span>
                                    <span className="font-bold text-[#D4AF37] flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Free
                                    </span>
                                </div>

                                <div className="pt-6 border-t border-[#D4AF37]/20 flex justify-between items-end">
                                    <span className="text-lg font-['Cinzel'] font-bold text-[#3E2723]">Grand Total</span>
                                    <span className="text-3xl font-bold text-[#3E2723] font-['Playfair_Display']">{fmt(totals.grand)}</span>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center gap-3 text-xs text-[#8A7A5E] bg-[#FFF9E6] p-4 rounded-xl border border-[#D4AF37]/20">
                                    <ShieldCheck className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                                    <span className="font-medium leading-relaxed">Secure Checkout. Taxes calculated at next step.</span>
                                </div>

                                <button
                                    onClick={() => navigate("/checkout")}
                                    className="w-full py-4.5 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-full font-bold font-['Cinzel'] tracking-widest uppercase hover:from-[#D4AF37] hover:to-[#C59D5F] transition-all shadow-[0_10px_25px_rgba(176,137,76,0.3)] hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 border border-[#F9F1D8]/30 group"
                                >
                                    Checkout
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}