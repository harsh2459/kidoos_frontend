import React, { useEffect, useMemo, useState, useRef, forwardRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import { api } from "../api/client";
import { useCart } from "../contexts/CartStore";
import { assetUrl } from "../api/asset";
import { deal as dealFn } from "../lib/Price";
import { useCustomer } from "../contexts/CustomerAuth";
import { CustomerAPI } from "../api/customer";
import { t } from "../lib/toast";
import {
    ShoppingCart, Heart, Check, Star,
    BookOpen, Globe, Feather, ShieldCheck,
    Smile, Sparkles, Brain, X, Truck, ZoomIn, ArrowLeft, ArrowRight,
    Lightbulb, Zap, Pencil, Calculator, Music, Palette, Puzzle,
    Users, Trophy, Target, Clock, Sun, Moon, Leaf, Anchor,
    Award, Gift, Camera, Video, Mic, MapPin, GraduationCap,
    Medal, Rocket, Compass, Eye, ChevronLeft, ChevronRight,
    ImageOff, Book, Share2, Info, Quote,
    MessageSquarePlus
} from "lucide-react";

// --- THEME ASSETS ---
const parchmentBg = "url('/images/homepage/parchment-bg.png')";
const mandalaBg = "url('/images/homepage/mandala-bg.png')";

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
    <div className="flex items-center justify-between p-3 md:p-4 bg-white border border-[#D4AF37]/20 rounded-xl hover:border-[#D4AF37] transition-colors group shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 group-hover:bg-[#3E2723] group-hover:text-[#F3E5AB] transition-colors">
                {Icon ? <Icon className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
            </div>
            <span className="text-[10px] md:text-xs font-bold text-[#8A7A5E] uppercase tracking-widest font-['Cinzel']">{label}</span>
        </div>
        <span className="font-bold text-[#3E2723] font-['Lato'] text-sm text-right">{value}</span>
    </div>
);

// --- FLIPBOOK PAGE ---
const Page = forwardRef(({ children, number, isCover }, ref) => (
    <div className="demoPage h-full w-full bg-[#FAF7F2] relative overflow-hidden shadow-2xl border-l border-[#3E2723]/10" ref={ref}>
        <div className="h-full w-full relative p-4 flex items-center justify-center">
            {children}
            {!isCover && (
                <div className="absolute bottom-4 right-4 text-[10px] text-[#8A7A5E] font-bold font-['Cinzel']">
                    {number}
                </div>
            )}
            <div className="absolute inset-0 pointer-events-none opacity-[0.1]" style={{ backgroundImage: parchmentBg }}></div>
            <div className="absolute top-0 left-0 w-6 h-full bg-gradient-to-r from-[#3E2723]/20 to-transparent pointer-events-none"></div>
        </div>
    </div>
));

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

    // Cart & Auth
    const items = useCart((s) => s.items);
    const add = useCart((s) => s.add);
    const replaceAll = useCart((s) => s.replaceAll);
    const { isCustomer, token } = useCustomer();

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

    // --- RESIZE LOGIC FOR FLIPBOOK ---
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;

            if (w < 640) {
                // Mobile - smaller and portrait
                const width = Math.min(w * 0.75, 250);
                const height = Math.min(h * 0.5, 375);
                setBookDim({ width, height });
            } else if (w < 768) {
                // Small tablet
                const width = Math.min(w * 0.65, 320);
                const height = Math.min(h * 0.6, 480);
                setBookDim({ width, height });
            } else if (w < 1024) {
                // Tablet
                setBookDim({ width: 380, height: 570 });
            } else {
                // Desktop
                setBookDim({ width: 500, height: 700 });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            add(cartItem, qty); // Local Cart
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
            <div className="w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#3E2723] rounded-full animate-spin"></div>
        </div>
    );

    if (!book) return null;

    return (
        <div className="bg-[#FAF7F2] min-h-screen font-['Lato'] text-[#5C4A2E] selection:bg-[#F3E5AB] selection:text-[#3E2723] pb-32">

            {/* Global Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-100 z-0" style={{ backgroundImage: parchmentBg, backgroundAttachment: 'fixed' }}></div>

            {/* --- FLIPBOOK MODAL --- */}
            {showFlipbook && (
                <div className="fixed inset-0 z-[100] bg-[#1a0f0a]/98 backdrop-blur-xl flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-500">

                    {/* Close Button - UPDATE THIS */}
                    <button
                        onClick={() => setShowFlipbook(false)}
                        className="absolute top-2 right-2 sm:top-6 sm:right-6 p-2 sm:p-3 bg-white/10 hover:bg-red-900/40 text-[#F3E5AB] rounded-full transition-all border border-[#D4AF37]/20 z-[110] backdrop-blur-sm"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    {/* Main container - UPDATE THIS */}
                    <div className="relative flex items-center justify-center w-full h-[calc(100vh-120px)] sm:h-full max-w-7xl">

                        {/* Navigation Arrows - UPDATE VISIBILITY */}
                        <button
                            onClick={() => flipBookRef.current?.pageFlip()?.flipPrev()}
                            className="hidden sm:flex absolute left-2 sm:left-0 lg:-left-16 z-20 p-2 sm:p-3 lg:p-4 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-all hover:scale-110"
                        >
                            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
                        </button>

                        {/* The Book Container */}
                        <div className="relative flex items-center justify-center w-full h-full py-16 sm:py-20">
                            <HTMLFlipBook
                                width={bookDim.width}
                                height={bookDim.height}
                                size="stretch"
                                minWidth={200}
                                maxWidth={600}
                                minHeight={300}
                                maxHeight={900}
                                maxShadowOpacity={0.8}
                                showCover={true}
                                mobileScrollSupport={true}
                                className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]"
                                ref={flipBookRef}
                                usePortrait={false}
                                startPage={0}
                                drawShadow={true}
                                flippingTime={1000}
                                useMouseEvents={true}
                                swipeDistance={30}
                                clickEventForward={true}
                                disableFlipByClick={false}
                            >
                                {flipbookPages.map((url, i) => (
                                    <div key={i} className="bg-[#fdfaf3] overflow-hidden shadow-xl" data-density="hard">
                                        <div className="relative w-full h-full">
                                            {/* Page Background Texture */}
                                            <div className="absolute inset-0 pointer-events-none opacity-5"
                                                style={{ backgroundImage: parchmentBg }} />

                                            {/* Subtle gradient for depth */}
                                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-transparent to-black/5 z-10" />

                                            {/* The actual page image */}
                                            <img
                                                src={url}
                                                className="w-full h-full object-contain p-2 sm:p-4"
                                                alt={`Page ${i + 1}`}
                                                draggable={false}
                                            />

                                            {/* Gutter Shadow - The spine/fold effect */}
                                            <div className={`absolute top-0 bottom-0 w-6 sm:w-8 z-20 pointer-events-none 
                                    ${i % 2 === 0
                                                    ? 'right-0 bg-gradient-to-l from-black/30 via-black/10 to-transparent'
                                                    : 'left-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent'
                                                }`}
                                            />

                                            {/* Corner Curl Effect - Makes it look more like a real page */}
                                            {i > 0 && (
                                                <div className={`absolute w-8 h-8 sm:w-12 sm:h-12 pointer-events-none z-30
                                        ${i % 2 === 0
                                                        ? 'bottom-0 right-0 bg-gradient-to-tl from-[#3E2723]/20 to-transparent'
                                                        : 'bottom-0 left-0 bg-gradient-to-tr from-[#3E2723]/20 to-transparent'
                                                    }`}
                                                />
                                            )}

                                            {/* Page Number */}
                                            {i > 0 && (
                                                <div className={`absolute bottom-3 sm:bottom-6 font-['Cinzel'] text-[9px] sm:text-[10px] text-black/40 tracking-widest z-30
                                        ${i % 2 === 0 ? 'left-4 sm:left-8' : 'right-4 sm:right-8'}`}>
                                                    {i}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </HTMLFlipBook>
                        </div>

                        {/* Navigation Arrows - Hidden on mobile, visible on desktop */}
                        <button
                            onClick={() => flipBookRef.current?.pageFlip()?.flipNext()}
                            className="hidden md:flex absolute right-0 lg:-right-16 z-20 p-3 lg:p-4 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-all hover:scale-110"
                        >
                            <ChevronRight className="w-10 h-10 lg:w-12 lg:h-12" />
                        </button>
                    </div>

                    {/* Bottom Info & Controls */}
                    <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 space-y-3 sm:space-y-4">
                        {/* Mobile Navigation Buttons */}
                        <div className="flex md:hidden justify-center gap-3 px-4">
                            <button
                                onClick={() => flipBookRef.current?.pageFlip()?.flipPrev()}
                                className="flex-1 max-w-[140px] px-4 py-2.5 bg-white/10 backdrop-blur-md border border-[#D4AF37]/30 text-[#F3E5AB] rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>
                            <button
                                onClick={() => flipBookRef.current?.pageFlip()?.flipNext()}
                                className="flex-1 max-w-[140px] px-4 py-2.5 bg-white/10 backdrop-blur-md border border-[#D4AF37]/30 text-[#F3E5AB] rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">

                {/* --- BREADCRUMB --- */}
                <nav className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8A7A5E] mb-8 font-['Cinzel']">
                    <span className="cursor-pointer hover:text-[#3E2723]" onClick={() => navigate('/')}>Home</span>
                    <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
                    <span className="cursor-pointer hover:text-[#3E2723]" onClick={() => navigate('/catalog')}>Catalog</span>
                    <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[#3E2723] truncate max-w-xs">{book.title}</span>
                </nav>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* --- LEFT: GALLERY --- */}
                    <div className="lg:col-span-5 relative">

                        {/* Mobile Header (Back + Title) */}
                        <div className="md:hidden mb-4 flex items-center justify-between">
                            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white border border-[#D4AF37]/20 shadow-sm text-[#3E2723] active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5" /></button>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] font-['Cinzel']">Book Details</div>
                            <div className="w-9 h-9"></div> {/* Spacer */}
                        </div>

                        <div className="lg:sticky lg:top-28 space-y-4 md:space-y-6">

                            {/* Main Image Container */}
                            {/* ✅ FIXED: Added 'flex items-center justify-center' to force centering */}
                            <div className="relative h-[350px] md:h-auto md:aspect-[3/4] w-full rounded-[1.5rem] overflow-hidden shadow-[0_15px_40px_rgba(62,39,35,0.1)] bg-white border border-[#D4AF37]/20 group mx-auto flex items-center justify-center">
                                {/* ✅ FIXED: Changed to max-h-full max-w-full to prevent overflow */}
                                <img
                                    src={images[activeImg] || "/placeholder.png"}
                                    alt={book.title}
                                    className="max-w-full max-h-full object-contain p-6 md:p-6 transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Overlay Button (Desktop) */}
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                    <button
                                        onClick={() => setShowFlipbook(true)}
                                        className="bg-white/90 text-[#3E2723] px-6 py-3 rounded-full font-bold text-xs shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-[#D4AF37] hover:text-white font-['Cinzel'] tracking-wider border border-[#D4AF37]/30"
                                    >
                                        <BookOpen className="w-4 h-4" /> Look Inside
                                    </button>
                                </div>

                                {/* Mobile "Look Inside" Badge (Always Visible on Touch) */}
                                <button
                                    onClick={() => setShowFlipbook(true)}
                                    className="md:hidden absolute bottom-4 right-4 bg-white/95 text-[#3E2723] px-4 py-2 rounded-full text-[10px] font-bold shadow-lg border border-[#D4AF37]/30 flex items-center gap-1.5 backdrop-blur-md z-10"
                                >
                                    <BookOpen className="w-3 h-3 text-[#D4AF37]" /> Look Inside
                                </button>

                                {d.off > 0 && (
                                    <div className="absolute top-4 left-4 bg-[#3E2723] text-[#F3E5AB] px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded shadow-md border border-[#D4AF37]/50 z-10">
                                        -{d.off}% OFF
                                    </div>
                                )}
                            </div>

                            {/* LEFT: Image Gallery */}
                            <div className="space-y-3 sm:space-y-4 md:space-y-6">
                                {/* Thumbnail Gallery */}
                                {images.length > 1 && (
                                    <div className="relative max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
                                        {/* Left scroll button */}
                                        <button
                                            onClick={() => {
                                                const container = document.getElementById('thumbnail-scroll');
                                                container?.scrollBy({ left: -100, behavior: 'smooth' });
                                            }}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-[#3E2723] border border-[#D4AF37]/30 shadow-lg hover:bg-[#3E2723] hover:text-white transition-all -translate-x-1/2"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>

                                        {/* Scroll container */}
                                        <div
                                            id="thumbnail-scroll"
                                            className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide px-1 snap-x snap-mandatory"
                                        >
                                            {images.map((img, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActiveImg(i)}
                                                    className={`relative w-12 h-14 sm:w-14 sm:h-16 md:w-16 md:h-20 lg:w-20 lg:h-24 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center bg-white snap-center ${activeImg === i
                                                        ? 'border-[#D4AF37] shadow-md scale-105'
                                                        : 'border-[#D4AF37]/20 opacity-70 hover:opacity-100 hover:border-[#D4AF37]/50'
                                                        }`}
                                                >
                                                    <img
                                                        src={img}
                                                        className="w-full h-full object-contain p-0.5 sm:p-1 md:p-1.5"
                                                        alt={`Thumbnail ${i + 1}`}
                                                    />

                                                    {/* Active indicator */}
                                                    {activeImg === i && (
                                                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]"></div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Right scroll button */}
                                        <button
                                            onClick={() => {
                                                const container = document.getElementById('thumbnail-scroll');
                                                container?.scrollBy({ left: 100, behavior: 'smooth' });
                                            }}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-[#3E2723] border border-[#D4AF37]/30 shadow-lg hover:bg-[#3E2723] hover:text-white transition-all translate-x-1/2"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>

                                        {/* Scroll indicators for mobile */}
                                        {images.length > 4 && (
                                            <div className="flex justify-center gap-1 mt-2 sm:hidden">
                                                {images.map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-1.5 h-1.5 rounded-full transition-all ${activeImg === i ? 'bg-[#D4AF37] w-3' : 'bg-[#D4AF37]/30'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Preview Button */}
                                {flipbookPages.length > 0 && (
                                    <div className="max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
                                        <button
                                            onClick={() => setShowFlipbook(true)}
                                            className="w-full py-2.5 sm:py-3 md:py-4 bg-white border-2 border-[#D4AF37] text-[#3E2723] rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider hover:bg-[#3E2723] hover:text-white transition-all shadow-md flex items-center justify-center gap-2"
                                        >
                                            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                            Preview Book
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: DETAILS & ACTIONS --- */}
                    <div className="lg:col-span-7 space-y-6 md:space-y-8">

                        {/* Title Header */}
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-3 md:mb-4">
                                <span className="px-3 py-1 bg-[#FFF9E6] text-[#B45309] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#D4AF37]/30 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {book.categories?.[0] || "Featured"}
                                </span>
                            </div>

                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-['Cinzel'] font-bold text-[#3E2723] leading-tight mb-3 sm:mb-4 break-words">
                                {book.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                                {book.author && (
                                    <span className="text-xs sm:text-sm text-[#8A7A5E] font-['Playfair_Display'] italic break-words">
                                        by <span className="font-bold text-[#5C4A2E]">{book.author}</span>
                                    </span>
                                )}
                                <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-[#D4AF37]/20">
                                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 fill-[#D4AF37] text-[#D4AF37]" />
                                    <span className="text-xs sm:text-sm font-bold text-[#3E2723]">4.8</span>
                                    <span className="text-[10px] sm:text-xs text-[#8A7A5E]">(124)</span>
                                </div>
                            </div>
                        </div>

                        {/* ✅ PRICE & BUY BOX (Desktop Only) */}
                        <div className="hidden md:block bg-white p-6 md:p-8 rounded-2xl border border-[#D4AF37]/20 shadow-sm relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: mandalaBg }}></div>

                            <div className="relative z-10">
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-4xl md:text-5xl font-bold text-[#3E2723] font-['Playfair_Display']">₹{d.price}</span>
                                    {d.mrp > d.price && (
                                        <span className="text-lg text-[#8A7A5E] line-through mb-1 font-['Lato'] decoration-[#D4AF37]/50">₹{d.mrp}</span>
                                    )}
                                    <span className="text-[10px] font-bold text-[#3E2723] bg-[#F3E5AB] px-2 py-1 rounded mb-2 ml-auto uppercase tracking-wider border border-[#D4AF37]/30">
                                        {book.inventory?.stock > 0 ? 'In Stock' : 'Sold Out'}
                                    </span>
                                </div>

                                <div className="flex gap-4">
                                    {/* Quantity */}
                                    <div className="flex items-center bg-[#FAF7F2] rounded-xl px-3 border border-[#D4AF37]/20 h-14 w-32 justify-between">
                                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-[#3E2723] hover:bg-[#D4AF37] hover:text-white p-1 rounded transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                        <span className="font-bold text-[#3E2723] font-['Playfair_Display'] text-lg">{qty}</span>
                                        <button onClick={() => setQty(q => q + 1)} className="text-[#3E2723] hover:bg-[#D4AF37] hover:text-white p-1 rounded transition-colors"><ChevronRight className="w-4 h-4" /></button>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        onClick={() => handleAddToCart(false)}
                                        disabled={isOutOfStock}
                                        className="flex-1 h-14 border border-[#3E2723] text-[#3E2723] rounded-xl font-bold uppercase tracking-[0.1em] hover:bg-[#3E2723] hover:text-[#F3E5AB] active:scale-95 transition-all text-xs flex items-center justify-center gap-2 font-['Cinzel'] disabled:opacity-50"
                                    >
                                        <ShoppingCart className="w-4 h-4" /> Add
                                    </button>

                                    {/* Buy Now */}
                                    <button
                                        onClick={() => handleAddToCart(true)}
                                        disabled={isOutOfStock}
                                        className="flex-[1.5] h-14 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-xl font-bold uppercase tracking-[0.1em] hover:from-[#D4AF37] hover:to-[#C59D5F] active:scale-95 transition-all shadow-[0_10px_20px_rgba(176,137,76,0.2)] disabled:grayscale flex items-center justify-center gap-2 text-xs font-['Cinzel']"
                                    >
                                        {isOutOfStock ? "Sold Out" : "Buy Now"} <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* --- TABBED CONTENT --- */}
                        <div>
                            <div className="flex gap-4 md:gap-6 border-b border-[#D4AF37]/20 mb-6 overflow-x-auto no-scrollbar">
                                {['Overview', 'Specifications', 'Curriculum', 'Reviews'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={`pb-3 text-xs md:text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap font-['Cinzel'] flex-shrink-0 ${activeTab === tab.toLowerCase() ? 'text-[#3E2723] border-b-2 border-[#D4AF37]' : 'text-[#8A7A5E] hover:text-[#3E2723]'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="min-h-[200px] animate-in slide-in-from-bottom-2 fade-in duration-300 pb-20 md:pb-0">
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {book.descriptionHtml && (
                                            <div className="bg-white/50 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border border-[#D4AF37]/20">
                                                <div
                                                    className="text-xs sm:text-sm md:text-base text-[#5C4A2E] leading-relaxed font-['Lato'] break-words prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: book.descriptionHtml }}
                                                />
                                            </div>
                                        )}

                                        {/* Why Choose Points */}
                                        {book.whyChooseThis?.length > 0 && (
                                            <div className="bg-white p-6 rounded-2xl border border-[#D4AF37]/20 shadow-sm mt-6">
                                                <h3 className="font-['Cinzel'] font-bold text-[#3E2723] mb-4 flex items-center gap-2 text-lg">
                                                    <Sparkles className="w-5 h-5 text-[#D4AF37]" /> Why Kids Love This
                                                </h3>
                                                <ul className="grid sm:grid-cols-2 gap-3">
                                                    {book.whyChooseThis.map((pt, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-[#5C4A2E]">
                                                            <div className="mt-0.5 w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                                                                <Check className="w-3 h-3 text-[#D4AF37]" />
                                                            </div>
                                                            <span className="leading-relaxed">{pt}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'specifications' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">

                                        {config.specs?.map((s, i) => (
                                            <SpecItem key={i} label={s.label} value={s.value} />
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'curriculum' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {config.curriculum?.length > 0 ? config.curriculum.map((item, i) => {
                                            const IconComp = IconMap[item.icon] || Star;
                                            return (
                                                <div key={i} className="bg-white p-5 rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:shadow-lg transition-all group">
                                                    <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#D4AF37] mb-3 group-hover:bg-[#3E2723] group-hover:text-[#F3E5AB] transition-colors">
                                                        <IconComp className="w-6 h-6" />
                                                    </div>
                                                    <h4 className="font-bold text-[#3E2723] mb-2 font-['Cinzel']">{item.title}</h4>
                                                    <p className="text-xs text-[#8A7A5E] leading-relaxed font-['Lato']">{item.description}</p>
                                                </div>
                                            )
                                        }) : (
                                            <p className="text-[#8A7A5E] italic">No specific curriculum details available.</p>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'reviews' && (
                                    <div className="space-y-6">
                                        {config.testimonials?.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {config.testimonials.map((t, i) => (
                                                    <div key={i} className="bg-white p-6 rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-colors relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Quote className="w-10 h-10 text-[#D4AF37]" /></div>
                                                        <div className="flex gap-1 mb-3 text-[#D4AF37]">
                                                            {[...Array(t.rating || 5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                                        </div>
                                                        <p className="text-[#3E2723] text-sm leading-relaxed mb-4 font-['Lato']">"{t.text}"</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#3E2723] font-bold font-serif border border-[#D4AF37]/30">
                                                                {t.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-[#3E2723] font-['Cinzel']">{t.name}</div>
                                                                <div className="text-[10px] text-[#8A7A5E]">{t.role}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#D4AF37]/30">
                                                <MessageSquarePlus className="w-12 h-12 text-[#D4AF37]/30 mx-auto mb-4" />
                                                <h3 className="text-[#3E2723] font-bold font-['Cinzel'] mb-2">No Reviews Yet</h3>
                                                <p className="text-[#8A7A5E] text-sm mb-6">Be the first to share your experience with this sacred treasure.</p>
                                                <button className="px-6 py-2 bg-[#FAF7F2] border border-[#D4AF37] text-[#3E2723] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-white transition-all">
                                                    Write a Review
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- STORY SECTION (If Exists) --- */}
                {config.story?.text && (
                    <section className="mt-16 md:mt-24 bg-white rounded-[2rem] p-8 md:p-12 border border-[#D4AF37]/20 relative overflow-hidden shadow-sm">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: mandalaBg }}></div>

                        <div className="relative z-10 max-w-4xl mx-auto text-center">
                            <span className="text-[#D4AF37] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-4 block font-['Cinzel']">The Story Behind</span>
                            <h2 className="text-2xl md:text-4xl font-['Cinzel'] font-bold text-[#3E2723] mb-6 md:mb-8">{config.story.heading}</h2>
                            <p className="text-base md:text-lg text-[#5C4A2E] leading-relaxed mb-8 font-light italic font-['Playfair_Display']">
                                "{config.story.text}"
                            </p>

                            {config.story.quote && (
                                <div className="inline-block relative px-8 py-4 border-t border-b border-[#D4AF37]/30">
                                    <p className="text-sm md:text-base font-['Cinzel'] font-bold text-[#3E2723] uppercase tracking-wide">{config.story.quote}</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* --- SUGGESTIONS --- */}
                {suggestions.length > 0 && (
                    <section className="mt-16 md:mt-24 border-t border-[#D4AF37]/10 pt-12 pb-24">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg md:text-2xl font-['Cinzel'] font-bold text-[#3E2723] flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></span>
                                You Might Also Like
                            </h2>
                            <button onClick={() => navigate('/catalog')} className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest hover:text-[#3E2723] transition-colors">View All</button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {suggestions.map((s) => (
                                <div key={s._id} onClick={() => { navigate(`/book/${s.slug}`); window.scrollTo(0, 0); }} className="group cursor-pointer">
                                    <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 border border-[#D4AF37]/20 group-hover:border-[#D4AF37] transition-all relative bg-white shadow-sm">
                                        <img src={assetUrl(s.assets?.coverUrl?.[0])} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" alt={s.title} />
                                    </div>
                                    <h3 className="font-['Cinzel'] font-bold text-[#3E2723] text-xs md:text-sm leading-tight line-clamp-2 group-hover:text-[#B45309] transition-colors">{s.title}</h3>
                                    <p className="text-[#8A7A5E] text-xs mt-1 font-['Playfair_Display'] font-bold">₹{dealFn(s).price}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* --- MOBILE STICKY BOTTOM BAR (Updated) --- */}
            <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-[#D4AF37]/20 p-2 sm:p-3 flex items-center justify-between gap-2 md:hidden z-50 shadow-[0_-5px_20px_rgba(62,39,35,0.1)]">
                <div className="flex flex-col min-w-0 flex-shrink">
                    {d.mrp > d.price && <span className="text-[10px] text-[#8A7A5E] line-through decoration-[#D4AF37]/50">₹{d.mrp}</span>}
                    <span className="text-base sm:text-lg md:text-xl font-bold text-[#3E2723] font-['Playfair_Display'] leading-none truncate">₹{d.price}</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Qty Selector Small */}
                    <div className="flex items-center bg-[#FAF7F2] rounded-lg border border-[#D4AF37]/20 h-10 px-1">
                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-1 text-[#3E2723]"><ChevronLeft className="w-3 h-3" /></button>
                        <span className="w-4 text-center text-xs font-bold text-[#3E2723]">{qty}</span>
                        <button onClick={() => setQty(q => q + 1)} className="p-1 text-[#3E2723]"><ChevronRight className="w-3 h-3" /></button>
                    </div>

                    <button
                        onClick={() => handleAddToCart(false)}
                        disabled={isOutOfStock}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#3E2723] text-[#3E2723] active:bg-[#FAF7F2]"
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => handleAddToCart(true)}
                        disabled={isOutOfStock}
                        className={`px-4 h-10 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-md ${isOutOfStock ? 'opacity-50 grayscale' : 'active:scale-95'}`}
                    >
                        {isOutOfStock ? "Sold" : "Buy Now"}
                    </button>
                </div>
            </div>

        </div>
    );
}

// function ArrowLeft({ className }) {
//     return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
// }