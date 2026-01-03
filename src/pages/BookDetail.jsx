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
    Smile, Sparkles, Brain, X, Truck, ZoomIn, ArrowRight,
    Lightbulb, Zap, Pencil, Calculator, Music, Palette, Puzzle,
    Users, Trophy, Target, Clock, Sun, Moon, Leaf, Anchor,
    Award, Gift, Camera, Video, Mic, MapPin, GraduationCap,
    Medal, Rocket, Compass, Eye, ChevronLeft, ChevronRight,
    ImageOff
} from "lucide-react";

// --- THEME ASSETS ---
const parchmentBg = "url('/images/homepage/parchment-bg.png')";
const mandalaBg = "url('/images/homepage/mandala-bg.png')";

// --- HELPER COMPONENT: SPECS ---
const SpecRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-1 border-l-4 border-[#D4AF37]/40 pl-4 py-1">
            <span className="text-xs font-bold text-[#8A7A5E] uppercase tracking-wider font-['Cinzel']">{label}</span>
            <span className="font-bold text-[#3E2723] text-lg font-['Lato']">{value}</span>
        </div>
    );
};

// --- FLIPBOOK PAGE COMPONENT ---
const Page = forwardRef(({ children, number, isCover }, ref) => {
    return (
        <div className="demoPage h-full w-full bg-[#FAF7F2] relative overflow-hidden shadow-2xl border-l border-[#D4AF37]/20" ref={ref}>
            <div className="h-full w-full relative">
                {children}
                {!isCover && (
                    <div className="absolute bottom-4 right-4 text-[12px] text-[#8A7A5E] font-bold font-['Cinzel'] bg-white/80 px-3 py-1 rounded-full shadow-sm z-20 border border-[#D4AF37]/20">
                        {number}
                    </div>
                )}
                {/* Texture Overlay */}
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-10 mix-blend-multiply opacity-10" 
                     style={{ backgroundImage: parchmentBg }}>
                </div>
                {/* Spine Shadow */}
                <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-20"></div>
            </div>
        </div>
    );
});

// Icon Mapping
const ICON_MAP = {
    "star": Star, "brain": Brain, "heart": Heart, "lightbulb": Lightbulb, "zap": Zap,
    "smile": Smile, "book-open": BookOpen, "pencil": Pencil, "calculator": Calculator,
    "globe": Globe, "music": Music, "palette": Palette, "puzzle": Puzzle,
    "users": Users, "trophy": Trophy, "target": Target, "sparkles": Sparkles,
    "clock": Clock, "sun": Sun, "moon": Moon, "leaf": Leaf, "anchor": Anchor,
    "award": Award, "gift": Gift, "camera": Camera, "video": Video, "mic": Mic,
    "map-pin": MapPin, "graduation-cap": GraduationCap, "medal": Medal,
    "rocket": Rocket, "compass": Compass, "feather": Feather, "eye": Eye
};

export default function BookDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [activeImg, setActiveImg] = useState(0);
    const [activeTab, setActiveTab] = useState("description");
    const [qty, setQty] = useState(1);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    
    // Flipbook State
    const [showFlipbook, setShowFlipbook] = useState(false);
    const flipBookRef = useRef(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    
    // Dimension State
    const [bookDim, setBookDim] = useState({ width: 400, height: 600 });
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Image Error Handling
    const [brokenImages, setBrokenImages] = useState({});

    const revealRefs = useRef([]);
    const galleryRef = useRef(null);

    const items = useCart((s) => s.items);
    const add = useCart((s) => s.add);
    const replaceAll = useCart((s) => s.replaceAll);
    const { isCustomer, token } = useCustomer();
    
    const addToRefs = (el) => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); };

    // --- PREPARE PAGES ---
    const flipbookPages = useMemo(() => {
        if (!book) return [];
        const covers = Array.isArray(book.assets?.coverUrl) ? book.assets.coverUrl : [book.assets?.coverUrl];
        const previews = book.assets?.previewPages || [];
        return [...covers, ...previews].map(url => assetUrl(url)).filter(Boolean);
    }, [book]);

    // --- SIZE CALCULATION ---
    useEffect(() => {
        const calculateSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            if (width < 768) {
                const w = width * 0.9;
                setBookDim({ width: w, height: w * 1.414 });
            } else {
                const h = height * 0.85; 
                const w = h * 0.707;     
                setBookDim({ width: w, height: h });
            }
            setWindowWidth(width);
        };
        calculateSize();
        window.addEventListener('resize', calculateSize);
        return () => window.removeEventListener('resize', calculateSize);
    }, []);

    // Animation Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, [book]);

    // Fetch Data
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                window.scrollTo(0, 0);
                const { data } = await api.get(`/books/${slug}/suggestions?limit=5`);
                if (!data?.book) { t.err("Book not found"); return; }
                setBook(data.book);
                setSuggestions(data.suggestions || []);
            } catch (e) { console.error("Fetch error", e); } finally { setLoading(false); }
        })();
    }, [slug]);

    const images = useMemo(() => {
        if (!book) return [];
        let urls = Array.isArray(book.assets?.coverUrl) ? book.assets.coverUrl : [book.assets?.coverUrl];
        // Merge covers and previews for the gallery
        if (book.assets?.previewPages) {
            urls = [...urls, ...book.assets.previewPages];
        }
        return urls.filter(Boolean).map(url => assetUrl(url));
    }, [book]);

    const mainSrc = images.length > 0 ? images[activeImg] : "/images/placeholder-book.png";
    const d = book ? dealFn(book) : { price: 0, mrp: 0, off: 0 };
    const inCart = book ? items.find(i => (i.bookId || i.book?._id || i.id) === book._id) : null;
    const isOutOfStock = book?.inventory?.stock === 0;

    useEffect(() => { if (inCart) setQty(inCart.qty); }, [inCart]);

    // --- SCROLL GALLERY ---
    const scrollGallery = (direction) => {
        if (galleryRef.current) {
            const scrollAmount = 200;
            galleryRef.current.scrollBy({ 
                left: direction === 'left' ? -scrollAmount : scrollAmount, 
                behavior: 'smooth' 
            });
        }
    };

    // --- HANDLE IMAGE ERROR ---
    const handleImageError = (index) => {
        setBrokenImages(prev => ({ ...prev, [index]: true }));
    };

    async function handleAddToCart(buyNow = false) {
       if (isOutOfStock) return;
        if (!isCustomer) {
            t.info("Please login to continue");
            navigate("/login", { state: { next: "/cart" } });
            return;
        }
        try {
            const res = await CustomerAPI.addToCart(token, { bookId: book._id, qty: qty });
            replaceAll(res?.data?.cart?.items || []);
            t.ok("Added to cart");
            if (buyNow) navigate("/checkout");
        } catch (e) {
            add({ ...book, price: d.price, qty: qty }, qty);
            t.ok("Added to cart (Local)");
            if (buyNow) navigate("/checkout");
        }
    }

    const onFlip = (e) => setCurrentPageIndex(e.data);
    const nextFlip = () => flipBookRef.current?.pageFlip()?.flipNext();
    const prevFlip = () => flipBookRef.current?.pageFlip()?.flipPrev();

    const isMobile = windowWidth < 1024;
    const shouldCenterCover = !isMobile && currentPageIndex === 0;

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#3E2723]">
            <div className="w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
            <p className="text-[#D4AF37] animate-pulse font-['Cinzel'] tracking-widest font-bold">Unlocking Wisdom...</p>
        </div>
    );
    
    if (!book) return null;

    const config = book.layoutConfig || {};
    const isSpiritual = book.templateType === 'spiritual';

    return (
        <div className="min-h-screen font-['Lato'] text-[#5C4A2E] bg-[#FAF7F2] selection:bg-[#F3E5AB] selection:text-[#3E2723] overflow-x-hidden">
            
            {/* Global Texture */}
            <div 
                className="fixed inset-0 pointer-events-none opacity-100 z-0" 
                style={{ backgroundImage: parchmentBg, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
            />

            <style>{`
                .reveal { opacity: 0; transform: translateY(40px); transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
                .reveal.active { opacity: 1; transform: translateY(0); }
                .alive-image { animation: floatImage 6s ease-in-out infinite; }
                @keyframes floatImage {
                    0%, 100% { transform: translateY(0px); filter: drop-shadow(0 20px 30px rgba(0,0,0,0.3)); }
                    50% { transform: translateY(-10px); filter: drop-shadow(0 30px 40px rgba(0,0,0,0.4)); }
                }
                /* Hide scrollbar for gallery */
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* --- FLIPBOOK MODAL --- */}
            {showFlipbook && (
                <div className="fixed inset-0 z-[100] bg-[#1a0f0a]/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 text-[#F3E5AB] pointer-events-none">
                        <div className="pointer-events-auto">
                            <h2 className="text-xl font-bold font-['Cinzel'] tracking-wide">{book.title}</h2>
                            <p className="text-xs text-[#D4AF37] mt-1 uppercase tracking-widest font-['Lato']">{isMobile ? "Swipe to Turn Pages" : "Interactive Manuscript"}</p>
                        </div>
                        <button onClick={() => setShowFlipbook(false)} className="pointer-events-auto bg-white/5 hover:bg-[#D4AF37] hover:text-[#3E2723] p-3 rounded-full transition-all border border-[#D4AF37]/30">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden py-10">
                        <div 
                            className="flipbook-shifter flex items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                            style={{ transform: shouldCenterCover ? 'translateX(-25%)' : 'translateX(0)', width: '100%', height: '100%' }}
                        >
                            <HTMLFlipBook
                                width={bookDim.width}
                                height={bookDim.height}
                                size="fixed" 
                                minWidth={200}
                                maxWidth={3000}
                                minHeight={300}
                                maxHeight={3000}
                                maxShadowOpacity={0.6}
                                showCover={true}
                                mobileScrollSupport={true}
                                usePortrait={isMobile}
                                onFlip={onFlip}
                                flippingTime={1200} 
                                className="flip-book shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)]"
                                ref={flipBookRef}
                            >
                                {flipbookPages.map((pageUrl, index) => (
                                    <Page key={index} number={index + 1} isCover={index === 0}>
                                        <img src={pageUrl} alt={`Page ${index + 1}`} className="w-full h-full object-fill select-none" draggable={false} />
                                    </Page>
                                ))}
                                {/* End Page */}
                                <Page number={flipbookPages.length + 1}>
                                    <div className="w-full h-full bg-[#FAF7F2] flex flex-col items-center justify-center p-10 text-center border-l border-[#D4AF37]/20 relative">
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: mandalaBg }}></div>
                                        <div className="relative z-10">
                                            <div className="w-20 h-20 bg-[#FFF9E6] rounded-full flex items-center justify-center mb-6 animate-bounce border border-[#D4AF37]/30 shadow-inner mx-auto">
                                                <ShoppingCart className="w-8 h-8 text-[#D4AF37]" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-[#3E2723] font-['Cinzel'] mb-4">End of Preview</h3>
                                            <p className="text-[#8A7A5E] mb-8 font-['Lato']">Own this treasure to reveal the full wisdom.</p>
                                            <button onClick={() => { setShowFlipbook(false); handleAddToCart(false); }} className="bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all shadow-lg font-['Cinzel'] tracking-wider border border-[#D4AF37]">Add to Cart</button>
                                        </div>
                                    </div>
                                </Page>
                            </HTMLFlipBook>
                        </div>
                    </div>
                    {!isMobile && (
                        <>
                            <button onClick={prevFlip} disabled={currentPageIndex === 0} className="absolute left-12 top-1/2 -translate-y-1/2 z-50 bg-black/20 hover:bg-[#D4AF37] text-white hover:text-[#3E2723] w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 disabled:opacity-0 disabled:pointer-events-none border border-white/10 hover:border-[#D4AF37]"><ChevronLeft className="w-8 h-8" /></button>
                            <button onClick={nextFlip} disabled={currentPageIndex >= flipbookPages.length} className="absolute right-12 top-1/2 -translate-y-1/2 z-50 bg-black/20 hover:bg-[#D4AF37] text-white hover:text-[#3E2723] w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 disabled:opacity-0 disabled:pointer-events-none border border-white/10 hover:border-[#D4AF37]"><ChevronRight className="w-8 h-8" /></button>
                        </>
                    )}
                </div>
            )}

            {/* --- LIGHTBOX --- */}
            {lightboxOpen && (
                 <div className="fixed inset-0 z-[100] bg-[#1a0f0a]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/60 hover:text-[#D4AF37] transition-colors bg-white/5 p-2 rounded-full z-50 hover:rotate-90 duration-300"><X className="w-8 h-8" /></button>
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                        <div className="flex-1 flex items-center justify-center w-full max-h-[85vh] animate-in zoom-in duration-500 p-4">
                            <img src={images[activeImg]} className="max-h-full max-w-full object-contain shadow-[0_0_50px_rgba(212,175,55,0.1)] rounded-sm border-4 border-white/5" />
                        </div>
                        <div className="flex gap-4 overflow-x-auto max-w-full px-4 py-6 justify-center">
                            {images.map((img, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); setActiveImg(i); }} className={`w-16 h-24 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all duration-300 ${activeImg === i ? 'border-[#D4AF37] scale-110 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-white/10 opacity-50 hover:opacity-100'}`}><img src={img} className="w-full h-full object-cover" /></button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- HERO SECTION --- */}
            <section className="relative pt-24 md:pt-32 pb-20 md:pb-28 overflow-hidden bg-[#3E2723]">
                <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: mandalaBg, backgroundSize: '500px' }}></div>
                <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#3E2723] to-transparent z-0"></div>
                
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center lg:items-start">
                        
                        {/* LEFT: BOOK DISPLAY & GALLERY */}
                        <div className="lg:col-span-5 flex flex-col items-center">
                            
                            {/* Main Image */}
                            <div className="relative w-[260px] md:w-[340px] cursor-pointer group mb-8 perspective-1000" onClick={() => setShowFlipbook(true)}>
                                <div className="alive-image relative transition-transform duration-500 group-hover:scale-105">
                                    <div className="absolute inset-4 bg-[#D4AF37] rounded-lg blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                                    <img 
                                        src={mainSrc} 
                                        alt={book.title} 
                                        className="relative w-full h-auto rounded-r-lg shadow-[10px_10px_30px_rgba(0,0,0,0.5)] z-10 block object-cover border-l-4 border-white/10" 
                                    />
                                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-white/30 to-transparent z-20 rounded-l-lg pointer-events-none"></div>
                                    <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-[#1a0f0a]/80 text-[#F3E5AB] px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md font-bold text-sm shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all border border-[#D4AF37]/50 font-['Cinzel'] tracking-widest">
                                            <ZoomIn className="w-4 h-4" /> PREVIEW
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- THE FIXED GALLERY STRIP --- */}
                            <div className="w-full relative group/gallery">
                                {/* Fade gradients */}
                                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#3E2723] to-transparent z-10 pointer-events-none"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#3E2723] to-transparent z-10 pointer-events-none"></div>
                                
                                {images.length > 3 && (
                                    <>
                                        <button 
                                            onClick={() => scrollGallery('left')}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[#D4AF37] text-white p-2 rounded-full backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover/gallery:opacity-100"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => scrollGallery('right')}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[#D4AF37] text-white p-2 rounded-full backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover/gallery:opacity-100"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </>
                                )}

                                <div 
                                    ref={galleryRef}
                                    className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-4 scroll-smooth"
                                >
                                    {images.map((img, i) => {
                                        if (brokenImages[i]) return null; // Hide broken images completely
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => { setActiveImg(i); }}
                                                className={`relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 bg-white ${
                                                    activeImg === i 
                                                    ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.5)] scale-105 z-10' 
                                                    : 'border-white/20 opacity-70 hover:opacity-100 hover:border-white/50 hover:scale-105'
                                                }`}
                                            >
                                                <img 
                                                    src={img} 
                                                    className="w-full h-full object-contain" // Full image no crop
                                                    alt={`Page ${i+1}`}
                                                    onError={() => handleImageError(i)}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: DETAILS */}
                        <div className="lg:col-span-7 pt-4 text-[#F3E5AB] reveal" ref={addToRefs}>
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                {book.categories?.map((cat, i) => (
                                    <span key={i} className="bg-white/10 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] shadow-sm">{cat}</span>
                                ))}
                                {isSpiritual && <span className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_10px_rgba(212,175,55,0.2)]"><Star className="w-3 h-3 fill-current" /> Bestseller</span>}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-['Cinzel'] font-bold text-[#F3E5AB] mb-6 leading-tight drop-shadow-md">{book.title}</h1>
                            
                            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-white/10">
                                {book.authors?.length > 0 && <p className="text-lg font-light font-['Lato'] text-[#D4AF37]">By <span className="text-[#F3E5AB] font-normal">{book.authors.join(", ")}</span></p>}
                                <div className="w-px h-6 bg-white/20 hidden sm:block"></div>
                                <div className="flex items-center gap-2">
                                    <div className="flex text-[#D4AF37]">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                                    <span className="text-sm font-bold text-[#8A7A5E] tracking-wide ml-1">(4.9 Rating)</span>
                                </div>
                            </div>
                            
                            <div className="mb-10 flex items-end gap-4">
                                <span className="text-5xl font-['Playfair_Display'] font-bold text-[#F3E5AB] tracking-tight">{book.currency === 'INR' ? '₹' : book.currency}{d.price}</span>
                                {d.mrp > d.price && (
                                    <div className="mb-2 flex flex-col">
                                        <span className="text-lg text-[#8A7A5E] line-through decoration-white/30 font-['Lato']">₹{d.mrp}</span>
                                        <span className="text-[10px] font-bold text-[#3E2723] bg-[#D4AF37] px-2 py-0.5 rounded uppercase tracking-wide">{d.off}% SAVING</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-5 mb-12">
                                {isOutOfStock ? (
                                    <button disabled className="flex-1 h-14 bg-white/10 text-white/40 font-bold rounded-full cursor-not-allowed text-lg font-['Cinzel'] tracking-widest border border-white/5">SOLD OUT</button>
                                ) : (
                                    <>
                                        <button onClick={() => handleAddToCart(false)} className="flex-1 h-14 bg-gradient-to-r from-[#C59D5F] to-[#B0894C] text-white font-bold rounded-full shadow-[0_0_20px_rgba(176,137,76,0.3)] hover:shadow-[0_0_30px_rgba(176,137,76,0.5)] flex items-center justify-center gap-3 text-lg btn-shine transition-transform hover:-translate-y-1 font-['Cinzel'] tracking-widest border border-[#F3E5AB]/20">
                                            <ShoppingCart className="w-5 h-5" /> ADD TO CART
                                        </button>
                                        <button onClick={() => handleAddToCart(true)} className="flex-1 h-14 bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] font-bold rounded-full flex items-center justify-center gap-3 text-lg hover:bg-[#D4AF37] hover:text-[#3E2723] transition-all font-['Cinzel'] tracking-widest hover:shadow-lg">
                                            BUY NOW
                                        </button>
                                    </>
                                )}
                            </div>

                            {book.whyChooseThis?.length > 0 && (
                                <div className="bg-white/5 p-8 rounded-3xl border border-[#D4AF37]/20 relative overflow-hidden backdrop-blur-sm">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                                    <h3 className="font-['Cinzel'] font-bold text-[#D4AF37] text-lg mb-5 flex items-center gap-3 relative z-10"><Sparkles className="w-5 h-5" /> Why This Treasure?</h3>
                                    <div className="grid gap-4 relative z-10">
                                        {book.whyChooseThis.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 group">
                                                <div className="mt-1 w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] flex-shrink-0 border border-[#D4AF37]/30"><Check className="w-3 h-3" strokeWidth={3} /></div>
                                                <p className="text-[#F3E5AB]/90 font-light leading-relaxed text-sm font-['Lato']">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* --- CURRICULUM --- */}
             {config.curriculum?.length > 0 && (
                <section className="py-24 relative z-10">
                   <div className="max-w-[1400px] mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-[#3E2723] mb-4 reveal" ref={addToRefs}>Wisdom Unlocked</h2>
                        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-16 rounded-full opacity-60 reveal" ref={addToRefs}></div>

                        <div className="grid md:grid-cols-4 gap-6 text-left">
                            {config.curriculum.slice(0, 4).map((item, i) => {
                                const IconComp = ICON_MAP[item.icon] || Star;
                                return (
                                    <div key={i} className="p-8 rounded-[2rem] bg-white border border-[#D4AF37]/20 hover:border-[#D4AF37] shadow-[0_10px_30px_rgba(62,39,35,0.05)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] transition-all duration-500 group hover:-translate-y-2 reveal" ref={addToRefs} style={{ transitionDelay: `${i * 100}ms` }}>
                                        <div className="w-14 h-14 rounded-2xl bg-[#FFF9E6] text-[#D4AF37] flex items-center justify-center mb-6 shadow-inner border border-[#D4AF37]/20 group-hover:bg-[#D4AF37] group-hover:text-white transition-colors duration-300">
                                            <IconComp className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-['Cinzel'] font-bold text-[#3E2723] mb-3 text-lg group-hover:text-[#B0894C] transition-colors">{item.title}</h3>
                                        <p className="text-[#8A7A5E] leading-relaxed text-sm">{item.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* --- STORY --- */}
            {config.story?.text && (
                 <section className="py-24 bg-white/60 relative overflow-hidden border-y border-[#D4AF37]/10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none" style={{ backgroundImage: mandalaBg, backgroundSize: '600px', width: '800px', height: '800px' }}></div>

                    <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                            <div className="lg:w-1/2 order-2 lg:order-1 reveal" ref={addToRefs}>
                                <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs uppercase mb-4 block font-['Cinzel']">The Legend</span>
                                <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-[#3E2723] mb-8 leading-tight">{config.story.heading}</h2>
                                <p className="text-[#5C4A2E] leading-loose mb-10 text-lg font-light">{config.story.text}</p>
                                {config.story.quote && (
                                    <div className="relative bg-[#FAF7F2] p-10 rounded-tr-[3rem] rounded-bl-[3rem] border border-[#D4AF37]/20 shadow-sm">
                                        <span className="absolute top-4 left-6 text-6xl text-[#D4AF37]/20 font-serif leading-none">“</span>
                                        <p className="font-['Playfair_Display'] italic text-[#3E2723] text-xl relative z-10 pl-4 leading-relaxed">"{config.story.quote}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="lg:w-1/2 order-1 lg:order-2 reveal" ref={addToRefs}>
                                <div className="relative alive-image">
                                    <div className="absolute -inset-4 bg-[#D4AF37] opacity-10 rounded-[40px] rotate-3 scale-105"></div>
                                    <div className="rounded-[30px] overflow-hidden shadow-2xl border-4 border-white relative z-10">
                                        <img
                                            src={config.story.imageUrl || mainSrc}
                                            className="w-full h-auto object-contain block"
                                            alt="Our Story"
                                            onError={(e) => e.target.src = mainSrc}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </section>
            )}

             {/* --- TABS --- */}
             <section className="py-24" id="details">
                 <div className="max-w-[1000px] mx-auto px-6">
                    <div className="flex justify-center gap-8 md:gap-16 mb-12 border-b border-[#D4AF37]/20">
                        {['Description', 'Specs', 'Reviews'].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab.toLowerCase())} 
                                className={`pb-4 text-sm font-bold uppercase tracking-[0.15em] font-['Cinzel'] transition-all relative ${activeTab === tab.toLowerCase() ? 'text-[#D4AF37]' : 'text-[#8A7A5E] hover:text-[#3E2723]'}`}
                            >
                                {tab}
                                {activeTab === tab.toLowerCase() && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#D4AF37] rounded-t-full"></span>}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white/80 backdrop-blur-md p-8 md:p-14 rounded-[2rem] border border-[#D4AF37]/20 min-h-[300px] shadow-[0_10px_40px_rgba(62,39,35,0.05)] reveal active" ref={addToRefs}>
                        {activeTab === 'description' && (
                            <div className="animate-[fadeIn_0.5s_ease-out] prose max-w-none text-[#5C4A2E] leading-loose text-lg font-['Lato']">
                                <div dangerouslySetInnerHTML={{ __html: book.descriptionHtml || "<p>Explore the magical world inside this book...</p>" }} />
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <div className="grid md:grid-cols-2 gap-x-16 gap-y-8 animate-[fadeIn_0.5s_ease-out]">
                                <SpecRow label="Pages" value={book.pages} />
                                <SpecRow label="Weight" value={`${book.dimensions?.weight || 50}g`} />
                                {config.specs?.map((s, i) => <SpecRow key={i} label={s.label} value={s.value} />)}
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="animate-[fadeIn_0.5s_ease-out]">
                                {config.testimonials?.length > 0 ? (
                                    <div className="grid gap-8">
                                        {config.testimonials.map((t, i) => (
                                            <div key={i} className="pb-8 border-b border-[#D4AF37]/10 last:border-0">
                                                <div className="flex items-center gap-1 mb-3">{[...Array(Number(t.rating) || 5)].map((_, r) => <Star key={r} className="w-4 h-4 text-[#F59E0B] fill-current" />)}</div>
                                                <p className="text-[#3E2723] italic mb-4 text-lg leading-relaxed font-['Playfair_Display']">"{t.text}"</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#3E2723] text-[#F3E5AB] flex items-center justify-center font-bold text-sm shadow-sm font-['Cinzel'] border border-[#D4AF37]">{t.name[0]}</div>
                                                    <div><div className="font-bold text-[#3E2723] text-sm font-['Cinzel']">{t.name}</div><div className="text-[10px] text-[#8A7A5E] uppercase tracking-wider font-bold">{t.role}</div></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="text-center py-10 text-[#8A7A5E] italic">No reviews yet. Be the first to share wisdom.</div>}
                            </div>
                        )}
                    </div>
                </div>
             </section>

             {/* --- SUGGESTIONS --- */}
             {suggestions.length > 0 && (
                <section className="py-24 bg-[#3E2723] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }}></div>
                    <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-12 h-1 bg-[#D4AF37]"></div>
                            <h2 className="text-3xl font-['Cinzel'] font-bold text-[#F3E5AB]">You May Also Cherish</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {suggestions.map((s) => (
                                <div key={s._id} className="group bg-white rounded-xl overflow-hidden shadow-lg transition-all cursor-pointer hover:-translate-y-2 duration-500 border border-white/10" onClick={() => { navigate(`/book/${s.slug}`); window.scrollTo(0, 0); }}>
                                    <div className="aspect-[3/4] p-6 bg-[#FAF7F2] relative flex items-center justify-center overflow-hidden border-b border-[#D4AF37]/10">
                                        <img src={assetUrl(s.assets?.coverUrl?.[0])} className="w-full h-auto object-contain shadow-md group-hover:scale-110 group-hover:rotate-1 transition-all duration-700" />
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-['Cinzel'] font-bold text-[#3E2723] line-clamp-2 mb-3 h-10 text-sm leading-tight group-hover:text-[#B0894C] transition-colors">{s.title}</h3>
                                        <div className="flex items-center justify-between border-t border-[#D4AF37]/10 pt-3">
                                            <div className="font-bold text-[#3E2723] text-base font-['Playfair_Display']">₹{dealFn(s).price}</div>
                                            <div className="text-[10px] font-bold text-[#8A7A5E] uppercase tracking-wider group-hover:text-[#D4AF37]">View</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
             )}
             
            {/* MOBILE BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-[#D4AF37]/30 p-4 flex items-center justify-between sm:hidden z-50 shadow-[0_-5px_20px_rgba(62,39,35,0.1)]">
                <div>
                    <div className="text-[10px] text-[#8A7A5E] uppercase font-bold tracking-wider mb-0.5">Total</div>
                    <div className="text-xl font-bold text-[#3E2723] font-['Playfair_Display']">₹{d.price}</div>
                </div>
                <button onClick={() => handleAddToCart(false)} disabled={isOutOfStock} className={`px-8 py-3 rounded-full font-bold text-white shadow-lg text-sm font-['Cinzel'] tracking-widest ${isOutOfStock ? 'bg-gray-400' : 'bg-[#3E2723]'}`}>{isOutOfStock ? "Sold Out" : "Add to Cart"}</button>
            </div>
        </div>
    )
}