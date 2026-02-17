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
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeImg, setActiveImg] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");
    const [qty, setQty] = useState(1);
    const [showFlipbook, setShowFlipbook] = useState(false);

    // Flipbook Logic
    const flipBookRef = useRef(null);
    const [bookDim, setBookDim] = useState({ width: 400, height: 600 });
    const [currentPage, setCurrentPage] = useState(0);
    const mobileGalleryRef = useRef(null);
    const thumbnailScrollRef = useRef(null);
    const [canScrollThumbnailLeft, setCanScrollThumbnailLeft] = useState(false);
    const [canScrollThumbnailRight, setCanScrollThumbnailRight] = useState(false);

    // Cart & Auth
    const items = useCart((s) => s.items);
    const add = useCart((s) => s.add);
    const replaceAll = useCart((s) => s.replaceAll);
    const { isCustomer, token } = useCustomer();

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
        (async () => {
            try {
                setLoading(true);
                window.scrollTo(0, 0);
                const { data } = await api.get(`/books/${slug}/suggestions?limit=5`);
                if (!data?.book) { t.error("Book not found"); return; }
                setBook(data.book);
                setSuggestions(data.suggestions || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);

    // --- RESET FLIPBOOK TO FIRST PAGE WHEN MODAL OPENS ---
    useEffect(() => {
        if (showFlipbook) {
            setCurrentPage(0);
            // Small delay to ensure the flipbook is mounted before resetting
            setTimeout(() => {
                if (flipBookRef.current?.pageFlip) {
                    try {
                        flipBookRef.current.pageFlip().turnToPage(0);
                    } catch (e) {
                        // Silently handle if flipbook isn't ready
                    }
                }
            }, 100);
        }
    }, [showFlipbook]);

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
        return urls.filter(Boolean).map(url => assetUrl(url));
    }, [book]);

    const flipbookPages = useMemo(() => {
        if (!book) return [];
        const covers = images;
        const previews = (book.assets?.previewPages || []).map(url => assetUrl(url));
        return [...covers, ...previews].filter(Boolean);
    }, [book, images]);

    // Update navigation buttons when images change
    useEffect(() => {
        updateThumbnailNavButtons();
    }, [images]);

    const d = book ? dealFn(book) : { price: 0, mrp: 0, off: 0 };
    const inCart = book ? items.find(i => (i.bookId || i.book?._id || i.id) === book._id) : null;
    const isOutOfStock = book?.inventory?.stock === 0;
    const config = book?.layoutConfig || {};

    useEffect(() => { if (inCart) setQty(inCart.qty); }, [inCart]);

    // --- HANDLERS ---
    async function handleAddToCart(buyNow = false) {
        if (isOutOfStock) return;
        const cartItem = { ...book, price: d.price, qty: qty };

        if (!isCustomer) {
            add(cartItem, qty);
            t.success(buyNow ? "Proceeding to checkout..." : "Added to cart");
            if (buyNow) navigate("/checkout");
        } else {
            try {
                const res = await CustomerAPI.addToCart(token, { bookId: book._id, qty: qty });
                replaceAll(res?.data?.cart?.items || []);
                t.success(buyNow ? "Proceeding to checkout..." : "Added to cart");
                if (buyNow) navigate("/checkout");
            } catch (e) {
                t.error("Could not add to cart");
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
    const FlipbookModal = () => (
        showFlipbook && (
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
                        onClick={() => flipBookRef.current?.pageFlip()?.flipPrev()}
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
                        onClick={() => flipBookRef.current?.pageFlip()?.flipNext()}
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
                            onClick={() => flipBookRef.current?.pageFlip()?.flipPrev()}
                            disabled={currentPage === 0}
                            className="flex-1 max-w-[140px] px-4 py-3 bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-lg border border-[#D4AF37]/40 text-[#F3E5AB] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        <button
                            onClick={() => flipBookRef.current?.pageFlip()?.flipNext()}
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
        )
    );

    // --- DEDICATED MOBILE VIEW ---
    const MobileView = () => (
        <div className="bg-[#FAF7F2] min-h-screen pb-28">
            

            {/* Main Image Carousel */}
            <div className="relative w-full bg-[#FFF9E6] pt-[10px] pb-5">
                <div className="aspect-[4/5] w-full overflow-hidden relative">
                    <div
                        ref={mobileGalleryRef}
                        id="mobile-gallery"
                        className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide z-10"
                        onScroll={(e) => {
                            const scrollLeft = e.currentTarget.scrollLeft;
                            const width = e.currentTarget.offsetWidth;
                            const newIndex = Math.round(scrollLeft / width);
                            if (newIndex !== activeImg) {
                                setActiveImg(newIndex);
                            }
                        }}
                    >
                        {images.map((img, i) => (
                            <div key={i} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center p-6">
                                <img src={img} className="max-w-full max-h-full object-contain drop-shadow-xl" alt={`${book.title} - Image ${i + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Thumbnails Strip with Navigation */}
                <div className="relative px-5">
                    {/* Left Arrow */}
                    {images.length > 3 && canScrollThumbnailLeft && (
                        <button
                            onClick={() => scrollThumbnails('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#D4AF37]/30 flex items-center justify-center text-[#3E2723] hover:bg-[#FFF9E6] active:scale-95 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Thumbnail Strip */}
                    <div
                        ref={thumbnailScrollRef}
                        className="flex gap-2.5 overflow-x-auto py-2 scrollbar-hide scroll-smooth"
                        onScroll={updateThumbnailNavButtons}
                    >
                        {images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    const gallery = mobileGalleryRef.current || document.getElementById('mobile-gallery');
                                    if (gallery) {
                                        const targetScroll = i * gallery.offsetWidth;
                                        gallery.scrollTo({ left: targetScroll, behavior: 'smooth' });
                                        // Update active image immediately for better UX
                                        setActiveImg(i);
                                    }
                                }}
                                className={`w-14 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden bg-white p-1 transition-all ${activeImg === i ? 'border-[#D4AF37] ring-2 ring-[#FFF9E6] scale-105' : 'border-[#D4AF37]/30 opacity-70 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-contain" alt={`Thumbnail ${i + 1}`} />
                            </button>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    {images.length > 3 && canScrollThumbnailRight && (
                        <button
                            onClick={() => scrollThumbnails('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#D4AF37]/30 flex items-center justify-center text-[#3E2723] hover:bg-[#FFF9E6] active:scale-95 transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {d.off > 0 && (
                    <div className="absolute top-20 left-0 z-20 bg-[#D4AF37] text-white text-xs font-bold px-3 py-1 rounded-r-full shadow-md">
                        {d.off}% OFF
                    </div>
                )}
            </div>

            <div className="px-5 py-6">
                {/* Title & Price */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-[#D4AF37] bg-[#FFF9E6] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {book.categories?.[0] || 'Book'}
                        </span>
                        <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-bold text-[#5C4A2E]">4.8</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-['Cinzel'] font-bold text-[#3E2723] leading-snug mb-2">{book.title}</h1>
                    {book.author && <p className="text-base text-[#8A7A5E] mb-4">by <span className="text-[#3E2723] font-medium">{book.author}</span></p>}

                    <div className="flex items-end gap-3 mt-2 pb-4 border-b border-[#D4AF37]/20">
                        {/* Fixed Rupee Symbol Encoding */}
                        <span className="text-4xl font-bold text-[#3E2723] tracking-tight">₹{d.price.toLocaleString('en-IN')}</span>
                        {d.mrp > d.price && <span className="text-lg text-[#8A7A5E] line-through mb-1.5">₹{d.mrp.toLocaleString('en-IN')}</span>}
                        {book.inventory?.stock > 0 ? (
                            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full mb-2">In Stock</span>
                        ) : (
                            <span className="text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full mb-2">Out of Stock</span>
                        )}
                    </div>
                </div>

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

                    <MobileAccordion icon={MessageSquarePlus} title="Reviews">
                        <div className="space-y-4">
                            {config.testimonials?.length > 0 ? config.testimonials.map((review, i) => (
                                <div key={i} className="bg-[#FAF7F2] p-4 rounded-xl border border-[#D4AF37]/20">
                                    <div className="flex gap-0.5 mb-2">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star key={idx} className={`w-3.5 h-3.5 ${idx < (parseInt(review.rating) || 5) ? 'fill-amber-400 text-amber-400' : 'text-[#D4AF37]/30'}`} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-[#5C4A2E] italic mb-3">"{review.text}"</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-[#FFF9E6] flex items-center justify-center text-[10px] font-bold text-[#D4AF37] border border-[#D4AF37]/30">
                                            {review.name.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-[#3E2723]">{review.name}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-[#8A7A5E] italic px-2">No reviews yet.</p>
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

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-[#D4AF37]/20">
                        <h3 className="text-xl font-['Cinzel'] font-bold text-[#3E2723] mb-6 px-1 flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#D4AF37] rounded-full"></span>
                            You Might Also Like
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {suggestions.map((s) => {
                                const sDeal = dealFn(s);
                                return (
                                    <div key={s._id} className="bg-white rounded-xl border border-[#D4AF37]/20 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                        <div
                                            onClick={() => { navigate(`/book/${s.slug}`); window.scrollTo(0, 0); }}
                                            className="aspect-[3/4] bg-[#FAF7F2] overflow-hidden relative cursor-pointer"
                                        >
                                            <img src={assetUrl(s.assets?.coverUrl?.[0])} className="w-full h-full object-contain p-4" alt={s.title} />
                                            {sDeal.off > 0 && <span className="absolute top-2 left-2 bg-[#D4AF37] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">-{sDeal.off}%</span>}
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <h4
                                                onClick={() => { navigate(`/book/${s.slug}`); window.scrollTo(0, 0); }}
                                                className="font-bold text-sm text-[#3E2723] line-clamp-2 mb-1 min-h-[40px] cursor-pointer hover:text-[#D4AF37] transition-colors"
                                            >
                                                {s.title}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-base text-[#3E2723]">₹{sDeal.price}</span>
                                                {sDeal.off > 0 && <span className="text-xs text-[#8A7A5E] line-through">₹{sDeal.mrp}</span>}
                                            </div>
                                            <button
                                                onClick={() => { navigate(`/book/${s.slug}`); window.scrollTo(0, 0); }}
                                                className="w-full py-2 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] hover:from-[#D4AF37] hover:to-[#C59D5F] text-white rounded-lg font-semibold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

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
    const DesktopView = () => (
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
                            <div className="relative w-full overflow-hidden">
                                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory px-0.5">
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImg(i)}
                                            className={`w-14 h-16 sm:w-16 sm:h-20 md:w-18 md:h-22 lg:w-20 lg:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-white snap-center ${activeImg === i
                                                ? 'border-[#D4AF37] shadow-md ring-2 ring-[#FFF9E6]'
                                                : 'border-[#D4AF37]/30 opacity-60 hover:opacity-100 hover:border-[#D4AF37]'
                                                }`}
                                        >
                                            <img src={img} className="w-full h-full object-contain p-1" alt={`Thumbnail ${i + 1}`} />
                                        </button>
                                    ))}
                                </div>
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
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <span className="text-sm font-semibold text-[#5C4A2E]">4.8</span>
                            <span className="text-xs text-[#8A7A5E]">(124 reviews)</span>
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
                        <div className="space-y-5">
                            {config.testimonials?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {config.testimonials.map((review, i) => {
                                        const validRating = Math.min(Math.max(parseInt(review.rating) || 5, 1), 5);
                                        return (
                                            <div key={i} className="bg-[#FAF7F2] p-4 sm:p-5 rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all relative overflow-hidden">
                                                <Quote className="absolute top-3 right-3 w-10 h-10 text-[#D4AF37]/10" />
                                                <div className="flex gap-0.5 mb-3 relative z-10">
                                                    {Array.from({ length: 5 }, (_, idx) => (
                                                        <Star key={idx} className={`w-4 h-4 ${idx < validRating ? 'fill-amber-400 text-amber-400' : 'fill-none text-[#D4AF37]/20'}`} />
                                                    ))}
                                                </div>
                                                <p className="text-[#5C4A2E] text-sm leading-relaxed mb-4 relative z-10">"{review.text}"</p>
                                                <div className="flex items-center gap-2.5 relative z-10">
                                                    <div className="w-9 h-9 rounded-full bg-[#FFF9E6] flex items-center justify-center text-[#D4AF37] font-bold text-sm border border-[#D4AF37]/30">{review.name.charAt(0)}</div>
                                                    <div><div className="text-sm font-semibold text-[#3E2723]">{review.name}</div><div className="text-xs text-[#8A7A5E]">{review.role}</div></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-[#FAF7F2] rounded-xl border border-dashed border-[#D4AF37]/30">
                                    <MessageSquarePlus className="w-12 h-12 text-[#D4AF37]/20 mx-auto mb-4" />
                                    <h3 className="text-lg font-['Cinzel'] font-bold text-[#5C4A2E] mb-2">No Reviews Yet</h3>
                                    <p className="text-[#8A7A5E] text-sm mb-6 max-w-sm mx-auto px-4">Be the first to share your experience with this book.</p>
                                    <button className="px-6 py-2.5 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] hover:from-[#D4AF37] hover:to-[#C59D5F] text-white rounded-xl text-sm font-semibold uppercase tracking-wider transition-all shadow-sm">Write a Review</button>
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
                <section className="mt-8 sm:mt-12 md:mt-16 border-t border-[#D4AF37]/20 pt-6 sm:pt-8 md:pt-10 pb-20 md:pb-8">
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-['Cinzel'] font-bold text-[#3E2723] flex items-center gap-2.5">
                            <span className="w-1 h-6 bg-[#D4AF37] rounded-full"></span>
                            You Might Also Like
                        </h2>
                        <button onClick={() => navigate('/catalog')} className="text-[#D4AF37] text-xs sm:text-sm font-semibold uppercase tracking-wider hover:text-[#B0894C] transition-colors flex items-center gap-1 group">
                            View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                        {suggestions.map((s) => {
                            const deal = dealFn(s);
                            return (
                                <div key={s._id} className="group bg-white rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden">
                                    <div
                                        onClick={() => { navigate(`/book/${s.slug}`); window.scrollTo(0, 0); }}
                                        className="aspect-[3/4] overflow-hidden relative bg-[#FAF7F2] cursor-pointer"
                                    >
                                        <img
                                            src={assetUrl(s.assets?.coverUrl?.[0])}
                                            className="w-full h-full object-contain p-4 sm:p-5 transition-transform duration-500 group-hover:scale-110"
                                            alt={s.title}
                                        />
                                        {deal.off > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#D4AF37] text-white px-2 py-0.5 text-[10px] font-bold rounded-md shadow">
                                                -{deal.off}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 sm:p-3.5 space-y-2">
                                        <h3
                                            onClick={() => { navigate(`/book/${s.slug}`); window.scrollTo(0, 0); }}
                                            className="font-bold text-[#3E2723] text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-[#D4AF37] transition-colors cursor-pointer min-h-[2rem] sm:min-h-[2.5rem]"
                                        >
                                            {s.title}
                                        </h3>
                                        <div className="flex items-end gap-1.5">
                                            <span className="text-base sm:text-lg font-bold text-[#3E2723]">₹{deal.price}</span>
                                            {deal.mrp > deal.price && (
                                                <span className="text-[10px] sm:text-xs text-[#8A7A5E] line-through mb-0.5">₹{deal.mrp}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-[#8A7A5E] ml-0.5">(4.8)</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/book/${s.slug}`);
                                                window.scrollTo(0, 0);
                                            }}
                                            className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] hover:from-[#D4AF37] hover:to-[#C59D5F] text-white rounded-lg font-semibold text-[10px] sm:text-xs uppercase tracking-wider active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
                                        >
                                            <span className="hidden sm:inline">View Details</span>
                                            <span className="sm:hidden">View</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );

    return (
        <div className="bg-[#FAF7F2] min-h-screen text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723] pb-0">
            <SEO
                title={`${book.title} - ${book.categories?.[0] || 'Books'} | Kiddos Intellect`}
                description={book.descriptionHtml?.replace(/<[^>]*>/g, '').slice(0, 155) || `Shop ${book.title} by ${book.author || 'various authors'}. Premium children's books and educational materials.`}
                image={images[0] || '/favicon.jpg'}
                type="product"
                keywords={`${book.title}, ${book.author || ''}, ${book.categories?.join(', ') || ''}, children's books, kids books, educational books, story books, learning materials`}
                breadcrumbs={[
                    { name: "Home", url: "/" },
                    { name: "Catalog", url: "/catalog" },
                    { name: book.title, url: `/book/${book.slug}` }
                ]}
                product={{
                    name: book.title,
                    description: book.descriptionHtml?.replace(/<[^>]*>/g, '').slice(0, 155),
                    image: images[0],
                    price: d.price,
                    priceCurrency: 'INR',
                    inStock: !isOutOfStock,
                    sku: book._id,
                    rating: { value: 4.8, count: 124 }
                }}
            />

            <FlipbookModal />

            {/* DEDICATED MOBILE VIEW */}
            <div className="md:hidden">
                <MobileView />
            </div>

            {/* DEDICATED DESKTOP VIEW */}
            <div className="hidden md:block">
                <DesktopView />
            </div>
            <Footer />
        </div>

    );
}