import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import Footer from "../components/Footer";
import { assetUrl } from "../api/asset";
import { deal as dealFn } from "../lib/Price";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerAPI } from "../api/customer";
import { t } from "../lib/toast";
import SEO from "../components/SEO";
import {
    ShoppingCart, Heart, Check, Star, BookOpen, Globe, Feather, ShieldCheck,
    Smile, Sparkles, Brain, X, Truck, ZoomIn, ArrowLeft, ArrowRight,
    Lightbulb, Zap, Pencil, Calculator, Music, Palette, Puzzle, Users,
    Trophy, Target, Clock, Sun, Moon, Leaf, Anchor, Award, Gift, Camera,
    Video, Mic, MapPin, GraduationCap, Medal, Rocket, Compass, Eye,
    ChevronLeft, ChevronRight, ImageOff, Book, Share2, Info, Quote,
    MessageSquarePlus, Shield, ChevronDown, ChevronUp
} from "lucide-react";

// --- THEME ASSETS ---
const parchmentBg = "url('/images-webp/homepage/parchment-bg.webp')";
const mandalaBg = "url('/images-webp/homepage/mandala-bg.webp')";

// --- HELPER COMPONENTS ---
const IconMap = {
    "star": Star, "brain": Brain, "heart": Heart, "lightbulb": Lightbulb, "zap": Zap,
    "smile": Smile, "book-open": BookOpen, "pencil": Pencil, "calculator": Calculator,
    "globe": Globe, "music": Music, "palette": Palette, "puzzle": Puzzle,
    "users": Users, "trophy": Trophy, "target": Target, "sparkles": Sparkles,
    "clock": Clock, "sun": Sun, "moon": Moon, "leaf": Leaf, "anchor": Anchor,
    "award": Award, "gift": Gift, "camera": Camera, "video": Video, "mic": Mic,
    "map-pin": MapPin, "graduation-cap": GraduationCap, "medal": Medal,
    "rocket": Rocket, "compass": Compass, "feather": Feather, "eye": Eye
};

const SpecItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-[#FAF7F2] rounded-xl hover:bg-[#FFF9E6] transition-colors group border border-[#D4AF37]/20">
        <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFF9E6] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37]/20 transition-colors">
                {Icon ? <Icon className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#8A7A5E] uppercase tracking-wide">{label}</span>
        </div>
        <span className="font-bold text-[#3E2723] text-sm sm:text-base text-right ml-2">{value}</span>
    </div>
);

// --- MOBILE ACCORDION COMPONENT ---
const MobileAccordion = ({ icon: Icon, title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-[#D4AF37]/20 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-5 bg-white active:bg-[#FAF7F2] transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-[#FFF9E6] text-[#D4AF37]' : 'bg-[#FAF7F2] text-[#8A7A5E]'}`}>
                        {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`font-bold text-[16px] ${isOpen ? 'text-[#3E2723]' : 'text-[#5C4A2E]'}`}>{title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-[#8A7A5E]" /> : <ChevronDown className="w-5 h-5 text-[#8A7A5E]" />}
            </button>
            {isOpen && <div className="pb-6 animate-in fade-in slide-in-from-top-2 duration-200">{children}</div>}
        </div>
    );
};

export default function BookDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();

    // Data State
    const [book, setBook] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [editions, setEditions] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeImg, setActiveImg] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");
    const [qty, setQty] = useState(1);
    const [showFlipbook, setShowFlipbook] = useState(false);
    const [showAllEditions, setShowAllEditions] = useState(false);

    // Flipbook Logic
    const flipBookRef = useRef(null);
    const [bookDim, setBookDim] = useState({ width: 400, height: 600 });
    const [currentPage, setCurrentPage] = useState(0);
    const mobileGalleryRef = useRef(null);
    const thumbnailScrollRef = useRef(null);
    const [canScrollThumbnailLeft, setCanScrollThumbnailLeft] = useState(false);
    const [canScrollThumbnailRight, setCanScrollThumbnailRight] = useState(false);
    const editionsMobileRef = useRef(null);
    const editionsDesktopRef = useRef(null);

    // Cart & Auth
    const items = useCart((s) => s.items);
    const add = useCart((s) => s.add);
    const replaceAll = useCart((s) => s.replaceAll);
    const { isCustomer, token, loginAnonymously } = useCustomer();

    // Reviews state
    const [publicReviews, setPublicReviews] = useState([]);
    const [myReview, setMyReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 0, text: "" });
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    // --- ERROR SUPPRESSION & RESIZE FIX ---
    useEffect(() => {
        // 1. Suppress the benign ResizeObserver loop error
        const errorHandler = (e) => {
            if (e.message && e.message.includes("ResizeObserver loop")) {
                e.stopImmediatePropagation();
                return;
            }
        };

        // Catch both error events and unhandled promise rejections
        window.addEventListener("error", errorHandler);

        // Override console.error temporarily to suppress ResizeObserver warnings
        const originalError = console.error;
        console.error = (...args) => {
            if (typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
                return;
            }
            originalError.apply(console, args);
        };

        // 2. Debounced Resize Logic
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const w = window.innerWidth;
                const h = window.innerHeight;

                // Much larger dimensions for better viewing experience
                if (w < 640) {
                    // Mobile: 90% width, taller height
                    setBookDim({ width: Math.min(w * 0.9, 400), height: Math.min(h * 0.7, 600) });
                } else if (w < 768) {
                    // Tablet: 85% width
                    setBookDim({ width: Math.min(w * 0.85, 550), height: Math.min(h * 0.75, 750) });
                } else if (w < 1024) {
                    // Small desktop - MUCH BIGGER
                    setBookDim({ width: 700, height: 900 });
                } else if (w < 1280) {
                    // Medium desktop - MUCH BIGGER
                    setBookDim({ width: 850, height: 1050 });
                } else if (w < 1536) {
                    // Large desktop - MUCH BIGGER
                    setBookDim({ width: 950, height: 1150 });
                } else {
                    // Extra Large desktop - HUGE
                    setBookDim({ width: 1100, height: 1300 });
                }
            }, 150); // Increased debounce to 150ms
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener("error", errorHandler);
            console.error = originalError; // Restore original console.error
            clearTimeout(timeoutId);
        };
    }, []);

    // --- FETCH DATA ---
    useEffect(() => {
        let cancelled = false;  // ← stale request guard

        (async () => {
            try {
                setLoading(true);
                setActiveImg(0);
                window.scrollTo(0, 0);

                const { data } = await api.get(`/books/${slug}/suggestions?limit=25&_=${Date.now()}`);
                if (cancelled) return; // ← ignore if a newer request already fired

                if (!data?.book) { t.error({ title: "Book not found", sub: "This title may no longer be available." }); return; }

                setBook(data.book);
                setSuggestions(data.suggestions || []);
                setEditions(data.editions || []);  // ← now guaranteed to be from the latest request

                // ✅ Fire Meta ViewContent Event
                if (window.fbq) {
                    window.fbq('track', 'ViewContent', {
                        content_ids: [data.book.inventory?.sku || data.book._id],
                        content_type: 'product',
                        content_name: data.book.title,
                        value: dealFn(data.book).price,
                        currency: 'INR',
                    });
                }

                // google analytics gtag event for view_item
                if (window.gtag) {
                    window.gtag('event', 'view_item', {
                        currency: 'INR',
                        value: dealFn(data.book).price,
                        items: [{
                            item_id: data.book.inventory?.sku || data.book._id,
                            item_name: data.book.title,
                            index: 0,
                            item_brand: "Kiddos Intellect",
                            item_category: data.book.categories?.[0] || 'Book',
                            price: dealFn(data.book).price,
                            quantity: 1
                        }]
                    });
                }

            } catch (e) {
                if (!cancelled) console.error(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };  // ← cleanup cancels stale request
    }, [slug]);

    // --- FETCH PUBLIC REVIEWS ---
    useEffect(() => {
        if (!book?._id) return;
        api.get(`/reviews/book/${book._id}`, { meta: { auth: "none" } })
            .then(({ data }) => setPublicReviews(data.reviews || []))
            .catch(() => {});
    }, [book?._id]);

    // --- FETCH MY REVIEW (if logged in) ---
    useEffect(() => {
        if (!book?._id || !isCustomer) return;
        api.get(`/reviews/my/${book._id}`, { meta: { auth: "customer" } })
            .then(({ data }) => {
                setMyReview(data.review || null);
                if (data.review) setReviewForm({ rating: data.review.rating, text: data.review.text });
            })
            .catch(() => {});
    }, [book?._id, isCustomer]);

    // --- SUBMIT REVIEW ---
    async function handleSubmitReview(e) {
        e.preventDefault();
        if (!reviewForm.rating) return t.error({ title: "Please select a star rating." });
        if (!reviewForm.text.trim()) return t.error({ title: "Please write something about the book." });
        setReviewSubmitting(true);
        try {
            const { data } = await api.post("/reviews", { bookId: book._id, rating: reviewForm.rating, text: reviewForm.text }, { meta: { auth: "customer" } });
            if (!data.ok) throw new Error(data.error || "Failed to submit review.");
            t.success({ title: data.message || "Review submitted!" });
            setMyReview({ rating: reviewForm.rating, text: reviewForm.text, createdAt: new Date() });
            setShowReviewForm(false);
            // Refresh public reviews
            const { data: rd } = await api.get(`/reviews/book/${book._id}`, { meta: { auth: "none" } });
            setPublicReviews(rd.reviews || []);
        } catch (err) {
            t.error({ title: err?.response?.data?.error || "Failed to submit review." });
        } finally {
            setReviewSubmitting(false);
        }
    }

    // --- THUMBNAIL NAVIGATION HELPERS ---
    const updateThumbnailNavButtons = () => {
        const container = thumbnailScrollRef.current;
        if (container) {
            setCanScrollThumbnailLeft(container.scrollLeft > 0);
            setCanScrollThumbnailRight(
                container.scrollLeft < container.scrollWidth - container.clientWidth - 10
            );
        }
    };

    const scrollThumbnails = (direction) => {
        const container = thumbnailScrollRef.current;
        if (container) {
            const scrollAmount = 200; // pixels to scroll
            const newScrollLeft = container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        }
    };

    // --- COMPUTED VALUES ---
    const images = useMemo(() => {
        if (!book) return [];
        let urls = Array.isArray(book.assets?.coverUrl) ? book.assets.coverUrl : [book.assets?.coverUrl];
        const result = urls.filter(Boolean).map(url => assetUrl(url));
        console.log('Images loaded:', result.length, 'images');
        return result;
    }, [book]);

    const flipbookPages = useMemo(() => {
        if (!book) return [];
        const covers = images;
        const previews = (book.assets?.previewPages || []).map(url => assetUrl(url));
        return [...covers, ...previews].filter(Boolean);
    }, [book, images]);

    // --- RESET FLIPBOOK TO FIRST PAGE WHEN MODAL OPENS ---
    useEffect(() => {
        if (showFlipbook) {
            console.log('Flipbook opened! Pages:', flipbookPages.length, 'FlipBook ref:', flipBookRef.current);
            setCurrentPage(0);
            // Small delay to ensure the flipbook is mounted before resetting
            setTimeout(() => {
                console.log('After timeout - FlipBook ref:', flipBookRef.current, 'pageFlip method:', flipBookRef.current?.pageFlip);
                if (flipBookRef.current?.pageFlip) {
                    try {
                        flipBookRef.current.pageFlip().turnToPage(0);
                        console.log('Successfully reset to page 0');
                    } catch (e) {
                        console.error('Error resetting flipbook:', e);
                    }
                } else {
                    console.error('FlipBook ref or pageFlip method not available!');
                }
            }, 100);
        }
    }, [showFlipbook, flipbookPages.length]);

    // Update navigation buttons when images change
    useEffect(() => {
        updateThumbnailNavButtons();
    }, [images]);

    const d = book ? dealFn(book) : { price: 0, mrp: 0, off: 0 };
    const inCart = book ? items.find(i => (i.bookId || i.book?._id || i.id) === book._id) : null;
    const isOutOfStock = book?.inventory?.stock === 0;
    const config = book?.layoutConfig || {};

    // Merge admin-curated testimonials + customer public reviews into one list
    const allReviews = useMemo(() => {
        const adminOnes = (config.testimonials || []).map((t, i) => ({
            _id: `admin-${i}`,
            customerName: t.name,
            role: t.role,
            rating: Math.min(Math.max(parseInt(t.rating) || 5, 1), 5),
            text: t.text,
            isAdmin: true,
        }));
        return [...adminOnes, ...publicReviews];
    }, [config.testimonials, publicReviews]);

    useEffect(() => { if (inCart) setQty(inCart.qty); }, [inCart]);

    // Debug: Log when activeImg changes
    useEffect(() => {
        console.log('activeImg changed to:', activeImg);
    }, [activeImg]);

    // --- HANDLERS ---
    async function handleAddToCart(buyNow = false) {
        if (isOutOfStock) return;

        // ✅ Fire Meta AddToCart Event
        if (window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_ids: [book.inventory?.sku || book._id],
                content_type: 'product',
                content_name: book.title,
                value: d.price,
                currency: 'INR',
            });
        }

        // 🟢 ADD THIS: Google Analytics add_to_cart
        if (window.gtag) {
            window.gtag('event', 'add_to_cart', {
                currency: 'INR',
                value: d.price * qty,
                items: [{
                    item_id: book.inventory?.sku || book._id,
                    item_name: book.title,
                    item_brand: "Kiddos Intellect",
                    item_category: book.categories?.[0] || 'Book',
                    price: d.price,
                    quantity: qty
                }]
            });
        }

        // 🟢 ADD THIS: Google Analytics begin_checkout for Buy Now
        if (buyNow) {
            window.gtag('event', 'begin_checkout', {
                currency: 'INR',
                value: d.price * qty,
                buy_now: true, // <--- MARKING DIRECT CHECKOUT
                items: [{
                    item_id: book.inventory?.sku || book._id,
                    item_name: book.title,
                    price: d.price,
                    quantity: qty
                }]
            });
        }
    
    // 1. If user is NOT logged in and clicks BUY NOW -> Auto-Login Anonymously
    if (!isCustomer && buyNow) {
        try {
            t.info({ title: "Preparing checkout", sub: "Setting up your secure session..." });

            // Trigger the anonymous login
            // Note: We assume loginAnonymously is now exposed from useCustomer()
            const newToken = await loginAnonymously();

            // Perform the "Add to Cart" action using the NEW token immediately
            // We cannot rely on 'token' state variable yet as React state updates are async
            const res = await CustomerAPI.addToCart(newToken, { bookId: book._id, qty: qty });

            // Update local cart state to match backend
            replaceAll(res?.data?.cart?.items || []);

            t.success({ title: "Ready!", detail: book.title, sub: "Redirecting you to checkout..." });
            navigate("/checkout");
        } catch (e) {
            console.error("Auto-login failed:", e);
            // Fallback: Just add to local cart and go to checkout (Guest Mode fallback)
            add({ ...book, price: d.price, qty: qty }, qty);
            navigate("/checkout");
        }
        return;
    }

    // 2. Standard Logic (Existing)
    const cartItem = { ...book, price: d.price, qty: qty };

    if (!isCustomer) {
        // Not logged in, redirect to login
        t.info({ title: "Login required", sub: "Sign in to add items to your cart." });
        navigate("/login");
        return;
    } else {
        // Logged in user (Normal flow)
        try {
            const res = await CustomerAPI.addToCart(token, { bookId: book._id, qty: qty });
            replaceAll(res?.data?.cart?.items || []);
            t.success(buyNow
                ? { title: "Proceeding to checkout", detail: book.title, sub: "Redirecting you now..." }
                : { title: "Added to cart", detail: book.title, sub: "View cart to checkout." });
            if (buyNow) navigate("/checkout");
        } catch (e) {
            t.error({ title: "Could not add to cart", detail: book.title });
        }
    }
}

if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-14 h-14 border-4 border-[#FFF9E6] border-t-[#D4AF37] rounded-full animate-spin"></div>
    </div>
);

if (!book) return null;

// --- FLIPBOOK MODAL ---
const flipbookModalJSX = showFlipbook && (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#1a0f0a]/95 via-[#2d1810]/98 to-[#1a0f0a]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-700">

        {/* Enhanced Close Button */}
        <button
            onClick={() => setShowFlipbook(false)}
            className="absolute top-2 right-2 sm:top-6 sm:right-6 p-2.5 sm:p-3.5 bg-gradient-to-br from-white/15 to-white/5 hover:from-red-900/50 hover:to-red-700/40 text-[#F3E5AB] rounded-full transition-all border border-[#D4AF37]/30 z-[110] backdrop-blur-lg hover:scale-110 active:scale-95 shadow-xl"
        >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Book Title Header */}
        <div className="absolute top-4 sm:top-8 left-1/2 transform -translate-x-1/2 z-[105] text-center max-w-md px-4">
            <h2 className="text-sm sm:text-lg md:text-xl font-['Cinzel'] font-bold text-[#F3E5AB] drop-shadow-lg">{book.title}</h2>
            <p className="text-[10px] sm:text-xs text-[#D4AF37]/80 mt-1">Page {currentPage + 1} of {flipbookPages.length}</p>
        </div>

        {/* Main container */}
        <div className="relative flex items-center justify-center w-full h-[calc(100vh-140px)] sm:h-full max-w-7xl mt-8 sm:mt-0">

            {/* Navigation Arrows - Enhanced Design */}
            <button
                onClick={() => {
                    console.log('Desktop flipbook PREV clicked, currentPage:', currentPage, 'ref:', flipBookRef.current);
                    flipBookRef.current?.pageFlip()?.flipPrev();
                }}
                disabled={currentPage === 0}
                className="hidden sm:flex absolute left-2 sm:left-0 lg:-left-16 z-20 p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-white/10 to-transparent hover:from-white/20 backdrop-blur-md rounded-xl text-[#D4AF37] hover:text-[#F3E5AB] transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 border border-[#D4AF37]/20"
            >
                <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 drop-shadow-lg" />
            </button>

            {/* The Book Container */}
            <div className="relative flex items-center justify-center w-full h-full py-12 sm:py-16">
                <HTMLFlipBook
                    width={bookDim.width}
                    height={bookDim.height}
                    size="stretch"
                    minWidth={200}
                    maxWidth={600}
                    minHeight={300}
                    maxHeight={900}
                    maxShadowOpacity={0.9}
                    showCover={true}
                    mobileScrollSupport={true}
                    className="shadow-[0_30px_80px_-15px_rgba(0,0,0,0.95)] rounded-sm"
                    ref={flipBookRef}
                    usePortrait={false}
                    startPage={0}
                    drawShadow={true}
                    flippingTime={800}
                    useMouseEvents={true}
                    swipeDistance={30}
                    clickEventForward={true}
                    disableFlipByClick={false}
                    onFlip={(e) => setCurrentPage(e.data)}
                >
                    {flipbookPages.map((url, i) => (
                        <div key={i} className="bg-[#fdfaf3] overflow-hidden shadow-2xl" data-density="hard">
                            <div className="relative w-full h-full">
                                {/* Page Background Texture */}
                                <div className="absolute inset-0 pointer-events-none opacity-5"
                                    style={{ backgroundImage: parchmentBg }} />

                                {/* Subtle gradient for depth */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-transparent to-black/5 z-10" />

                                {/* The actual page image */}
                                <img
                                    src={url}
                                    className="w-full h-full object-contain p-3 sm:p-5"
                                    alt={`Page ${i + 1}`}
                                    draggable={false}
                                />

                                {/* Gutter Shadow - The spine/fold effect */}
                                <div className={`absolute top-0 bottom-0 w-6 sm:w-10 z-20 pointer-events-none
                                ${i % 2 === 0
                                        ? 'right-0 bg-gradient-to-l from-black/40 via-black/15 to-transparent'
                                        : 'left-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent'
                                    }`}
                                />

                                {/* Corner Curl Effect - Makes it look more like a real page */}
                                {i > 0 && (
                                    <div className={`absolute w-10 h-10 sm:w-14 sm:h-14 pointer-events-none z-30
                                    ${i % 2 === 0
                                            ? 'bottom-0 right-0 bg-gradient-to-tl from-[#3E2723]/25 to-transparent rounded-tl-lg'
                                            : 'bottom-0 left-0 bg-gradient-to-tr from-[#3E2723]/25 to-transparent rounded-tr-lg'
                                        }`}
                                    />
                                )}

                                {/* Page Number */}
                                {i > 0 && (
                                    <div className={`absolute bottom-4 sm:bottom-6 font-['Cinzel'] text-[10px] sm:text-[11px] text-black/50 tracking-widest z-30 font-semibold
                                    ${i % 2 === 0 ? 'left-5 sm:left-8' : 'right-5 sm:right-8'}`}>
                                        {i}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </HTMLFlipBook>
            </div>

            {/* Navigation Arrows - Enhanced Design */}
            <button
                onClick={() => {
                    console.log('Desktop flipbook NEXT clicked, currentPage:', currentPage, 'ref:', flipBookRef.current);
                    flipBookRef.current?.pageFlip()?.flipNext();
                }}
                disabled={currentPage >= flipbookPages.length - 2}
                className="hidden md:flex absolute right-0 lg:-right-16 z-20 p-3 sm:p-4 lg:p-5 bg-gradient-to-l from-white/10 to-transparent hover:from-white/20 backdrop-blur-md rounded-xl text-[#D4AF37] hover:text-[#F3E5AB] transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 border border-[#D4AF37]/20"
            >
                <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 drop-shadow-lg" />
            </button>
        </div>

        {/* Bottom Info & Controls */}
        <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 space-y-3 sm:space-y-4">
            {/* Mobile Navigation Buttons */}
            <div className="flex md:hidden justify-center gap-3 px-4">
                <button
                    onClick={() => {
                        console.log('Mobile flipbook PREV clicked, currentPage:', currentPage, 'ref:', flipBookRef.current);
                        if (flipBookRef.current?.pageFlip) {
                            flipBookRef.current.pageFlip().flipPrev();
                        } else {
                            console.error('FlipBook ref not initialized!');
                        }
                    }}
                    disabled={currentPage === 0}
                    className="flex-1 max-w-[140px] px-4 py-3 bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-lg border border-[#D4AF37]/40 text-[#F3E5AB] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>
                <button
                    onClick={() => {
                        console.log('Mobile flipbook NEXT clicked, currentPage:', currentPage, 'ref:', flipBookRef.current);
                        if (flipBookRef.current?.pageFlip) {
                            flipBookRef.current.pageFlip().flipNext();
                        } else {
                            console.error('FlipBook ref not initialized!');
                        }
                    }}
                    disabled={currentPage >= flipbookPages.length - 2}
                    className="flex-1 max-w-[140px] px-4 py-3 bg-gradient-to-l from-white/15 to-white/10 backdrop-blur-lg border border-[#D4AF37]/40 text-[#F3E5AB] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Page Progress Indicator */}
            <div className="flex justify-center px-4">
                <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-[#D4AF37]/30">
                    <p className="text-[10px] sm:text-xs text-[#F3E5AB] font-medium tracking-wide">
                        Swipe or click to flip pages
                    </p>
                </div>
            </div>
        </div>
    </div>

);

// --- DEDICATED MOBILE VIEW ---
const mobileViewJSX = (
    <div className="bg-[#FAF7F2] min-h-screen pb-28">

        {/* ── Hero Image with blurred backdrop ── */}
        <div className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(180deg,#FFF4E0 0%,#FAF7F2 100%)' }}>
            {/* Blurred bg cover */}
            <div className="absolute inset-0 scale-110 blur-2xl opacity-40 pointer-events-none"
                style={{ backgroundImage: `url(${images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

            {/* Discount ribbon */}
            {d.off > 0 && (
                <div className="absolute top-4 left-0 z-20 bg-[#D4AF37] text-white text-xs font-bold px-4 py-1 rounded-r-full shadow-md tracking-wide">
                    {d.off}% OFF
                </div>
            )}

            {/* Main image */}
            <div className="relative flex items-center justify-center pt-10 pb-4" style={{ minHeight: 320 }}>
                <img
                    src={images[activeImg] || "/placeholder.png"}
                    className="max-h-[320px] w-auto object-contain drop-shadow-2xl transition-all duration-300 rounded-xl"
                    alt={`${book.title} - Image ${activeImg + 1}`}
                    style={{ filter: 'drop-shadow(0 20px 30px rgba(62,39,35,0.25))' }}
                />
                {images.length > 1 && activeImg > 0 && (
                    <button onMouseDown={e => e.preventDefault()} onClick={() => setActiveImg(i => i - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-[#D4AF37]/30 shadow flex items-center justify-center text-[#3E2723] active:scale-90 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
                {images.length > 1 && activeImg < images.length - 1 && (
                    <button onMouseDown={e => e.preventDefault()} onClick={() => setActiveImg(i => i + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-[#D4AF37]/30 shadow flex items-center justify-center text-[#3E2723] active:scale-90 transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="flex justify-center gap-2 pb-4 px-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {images.map((img, i) => (
                        <button key={i} onMouseDown={e => e.preventDefault()} onClick={() => setActiveImg(i)}
                            className={`w-12 h-14 flex-shrink-0 rounded-lg border-2 bg-white/70 backdrop-blur-sm p-0.5 transition-all ${activeImg === i ? 'border-[#D4AF37] shadow-md scale-110' : 'border-transparent opacity-60'}`}>
                            <img src={img} className="w-full h-full object-contain pointer-events-none" alt="" />
                        </button>
                    ))}
                </div>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
                <div className="flex justify-center gap-1.5 pb-3">
                    {images.map((_, i) => (
                        <button key={i} onMouseDown={e => e.preventDefault()} onClick={() => setActiveImg(i)}
                            className={`rounded-full transition-all ${activeImg === i ? 'w-5 h-1.5 bg-[#D4AF37]' : 'w-1.5 h-1.5 bg-[#D4AF37]/30'}`} />
                    ))}
                </div>
            )}
        </div>

        {/* ── Content card overlapping the hero ── */}
        <div className="relative -mt-3 rounded-t-[2rem] bg-white shadow-[0_-8px_30px_rgba(62,39,35,0.1)] z-10">
            <div className="px-5 pt-6 pb-4">

                {/* Category + rating row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {book.categories?.[0] && (
                        <span className="text-[10px] font-bold text-[#D4AF37] bg-[#FFF9E6] border border-[#D4AF37]/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            ✦ {book.categories[0]}
                        </span>
                    )}
                    <div className="flex items-center gap-1 ml-auto">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(bookRating(book._id)) ? 'fill-amber-400 text-amber-400' : (bookRating(book._id) % 1 >= 0.5 && i === Math.floor(bookRating(book._id))) ? 'fill-amber-200 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                        ))}
                        <span className="text-sm font-bold text-[#5C4A2E] ml-1">{bookRating(book._id).toFixed(1)}</span>
                        <span className="text-xs text-[#8A7A5E]">({bookReviews(book._id, book.inventory?.stock ?? 0)})</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-xl font-['Cinzel'] font-bold text-[#3E2723] leading-snug mb-1">{book.title}</h1>
                {book.author && <p className="text-sm text-[#8A7A5E] mb-4">by <span className="text-[#3E2723] font-semibold">{book.author}</span></p>}

                {/* Price row */}
                <div className="flex items-center gap-3 p-3.5 bg-[#FFF9E6] rounded-2xl border border-[#D4AF37]/20 mb-4">
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-[#3E2723]">₹{d.price.toLocaleString('en-IN')}</span>
                            {d.mrp > d.price && <span className="text-base text-[#8A7A5E] line-through">₹{d.mrp.toLocaleString('en-IN')}</span>}
                        </div>
                        {d.off > 0 && <span className="text-xs font-bold text-green-700">You save ₹{(d.mrp - d.price).toLocaleString('en-IN')} ({d.off}%)</span>}
                    </div>
                    {book.inventory?.stock > 0
                        ? <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 whitespace-nowrap">✓ In Stock</span>
                        : <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 whitespace-nowrap">Out of Stock</span>
                    }
                </div>

                {/* Edition badge */}
                {book.edition && (
                    <div className="flex items-center gap-2 mb-4">
                        <Book className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-xs font-semibold text-[#8A7A5E] uppercase tracking-wide">Edition</span>
                        <span className="text-xs font-bold text-[#3E2723] bg-[#FFF9E6] px-2.5 py-1 rounded-full border border-[#D4AF37]/30">{book.edition}</span>
                    </div>
                )}
            </div>{/* end px-5 pt-6 pb-4 */}

            <div className="px-5 pb-6">

            {/* Editions Strip - Mobile */}
            {editions.length > 0 && (
                <div className="mb-6 rounded-xl border border-[#D4AF37]/30 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF9E6] border-b border-[#D4AF37]/20">
                        <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-[11px] font-bold text-[#8A7A5E] uppercase tracking-widest">Also Available In</span>
                        <span className="text-[10px] font-semibold text-[#D4AF37] ml-2">{editions.length} edition{editions.length > 1 ? 's' : ''}</span>
                        {editions.length > 3 && (
                            <button onClick={() => setShowAllEditions(true)} className="ml-auto text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider hover:text-[#B0894C] transition-colors flex items-center gap-0.5">
                                See All <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    {/* Cards */}
                    <div className="relative bg-white">
                        <button
                            onClick={() => editionsMobileRef.current?.scrollBy({ left: -260, behavior: 'smooth' })}
                            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-[#D4AF37]/40 shadow flex items-center justify-center text-[#3E2723] active:scale-95 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div ref={editionsMobileRef} className="flex gap-3 px-9 py-3 overflow-x-auto scrollbar-hide">
                        {editions.map(ed => {
                            const edDeal = dealFn(ed);
                            const skuTokens = (ed.inventory?.sku || '').split('_');
                            const lastToken = skuTokens[skuTokens.length - 1] || '';
                            const skuLabel = /^\d+$/.test(lastToken) && skuTokens.length >= 2
                                ? `${skuTokens[skuTokens.length - 2]} ${lastToken}`
                                : lastToken;
                            return (
                                <button
                                    key={ed._id}
                                    onClick={() => { navigate(`/book/${ed.slug}`); window.scrollTo(0, 0); }}
                                    className="flex-shrink-0 w-[120px] bg-[#FAF7F2] rounded-xl border border-[#D4AF37]/20 active:border-[#D4AF37] active:scale-[0.97] transition-all duration-150 text-left group overflow-hidden"
                                >
                                    {/* Cover */}
                                    <div className="relative w-full aspect-[3/4] bg-[#FFF9E6] overflow-hidden">
                                        <img
                                            src={assetUrl(ed.assets?.coverUrl?.[0])}
                                            className="w-full h-full object-contain p-2"
                                            alt={ed.title}
                                        />
                                        {skuLabel && (
                                            <div className="absolute bottom-0 inset-x-0 pt-5 pb-1.5 px-2 bg-gradient-to-t from-[#3E2723]/85 via-[#3E2723]/40 to-transparent">
                                                <span className="block text-center text-[10px] font-bold text-[#F3E5AB] tracking-wider uppercase">
                                                    {skuLabel}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="px-2.5 py-2">
                                        <p className="text-[11px] font-bold text-[#3E2723] leading-tight line-clamp-2 min-h-[28px] mb-1.5">
                                            {ed.title}
                                        </p>
                                        <div className="flex items-baseline gap-1 flex-wrap">
                                            <span className="text-sm font-bold text-[#3E2723]">₹{edDeal.price.toLocaleString('en-IN')}</span>
                                            {edDeal.mrp > edDeal.price && (
                                                <span className="text-[10px] text-[#8A7A5E] line-through">₹{edDeal.mrp.toLocaleString('en-IN')}</span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                        </div>
                        <button
                            onClick={() => editionsMobileRef.current?.scrollBy({ left: 260, behavior: 'smooth' })}
                            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-[#D4AF37]/40 shadow flex items-center justify-center text-[#3E2723] active:scale-95 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Button */}
            {flipbookPages.length > 0 && (
                <button
                    onClick={() => setShowFlipbook(true)}
                    className="w-full py-3.5 bg-[#3E2723] text-white rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 active:bg-[#5C4A2E] transition-colors mb-8 shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]/30"
                >
                    <BookOpen className="w-5 h-5" /> Look Inside
                </button>
            )}

            {/* Info Sections - Improved Readability */}
            <div className="space-y-2">
                <MobileAccordion icon={Info} title="Overview" defaultOpen={true}>
                    {/* Styles for better readability: Larger text, looser leading, more spacing */}
                    <div className="text-[16px] leading-8 text-[#5C4A2E] tracking-normal space-y-4 font-normal">
                        <div
                            className="[&>p]:mb-5 [&>ul]:mb-5 [&>ul]:list-disc [&>ul]:pl-5 [&>strong]:text-[#3E2723] [&>strong]:font-bold"
                            dangerouslySetInnerHTML={{ __html: book.descriptionHtml }}
                        />
                    </div>
                </MobileAccordion>

                <MobileAccordion icon={Sparkles} title="Specifications">
                    <div className="bg-[#FAF7F2] rounded-xl border border-[#D4AF37]/20 p-4 space-y-3">
                        {config.specs?.map((s, i) => (
                            <div key={i} className="flex justify-between items-center text-sm border-b border-[#D4AF37]/20 last:border-0 pb-2 last:pb-0">
                                <span className="text-[#8A7A5E] font-medium">{s.label}</span>
                                <span className="font-bold text-[#3E2723]">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </MobileAccordion>

                <MobileAccordion icon={Brain} title="What they'll learn">
                    <div className="grid gap-4">
                        {config.curriculum?.map((item, i) => (
                            <div key={i} className="flex gap-4 items-start p-3 bg-[#FAF7F2] rounded-xl border border-[#D4AF37]/10">
                                <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-2 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-[#3E2723] mb-1">{item.title}</h4>
                                    <p className="text-sm text-[#5C4A2E] leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </MobileAccordion>

                <MobileAccordion icon={MessageSquarePlus} title={`Reviews${allReviews.length ? ` (${allReviews.length})` : ""}`}>
                    <div className="space-y-4">
                        {/* Write a review button / form */}
                        {isCustomer && !showReviewForm && (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="w-full py-2.5 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-xl text-sm font-semibold tracking-wide"
                            >
                                {myReview ? "Edit Your Review" : "Write a Review"}
                            </button>
                        )}
                        {!isCustomer && (
                            <p className="text-xs text-[#8A7A5E] italic px-1">
                                <a href="/login" className="text-[#C59D5F] underline font-semibold">Login</a> to write a review.
                            </p>
                        )}
                        {showReviewForm && isCustomer && (
                            <form onSubmit={handleSubmitReview} className="bg-[#FFF9E6] p-4 rounded-xl border border-[#D4AF37]/30 space-y-3">
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(s => (
                                        <button key={s} type="button"
                                            onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                                            onMouseEnter={() => setReviewHover(s)}
                                            onMouseLeave={() => setReviewHover(0)}
                                        >
                                            <Star className={`w-7 h-7 transition-colors ${s <= (reviewHover || reviewForm.rating) ? 'fill-amber-400 text-amber-400' : 'text-[#D4AF37]/30'}`} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={reviewForm.text}
                                    onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
                                    placeholder="Share your thoughts about this book..."
                                    rows={3}
                                    maxLength={1000}
                                    className="w-full text-sm border border-[#D4AF37]/30 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-[#3E2723] resize-none"
                                />
                                <div className="flex gap-2">
                                    <button type="submit" disabled={reviewSubmitting}
                                        className="flex-1 py-2 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-lg text-sm font-semibold disabled:opacity-60"
                                    >{reviewSubmitting ? "Submitting..." : "Submit"}</button>
                                    <button type="button" onClick={() => setShowReviewForm(false)}
                                        className="px-4 py-2 border border-[#D4AF37]/30 rounded-lg text-sm text-[#8A7A5E]"
                                    >Cancel</button>
                                </div>
                            </form>
                        )}
                        {/* Public reviews */}
                        {allReviews.length > 0 ? allReviews.map((review, i) => (
                            <div key={review._id || i} className="bg-[#FAF7F2] p-4 rounded-xl border border-[#D4AF37]/20">
                                <div className="flex gap-0.5 mb-2">
                                    {[...Array(5)].map((_, idx) => (
                                        <Star key={idx} className={`w-3.5 h-3.5 ${idx < review.rating ? 'fill-amber-400 text-amber-400' : 'text-[#D4AF37]/30'}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-[#5C4A2E] italic mb-3">"{review.text}"</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#FFF9E6] flex items-center justify-center text-[10px] font-bold text-[#D4AF37] border border-[#D4AF37]/30">
                                        {review.customerName?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-[#3E2723]">{review.customerName}</span>
                                        {review.role && <span className="text-[10px] text-[#8A7A5E] ml-1">· {review.role}</span>}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-[#8A7A5E] italic px-2">No reviews yet. Be the first!</p>
                        )}
                    </div>
                </MobileAccordion>

                {config.story?.text && (
                    <MobileAccordion icon={Feather} title="The Story">
                        <div className="bg-[#FFF9E6] p-5 rounded-xl border border-[#D4AF37]/30 text-center relative overflow-hidden">
                            <Quote className="w-8 h-8 text-[#D4AF37]/20 absolute top-2 left-2" />
                            <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-3">Behind the scenes</h3>
                            <p className="text-[15px] italic text-[#3E2723] leading-relaxed relative z-10">"{config.story.text}"</p>
                        </div>
                    </MobileAccordion>
                )}
            </div>

            {/* Suggestions — mobile slider */}
            {suggestions.length > 0 && (
                <MobileSuggestionsSlider suggestions={suggestions} navigate={navigate} />
            )}
            </div>{/* end px-5 pb-6 */}
        </div>{/* end white card */}

        {/* Sticky Mobile Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D4AF37]/20 p-3 px-4 shadow-[0_-4px_20px_rgba(62,39,35,0.1)] z-50 flex gap-3 safe-area-bottom">
            <div className="flex items-center bg-[#FAF7F2] rounded-xl h-12 px-2 flex-shrink-0 border border-[#D4AF37]/20">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-full flex items-center justify-center text-[#8A7A5E] active:text-[#3E2723]"><ChevronLeft className="w-5 h-5" /></button>
                <span className="w-6 text-center font-bold text-base text-[#3E2723]">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-8 h-full flex items-center justify-center text-[#8A7A5E] active:text-[#3E2723]"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 flex gap-2">
                <button onClick={() => handleAddToCart(false)} disabled={isOutOfStock} className="w-14 bg-green-100 text-green-800 rounded-xl font-bold text-sm flex items-center justify-center active:scale-95 transition-transform border border-green-200">
                    <ShoppingCart className="w-6 h-6" />
                </button>
                <button onClick={() => handleAddToCart(true)} disabled={isOutOfStock} className="flex-1 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] hover:from-[#D4AF37] hover:to-[#C59D5F] text-white rounded-xl font-bold text-base shadow-[#D4AF37]/30 shadow-lg active:scale-95 transition-transform flex items-center justify-center">
                    {isOutOfStock ? "Sold Out" : "Buy Now"}
                </button>
            </div>
        </div>
    </div>
);

// --- DEDICATED DESKTOP VIEW ---
const desktopViewJSX = (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 relative">
        <nav className="hidden md:flex items-center gap-2 text-sm text-[#8A7A5E] mb-6">
            <span className="cursor-pointer hover:text-[#D4AF37] transition-colors" onClick={() => navigate('/')}>Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="cursor-pointer hover:text-[#D4AF37] transition-colors" onClick={() => navigate('/catalog')}>Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#3E2723] font-medium truncate max-w-xs">{book.title}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10">
            <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-24 space-y-3 sm:space-y-4">
                    <div className="relative w-full bg-white rounded-xl sm:rounded-2xl border border-[#D4AF37]/30 shadow-sm group overflow-hidden">
                        <div className="relative w-full h-[280px] sm:h-auto sm:aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5]">
                            <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
                                <img
                                    src={images[activeImg] || "/placeholder.png"}
                                    alt={book.title}
                                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            {/* Prev / Next arrows on main image */}
                            {images.length > 1 && activeImg > 0 && (
                                <button
                                    onClick={() => setActiveImg(i => i - 1)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 border border-[#D4AF37]/40 shadow-md flex items-center justify-center text-[#3E2723] hover:bg-[#FFF9E6] active:scale-95 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            )}
                            {images.length > 1 && activeImg < images.length - 1 && (
                                <button
                                    onClick={() => setActiveImg(i => i + 1)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 border border-[#D4AF37]/40 shadow-md flex items-center justify-center text-[#3E2723] hover:bg-[#FFF9E6] active:scale-95 transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                            {/* Dot indicators */}
                            {images.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImg(i)}
                                            className={`rounded-full transition-all ${activeImg === i ? 'w-4 h-1.5 bg-[#D4AF37]' : 'w-1.5 h-1.5 bg-[#D4AF37]/30 hover:bg-[#D4AF37]/60'}`}
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="hidden md:flex absolute inset-0 bg-[#3E2723]/5 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                                <button
                                    onClick={() => setShowFlipbook(true)}
                                    className="bg-white text-[#3E2723] px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-gradient-to-r hover:from-[#C59D5F] hover:to-[#B0894C] hover:text-white border border-[#D4AF37]/30"
                                >
                                    <BookOpen className="w-4 h-4" /> Look Inside
                                </button>
                            </div>
                            {d.off > 0 && (
                                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#D4AF37] text-white px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-md sm:rounded-lg shadow-md z-10">
                                    -{d.off}% OFF
                                </div>
                            )}
                        </div>
                    </div>

                    {images.length > 1 && (
                        <div className="relative w-full">
                            {activeImg > 0 && (
                                <button
                                    onClick={() => setActiveImg(i => i - 1)}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-[#D4AF37]/40 shadow flex items-center justify-center text-[#3E2723] hover:bg-[#FFF9E6] active:scale-95 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            )}
                            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory px-6">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.preventDefault(); setActiveImg(i); }}
                                        className={`w-14 h-16 sm:w-16 sm:h-20 lg:w-20 lg:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-white snap-center cursor-pointer ${activeImg === i
                                            ? 'border-[#D4AF37] shadow-md ring-2 ring-[#FFF9E6] scale-105'
                                            : 'border-[#D4AF37]/30 opacity-60 hover:opacity-100 hover:border-[#D4AF37] hover:scale-105'
                                            }`}
                                    >
                                        <img src={img} className="w-full h-full object-contain p-1 pointer-events-none" alt={`Thumbnail ${i + 1}`} />
                                    </button>
                                ))}
                            </div>
                            {activeImg < images.length - 1 && (
                                <button
                                    onClick={() => setActiveImg(i => i + 1)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-[#D4AF37]/40 shadow flex items-center justify-center text-[#3E2723] hover:bg-[#FFF9E6] active:scale-95 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {flipbookPages.length > 0 && (
                        <button
                            onClick={() => setShowFlipbook(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 md:py-4 bg-white border-2 border-[#3E2723] text-[#3E2723] rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base uppercase tracking-wider hover:bg-[#3E2723] hover:text-white active:scale-[0.98] transition-all shadow-sm hover:shadow-md"
                        >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            Preview Book
                        </button>
                    )}
                </div>
            </div>

            <div className="lg:col-span-7 space-y-3 sm:space-y-4 md:space-y-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF9E6] text-[#D4AF37] text-xs font-semibold rounded-full border border-[#D4AF37]/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    {book.categories?.[0] || "Featured"}
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-['Cinzel'] font-bold text-[#3E2723] leading-tight">
                    {book.title}
                </h1>
                {book.subtitle && (
                    <p className="text-sm sm:text-base text-[#8A7A5E] leading-relaxed">{book.subtitle}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {book.author && (
                        <span className="text-sm text-[#8A7A5E]">
                            by <span className="font-semibold text-[#5C4A2E]">{book.author}</span>
                        </span>
                    )}
                    <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${
                                    i < Math.floor(bookRating(book._id)) ? 'fill-amber-400 text-amber-400'
                                    : (bookRating(book._id) % 1 >= 0.5 && i === Math.floor(bookRating(book._id))) ? 'fill-amber-200 text-amber-400'
                                    : 'fill-gray-200 text-gray-300'
                                }`} />
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-[#5C4A2E]">{bookRating(book._id).toFixed(1)}</span>
                        <span className="text-xs text-[#8A7A5E]">({bookReviews(book._id, book.inventory?.stock ?? 0)} reviews)</span>
                    </div>
                </div>

                <div className="bg-[#FFF9E6]/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-[#D4AF37]/30">
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#3E2723]">
                            ₹{d.price.toLocaleString('en-IN')}
                        </span>
                        {d.mrp > d.price && (
                            <span className="text-sm sm:text-base md:text-lg text-[#8A7A5E] line-through">
                                ₹{d.mrp.toLocaleString('en-IN')}
                            </span>
                        )}
                        {d.off > 0 && (
                            <span className="text-[10px] sm:text-xs font-bold text-green-700 bg-green-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                                Save {d.off}%
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                        <span className={`inline-flex items-center gap-1 font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${book.inventory?.stock > 0 ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-700 bg-red-50 border border-red-200'}`}>
                            {book.inventory?.stock > 0 ? <><Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> In Stock</> : <><X className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Out of Stock</>}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#8A7A5E] bg-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#D4AF37]/20">
                            <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Free delivery
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1 text-[#8A7A5E] bg-white px-2.5 py-1 rounded-full border border-[#D4AF37]/20">
                            <Shield className="w-3 h-3" /> Age appropriate
                        </span>
                    </div>
                </div>

                {/* Edition Badge */}
                {book.edition && (
                    <div className="flex items-center gap-2">
                        <Book className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="text-xs font-semibold text-[#8A7A5E] uppercase tracking-wide">Edition</span>
                        <span className="text-xs font-bold text-[#3E2723] bg-[#FFF9E6] px-2.5 py-1 rounded-full border border-[#D4AF37]/30">{book.edition}</span>
                    </div>
                )}

                {/* Editions Strip - Desktop */}
                {editions.length > 0 && (
                    <div className="rounded-xl border border-[#D4AF37]/30 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF9E6] border-b border-[#D4AF37]/20">
                            <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span className="text-[11px] font-bold text-[#8A7A5E] uppercase tracking-widest">Also Available In</span>
                            <span className="text-[10px] font-semibold text-[#D4AF37] ml-2">{editions.length} edition{editions.length > 1 ? 's' : ''}</span>
                            {editions.length > 3 && (
                                <button onClick={() => setShowAllEditions(true)} className="ml-auto text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider hover:text-[#B0894C] transition-colors flex items-center gap-0.5">
                                    See All <ArrowRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        {/* Cards */}
                        <div className="relative bg-white">
                            <button
                                onClick={() => editionsDesktopRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                                className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-[#D4AF37]/40 shadow flex items-center justify-center text-[#3E2723] hover:bg-[#FFF9E6] active:scale-95 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div ref={editionsDesktopRef} className="flex gap-3 px-9 py-3 overflow-x-auto scrollbar-hide">
                                {editions.map(ed => {
                                    const edDeal = dealFn(ed);
                                    const skuTokens = (ed.inventory?.sku || '').split('_');
                                    const lastToken = skuTokens[skuTokens.length - 1] || '';
                                    const skuLabel = /^\d+$/.test(lastToken) && skuTokens.length >= 2
                                        ? `${skuTokens[skuTokens.length - 2]} ${lastToken}`
                                        : lastToken;
                                    return (
                                        <button
                                            key={ed._id}
                                            onClick={() => { navigate(`/book/${ed.slug}`); window.scrollTo(0, 0); }}
                                            className="flex-shrink-0 w-[130px] bg-[#FAF7F2] rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-lg active:scale-[0.97] transition-all duration-200 text-left group overflow-hidden"
                                        >
                                            {/* Cover */}
                                            <div className="relative w-full aspect-[3/4] bg-[#FFF9E6] overflow-hidden">
                                                <img
                                                    src={assetUrl(ed.assets?.coverUrl?.[0])}
                                                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                                    alt={ed.title}
                                                />
                                                {skuLabel && (
                                                    <div className="absolute bottom-0 inset-x-0 pt-5 pb-1.5 px-2 bg-gradient-to-t from-[#3E2723]/85 via-[#3E2723]/40 to-transparent">
                                                        <span className="block text-center text-[10px] font-bold text-[#F3E5AB] tracking-wider uppercase">
                                                            {skuLabel}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Info */}
                                            <div className="px-2.5 py-2">
                                                <p className="text-[11px] font-bold text-[#3E2723] leading-tight line-clamp-2 group-hover:text-[#D4AF37] transition-colors min-h-[30px] mb-1.5">
                                                    {ed.title}
                                                </p>
                                                <div className="flex items-baseline gap-1 flex-wrap">
                                                    <span className="text-sm font-bold text-[#3E2723]">₹{edDeal.price.toLocaleString('en-IN')}</span>
                                                    {edDeal.mrp > edDeal.price && (
                                                        <span className="text-[10px] text-[#8A7A5E] line-through">₹{edDeal.mrp.toLocaleString('en-IN')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => editionsDesktopRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                                className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-[#D4AF37]/40 shadow flex items-center justify-center text-[#3E2723] hover:bg-[#FFF9E6] active:scale-95 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {book.whyChooseThis?.length > 0 && (
                    <ul className="space-y-1.5 sm:space-y-2">
                        {book.whyChooseThis.slice(0, 4).map((pt, i) => (
                            <li key={i} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-[#5C4A2E]">
                                <div className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                                </div>
                                <span className="leading-relaxed">{pt}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="hidden md:block space-y-3 lg:space-y-4">
                    <div className="flex items-center gap-3">
                        <label className="text-xs lg:text-sm font-semibold text-[#8A7A5E] uppercase tracking-wide">Qty</label>
                        <div className="flex items-center bg-white rounded-lg border border-[#D4AF37]/30 h-10 lg:h-11">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 lg:w-11 h-full flex items-center justify-center text-[#8A7A5E] hover:text-[#3E2723] hover:bg-[#FAF7F2] rounded-l-lg transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="w-10 lg:w-12 text-center font-bold text-[#3E2723] text-base lg:text-lg">{qty}</span>
                            <button onClick={() => setQty(q => q + 1)} className="w-10 lg:w-11 h-full flex items-center justify-center text-[#8A7A5E] hover:text-[#3E2723] hover:bg-[#FAF7F2] rounded-r-lg transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => handleAddToCart(false)} disabled={isOutOfStock} className="flex-1 h-11 lg:h-12 xl:h-13 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm lg:text-base uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                            <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" /> Add to Cart
                        </button>
                        <button onClick={() => handleAddToCart(true)} disabled={isOutOfStock} className="flex-1 h-11 lg:h-12 xl:h-13 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] hover:from-[#D4AF37] hover:to-[#C59D5F] text-white rounded-xl font-semibold text-sm lg:text-base uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                            {isOutOfStock ? "Sold Out" : "Buy Now"} <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-10 sm:mt-14 bg-white rounded-2xl border border-[#D4AF37]/30 shadow-sm overflow-hidden">
            <div className="flex border-b border-[#D4AF37]/20 bg-[#FAF7F2]/50 overflow-x-auto no-scrollbar">
                {['Overview', 'Specifications', 'Curriculum', 'Reviews'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`flex-1 min-w-[90px] sm:min-w-[110px] py-3.5 sm:py-4 px-3 text-xs sm:text-sm font-['Cinzel'] font-semibold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${activeTab === tab.toLowerCase() ? 'text-[#D4AF37] border-[#D4AF37] bg-white' : 'text-[#8A7A5E] border-transparent hover:text-[#5C4A2E] hover:bg-white/60'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="min-h-[200px] p-4 sm:p-6 md:p-8">
                {activeTab === 'overview' && (
                    <div className="space-y-6 sm:space-y-8">
                        {book.descriptionHtml && (
                            <div>
                                <h3 className="text-lg sm:text-xl font-['Cinzel'] font-bold text-[#3E2723] mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-[#D4AF37]" />
                                    About This Book
                                </h3>
                                <div className="bg-[#FAF7F2] p-4 sm:p-6 rounded-xl border border-[#D4AF37]/20">
                                    <div
                                        className="text-sm sm:text-base text-[#5C4A2E] leading-relaxed prose prose-sm sm:prose-base max-w-none [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3"
                                        dangerouslySetInnerHTML={{ __html: book.descriptionHtml }}
                                    />
                                </div>
                            </div>
                        )}
                        {book.whyChooseThis?.length > 0 && (
                            <div>
                                <h3 className="text-lg sm:text-xl font-['Cinzel'] font-bold text-[#3E2723] mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-[#D4AF37]" />
                                    Why Kids Love This
                                </h3>
                                <div className="bg-[#FAF7F2] p-4 sm:p-6 rounded-xl border border-[#D4AF37]/20">
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {book.whyChooseThis.map((pt, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base text-[#5C4A2E]">
                                                <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-3 h-3 text-green-600" />
                                                </div>
                                                <span className="leading-relaxed">{pt}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'specifications' && (
                    <div>
                        <h3 className="text-lg sm:text-xl font-['Cinzel'] font-bold text-[#3E2723] mb-5 flex items-center gap-2"><Info className="w-5 h-5 text-[#D4AF37]" /> Specifications</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {config.specs?.map((s, i) => (
                                <SpecItem key={i} label={s.label} value={s.value} />
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'curriculum' && (
                    <div>
                        <h3 className="text-lg sm:text-xl font-['Cinzel'] font-bold text-[#3E2723] mb-5 flex items-center gap-2"><Brain className="w-5 h-5 text-[#D4AF37]" /> Learning Curriculum</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {config.curriculum?.length > 0 ? config.curriculum.map((item, i) => {
                                const IconComp = IconMap[item.icon] || Star;
                                return (
                                    <div key={i} className="bg-[#FAF7F2] p-4 sm:p-5 rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#FFF9E6]/50 transition-all group">
                                        <div className="w-11 h-11 rounded-xl bg-[#FFF9E6] flex items-center justify-center text-[#D4AF37] mb-3 group-hover:bg-[#D4AF37]/20 transition-colors">
                                            <IconComp className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-[#3E2723] mb-2 text-sm sm:text-base">{item.title}</h4>
                                        <p className="text-xs sm:text-sm text-[#5C4A2E] leading-relaxed">{item.description}</p>
                                    </div>
                                )
                            }) : <div className="col-span-2 text-center py-10"><p className="text-[#8A7A5E] text-sm italic">No curriculum details available.</p></div>}
                        </div>
                    </div>
                )}
                {activeTab === 'reviews' && (
                    <div className="space-y-6">
                        {/* Write a review */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-[#3E2723]">
                                {allReviews.length > 0 ? `${allReviews.length} Review${allReviews.length !== 1 ? "s" : ""}` : "No Reviews Yet"}
                            </h3>
                            {isCustomer && !showReviewForm && (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="px-5 py-2 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] hover:from-[#D4AF37] hover:to-[#C59D5F] text-white rounded-xl text-sm font-semibold uppercase tracking-wider transition-all shadow-sm"
                                >
                                    {myReview ? "Edit Review" : "Write a Review"}
                                </button>
                            )}
                            {!isCustomer && (
                                <a href="/login" className="text-sm text-[#C59D5F] underline font-semibold">Login to review</a>
                            )}
                        </div>

                        {/* Review form */}
                        {showReviewForm && isCustomer && (
                            <form onSubmit={handleSubmitReview} className="bg-[#FFF9E6] p-5 rounded-xl border border-[#D4AF37]/30 space-y-4">
                                <h4 className="font-semibold text-[#3E2723] text-sm">{myReview ? "Update your review" : "Share your experience"}</h4>
                                <div>
                                    <p className="text-xs text-[#8A7A5E] mb-1.5">Your rating</p>
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5].map(s => (
                                            <button key={s} type="button"
                                                onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                                                onMouseEnter={() => setReviewHover(s)}
                                                onMouseLeave={() => setReviewHover(0)}
                                            >
                                                <Star className={`w-8 h-8 transition-colors ${s <= (reviewHover || reviewForm.rating) ? 'fill-amber-400 text-amber-400' : 'text-[#D4AF37]/30'}`} />
                                            </button>
                                        ))}
                                        {reviewForm.rating > 0 && (
                                            <span className="ml-2 text-sm font-bold text-[#D4AF37] self-center">{reviewForm.rating}.0</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-[#8A7A5E] mb-1.5">Your review</p>
                                    <textarea
                                        value={reviewForm.text}
                                        onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
                                        placeholder="Share your thoughts about this book..."
                                        rows={4}
                                        maxLength={1000}
                                        className="w-full text-sm border border-[#D4AF37]/30 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-[#3E2723] resize-none"
                                    />
                                    <p className="text-xs text-[#8A7A5E] text-right mt-0.5">{reviewForm.text.length}/1000</p>
                                </div>
                                <div className="flex gap-3">
                                    <button type="submit" disabled={reviewSubmitting}
                                        className="px-6 py-2.5 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] hover:from-[#D4AF37] hover:to-[#C59D5F] text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-all"
                                    >{reviewSubmitting ? "Submitting..." : "Submit Review"}</button>
                                    <button type="button" onClick={() => setShowReviewForm(false)}
                                        className="px-5 py-2.5 border border-[#D4AF37]/30 rounded-xl text-sm text-[#8A7A5E] hover:bg-[#FAF7F2] transition-all"
                                    >Cancel</button>
                                </div>
                            </form>
                        )}

                        {/* All reviews grid (admin testimonials + customer reviews) */}
                        {allReviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allReviews.map((review, i) => (
                                    <div key={review._id || i} className="bg-[#FAF7F2] p-4 sm:p-5 rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all relative overflow-hidden">
                                        <Quote className="absolute top-3 right-3 w-10 h-10 text-[#D4AF37]/10" />
                                        <div className="flex gap-0.5 mb-3 relative z-10">
                                            {Array.from({ length: 5 }, (_, idx) => (
                                                <Star key={idx} className={`w-4 h-4 ${idx < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-[#D4AF37]/20'}`} />
                                            ))}
                                        </div>
                                        <p className="text-[#5C4A2E] text-sm leading-relaxed mb-4 relative z-10">"{review.text}"</p>
                                        <div className="flex items-center gap-2.5 relative z-10">
                                            <div className="w-9 h-9 rounded-full bg-[#FFF9E6] flex items-center justify-center text-[#D4AF37] font-bold text-sm border border-[#D4AF37]/30">{review.customerName?.charAt(0) || "?"}</div>
                                            <div>
                                                <div className="text-sm font-semibold text-[#3E2723]">{review.customerName}</div>
                                                {review.role && <div className="text-xs text-[#8A7A5E]">{review.role}</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-[#FAF7F2] rounded-xl border border-dashed border-[#D4AF37]/30">
                                <MessageSquarePlus className="w-12 h-12 text-[#D4AF37]/20 mx-auto mb-4" />
                                <h3 className="text-lg font-['Cinzel'] font-bold text-[#5C4A2E] mb-2">No Reviews Yet</h3>
                                <p className="text-[#8A7A5E] text-sm mb-6 max-w-sm mx-auto px-4">Be the first to share your experience with this book.</p>
                                {!isCustomer && (
                                    <a href="/login" className="px-6 py-2.5 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] hover:from-[#D4AF37] hover:to-[#C59D5F] text-white rounded-xl text-sm font-semibold uppercase tracking-wider transition-all shadow-sm inline-block">Login to Review</a>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* --- STORY SECTION --- */}
        {config.story?.text && (
            <section className="mt-12 sm:mt-16 bg-[#FFF9E6]/50 rounded-2xl p-6 sm:p-8 md:p-12 border border-[#D4AF37]/30 relative overflow-hidden">
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.2em] mb-3 block">The Story Behind</span>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-['Cinzel'] font-bold text-[#3E2723] mb-4 sm:mb-6">{config.story.heading}</h2>
                    <p className="text-sm sm:text-base md:text-lg text-[#5C4A2E] leading-relaxed mb-6 italic">
                        "{config.story.text}"
                    </p>
                    {config.story.quote && (
                        <div className="inline-block px-6 py-3 border-t border-b border-[#D4AF37]/30">
                            <p className="text-sm font-bold text-[#3E2723] uppercase tracking-wide">{config.story.quote}</p>
                        </div>
                    )}
                </div>
            </section>
        )}

        {/* --- SUGGESTIONS --- */}
        {suggestions.length > 0 && (
            <DesktopSuggestionsSlider suggestions={suggestions} navigate={navigate} />
        )}
    </div>
);

return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723] pb-0">
        <SEO
            title={`${book.title} - ${book.categories?.[0] || 'Books'} | Kiddos Intellect`}
            description={book.descriptionHtml?.replace(/<[^>]*>/g, '').slice(0, 155) || `Shop ${book.title} by ${book.authors?.[0] || 'various authors'}. Premium children's books and educational materials.`}
            image={images[0] || '/favicon.jpg'}
            type="product"
            keywords={`${book.title}, ${book.authors?.join(', ') || ''}, ${book.categories?.join(', ') || ''}, children's books, kids books, educational books, story books, learning materials`}
            breadcrumbs={[
                { name: "Home", url: "/" },
                { name: "Catalog", url: "/catalog" },
                { name: book.title, url: `/book/${book.slug}` }
            ]}
            product={{
                name: book.title,
                description: book.descriptionHtml?.replace(/<[^>]*>/g, '').slice(0, 155),
                images: images,
                price: d.price,
                priceCurrency: 'INR',
                inStock: !isOutOfStock,
                sku: book.inventory?.sku || book._id,
                isbn: book.isbn13 || book.isbn10,
                author: book.authors?.[0],
                numberOfPages: book.pages,
                language: book.language,
                ...(config.testimonials?.length > 0 && {
                    rating: {
                        value: parseFloat((config.testimonials.reduce((s, t) => s + (t.rating || 5), 0) / config.testimonials.length).toFixed(1)),
                        count: config.testimonials.length
                    }
                })
            }}
        />

        {flipbookModalJSX}

        {/* All Editions Modal */}
        {showAllEditions && (
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowAllEditions(false)}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                {/* Sheet */}
                <div
                    className="relative w-full sm:max-w-lg bg-white rounded-t-[2rem] sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-10 h-1 rounded-full bg-[#D4AF37]/30" />
                    </div>
                    {/* Header */}
                    <div className="flex items-center gap-2 px-5 py-3.5 bg-[#FFF9E6] border-b border-[#D4AF37]/20">
                        <Globe className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-['Cinzel'] font-bold text-[#3E2723] text-sm">All Editions</span>
                        <span className="text-xs text-[#D4AF37] font-semibold ml-1">({editions.length})</span>
                        <button onClick={() => setShowAllEditions(false)} className="ml-auto w-7 h-7 rounded-full bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 flex items-center justify-center text-[#3E2723] transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Grid */}
                    <div className="overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {editions.map(ed => {
                            const edDeal = dealFn(ed);
                            const skuTokens = (ed.inventory?.sku || '').split('_');
                            const lastToken = skuTokens[skuTokens.length - 1] || '';
                            const skuLabel = /^\d+$/.test(lastToken) && skuTokens.length >= 2
                                ? `${skuTokens[skuTokens.length - 2]} ${lastToken}`
                                : lastToken;
                            return (
                                <button
                                    key={ed._id}
                                    onClick={() => { setShowAllEditions(false); navigate(`/book/${ed.slug}`); window.scrollTo(0, 0); }}
                                    className="bg-[#FAF7F2] rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-md active:scale-[0.97] transition-all text-left group overflow-hidden"
                                >
                                    <div className="relative w-full aspect-[3/4] bg-[#FFF9E6] overflow-hidden">
                                        <img src={assetUrl(ed.assets?.coverUrl?.[0])} className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" alt={ed.title} />
                                        {skuLabel && (
                                            <div className="absolute bottom-0 inset-x-0 pt-4 pb-1 px-1.5 bg-gradient-to-t from-[#3E2723]/85 via-[#3E2723]/40 to-transparent">
                                                <span className="block text-center text-[9px] font-bold text-[#F3E5AB] tracking-wider uppercase">{skuLabel}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-2 py-1.5">
                                        <p className="text-[10px] font-bold text-[#3E2723] leading-tight line-clamp-2 mb-1 group-hover:text-[#D4AF37] transition-colors">{ed.title}</p>
                                        <span className="text-xs font-bold text-[#3E2723]">₹{edDeal.price.toLocaleString('en-IN')}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* DEDICATED MOBILE VIEW */}
        <div className="md:hidden">
            {mobileViewJSX}
        </div>

        {/* DEDICATED DESKTOP VIEW */}
        <div className="hidden md:block">
            {desktopViewJSX}
        </div>
        <Footer />
    </div>

);
    }

/* ── Seeded rating: deterministic per book, range 4.5–5.0 ── */
function bookRating(id = "") {
    const seed = parseInt((id || "").slice(-6) || "0", 16);
    const steps = [4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
    return steps[seed % steps.length];
}
function bookReviews(id = "", stock = 0) {
    // XOR counter+machine bytes of ObjectID — unique per document
    const s = id || "000000000000000000000000";
    const a = parseInt(s.slice(-6), 16);
    const b = parseInt(s.slice(12, 18), 16);
    const seed = ((a ^ b) >>> 0) % 420;  // 0-419, unique per book
    // Stock in log scale so even large stock values add at most ~60
    const stockBonus = Math.min(Math.floor(Math.log10(stock + 1) * 20), 60);
    return 42 + seed + stockBonus;  // range: 42-521
}

/* ── Shared suggestion card ── */
function SuggestionCard({ s, navigate }) {
    const deal = dealFn(s);
    const rating = bookRating(s._id);
    const reviews = bookReviews(s._id, s.inventory?.stock ?? 0);
    const go = () => { navigate(`/book/${s.slug}`); window.scrollTo(0, 0); };
    return (
        <div className="group bg-white rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col h-full">
            <div onClick={go} className="aspect-[3/4] overflow-hidden relative bg-[#FAF7F2] cursor-pointer flex-shrink-0">
                <img
                    src={assetUrl(s.assets?.coverUrl?.[0])}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    alt={s.title}
                    loading="lazy"
                />
                {deal.off > 0 && (
                    <div className="absolute top-2 left-2 bg-[#D4AF37] text-white px-2 py-0.5 text-[10px] font-bold rounded-md shadow">
                        -{deal.off}%
                    </div>
                )}
            </div>
            <div className="p-3 space-y-1.5 flex flex-col flex-grow">
                <h3 onClick={go} className="font-bold text-[#3E2723] text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-[#D4AF37] transition-colors cursor-pointer min-h-[2rem]">
                    {s.title}
                </h3>
                <div className="flex items-end gap-1.5">
                    <span className="text-base font-bold text-[#3E2723]">₹{deal.price}</span>
                    {deal.mrp > deal.price && <span className="text-[10px] text-[#8A7A5E] line-through mb-0.5">₹{deal.mrp}</span>}
                </div>
                <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-2.5 h-2.5 ${
                                i < Math.floor(rating) ? 'fill-amber-400 text-amber-400'
                                : (rating % 1 >= 0.5 && i === Math.floor(rating)) ? 'fill-amber-200 text-amber-400'
                                : 'fill-gray-200 text-gray-300'
                            }`} />
                        ))}
                    </div>
                    <span className="text-[10px] text-[#8A7A5E] ml-0.5">({rating.toFixed(1)}) · {reviews}</span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); go(); }}
                    className="mt-auto w-full py-2 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] hover:from-[#D4AF37] hover:to-[#C59D5F] text-white rounded-lg font-semibold text-[10px] sm:text-xs uppercase tracking-wider active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1"
                >
                    View Details <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

/* ── Mobile suggestions slider ── */
function MobileSuggestionsSlider({ suggestions, navigate }) {
    const ref = useRef(null);
    const scroll = (dir) => ref.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
    return (
        <div className="mt-12 pt-8 border-t border-[#D4AF37]/20 relative group/sugg">
            <h3 className="text-xl font-['Cinzel'] font-bold text-[#3E2723] mb-5 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#D4AF37] rounded-full" />
                You Might Also Like
            </h3>
            <button onMouseDown={e => e.preventDefault()} onClick={() => scroll(-1)}
                className="absolute left-0 top-1/2 z-10 w-8 h-8 rounded-full bg-white/90 border border-[#D4AF37]/30 shadow flex items-center justify-center text-[#3E2723] opacity-0 group-hover/sugg:opacity-100 transition-all -translate-x-3">
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button onMouseDown={e => e.preventDefault()} onClick={() => scroll(1)}
                className="absolute right-0 top-1/2 z-10 w-8 h-8 rounded-full bg-white/90 border border-[#D4AF37]/30 shadow flex items-center justify-center text-[#3E2723] opacity-0 group-hover/sugg:opacity-100 transition-all translate-x-3">
                <ChevronRight className="w-4 h-4" />
            </button>
            <div ref={ref} className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                {suggestions.map(s => (
                    <div key={s._id} className="w-[160px] flex-shrink-0 snap-start">
                        <SuggestionCard s={s} navigate={navigate} />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Desktop suggestions slider ── */
function DesktopSuggestionsSlider({ suggestions, navigate }) {
    const ref = useRef(null);
    const scroll = (dir) => ref.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
    return (
        <section className="mt-8 sm:mt-12 md:mt-16 border-t border-[#D4AF37]/20 pt-6 sm:pt-8 md:pt-10 pb-20 md:pb-8 relative group/sugg">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-['Cinzel'] font-bold text-[#3E2723] flex items-center gap-2.5">
                    <span className="w-1 h-6 bg-[#D4AF37] rounded-full" />
                    You Might Also Like
                </h2>
                <button onClick={() => navigate('/catalog')} className="text-[#D4AF37] text-xs sm:text-sm font-semibold uppercase tracking-wider hover:text-[#B0894C] transition-colors flex items-center gap-1 group">
                    View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
            <button onMouseDown={e => e.preventDefault()} onClick={() => scroll(-1)}
                className="absolute left-0 top-1/2 z-10 w-10 h-10 rounded-full bg-white/90 border border-[#D4AF37]/30 shadow-md flex items-center justify-center text-[#3E2723] opacity-0 group-hover/sugg:opacity-100 hover:bg-[#D4AF37] hover:text-white transition-all -translate-x-4">
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button onMouseDown={e => e.preventDefault()} onClick={() => scroll(1)}
                className="absolute right-0 top-1/2 z-10 w-10 h-10 rounded-full bg-white/90 border border-[#D4AF37]/30 shadow-md flex items-center justify-center text-[#3E2723] opacity-0 group-hover/sugg:opacity-100 hover:bg-[#D4AF37] hover:text-white transition-all translate-x-4">
                <ChevronRight className="w-5 h-5" />
            </button>
            <div ref={ref} className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                {suggestions.map(s => (
                    <div key={s._id} className="w-[200px] sm:w-[220px] md:w-[240px] flex-shrink-0 snap-start">
                        <SuggestionCard s={s} navigate={navigate} />
                    </div>
                ))}
            </div>
        </section>
    );
}