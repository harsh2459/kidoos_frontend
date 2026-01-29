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
        <div className="flex flex-col gap-1 border-l-4 border-[#D4AF37]/40 pl-5 py-2 hover:bg-[#D4AF37]/5 transition-colors rounded-r-xl">
            <span className="text-[10px] font-bold text-[#8A7A5E] uppercase tracking-[0.2em] font-['Cinzel']">{label}</span>
            <span className="font-bold text-[#2D2424] text-lg font-['Lato']">{value}</span>
        </div>
    );
};

// --- FLIPBOOK PAGE COMPONENT ---
const Page = forwardRef(({ children, number, isCover }, ref) => {
    return (
        <div className="demoPage h-full w-full bg-[#FDFBF7] relative overflow-hidden shadow-2xl border-l border-[#D4AF37]/20" ref={ref}>
            <div className="h-full w-full relative">
                {children}
                {!isCover && (
                    <div className="absolute bottom-6 right-6 text-[11px] text-[#8A7A5E] font-bold font-['Cinzel'] bg-white/90 px-3 py-1 rounded-full shadow-sm z-20 border border-[#D4AF37]/20">
                        {number}
                    </div>
                )}
                {/* Texture Overlay */}
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-10 mix-blend-multiply opacity-[0.05]"
                    style={{ backgroundImage: parchmentBg }}>
                </div>
                {/* Spine Shadow */}
                <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-20"></div>
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

    const scrollGallery = (direction) => {
        if (galleryRef.current) {
            const scrollAmount = 200;
            galleryRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1C1917]">
            <div className="w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mb-6"></div>
            <p className="text-[#D4AF37] animate-pulse font-['Cinzel'] tracking-[0.3em] font-bold text-sm uppercase">Divine Wisdom Awaits...</p>
        </div>
    );

    if (!book) return null;

    const config = book.layoutConfig || {};
    const isSpiritual = book.templateType === 'spiritual';

    return (
        <div className="min-h-screen font-['Lato'] text-[#44403C] bg-[#FDFBF7] selection:bg-[#D4AF37]/30 selection:text-[#1C1917] overflow-x-hidden pb-24 md:pb-0">

            {/* Subtle Global Texture */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{ backgroundImage: parchmentBg, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
            />

            <style>{`
                .reveal { opacity: 0; transform: translateY(40px); transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
                .reveal.active { opacity: 1; transform: translateY(0); }
                .alive-image { animation: floatImage 8s ease-in-out infinite; }
                @keyframes floatImage {
                    0%, 100% { transform: translateY(0px); filter: drop-shadow(0 20px 40px rgba(0,0,0,0.3)); }
                    50% { transform: translateY(-15px); filter: drop-shadow(0 35px 50px rgba(0,0,0,0.4)); }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .gold-glow { box-shadow: 0 0 20px rgba(212, 175, 55, 0.2); }
                .text-gradient-gold { 
                    background: linear-gradient(to right, #D4AF37, #F3E5AB, #B0894C);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>

            {/* --- FLIPBOOK MODAL --- */}
            {showFlipbook && (
                <div className="fixed inset-0 z-[100] bg-[#0C0A09]/98 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-center z-50 text-white pointer-events-none">
                        <div className="pointer-events-auto">
                            <h2 className="text-xl md:text-2xl font-bold font-['Cinzel'] tracking-wider text-[#FDFBF7]">{book.title}</h2>
                            <p className="text-[10px] md:text-xs text-[#D4AF37] mt-1 uppercase tracking-[0.3em] font-['Lato'] font-bold">Interactive Manuscript</p>
                        </div>
                        <button onClick={() => setShowFlipbook(false)} className="pointer-events-auto bg-white/10 hover:bg-[#D4AF37] hover:text-[#1C1917] p-3 rounded-full transition-all border border-white/20">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden py-10">
                        <div
                            className="flipbook-shifter flex items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                            style={{ transform: shouldCenterCover ? 'translateX(-25%)' : 'translateX(0)', width: '100%', height: '100%' }}
                        >
                            <HTMLFlipBook
                                width={bookDim.width} height={bookDim.height} size="fixed" minWidth={200} maxWidth={3000}
                                minHeight={300} maxHeight={3000} maxShadowOpacity={0.6} showCover={true}
                                mobileScrollSupport={true} usePortrait={isMobile} onFlip={onFlip} flippingTime={1200}
                                className="flip-book shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)]" ref={flipBookRef}>
                                {flipbookPages.map((pageUrl, index) => (
                                    <Page key={index} number={index + 1} isCover={index === 0}>
                                        <img src={pageUrl} alt={`Page ${index + 1}`} className="w-full h-full object-fill select-none" draggable={false} />
                                    </Page>
                                ))}
                                <Page number={flipbookPages.length + 1}>
                                    <div className="w-full h-full bg-[#FDFBF7] flex flex-col items-center justify-center p-12 text-center border-l border-[#D4AF37]/20 relative">
                                        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: mandalaBg }}></div>
                                        <div className="relative z-10">
                                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl border border-[#D4AF37]/30 mx-auto">
                                                <ShoppingCart className="w-10 h-10 text-[#D4AF37]" />
                                            </div>
                                            <h3 className="text-3xl font-bold text-[#1C1917] font-['Cinzel'] mb-4">Complete the Collection</h3>
                                            <p className="text-[#8A7A5E] mb-10 font-['Lato'] text-lg leading-relaxed">Own this spiritual treasure to reveal its full wisdom.</p>
                                            <button onClick={() => { setShowFlipbook(false); handleAddToCart(false); }} className="bg-[#1C1917] text-[#D4AF37] px-12 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-2xl font-['Cinzel'] tracking-widest border border-[#D4AF37]/50">ADD TO CART</button>
                                        </div>
                                    </div>
                                </Page>
                            </HTMLFlipBook>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HERO SECTION --- */}
            <section className="relative pt-24 md:pt-40 pb-16 md:pb-32 overflow-hidden bg-[#1C1917]">
                <div className="absolute inset-0 z-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: mandalaBg, backgroundSize: '600px' }}></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#D4AF37] rounded-full blur-[150px] opacity-[0.06] pointer-events-none"></div>

                <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center lg:items-start">

                        {/* LEFT: BOOK DISPLAY & GALLERY */}
                        <div className="lg:col-span-5 flex flex-col items-center">
                            <div className="relative w-full max-w-[280px] md:max-w-[420px] cursor-pointer group mb-12" onClick={() => setShowFlipbook(true)}>
                                <div className="alive-image relative transition-transform duration-700 group-hover:scale-[1.03]">
                                    <div className="absolute -inset-4 bg-[#D4AF37] rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                                    <img src={mainSrc} alt={book.title} className="relative w-full h-auto rounded-r-xl shadow-[20px_20px_60px_rgba(0,0,0,0.6)] z-10 block object-contain border-l-2 border-white/5" />
                                    <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-white/10 backdrop-blur-xl text-[#D4AF37] px-8 py-4 rounded-full flex items-center gap-3 font-bold text-sm shadow-2xl border border-[#D4AF37]/40 font-['Cinzel'] tracking-[0.2em]">
                                            <ZoomIn className="w-5 h-5" /> PREVIEW WISDOM
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full relative group/gallery max-w-[420px]">
                                <div ref={galleryRef} className="flex gap-4 overflow-x-auto no-scrollbar px-2 py-4 justify-center">
                                    {images.map((img, i) => !brokenImages[i] && (
                                        <button key={i} onClick={() => setActiveImg(i)} className={`relative w-16 h-24 md:w-20 md:h-28 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 bg-[#292524] ${activeImg === i ? 'border-[#D4AF37] shadow-lg scale-110 z-10' : 'border-white/10 opacity-40 hover:opacity-100'}`}>
                                            <img src={img} className="w-full h-full object-contain" alt={`Slide ${i}`} onError={() => handleImageError(i)} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: DETAILS */}
                        <div className="lg:col-span-7 pt-4 text-[#FDFBF7] reveal" ref={addToRefs}>
                            <div className="flex flex-wrap items-center gap-3 mb-8">
                                {book.categories?.map((cat, i) => (
                                    <span key={i} className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8A29E]">{cat}</span>
                                ))}
                                {isSpiritual && <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg"><Star className="w-3 h-3 fill-current" /> Bestseller</span>}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-5xl font-['Cinzel'] font-bold text-white mb-8 leading-[1.1] tracking-tight drop-shadow-xl">{book.title}</h1>

                            <div className="flex flex-wrap items-center gap-6 mb-10 pb-10 border-b border-white/10">
                                {book.authors?.length > 0 && <p className="text-lg font-light font-['Lato'] text-[#A8A29E]">By <span className="text-white font-medium border-b border-[#D4AF37]/50 pb-1">{book.authors.join(", ")}</span></p>}
                                <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
                                <div className="flex items-center gap-3">
                                    <div className="flex text-[#D4AF37] gap-1">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                                    <span className="text-sm font-bold text-[#78716C] tracking-widest">(4.9/5)</span>
                                </div>
                            </div>

                            <div className="mb-12 flex items-end gap-6">
                                <span className="text-6xl md:text-7xl font-['Playfair_Display'] font-medium text-white tracking-tight">₹{d.price}</span>
                                {d.mrp > d.price && (
                                    <div className="mb-3 flex flex-col">
                                        <span className="text-xl text-[#78716C] line-through decoration-[#78716C]/50 font-['Lato']">₹{d.mrp}</span>
                                        <span className="text-[11px] font-bold text-[#1C1917] bg-[#D4AF37] px-3 py-1 rounded-md uppercase tracking-widest mt-2">{d.off}% SAVING</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-5 mb-14">
                                <button onClick={() => handleAddToCart(false)} disabled={isOutOfStock} className="flex-1 h-16 bg-white/5 hover:bg-white/10 text-[#D4AF37] font-bold rounded-full border border-white/10 flex items-center justify-center gap-4 text-sm transition-all font-['Cinzel'] tracking-[0.2em] uppercase">
                                    <ShoppingCart className="w-5 h-5" /> Add to Cart
                                </button>
                                <button onClick={() => handleAddToCart(true)} disabled={isOutOfStock} className="flex-1 h-16 bg-[#D4AF37] hover:bg-[#E6C55C] text-[#1C1917] font-bold rounded-full flex items-center justify-center gap-4 text-sm transition-transform hover:-translate-y-1 font-['Cinzel'] tracking-[0.2em] shadow-[0_15px_30px_rgba(212,175,55,0.2)] uppercase">
                                    Buy Now
                                </button>
                            </div>

                            {book.whyChooseThis?.length > 0 && (
                                <div className="bg-white/[0.03] p-8 md:p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden backdrop-blur-sm">
                                    <h3 className="font-['Cinzel'] font-bold text-[#D4AF37] text-sm md:text-base mb-8 flex items-center gap-4 uppercase tracking-[0.3em]"><Sparkles className="w-5 h-5" /> Why This Treasure?</h3>
                                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                                        {book.whyChooseThis.map((item, i) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <div className="mt-1 w-6 h-6 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] flex-shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.1)]"><Check className="w-3.5 h-3.5" strokeWidth={4} /></div>
                                                <p className="text-[#D6D3D1] font-light leading-relaxed text-sm md:text-base font-['Lato']">{item}</p>
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
                <section className="py-24 md:py-32 relative z-10">
                    <div className="max-w-[1400px] mx-auto px-6 text-center">
                        <span className="block text-[#D4AF37] text-xs font-bold tracking-[0.4em] uppercase mb-4 font-['Cinzel'] reveal" ref={addToRefs}>Unveiling the path</span>
                        <h2 className="text-4xl md:text-5xl font-['Cinzel'] font-bold text-[#1C1917] mb-6 reveal" ref={addToRefs}>Wisdom Unlocked</h2>
                        <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-20 rounded-full opacity-40 reveal" ref={addToRefs}></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                            {config.curriculum.slice(0, 4).map((item, i) => {
                                const IconComp = ICON_MAP[item.icon] || Star;
                                return (
                                    <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-[#E7E5E4] hover:border-[#D4AF37]/50 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] transition-all duration-500 group hover:-translate-y-2 reveal" ref={addToRefs} style={{ transitionDelay: `${i * 100}ms` }}>
                                        <div className="w-16 h-16 rounded-2xl bg-[#FDFBF7] text-[#D4AF37] flex items-center justify-center mb-8 border border-[#D4AF37]/10 group-hover:bg-[#1C1917] transition-all duration-500">
                                            <IconComp className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-['Cinzel'] font-bold text-[#1C1917] mb-4 text-xl tracking-wide group-hover:text-[#B0894C] transition-colors">{item.title}</h3>
                                        <p className="text-[#78716C] leading-loose text-base font-['Lato']">{item.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* --- STORY --- */}
            {config.story?.text && (
                <section className="py-24 md:py-32 bg-white relative overflow-hidden border-y border-[#E7E5E4]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none" style={{ backgroundImage: mandalaBg, backgroundSize: '600px', width: '800px', height: '800px' }}></div>
                    <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                            <div className="lg:w-1/2 order-2 lg:order-1 reveal" ref={addToRefs}>
                                <span className="text-[#D4AF37] font-bold tracking-[0.3em] text-xs uppercase mb-6 block font-['Cinzel']">The Divine Narrative</span>
                                <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-[#1C1917] mb-10 leading-tight">{config.story.heading}</h2>
                                <p className="text-[#57534E] leading-[2.2] mb-12 text-lg font-light">{config.story.text}</p>
                                {config.story.quote && (
                                    <div className="relative bg-[#FDFBF7] p-10 md:p-14 rounded-r-[3rem] border-l-4 border-[#D4AF37] shadow-sm">
                                        <span className="absolute top-8 left-8 text-6xl text-[#D4AF37]/20 font-serif leading-none">“</span>
                                        <p className="font-['Playfair_Display'] italic text-[#292524] text-xl md:text-2xl relative z-10 leading-relaxed pl-4">"{config.story.quote}"</p>
                                    </div>
                                )}
                            </div>  
                            <div className="lg:w-1/2 order-1 lg:order-2 reveal" ref={addToRefs}>
                                <div className="relative alive-image">
                                    <div className="absolute -inset-6 bg-[#D4AF37] opacity-[0.08] rounded-[3rem] rotate-3 scale-105"></div>
                                    <div className="rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.1)] border-4 border-white relative z-10">
                                        <img src={config.story.imageUrl || mainSrc} className="w-full h-auto object-contain block" alt="Story" onError={(e) => e.target.src = mainSrc} loading="lazy" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* --- TABS --- */}
            <section className="py-24 md:py-32 bg-[#FDFBF7]" id="details">
                <div className="max-w-[1100px] mx-auto px-6">
                    <div className="flex justify-center flex-wrap gap-6 md:gap-12 mb-16">
                        {['Description', 'Specs', 'Reviews'].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`px-10 py-3 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.2em] font-['Cinzel'] transition-all border ${activeTab === tab.toLowerCase() ? 'bg-[#1C1917] text-[#D4AF37] border-[#1C1917] shadow-xl' : 'bg-white text-[#8A7A5E] border-[#E7E5E4] hover:border-[#D4AF37]'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white p-10 md:p-20 rounded-[3rem] border border-[#E7E5E4] shadow-[0_20px_60px_rgba(0,0,0,0.03)] reveal active" ref={addToRefs}>
                        {activeTab === 'description' && (
                            <div className="animate-[fadeIn_0.5s_ease-out] prose max-w-none text-[#44403C] leading-[2.2] text-lg font-['Lato']">
                                <div dangerouslySetInnerHTML={{ __html: book.descriptionHtml || "<p>Explore the spiritual wisdom within...</p>" }} />
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <div className="grid md:grid-cols-2 gap-x-20 gap-y-10 animate-[fadeIn_0.5s_ease-out]">
                                <SpecRow label="Pages" value={book.pages} />
                                <SpecRow label="Weight" value={`${book.dimensions?.weight || 50}g`} />
                                {config.specs?.map((s, i) => <SpecRow key={i} label={s.label} value={s.value} />)}
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="animate-[fadeIn_0.5s_ease-out]">
                                {config.testimonials?.length > 0 ? (
                                    <div className="grid gap-12">
                                        {config.testimonials.map((t, i) => (
                                            <div key={i} className="pb-12 border-b border-[#FDFBF7] last:border-0 last:pb-0">
                                                <div className="flex text-[#D4AF37] gap-1 mb-6">{[...Array(5)].map((_, r) => <Star key={r} className="w-4 h-4 fill-current" />)}</div>
                                                <p className="text-[#2D2424] italic mb-10 text-xl md:text-2xl leading-relaxed font-['Playfair_Display']">"{t.text}"</p>
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-full bg-[#1C1917] text-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-lg border border-[#D4AF37]/30">{t.name[0]}</div>
                                                    <div>
                                                        <div className="font-bold text-[#1C1917] text-base font-['Cinzel'] tracking-wider">{t.name}</div>
                                                        <div className="text-[11px] text-[#8A7A5E] uppercase tracking-widest font-bold mt-1">{t.role}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="text-center py-20 text-[#8A7A5E] italic text-lg font-['Lato']">Be the first to share wisdom.</div>}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* --- SUGGESTIONS --- */}
            {suggestions.length > 0 && (
                <section className="py-24 md:py-32 bg-[#1C1917] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: mandalaBg, backgroundSize: '400px' }}></div>
                    <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
                        <div className="flex items-end justify-between mb-16">
                            <div>
                                <span className="text-[#D4AF37] text-xs font-bold tracking-[0.4em] uppercase mb-4 block font-['Cinzel']">Eternal Connections</span>
                                <h2 className="text-3xl md:text-4xl font-['Cinzel'] font-bold text-white tracking-wide">You May Also Cherish</h2>
                            </div>
                            <button onClick={() => navigate('/catalog')} className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] hover:text-white transition-all flex items-center gap-3">View All <ArrowRight className="w-4 h-4" /></button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
                            {suggestions.map((s) => (
                                <div key={s._id} className="group cursor-pointer" onClick={() => { navigate(`/book/${s.slug}`); window.scrollTo(0, 0); }}>
                                    <div className="aspect-[3/4] p-8 bg-[#292524] rounded-2xl border border-white/5 mb-6 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-[#D4AF37]/30 group-hover:bg-[#383331]">
                                        <img src={assetUrl(s.assets?.coverUrl?.[0])} className="w-full h-auto object-contain shadow-2xl transition-transform duration-700 group-hover:scale-110" alt={s.title} />
                                    </div>
                                    <h3 className="font-['Cinzel'] font-bold text-[#FDFBF7] line-clamp-2 mb-3 h-10 text-sm tracking-wide leading-relaxed group-hover:text-[#D4AF37] transition-colors">{s.title}</h3>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <div className="font-medium text-[#D4AF37] text-lg font-['Playfair_Display']">₹{dealFn(s).price}</div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#1C1917] transition-all"><ArrowRight className="w-4 h-4" /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* MOBILE BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 w-full bg-white/98 backdrop-blur-2xl border-t border-[#E7E5E4] p-5 flex items-center justify-between sm:hidden z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div>
                    <div className="text-[10px] text-[#8A7A5E] uppercase font-bold tracking-[0.2em] mb-1">Total Blessing</div>
                    <div className="text-2xl font-bold text-[#1C1917] font-['Playfair_Display']">₹{d.price}</div>
                </div>
                <button onClick={() => handleAddToCart(false)} disabled={isOutOfStock} className={`px-10 py-4 rounded-full font-bold text-white shadow-xl text-xs font-['Cinzel'] tracking-[0.2em] uppercase transition-all active:scale-95 ${isOutOfStock ? 'bg-gray-400' : 'bg-[#1C1917] border border-[#D4AF37]/30'}`}>
                    {isOutOfStock ? "Sold Out" : "Add to Cart"}
                </button>
            </div>
        </div>
    )
}