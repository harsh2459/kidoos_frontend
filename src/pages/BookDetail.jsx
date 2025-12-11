// src/pages/BookDetail.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    // Icons
    Lightbulb, Zap, Pencil, Calculator, Music, Palette, Puzzle,
    Users, Trophy, Target, Clock, Sun, Moon, Leaf, Anchor,
    Award, Gift, Camera, Video, Mic, MapPin, GraduationCap,
    Medal, Rocket, Compass, Eye
} from "lucide-react";

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

// Colorful Card Themes for Curriculum
const CARD_THEMES = [
    { bg: "bg-orange-50", border: "border-orange-100", iconBg: "bg-orange-100", text: "text-orange-800", icon: "text-orange-600" },
    { bg: "bg-blue-50", border: "border-blue-100", iconBg: "bg-blue-100", text: "text-blue-800", icon: "text-blue-600" },
    { bg: "bg-green-50", border: "border-green-100", iconBg: "bg-green-100", text: "text-green-800", icon: "text-green-600" },
    { bg: "bg-purple-50", border: "border-purple-100", iconBg: "bg-purple-100", text: "text-purple-800", icon: "text-purple-600" },
];

export default function BookDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);

    const [activeTab, setActiveTab] = useState("description");
    const [qty, setQty] = useState(1);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // 3D Mouse Effect State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const bookRef = useRef(null);

    // Cart Context
    const items = useCart((s) => s.items);
    const add = useCart((s) => s.add);
    const replaceAll = useCart((s) => s.replaceAll);
    const { isCustomer, token } = useCustomer();

    // Scroll Animations Observer
    const revealRefs = useRef([]);
    const addToRefs = (el) => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); };

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

    // Handle 3D Tilt Logic
    const handleMouseMove = (e) => {
        if (!bookRef.current) return;
        const rect = bookRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
    };

    const images = useMemo(() => {
        if (!book) return [];
        let urls = Array.isArray(book.assets?.coverUrl) ? book.assets.coverUrl : [book.assets?.coverUrl];
        return urls.filter(Boolean).map(url => assetUrl(url));
    }, [book]);

    const mainSrc = images.length > 0 ? images[activeImg] : "/images/placeholder-book.png";
    const d = book ? dealFn(book) : { price: 0, mrp: 0, off: 0 };
    const inCart = book ? items.find(i => (i.bookId || i.book?._id || i.id) === book._id) : null;
    const isOutOfStock = book?.inventory?.stock === 0;

    useEffect(() => { if (inCart) setQty(inCart.qty); }, [inCart]);

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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F7F5]"><div className="animate-spin w-12 h-12 border-4 border-[#1A3C34] rounded-full border-t-transparent"></div></div>;
    if (!book) return null;

    const config = book.layoutConfig || {};
    const isSpiritual = book.templateType === 'spiritual';

    return (
        <div className="min-h-screen font-sans text-[#2C3E38] bg-[#F4F7F5] selection:bg-[#D4E2D4] selection:text-[#1A3C34] overflow-x-hidden">

            <style>{`
        /* --- ANIMATIONS --- */
        .reveal { opacity: 0; transform: translateY(40px); transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .reveal.active { opacity: 1; transform: translateY(0); }

        /* Mission Image Animation */
        .alive-image { animation: floatImage 6s ease-in-out infinite; }
        @keyframes floatImage {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-15px) scale(1.02); }
        }

        /* 3D Styles */
        .perspective-container { perspective: 1200px; }
        .book-3d { transform-style: preserve-3d; transition: transform 0.1s ease-out; box-shadow: 20px 40px 80px -10px rgba(26, 60, 52, 0.4); }

        /* Button Shine */
        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::after {
            content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
            transform: rotate(45deg) translate(-100%, -100%); transition: transform 0s;
        }
        .btn-shine:hover::after { transform: rotate(45deg) translate(100%, 100%); transition: transform 0.6s ease-in-out; }

        /* THEME: Deep Green (#1A3C34) */
        .btn-primary { background-color: #1A3C34; color: white; }
        .btn-primary:hover { background-color: #142e28; transform: translateY(-4px); box-shadow: 0 15px 30px -5px rgba(26, 60, 52, 0.4); }
        .btn-outline { border: 2px solid #1A3C34; color: #1A3C34; background: transparent; }
        .btn-outline:hover { background: #E3E8E5; transform: translateY(-4px); }

        .tab-btn { position: relative; color: #5C756D; font-weight: 600; padding-bottom: 12px; transition: all 0.3s; }
        .tab-btn.active { color: #1A3C34; font-weight: 800; transform: scale(1.05); }
        .tab-btn::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 3px; background-color: #1A3C34; transition: width 0.3s; }
        .tab-btn.active::after { width: 100%; }

        /* Gallery Scroll */
        .gallery-scroll::-webkit-scrollbar { height: 8px; }
        .gallery-scroll::-webkit-scrollbar-thumb { background: #1A3C34; border-radius: 10px; opacity: 0.5; }
        .gallery-scroll::-webkit-scrollbar-track { background: #E3E8E5; border-radius: 10px; }
      `}</style>

            {/* --- LIGHTBOX --- */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-[#1A3C34]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full z-50 hover:rotate-90 duration-300"><X className="w-8 h-8" /></button>
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                        <div className="perspective-container flex-1 flex items-center justify-center w-full max-h-[80vh] animate-in zoom-in duration-500">
                            <img
                                src={mainSrc}
                                className="max-h-full max-w-full object-contain shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg transition-transform duration-100"
                                style={{ transform: `rotateY(${mousePos.x * 15}deg) rotateX(${mousePos.y * -15}deg)` }}
                                onMouseMove={(e) => {
                                    const { innerWidth, innerHeight } = window;
                                    setMousePos({ x: (e.clientX / innerWidth) - 0.5, y: (e.clientY / innerHeight) - 0.5 });
                                }}
                            />
                        </div>
                        <div className="flex gap-4 overflow-x-auto max-w-full px-4 py-4 pb-8 mt-4">
                            {images.map((img, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); setActiveImg(i); }} className={`w-20 h-28 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all duration-300 ${activeImg === i ? 'border-white scale-110 ring-4 ring-white/30 translate-y-[-5px]' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`}><img src={img} className="w-full h-full object-cover" /></button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- HERO SECTION --- */}
            <section className="pt-10 pb-16 lg:pt-16 lg:pb-24 max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="flex flex-wrap items-center gap-2 mb-8 animate-[fadeIn_1s_ease-out]">
                    {book.categories?.map((cat, i) => (
                        <span key={i} className="bg-[#E3E8E5] text-[#1A3C34] px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#1A3C34] hover:text-white transition-colors cursor-default shadow-sm">{cat}</span>
                    ))}
                    {isSpiritual && <span className="bg-[#FFF4E0] text-[#D97706] px-4 py-1.5 rounded-lg border border-[#FDE68A] text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse"><Star className="w-3 h-3 fill-current" /> Bestseller</span>}
                </div>

                <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                    {/* LEFT: BOOK SHOWCASE */}
                    <div className="lg:col-span-5 flex flex-col items-center perspective-container relative z-10" ref={bookRef} onMouseMove={handleMouseMove} onMouseLeave={() => setMousePos({ x: 0, y: 0 })}>
                        <div
                            className="book-3d relative w-[280px] md:w-[360px] cursor-zoom-in group mb-14 animate-[fadeInUp_1.2s_ease-out]"
                            style={{ transform: `rotateY(${mousePos.x * 25 - 15}deg) rotateX(${mousePos.y * -25 + 5}deg)` }}
                            onClick={() => setLightboxOpen(true)}
                        >
                            <img src={mainSrc} alt={book.title} className="w-full h-auto rounded-r-2xl rounded-l-md bg-white border-l-[6px] border-[#eee]" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="bg-[#1A3C34]/90 text-white px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md font-bold text-sm shadow-2xl transform scale-90 group-hover:scale-100 transition-all"><ZoomIn className="w-5 h-5" /> Click to Preview</div>
                            </div>
                        </div>

                        {/* GALLERY STRIP */}
                        <div className="w-full animate-[fadeIn_1.5s_ease-out]">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="h-px bg-[#DCE4E0] flex-1"></div>
                                <p className="text-xs font-extrabold text-[#1A3C34] uppercase tracking-widest">Inside Pages</p>
                                <div className="h-px bg-[#DCE4E0] flex-1"></div>
                            </div>

                            <div className="flex gap-4 overflow-x-auto gallery-scroll pb-6 px-4 justify-start">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setActiveImg(i); setLightboxOpen(true); }}
                                        className={`relative w-[90px] h-[130px] flex-shrink-0 rounded-xl overflow-hidden border-2 bg-white transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:rotate-1 ${activeImg === i ? 'border-[#1A3C34] shadow-xl scale-105 ring-2 ring-[#1A3C34]/20' : 'border-[#F0F0F0] shadow-sm opacity-80 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-contain p-1" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: DETAILS */}
                    <div className="lg:col-span-7 pt-2 reveal" ref={addToRefs}>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#1A3C34] mb-6 leading-tight drop-shadow-sm">{book.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-[#E3E8E5]">
                            {book.authors?.length > 0 && <p className="text-base font-bold text-[#5C756D]">By <span className="text-[#1A3C34] hover:underline cursor-pointer">{book.authors.join(", ")}</span></p>}
                            <div className="w-px h-6 bg-[#D1D5DB] hidden sm:block"></div>
                            <div className="flex items-center gap-2 bg-[#FFF9E6] px-3 py-1 rounded-full border border-[#FFE082]">
                                <div className="flex text-[#F59E0B]">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                                <span className="text-sm font-bold text-[#B45309]">4.9/5 Rating</span>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="mb-8 p-6 bg-white rounded-2xl border border-[#E3E8E5] shadow-sm inline-block min-w-[300px]">
                            <div className="flex items-baseline gap-4">
                                <span className="text-5xl font-bold text-[#1A3C34] tracking-tight">{book.currency === 'INR' ? '₹' : book.currency}{d.price}</span>
                                {d.mrp > d.price && (
                                    <>
                                        <span className="text-xl text-[#999] line-through font-medium">₹{d.mrp}</span>
                                        <span className="text-xs font-bold text-[#1A3C34] bg-[#D4E2D4] px-3 py-1 rounded-full">{d.off}% OFF</span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-[#5C756D] mt-2 font-bold uppercase tracking-wide flex items-center gap-2"><Truck className="w-4 h-4" /> Free Fast Delivery</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-10">

                            {isOutOfStock ? (
                                <button disabled className="flex-1 h-14 bg-gray-200 text-gray-500 font-bold rounded-2xl cursor-not-allowed text-lg">Out of Stock</button>
                            ) : (
                                <>
                                    <button onClick={() => handleAddToCart(false)} className="flex-1 h-14 btn-primary font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 text-lg btn-shine transition-transform"><ShoppingCart className="w-5 h-5" /> Add to Cart</button>
                                    <button onClick={() => handleAddToCart(true)} className="flex-1 h-14 btn-outline font-bold rounded-2xl flex items-center justify-center gap-3 text-lg hover:shadow-lg transition-all">Buy Now</button>
                                </>
                            )}
                        </div>

                        {book.whyChooseThis?.length > 0 && (
                            <div className="bg-[#FFFDF5] p-8 rounded-3xl border border-[#FDE68A] shadow-md relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEF3C7] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <h3 className="font-serif font-bold text-[#92400E] text-xl mb-6 flex items-center gap-3 relative z-10"><Sparkles className="w-5 h-5 text-[#F59E0B]" /> Why Choose This Book?</h3>
                                <div className="grid gap-3 relative z-10">
                                    {book.whyChooseThis.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 group">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-[#F59E0B] flex items-center justify-center text-white flex-shrink-0 shadow-sm"><Check className="w-3 h-3" strokeWidth={4} /></div>
                                            <p className="text-[#78350F] font-medium leading-relaxed">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            

            {/* --- CURRICULUM SECTION --- */}
            {config.curriculum?.length > 0 && (
                <section className="py-24 bg-[#F4F7F5]">
                    <div className="max-w-[1200px] mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1A3C34] mb-6 reveal" ref={addToRefs}>What Your Child Will Learn</h2>
                        <div className="w-24 h-2 bg-[#1A3C34] mx-auto mb-16 rounded-full opacity-20 reveal" ref={addToRefs}></div>

                        <div className="grid md:grid-cols-4 gap-6 text-left">
                            {config.curriculum.slice(0, 4).map((item, i) => {
                                const IconComp = ICON_MAP[item.icon] || Star;
                                const theme = CARD_THEMES[i % CARD_THEMES.length];
                                return (
                                    <div key={i} className={`p-8 rounded-[24px] border hover:shadow-xl transition-all duration-500 group hover:-translate-y-3 reveal bg-white ${theme.border}`} ref={addToRefs} style={{ transitionDelay: `${i * 150}ms` }}>
                                        <div className={`w-14 h-14 rounded-2xl ${theme.iconBg} ${theme.icon} flex items-center justify-center mb-6 shadow-inner`}>
                                            <IconComp className="w-7 h-7" />
                                        </div>
                                        <h3 className={`font-bold ${theme.text} mb-3 text-lg`}>{item.title}</h3>
                                        <p className="text-[#5C756D] leading-relaxed font-medium text-sm">{item.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* --- MISSION / STORY SECTION --- */}
            {config.story?.text && (
                <section className="py-28 bg-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E3F9E5] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FEF3C7] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>

                    <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                            <div className="lg:w-1/2 order-2 lg:order-1 reveal" ref={addToRefs}>
                                <span className="bg-[#1A3C34] text-white px-6 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest mb-8 inline-block shadow-lg hover:scale-105 transition-transform">Our Story</span>
                                <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1A3C34] mb-8 leading-tight">{config.story.heading}</h2>
                                <p className="text-[#5C756D] leading-loose mb-10 text-lg">{config.story.text}</p>
                                {config.story.quote && (
                                    <div className="relative bg-[#F4F7F5] p-10 rounded-r-3xl border-l-8 border-[#1A3C34] shadow-sm">
                                        <span className="absolute top-4 left-4 text-8xl text-[#1A3C34] font-serif leading-none opacity-10">“</span>
                                        <p className="font-serif italic text-[#1A3C34] text-xl relative z-10 pl-6 leading-relaxed">"{config.story.quote}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="lg:w-1/2 order-1 lg:order-2 perspective-container reveal" ref={addToRefs}>
                                <div className="relative alive-image">
                                    <div className="absolute -inset-6 bg-[#1A3C34] opacity-5 rounded-[50px] rotate-6 scale-105 animate-pulse"></div>
                                    <div className="absolute -inset-6 bg-[#F59E0B] opacity-10 rounded-[50px] -rotate-3 scale-95 animate-pulse" style={{ animationDelay: '1s' }}></div>

                                    <div className="rounded-[40px] overflow-hidden shadow-2xl border-[10px] border-white bg-white relative z-10 transform transition-transform hover:scale-[1.02] duration-500">
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
            <section className="py-24 bg-[#F4F7F5]" id="details">
                <div className="max-w-[1000px] mx-auto px-6">
                    <div className="flex justify-center gap-8 md:gap-16 mb-12 border-b-2 border-[#E3E8E5]">
                        {['Description', 'Specs', 'Reviews'].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all tab-btn ${activeTab === tab.toLowerCase() ? 'active' : ''}`}>{tab}</button>
                        ))}
                    </div>
                    <div className="bg-white p-8 md:p-14 rounded-[30px] border border-[#E3E8E5] min-h-[300px] shadow-xl reveal active" ref={addToRefs}>
                        {activeTab === 'description' && (
                            <div className="animate-[fadeInUp_0.6s_ease-out] prose prose-green max-w-none text-[#5C756D] leading-loose text-lg">
                                <div dangerouslySetInnerHTML={{ __html: book.descriptionHtml || "<p>Explore the magical world inside this book...</p>" }} />
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <div className="grid md:grid-cols-2 gap-x-16 gap-y-8 animate-[fadeInUp_0.6s_ease-out]">
                                <SpecRow label="Pages" value={book.pages} />
                                <SpecRow label="Weight" value={`${book.dimensions?.weight || 50}g`} />
                                {config.specs?.map((s, i) => <SpecRow key={i} label={s.label} value={s.value} />)}
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="animate-[fadeInUp_0.6s_ease-out]">
                                {config.testimonials?.length > 0 ? (
                                    <div className="grid gap-10">
                                        {config.testimonials.map((t, i) => (
                                            <div key={i} className="pb-8 border-b border-[#E3E8E5] last:border-0 bg-[#FAFAFA] p-6 rounded-2xl">
                                                <div className="flex items-center gap-1 mb-4">{[...Array(Number(t.rating) || 5)].map((_, r) => <Star key={r} className="w-5 h-5 text-[#F59E0B] fill-current" />)}</div>
                                                <p className="text-[#5C756D] italic mb-6 text-xl leading-relaxed">"{t.text}"</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-[#1A3C34] text-white flex items-center justify-center font-bold text-lg shadow-md">{t.name[0]}</div>
                                                    <div><div className="font-bold text-[#1A3C34] text-lg">{t.name}</div><div className="text-xs text-[#8BA699] uppercase tracking-wide font-bold">{t.role}</div></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="text-center py-10 text-gray-400 italic">No reviews yet.</div>}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* --- RELATED BOOKS --- */}
            {suggestions.length > 0 && (
                <section className="py-24 bg-white border-t border-[#E3E8E5]">
                    <div className="max-w-[1400px] mx-auto px-6">
                        <h2 className="text-3xl font-serif font-bold text-[#1A3C34] mb-12 pl-6 border-l-8 border-[#1A3C34]">You May Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                            {suggestions.map((s) => (
                                <div key={s._id} className="group bg-white border border-[#E3E8E5] rounded-2xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-3 duration-500" onClick={() => { navigate(`/book/${s.slug}`); window.scrollTo(0, 0); }}>
                                    <div className="aspect-[3/4] p-8 bg-[#F4F7F5] relative flex items-center justify-center overflow-hidden">
                                        <img src={assetUrl(s.assets?.coverUrl?.[0])} className="w-full h-auto object-contain shadow-md group-hover:scale-110 group-hover:rotate-2 transition-all duration-700" />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-serif font-bold text-[#1A3C34] line-clamp-2 mb-4 h-14 group-hover:text-[#5C756D] transition-colors leading-tight">{s.title}</h3>
                                        <div className="flex items-center justify-between border-t border-[#E3E8E5] pt-4">
                                            <div className="font-bold text-[#1A3C34] text-lg">₹{dealFn(s).price}</div>
                                            <div className="text-xs font-bold text-[#1A3C34] uppercase tracking-wider group-hover:underline">View</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Mobile Sticky Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-[#E3E8E5] p-4 flex items-center justify-between sm:hidden z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                <div><div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Total</div><div className="text-2xl font-bold text-[#1A3C34]">₹{d.price}</div></div>
                <button onClick={() => handleAddToCart(false)} disabled={isOutOfStock} className={`px-10 py-3.5 rounded-xl font-bold text-white shadow-xl ${isOutOfStock ? 'bg-gray-300' : 'bg-[#1A3C34]'}`}>{isOutOfStock ? "Sold Out" : "Add to Cart"}</button>
            </div>
        </div>
    );
}

// Helper Components
const SpecRow = ({ label, value }) => (
    <div className="flex justify-between py-5 border-b border-[#F0F0F0] hover:bg-[#F4F7F5] px-4 rounded-xl transition-colors">
        <span className="font-bold text-[#8BA699] text-sm uppercase tracking-wide">{label}</span>
        <span className="font-bold text-[#1A3C34] text-lg text-end">{value}</span>
    </div>
);